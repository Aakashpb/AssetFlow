import React from 'react';
import * as LucideIcons from 'lucide-react';

const KpiCard = ({ title, value, icon, color = 'blue', description }) => {
  // Dynamically resolve icon from string name
  const IconComponent = LucideIcons[icon] || LucideIcons.HelpCircle;

  const colorStyles = {
    blue: { bg: 'bg-primary/10', text: 'text-primary' },
    teal: { bg: 'bg-secondary/10', text: 'text-secondary' },
    green: { bg: 'bg-success/10', text: 'text-success' },
    amber: { bg: 'bg-warning/10', text: 'text-warning' },
    red: { bg: 'bg-danger/10', text: 'text-danger' },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className="bg-cardBg border border-borderCol hover:border-primary rounded-lg p-5 shadow-sm hover:shadow-md flex items-center gap-4 transition-all duration-200 group">
      <div className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${style.bg} ${style.text}`}>
        <IconComponent className="w-6 h-6" />
      </div>
      <div className="flex flex-col text-left">
        <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-textPrimary leading-none mt-1">{value}</span>
        {description && <span className="text-xs text-textMuted mt-1">{description}</span>}
      </div>
    </div>
  );
};

export default KpiCard;
