from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import uuid
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from bson.objectid import ObjectId
from PIL import Image
import base64
import io
import tempfile
import requests
import numpy as np
from transformers import CLIPProcessor, CLIPModel
import datetime

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS with specific origins and methods
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8080", "http://localhost:5173", "https://commerce-hub-analytics.vercel.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/products/*": {
        "origins": ["http://localhost:8080", "http://localhost:5173", "https://commerce-hub-analytics.vercel.app"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# MongoDB connection
client = MongoClient(os.getenv('MONGODB_URI'))
db = client[os.getenv('MONGODB_DB_NAME')]
products_collection = db['products']

@app.route('/image-search', methods=['POST', 'OPTIONS'])
def image_search():
    """Handle image-based product search"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 200
        
    try:
        data = request.json
        image_data = data.get('image_data')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
            
        # Process the image and find similar products
        similar_products = process_image_search(image_data)
        
        return jsonify({
            'success': True,
            'products': similar_products
        })
        
    except Exception as e:
        print(f"Error in image search: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/message', methods=['POST'])
def chat_message():
    """Handle chat messages and return product recommendations"""
    try:
        data = request.json
        message = data.get('message')
        session_id = data.get('session_id')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
            
        # Process the message and get response from your AI/LLM
        # This is where you'd integrate with your AI service
        response = {
            "message": "I found some great options for you! The Samsung Galaxy S23 Ultra (₹1,24,999) is a premium smartphone with a 200MP camera and S Pen support. The OnePlus 11 5G (₹56,999) offers excellent value with its Snapdragon 8 Gen 2 processor and 100W fast charging. Both phones have great cameras and performance.",
            "intent": "product_search",
            "product_ids": ["65f1a2b3c4d5e6f7g8h9i0j1", "65f1a2b3c4d5e6f7g8h9i0j2"]
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in chat message: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        # Convert string ID to ObjectId
        product_oid = ObjectId(product_id)
        
        # Find product in database
        product = products_collection.find_one({'_id': product_oid})
        
        if product:
            # Convert ObjectId to string for JSON serialization
            product['_id'] = str(product['_id'])
            return jsonify({
                'success': True,
                'product': {
                    'product_id': product['_id'],
                    'name': product['name'],
                    'price': product['price'],
                    'category': product['category'],
                    'image_url': product.get('image_url', ''),
                    'images': product.get('images', []),
                    'description': product.get('description', ''),
                    'rating': product.get('rating', 0)
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Product not found'
            }), 404
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/products/<product_id>', methods=['GET', 'OPTIONS'])
def get_product_details(product_id):
    """Get product details by ID"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 200
        
    try:
        # Convert string ID to ObjectId
        product_oid = ObjectId(product_id)
        
        # Get product from MongoDB
        product = products_collection.find_one({"_id": product_oid})
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
            
        # Convert ObjectId to string for JSON serialization
        product['_id'] = str(product['_id'])
        
        return jsonify({
            'success': True,
            'product': {
                'product_id': product['_id'],
                'name': product['name'],
                'category': product['category'],
                'price': product['price'],
                'image_url': product.get('image_url', ''),
                'description': product.get('description', ''),
                'rating': product.get('rating', 0)
            }
        })
        
    except Exception as e:
        print(f"Error fetching product: {str(e)}")
        return jsonify({'error': str(e)}), 500 