import Asset from '../models/Asset.js';
import User from '../models/User.js';
import Maintenance from '../models/Maintenance.js';
import AssetAssignment from '../models/AssetAssignment.js';
import { generatePdfReport, generateExcelReport } from '../services/reportService.js';

export const exportAssetReport = async (req, res, next) => {
  const { format } = req.query; // pdf or excel

  try {
    const assets = await Asset.findAll();
    
    if (format === 'excel') {
      const columns = [
        { header: 'Tag ID', key: 'tag' },
        { header: 'Asset Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Status', key: 'status' },
        { header: 'Location', key: 'location' },
        { header: 'Cost ($)', key: 'purchaseCost' }
      ];
      const rows = assets.map(a => ({
        tag: a.tag,
        name: a.name,
        category: a.category,
        status: a.status,
        location: a.location,
        purchaseCost: parseFloat(a.purchaseCost)
      }));

      const buffer = await generateExcelReport('Asset Report', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=AssetReport.xlsx');
      return res.send(buffer);
    } else {
      // Default: PDF
      const headers = ['Tag ID', 'Asset Name', 'Category', 'Status', 'Location', 'Cost'];
      const rows = assets.map(a => [
        a.tag,
        a.name,
        a.category,
        a.status,
        a.location,
        `$${parseFloat(a.purchaseCost).toFixed(2)}`
      ]);

      const buffer = await generatePdfReport('Asset Registry Valuation Report', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=AssetReport.pdf');
      return res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};

export const exportMaintenanceReport = async (req, res, next) => {
  const { format } = req.query;

  try {
    const tickets = await Maintenance.findAll({
      include: [{ model: Asset, as: 'asset', attributes: ['tag', 'name'] }]
    });

    if (format === 'excel') {
      const columns = [
        { header: 'Ticket ID', key: 'id' },
        { header: 'Asset Tag', key: 'assetTag' },
        { header: 'Asset Name', key: 'assetName' },
        { header: 'Title', key: 'title' },
        { header: 'Priority', key: 'priority' },
        { header: 'Status', key: 'status' },
        { header: 'Cost ($)', key: 'cost' }
      ];
      const rows = tickets.map(t => ({
        id: t.id,
        assetTag: t.asset?.tag || '—',
        assetName: t.asset?.name || '—',
        title: t.title,
        priority: t.priority,
        status: t.status,
        cost: parseFloat(t.cost)
      }));

      const buffer = await generateExcelReport('Maintenance Spend Report', columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=MaintenanceReport.xlsx');
      return res.send(buffer);
    } else {
      const headers = ['Ticket ID', 'Asset Tag', 'Title', 'Priority', 'Status', 'Cost'];
      const rows = tickets.map(t => [
        t.id,
        t.asset?.tag || '—',
        t.title,
        t.priority,
        t.status,
        `$${parseFloat(t.cost).toFixed(2)}`
      ]);

      const buffer = await generatePdfReport('Asset Maintenance Spend & Downtime Report', headers, rows);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=MaintenanceReport.pdf');
      return res.send(buffer);
    }
  } catch (error) {
    next(error);
  }
};
export const exportUserReport = async (req, res, next) => {
  try {
    const users = await User.findAll();
    const headers = ['UID', 'Name', 'Email', 'Department', 'Role', 'Status'];
    const rows = users.map(u => [u.uid, u.name, u.email, u.department, u.roleId || 'Employee', u.status]);
    const buffer = await generatePdfReport('Corporate User Registrations Directory', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=UserReport.pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
export const exportAssignmentReport = async (req, res, next) => {
  try {
    const assignments = await AssetAssignment.findAll({
      include: [
        { model: Asset, as: 'asset', attributes: ['tag'] },
        { model: User, as: 'user', attributes: ['name'] }
      ]
    });
    const headers = ['ID', 'Asset Tag', 'Holder', 'Issue Date', 'Status'];
    const rows = assignments.map(a => [
      a.id,
      a.asset?.tag || '—',
      a.user?.name || '—',
      new Date(a.issueDate).toLocaleDateString(),
      a.status
    ]);
    const buffer = await generatePdfReport('Asset Assignment Check-out Log', headers, rows);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=AssignmentReport.pdf');
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};
