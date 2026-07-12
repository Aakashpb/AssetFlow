import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import KpiCard from '../../components/Cards/KpiCard';
import DataTable from '../../components/Tables/DataTable';
import { 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Clock, 
  Bell,
  Package,
  TrendingUp,
  Laptop
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState({
    assets: [],
    bookings: [],
    maintenance: [],
    employees: [],
    notifications: [],
    departments: []
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [assets, catalogs, bookings, maintenance, notifications] = await Promise.all([
          api.getAssets(),
          api.getCatalogs(),
          api.getBookings(),
          api.getMaintenanceTickets(),
          api.getNotifications()
        ]);
        
        setDbData({
          assets,
          bookings,
          maintenance,
          employees: catalogs.employees,
          departments: catalogs.departments,
          notifications
        });
      } catch (error) {
        console.error("Dashboard Load Error:", error);
      }
    };
    loadDashboardData();
  }, []);

  const totalAssets = dbData.assets.length;
  const activeAssets = dbData.assets.filter(a => a.status === 'Allocated').length;
  const maintenanceAssets = dbData.assets.filter(a => a.status === 'Maintenance').length;
  const totalValue = dbData.assets.reduce((sum, a) => sum + (a.cost || 0), 0);

  // Recent Activity Timeline
  const recentActivities = dbData.assets
    .flatMap(asset => 
      (asset.history || []).map(h => ({
        date: h.date,
        action: h.action,
        assetName: asset.name,
        tag: asset.tag,
        user: h.user
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Filter unread notifications
  const recentAlerts = dbData.notifications.slice(0, 4);

  const categories = [...new Set(dbData.assets.map(a => a.category))];
  const isDark = theme === 'dark';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#242f47' : '#e2e8f0';

  // 1. Doughnut Chart: Asset Categories
  const doughnutData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => dbData.assets.filter(a => a.category === cat).length),
      backgroundColor: ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#14B8A6'],
      borderWidth: isDark ? 2 : 1,
      borderColor: isDark ? '#131926' : '#ffffff'
    }]
  };

  // 2. Bar Chart: Department-wise Assets
  const barData = {
    labels: dbData.departments.map(d => d.name.substring(0, 8) + '...'),
    datasets: [{
      label: 'Units Assigned',
      data: dbData.departments.map(dept => {
        return dbData.assets.filter(a => {
          const emp = dbData.employees.find(e => e.id === a.assignedTo);
          return emp && emp.department === dept.name;
        }).length;
      }),
      backgroundColor: '#8B5CF6',
      borderRadius: 4,
      barThickness: 12
    }]
  };

  // 3. Line Chart: Monthly Asset Additions
  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [{
      label: 'Registrations',
      data: [1, 2, 1, 0, 3, 2, 4],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textSecondary, font: { family: 'Inter', size: 9 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textSecondary, font: { family: 'Inter', size: 9 }, stepSize: 1 }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textSecondary,
          font: { family: 'Inter', size: 9 },
          boxWidth: 8,
          padding: 8
        }
      }
    },
    cutout: '70%'
  };

  // Recent assets table
  const recentAssets = [...dbData.assets]
    .sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate))
    .slice(0, 4);

  const columns = [
    { field: 'tag', label: 'Tag ID', render: (val) => <span className="font-mono bg-tagBg px-1.5 py-0.5 rounded">{val}</span> },
    { field: 'name', label: 'Asset Name' },
    { field: 'category', label: 'Category' },
    { field: 'status', label: 'Status', render: (val) => {
      const badges = {
        available: 'badge-available',
        allocated: 'badge-allocated',
        maintenance: 'badge-maintenance',
        retired: 'badge-retired'
      };
      return <span className={`badge ${badges[val.toLowerCase()] || 'badge-retired'}`}>{val}</span>;
    }}
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Top Greeting Row */}
      <div className="bg-cardBg border border-borderCol rounded-card p-6 bg-gradient-to-r from-primary/5 to-secondary/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-soft">
        <div>
          <h2 className="font-heading font-bold text-lg text-textPrimary">Welcome back, {user?.role}!</h2>
          <p className="text-xs text-textSecondary mt-0.5">Here is what's happening with the system assets and departments today.</p>
        </div>
        <div className="flex gap-2.5">
          {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
            <button 
              onClick={() => navigate('/registry')}
              className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover-btn-scale"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register Asset</span>
            </button>
          )}
          <button 
            onClick={() => navigate('/bookings')}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover-btn-scale"
          >
            <Calendar className="w-4 h-4" />
            <span>Reserve Resource</span>
          </button>
        </div>
      </div>

      {/* First Row: 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Assets" value={totalAssets} icon="Package" color="blue" description="Registry counts" />
        <KpiCard title="Active Assets" value={activeAssets} icon="CheckCircle" color="green" description="In corporate use" />
        <KpiCard title="Maintenance Due" value={maintenanceAssets} icon="AlertTriangle" color="amber" description="Needs inspection" />
        <KpiCard title="Asset Value" value={`$${totalValue.toLocaleString()}`} icon="DollarSign" color="purple" description="Cost valuation basis" />
      </div>

      {/* Main dashboard body with Right sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left main area containing Charts and Recent table */}
        <div className="xl:col-span-2 space-y-6">
          {/* Second Row: Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card relative overflow-hidden hover-card-lift border border-borderCol rounded-card p-4 pt-6 shadow-soft flex flex-col h-64">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
              <span className="font-semibold text-xs text-textPrimary flex items-center gap-1.5 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Categories Distribution
              </span>
              <div className="flex-1 min-h-[160px]">
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>

            <div className="glass-card relative overflow-hidden hover-card-lift border border-borderCol rounded-card p-4 pt-6 shadow-soft flex flex-col h-64">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]" />
              <span className="font-semibold text-xs text-textPrimary flex items-center gap-1.5 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-secondary" /> Department Assets
              </span>
              <div className="flex-1 min-h-[160px]">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div className="glass-card relative overflow-hidden hover-card-lift border border-borderCol rounded-card p-4 pt-6 shadow-soft flex flex-col h-64">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#10B981] to-[#34D399]" />
              <span className="font-semibold text-xs text-textPrimary flex items-center gap-1.5 mb-3">
                <TrendingUp className="w-3.5 h-3.5 text-success" /> Monthly Additions
              </span>
              <div className="flex-1 min-h-[160px]">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Third Row: Recent assets table */}
          <div className="glass-card relative overflow-hidden border border-borderCol rounded-card shadow-soft flex flex-col">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4f46e5] to-[#06b6d4]" />
            <div className="px-5 py-4 border-b border-borderCol flex justify-between items-center bg-hoverBg/10">
              <span className="font-semibold text-xs text-textPrimary flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" /> Recently Registered Assets
              </span>
              <button 
                onClick={() => navigate('/registry')}
                className="text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                View Registry
              </button>
            </div>
            <div className="p-4">
              <DataTable columns={columns} data={recentAssets} />
            </div>
          </div>
        </div>

        {/* Right Sidebar panel containing activity and notifications */}
        <div className="space-y-6">
          {/* Notifications alert checklist */}
          <div className="glass-card relative overflow-hidden border border-borderCol rounded-card shadow-soft flex flex-col h-[260px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]" />
            <div className="px-5 py-4 border-b border-borderCol flex items-center gap-2 bg-hoverBg/10">
              <Bell className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-xs text-textPrimary">System Alerts Drawer</span>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-6 text-xs text-textSecondary">No alerts.</div>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="text-xs border-b border-borderCol/50 pb-2 last:border-b-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-textPrimary">{alert.title}</span>
                      <span className="text-[10px] text-textMuted">{alert.time}</span>
                    </div>
                    <p className="text-textSecondary mt-0.5 leading-normal">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Logs timeline */}
          <div className="glass-card relative overflow-hidden border border-borderCol rounded-card shadow-soft flex flex-col h-[330px]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
            <div className="px-5 py-4 border-b border-borderCol flex items-center gap-2 bg-hoverBg/10">
              <Clock className="w-4 h-4 text-primary" />
              <span className="font-semibold text-xs text-textPrimary">Recent Activity Logs</span>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-xs text-textSecondary">No logs.</div>
              ) : (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-borderCol">
                  {recentActivities.map((act, index) => (
                    <div key={index} className="relative flex flex-col text-xs text-left">
                      <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full border border-cardBg bg-primary" />
                      <span className="text-[10px] text-textMuted">{act.date} &bull; by {act.user}</span>
                      <strong className="text-textPrimary mt-0.5">{act.action}</strong>
                      <span className="text-textSecondary mt-0.5 truncate">{act.assetName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
