import React from 'react';
import { FolderOpen } from 'lucide-react';

const DataTable = ({ columns, data = [], actions = [] }) => {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-cardBg border border-borderCol rounded-card">
        <FolderOpen className="w-12 h-12 text-textMuted mb-4 hover-icon-rotate" />
        <div className="font-heading font-semibold text-lg text-textPrimary">No records found</div>
        <p className="text-xs text-textSecondary max-w-xs mt-1 leading-relaxed">Try clearing active filters or adding new items to seed this table.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden border border-borderCol rounded-card shadow-soft max-h-[400px] overflow-y-auto">
      <table className="w-full border-collapse text-left text-xs sticky-header-table zebra-table">
        <thead>
          <tr className="bg-hoverBg border-b border-borderCol">
            {columns.map(col => (
              <th key={col.label} className="text-textSecondary font-semibold px-4 py-3 whitespace-nowrap bg-hoverBg">
                {col.label}
              </th>
            ))}
            {actions.length > 0 && <th className="text-textSecondary font-semibold px-4 py-3 whitespace-nowrap bg-hoverBg">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-borderCol">
          {data.map((row, rowIndex) => (
            <tr key={row.id || row.assetId || rowIndex} className="hover:bg-hoverBg/40 transition-colors">
              {columns.map(col => {
                const cellValue = col.render ? col.render(row[col.field], row) : row[col.field];
                return (
                  <td key={col.label} className="px-4 py-3 text-textPrimary whitespace-nowrap">
                    {cellValue !== undefined && cellValue !== null ? cellValue : '—'}
                  </td>
                );
              })}
              {actions.length > 0 && (
                <td className="px-4 py-3 text-textPrimary whitespace-nowrap">
                  <div className="flex gap-1.5">
                    {actions.map((act, index) => {
                      if (act.visible && !act.visible(row)) {
                        return null;
                      }
                      const ActIcon = act.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => act.onclick(row)}
                          className={`btn btn-sm cursor-pointer flex items-center gap-1.5 hover-btn-scale py-1.5 px-3 rounded-btn ${act.class || 'btn-secondary'}`}
                        >
                          {ActIcon && <ActIcon className="w-3.5 h-3.5" />}
                          <span>{act.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
