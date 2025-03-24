
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { cache, isValidCache, updateCache } from '../utils/cache.js';

export const getInventoryData = async (req, res) => {
  try {
    // Check cache first
    if (isValidCache('inventory')) {
      return res.json(cache.inventory.data);
    }
    
    // Low stock products (less than 10 items)
    const lowStockThreshold = 10;
    const lowStockProducts = await Product.find({ stock: { $lt: lowStockThreshold } })
      .sort({ stock: 1 })
      .populate('seller', 'name');
    
    // Products by inventory level
    const inventoryLevels = await Product.aggregate([
      { $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$stock', 10] }, then: 'Low' },
                { case: { $lt: ['$stock', 50] }, then: 'Medium' },
                { case: { $gte: ['$stock', 50] }, then: 'High' }
              ],
              default: 'Unknown'
            }
          },
          count: { $sum: 1 },
          products: { $push: { id: '$_id', name: '$name', stock: '$stock' } }
        }
      },
      { $project: {
          _id: 0,
          level: '$_id',
          count: 1,
          products: { $slice: ['$products', 5] } // Only include 5 sample products per level
        }
      }
    ]);
    
    // Most viewed products (since we don't track views in the schema, substitute with highest rated)
    const topRatedProducts = await Product.find()
      .sort({ averageRating: -1 })
      .limit(10)
      .populate('seller', 'name');
    
    // Product performance (best and worst selling)
    const productPerformance = await Order.aggregate([
      { $unwind: '$products' },
      { $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $project: {
          _id: 0,
          product: {
            id: '$productDetails._id',
            name: '$productDetails.name',
            category: '$productDetails.category',
            price: '$productDetails.price'
          },
          totalSold: 1,
          revenue: 1,
          averagePrice: { $divide: ['$revenue', '$totalSold'] }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);
    
    // Stock by category
    const stockByCategory = await Product.aggregate([
      { $group: {
          _id: '$category',
          totalStock: { $sum: '$stock' },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { productCount: -1 } },
      { $project: {
          _id: 0,
          category: '$_id',
          totalStock: 1,
          productCount: 1,
          averageStock: { $divide: ['$totalStock', '$productCount'] }
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        lowStockProducts,
        inventoryLevels,
        topRatedProducts,
        productPerformance: {
          bestSelling: productPerformance.slice(0, 5),
          worstSelling: productPerformance.slice(-5).reverse()
        },
        stockByCategory
      }
    };
    
    // Update cache
    updateCache('inventory', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching inventory analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
