import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { mockApi } from '../../services/mockApi';
import KpiCard from '../../components/Cards/KpiCard';
import { 
  PlusCircle, 
  Calendar, 
  BarChart3, 
  Clock, 
  ArrowUpRight 
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [dbData, setDbData] = useState({
    assets: [],
    bookings: [],
    maintenance: [],
    employees: [],
    notifications: []
  });

  useEffect(() => {
    setDbData(mockApi.getData());
  }, []);

  const totalAssets = dbData.assets.length;
  const availableAssets = dbData.assets.filter(a => a.status === 'Available').length;
  const allocatedAssets = dbData.assets.filter(a => a.status === 'Allocated').length;
  const maintenanceAssets = dbData.assets.filter(a => a.status === 'Maintenance').length;

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

  // Charts Logic
  const categories = [...new Set(dbData.assets.map(a => a.category))];
  
  // Doughnut Chart data: categories distribution
  const doughnutData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => dbData.assets.filter(a => a.category === cat).length),
      backgroundColor: ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#64748b'],
      borderWidth: theme === 'dark' ? 2 : 1,
      borderColor: theme === 'dark' ? '#131926' : '#ffffff'
    }]
  };

  const isDark = theme === 'dark';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#242f47' : '#e2e8f0';

  // Bar Chart data: expenses by category
  const barData = {
    labels: categories,
    datasets: [{
      label: 'Total Expenses ($)',
      data: categories.map(cat => {
        const catAssetIds = dbData.assets.filter(a => a.category === cat).map(a => a.id);
        return dbData.maintenance
          .filter(m => catAssetIds.includes(m.assetId))
          .reduce((sum, curr) => sum + curr.cost, 0);
      }),
      backgroundColor: '#14b8a6',
      borderRadius: 6,
      barThickness: 20
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textSecondary, font: { family: 'Inter', size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textSecondary, font: { family: 'Inter', size: 10 } }
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
          font: { family: 'Inter', size: 10 },
          boxWidth: 10,
          padding: 10
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold font-heading text-textPrimary">Enterprise Dashboard</h2>
        <p className="text-xs text-textSecondary">Unified operational overview and key system stats.</p>
      </div>

      {/* Greeting Banner */}
      <div className="bg-cardBg border border-borderCol rounded-lg p-6 bg-gradient-to-r from-primary/5 to-secondary/5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-heading font-semibold text-lg text-textPrimary">Welcome back, {user?.role}!</h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Here is what's happening with the system assets and departments today.
          </p>
        </div>
        <div className="flex gap-2.5">
          {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
            <button 
              onClick={() => navigate('/registry')}
              className="btn btn-primary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
          )}
          <button 
            onClick={() => navigate('/bookings')}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <Calendar className="w-4 h-4" />
            <span>Reserve Resource</span>
          </button>
        </div>
      </div>

      {/* KPIs summary grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard title="Total Registered" value={totalAssets} icon="Package" color="blue" description="Across all workspaces" />
        <KpiCard title="Available Items" value={availableAssets} icon="CheckCircle" color="green" description="+12% this quarter" />
        <KpiCard title="Allocated Units" value={allocatedAssets} icon="UserCheck" color="teal" description="Allocated to staff" />
        <KpiCard title="In Maintenance" value={maintenanceAssets} icon="Wrench" color="red" description="Pending tickets" />
      </div>

      {/* Dashboard Chart grid & Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Analysis Chart */}
        <div className="lg:col-span-2 bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-borderCol flex justify-between items-center">
            <span className="font-semibold text-sm flex items-center gap-2 text-textPrimary">
              <BarChart3 className="w-4 h-4 text-secondary" /> Expenses Breakdown ($)
            </span>
            <button 
              onClick={() => navigate('/analytics')}
              className="btn btn-secondary btn-sm text-xs cursor-pointer"
            >
              View Reports
            </button>
          </div>
          <div className="p-5 flex-1 h-[280px]">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* Category distribution Doughnut */}
        <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-borderCol flex justify-between items-center">
            <span className="font-semibold text-sm text-textPrimary">Category Distribution</span>
          </div>
          <div className="p-5 flex-1 h-[280px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-3 bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-borderCol flex justify-between items-center">
            <span className="font-semibold text-sm flex items-center gap-2 text-textPrimary">
              <Clock className="w-4 h-4 text-primary" /> Recent Activity Logs
            </span>
          </div>
          <div className="p-5 flex flex-col gap-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-xs text-textSecondary">No recent logs.</div>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-borderCol">
                {recentActivities.map((act, index) => {
                  const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger'];
                  const dotColor = colors[index % colors.length];
                  return (
                    <div key={index} className="relative flex flex-col text-left text-xs gap-0.5">
                      <div className={`absolute -left-6 top-1.5 w-2 h-2 rounded-full border border-cardBg ${dotColor}`} />
                      <span className="text-[10px] text-textMuted">{act.date} &bull; by {act.user}</span>
                      <strong className="text-textPrimary text-sm mt-0.5">{act.action}</strong>
                      <span className="text-textSecondary mt-0.5">{act.assetName} ({act.tag})</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
