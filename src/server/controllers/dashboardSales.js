
import Order from '../models/Order.js';
import { cache, isValidCache, updateCache } from '../utils/cache.js';

export const getSalesData = async (req, res) => {
  try {
    // Check cache first
    if (isValidCache('sales')) {
      return res.json(cache.sales.data);
    }
    
    const timeFrame = req.query.timeFrame || 'monthly';
    let dateFormat, groupBy, dateRange;
    
    // Define time frame settings
    switch (timeFrame) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
        dateRange = 30; // Last 30 days
        break;
      case 'weekly':
        dateFormat = '%Y-W%U';
        groupBy = { year: { $year: '$createdAt' }, week: { $week: '$createdAt' } };
        dateRange = 12; // Last 12 weeks
        break;
      case 'monthly':
      default:
        dateFormat = '%Y-%m';
        groupBy = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
        dateRange = 12; // Last 12 months
        break;
    }
    
    // Calculate start date based on time frame
    const startDate = new Date();
    if (timeFrame === 'daily') {
      startDate.setDate(startDate.getDate() - dateRange);
    } else if (timeFrame === 'weekly') {
      startDate.setDate(startDate.getDate() - (dateRange * 7));
    } else {
      startDate.setMonth(startDate.getMonth() - dateRange);
    }
    
    // Get sales trends over time - Fixed to correctly format dates
    const salesTrends = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { 
        $group: {
          _id: groupBy,
          sales: { $sum: '$totalPrice' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $cond: {
              if: { $eq: [timeFrame, 'daily'] },
              then: { 
                $dateToString: { 
                  format: '%Y-%m-%d', 
                  date: { 
                    $dateFromParts: { 
                      year: '$_id.year', 
                      month: '$_id.month', 
                      day: '$_id.day' 
                    } 
                  } 
                }
              },
              else: {
                $cond: {
                  if: { $eq: [timeFrame, 'weekly'] },
                  then: { 
                    $concat: [
                      { $toString: '$_id.year' }, 
                      '-W', 
                      { $toString: '$_id.week' }
                    ]
                  },
                  else: { 
                    $concat: [
                      { $toString: '$_id.year' }, 
                      '-', 
                      { 
                        $cond: {
                          if: { $lt: ['$_id.month', 10] },
                          then: { $concat: ['0', { $toString: '$_id.month' }] },
                          else: { $toString: '$_id.month' }
                        }
                      }
                    ]
                  }
                }
              }
            },
          },
          sales: 1,
          count: 1
        }
      }
    ]);

    // Make sure we have entries for all periods, even if no sales
    const allPeriods = [];
    if (timeFrame === 'daily') {
      for (let i = 0; i < dateRange; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        if (!salesTrends.find(trend => trend.date === dateStr)) {
          allPeriods.push({ date: dateStr, sales: 0, count: 0 });
        }
      }
    } else if (timeFrame === 'monthly') {
      for (let i = 0; i < dateRange; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const monthStr = month < 10 ? `0${month}` : `${month}`;
        const dateStr = `${year}-${monthStr}`;
        if (!salesTrends.find(trend => trend.date === dateStr)) {
          allPeriods.push({ date: dateStr, sales: 0, count: 0 });
        }
      }
    }
    
    // Combine actual data with placeholder data and sort
    const combinedSalesTrends = [...salesTrends, ...allPeriods].sort((a, b) => a.date.localeCompare(b.date));
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: {
          _id: '$products.product',
          totalSold: { $sum: '$products.quantity' },
          revenue: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $project: {
          _id: 0,
          product: { $arrayElemAt: ['$productDetails', 0] },
          totalSold: 1,
          revenue: 1
        }
      }
    ]);
    
    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: '$products' },
      { $lookup: {
          from: 'products',
          localField: 'products.product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      { $group: {
          _id: '$productDetails.category',
          totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          count: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalSales: -1 } },
      { $project: {
          _id: 0,
          category: { $ifNull: ['$_id', 'Uncategorized'] },
          totalSales: 1,
          count: 1
        }
      }
    ]);
    
    // Prepare response data
    const responseData = {
      success: true,
      data: {
        salesTrends: combinedSalesTrends,
        topSellingProducts,
        salesByCategory,
        timeFrame
      }
    };
    
    // Update cache
    updateCache('sales', responseData);
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};
