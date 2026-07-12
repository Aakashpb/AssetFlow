import { Op, fn, col } from 'sequelize';
import Asset from '../models/Asset.js';
import ActivityLog from '../models/ActivityLog.js';

export const getMetrics = async (req, res, next) => {
  try {
    const totalCount = await Asset.count();
    const availableCount = await Asset.count({ where: { status: 'Available' } });
    const assignedCount = await Asset.count({ where: { status: 'Allocated' } });
    const maintenanceCount = await Asset.count({ where: { status: 'Maintenance' } });
    const damagedCount = await Asset.count({
      where: {
        status: { [Op.in]: ['Lost', 'Damaged'] }
      }
    });

    const now = new Date();
    const expiredWarrantyCount = await Asset.count({
      where: {
        warrantyExpiry: { [Op.lt]: now }
      }
    });

    // Recent activity log
    const recentActivities = await ActivityLog.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']]
    });

    // Category count statistics
    const categoryStats = await Asset.findAll({
      attributes: [
        'category',
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category']
    });

    res.json({
      success: true,
      metrics: {
        totalAssets: totalCount,
        availableAssets: availableCount,
        assignedAssets: assignedCount,
        maintenanceAssets: maintenanceCount,
        damagedAssets: damagedCount,
        expiredWarranties: expiredWarrantyCount
      },
      recentActivities: recentActivities.map(act => ({
        date: act.createdAt.toLocaleDateString(),
        time: act.createdAt.toLocaleTimeString(),
        action: act.action,
        user: act.userName || 'System',
        details: act.details
      })),
      categoryStatistics: categoryStats.map(stat => ({
        category: stat.category,
        count: parseInt(stat.getDataValue('count'))
      }))
    });
  } catch (error) {
    next(error);
  }
};
