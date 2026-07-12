import React from 'react';
import * as LucideIcons from 'lucide-react';

const KpiCard = ({ title, value, icon, color = 'blue', description }) => {
  const IconComponent = LucideIcons[icon] || LucideIcons.HelpCircle;

  const colorStyles = {
    blue: {
      cardBg: 'from-[#3B82F6]/10 to-[#6366F1]/10',
      topLine: 'bg-gradient-to-r from-[#3B82F6] to-[#6366F1]',
      iconBg: 'bg-gradient-to-br from-[#3B82F6] to-[#6366F1]',
    },
    green: {
      cardBg: 'from-[#10B981]/10 to-[#34D399]/10',
      topLine: 'bg-gradient-to-r from-[#10B981] to-[#34D399]',
      iconBg: 'bg-gradient-to-br from-[#10B981] to-[#34D399]',
    },
    amber: {
      cardBg: 'from-[#F59E0B]/10 to-[#FBBF24]/10',
      topLine: 'bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]',
      iconBg: 'bg-gradient-to-br from-[#F59E0B] to-[#FBBF24]',
    },
    purple: {
      cardBg: 'from-[#8B5CF6]/10 to-[#A78BFA]/10',
      topLine: 'bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA]',
      iconBg: 'bg-gradient-to-br from-[#8B5CF6] to-[#A78BFA]',
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${style.cardBg} hover-card-lift rounded-card p-5 pt-7 flex items-center gap-4 group cursor-pointer border border-borderCol shadow-soft`}>
      {/* Top Accent Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${style.topLine}`} />
      
      {/* Circular Gradient Icon Wrapper with white icon */}
      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${style.iconBg} text-white`}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <span className="text-2xl font-bold text-[#1E293B] dark:text-white leading-none mt-1 group-hover:text-primary transition-colors">{value}</span>
        {description && <span className="text-[10px] text-textMuted mt-1">{description}</span>}
      </div>
    </div>
  );
};

export default KpiCard;
