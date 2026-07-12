import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { mockApi } from '../../services/mockApi';
import KpiCard from '../../components/Cards/KpiCard';
import { Printer, BarChart3, TrendingUp } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const { theme } = useTheme();
  
  const [dbData, setDbData] = useState({
    assets: [],
    bookings: [],
    maintenance: [],
    employees: []
  });

  useEffect(() => {
    setDbData(mockApi.getData());
  }, []);

  // Compute reports statistics
  const totalAssetCost = dbData.assets.reduce((sum, a) => sum + (a.cost || 0), 0);
  const totalMaintExpenses = dbData.maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  const totalDowntime = dbData.maintenance.reduce((sum, m) => sum + (m.downtime || 0), 0);

  const categories = [...new Set(dbData.assets.map(a => a.category))];
  const isDark = theme === 'dark';
  const textSecondary = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#242f47' : '#e2e8f0';

  // Pie Chart: Assets Distribution Cost-wise
  const pieData = {
    labels: categories,
    datasets: [{
      data: categories.map(cat => {
        return dbData.assets
          .filter(a => a.category === cat)
          .reduce((sum, curr) => sum + (curr.cost || 0), 0);
      }),
      backgroundColor: ['#3b82f6', '#14b8a6', '#8b5cf6', '#f59e0b', '#64748b'],
      borderWidth: isDark ? 2 : 1,
      borderColor: isDark ? '#131926' : '#ffffff'
    }]
  };

  // Bar Chart: Maintenance Cost per category
  const barData = {
    labels: categories,
    datasets: [{
      label: 'Maintenance Cost ($)',
      data: categories.map(cat => {
        const catAssetIds = dbData.assets.filter(a => a.category === cat).map(a => a.id);
        return dbData.maintenance
          .filter(m => catAssetIds.includes(m.assetId))
          .reduce((sum, curr) => sum + (curr.cost || 0), 0);
      }),
      backgroundColor: '#f59e0b',
      borderRadius: 4,
      barThickness: 16
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
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

  const pieOptions = {
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
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Comprehensive Analytics</h2>
          <p className="text-xs text-textSecondary">System performance index, cost optimization, and downtime values.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="btn btn-secondary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
        >
          <Printer className="w-4 h-4" />
          <span>Print PDF Report</span>
        </button>
      </div>

      {/* KPIs summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KpiCard title="Active Capital Assets" value={`$${totalAssetCost.toLocaleString()}`} icon="DollarSign" color="blue" description="Cost valuation basis" />
        <KpiCard title="Maintenance Expenditures" value={`$${totalMaintExpenses.toLocaleString()}`} icon="Wrench" color="red" description="Total service spend" />
        <KpiCard title="Total Offline Downtime" value={`${totalDowntime} Days`} icon="Clock" color="amber" description="Unscheduled offline duration" />
      </div>

      {/* Double Charts display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-borderCol">
            <span className="font-semibold text-sm text-textPrimary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Capital Allocation by Category ($)
            </span>
          </div>
          <div className="p-5 h-[280px]">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-borderCol">
            <span className="font-semibold text-sm text-textPrimary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-warning" /> Maintenance Cost by Category ($)
            </span>
          </div>
          <div className="p-5 h-[280px]">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
