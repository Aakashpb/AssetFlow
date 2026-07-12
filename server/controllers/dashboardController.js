import Asset from '../models/Asset.js';
import ActivityLog from '../models/ActivityLog.js';

export const getMetrics = async (req, res, next) => {
  try {
    const totalCount = await Asset.countDocuments({ deletedAt: null });
    const availableCount = await Asset.countDocuments({ status: 'Available', deletedAt: null });
    const assignedCount = await Asset.countDocuments({ status: 'Allocated', deletedAt: null });
    const maintenanceCount = await Asset.countDocuments({ status: 'Maintenance', deletedAt: null });
    const damagedCount = await Asset.countDocuments({
      status: { $in: ['Lost', 'Damaged'] },
      deletedAt: null
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const expiredWarrantyCount = await Asset.countDocuments({
      warrantyExpiry: { $lt: todayStr },
      deletedAt: null
    });

    // Recent activity log
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(6);

    // Category count statistics via MongoDB aggregation pipeline
    const categoryStats = await Asset.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

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
        category: stat._id,
        count: stat.count
      }))
    });
  } catch (error) {
    next(error);
  }
};
