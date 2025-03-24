
import User from '../models/User.js';
import Order from '../models/Order.js';
import { cache, isValidCache, updateCache } from '../utils/cache.js';

export const getUsersData = async (req, res) => {
  try {
    // Check cache first
    if (isValidCache('users')) {
      return res.json(cache.users.data);
    }
    
    // User registrations over time (by month)
    const registrationsOverTime = await User.aggregate([
      { $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: {
          _id: 0,
          date: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          count: 1
        }
      }
    ]);
    
    // User role distribution
    const userRoles = await User.aggregate([
      { $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      { $project: {
          _id: 0,
          role: '$_id',
          count: 1
        }
      }
    ]);
    
    // Active users (with orders in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: {
          _id: '$user'
        }
      },
      { $count: 'activeUsers' }
    ]);
    
    const activeUsersCount = activeUsers.length > 0 ? activeUsers[0].activeUsers : 0;
    
    // User engagement (orders per user)
    const userEngagement = await Order.aggregate([
      { $group: {
          _id: '$user',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $project: {
          _id: 0,
          user: { $arrayElemAt: ['$userDetails', 0] },
          orderCount: 1,
          totalSpent: 1
        }
      },
      { $project: {
          'user.password': 0
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        registrationsOverTime,
        userRoles,
        activeUsersCount,
        userEngagement,
        totalUsers: await User.countDocuments()
      }
    };
    
    // Update cache
    updateCache('users', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
