import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import BaseModal from '../../components/Modals/BaseModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  PlusCircle, 
  User, 
  CheckSquare, 
  Wrench
} from 'lucide-react';

const Maintenance = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const [tickets, setTickets] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  const [form, setForm] = useState({
    assetId: '', title: '', severity: 'Low', cost: '', downtime: '', assignedTo: 'IT Helpdesk', description: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const list = mockApi.getMaintenance();
    setTickets(list);
    
    const allAssets = mockApi.getAssets();
    setAssets(allAssets);
    if (allAssets.length > 0 && !form.assetId) {
      setForm(prev => ({ ...prev, assetId: allAssets[0].id }));
    }
  };

  const columns = [
    { key: 'Backlog', label: 'Backlog' },
    { key: 'Scheduled', label: 'Scheduled' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Review', label: 'Under Review' },
    { key: 'Completed', label: 'Completed' }
  ];

  const handleOpenCreate = () => {
    if (assets.length === 0) {
      show('Error', 'No assets available to service.', 'error');
      return;
    }
    setIsOpenCreate();
  };

  const setIsOpenCreate = () => {
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    mockApi.addMaintenanceTicket({
      assetId: form.assetId,
      title: form.title,
      severity: form.severity,
      cost: parseFloat(form.cost) || 0,
      downtime: parseInt(form.downtime) || 0,
      assignedTo: form.assignedTo,
      description: form.description
    });
    show('Ticket Created', 'Successfully registered maintenance schedule.', 'success');
    setForm(prev => ({
      ...prev,
      title: '', cost: '', downtime: '', description: ''
    }));
    setIsCreateOpen(false);
    refreshData();
  };

  const handleMoveTicket = (ticketId, direction) => {
    const task = tickets.find(t => t.id === ticketId);
    if (!task) return;

    const columnKeys = columns.map(c => c.key);
    const idx = columnKeys.indexOf(task.stage);

    let newIdx = idx;
    if (direction === 'prev' && idx > 0) newIdx--;
    if (direction === 'next' && idx < columnKeys.length - 1) newIdx++;

    if (newIdx !== idx) {
      mockApi.updateMaintenanceStage(ticketId, columnKeys[newIdx]);
      show('Workflow Advanced', `Moved task to ${columnKeys[newIdx]}.`, 'success');
      refreshData();
    }
  };

  // Drag and Drop controls
  const handleDragStart = (e, ticketId) => {
    setDraggedTaskId(ticketId);
    e.dataTransfer.setData('text/plain', ticketId);
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const ticketId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!ticketId) return;

    const task = tickets.find(t => t.id === ticketId);
    if (task && task.stage !== targetStage) {
      mockApi.updateMaintenanceStage(ticketId, targetStage);
      show('Task Reordered', `Moved to ${targetStage} via drag-and-drop.`, 'success');
      refreshData();
    }
    setDraggedTaskId(null);
  };

  const openDetails = (ticket) => {
    setActiveTicket(ticket);
    setIsDetailsOpen(true);
  };

  const getSeverityClass = (sev) => {
    const styles = {
      low: 'bg-emerald-500/10 text-emerald-500',
      medium: 'bg-amber-500/10 text-amber-500',
      critical: 'bg-rose-500/10 text-rose-500'
    };
    return styles[sev.toLowerCase()] || 'bg-slate-500/10 text-slate-500';
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Asset Maintenance Board</h2>
          <p className="text-xs text-textSecondary">Kanban workflow to track diagnostics, repair schedules, and compliance check-offs.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Maintenance Ticket</span>
        </button>
      </div>

      {/* Kanban Board columns wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colTickets = tickets.filter(t => t.stage === col.key);
          
          return (
            <div 
              key={col.key} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.key)}
              className="bg-hoverBg border border-borderCol rounded-lg p-3 flex flex-col gap-3 min-h-[500px] w-full"
            >
              <div className="flex items-center justify-between px-1">
                <span className="font-semibold text-[11px] text-textSecondary uppercase tracking-wider">{col.label}</span>
                <span className="bg-cardBg text-textSecondary border border-borderCol text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {colTickets.length}
                </span>
              </div>

              <div className="flex flex-col gap-2.5 flex-1 min-h-[420px]">
                {colTickets.map(ticket => (
                  <div 
                    key={ticket.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, ticket.id)}
                    onClick={() => openDetails(ticket)}
                    className="bg-cardBg border border-borderCardCol hover:border-primary rounded-md p-3.5 shadow-sm hover:shadow-md cursor-grab transition-all duration-150 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-2.5">
                      <span className="font-semibold text-xs text-textPrimary leading-snug line-clamp-2">
                        {ticket.title}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase flex-shrink-0 ${getSeverityClass(ticket.severity)}`}>
                        {ticket.severity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-textSecondary">
                      <span className="bg-hoverBg px-1.5 py-0.5 rounded font-mono">{ticket.assetId}</span>
                      <span>Est: ${ticket.cost}</span>
                    </div>

                    <div className="flex justify-between items-center border-t border-borderCol pt-2 text-[10px] text-textMuted">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{ticket.assignedTo}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-1" onClick={(e) => e.stopPropagation()}>
                      {col.key !== 'Backlog' ? (
                        <button 
                          onClick={() => handleMoveTicket(ticket.id, 'prev')}
                          className="text-textMuted hover:text-textPrimary p-0.5 rounded hover:bg-hoverBg cursor-pointer transition-colors"
                          title="Move Left"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      ) : <div />}
                      
                      {col.key !== 'Completed' ? (
                        <button 
                          onClick={() => handleMoveTicket(ticket.id, 'next')}
                          className="text-textMuted hover:text-textPrimary p-0.5 rounded hover:bg-hoverBg cursor-pointer transition-colors"
                          title="Move Right"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : <div />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostics details modal */}
      <BaseModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Maintenance Ticket Details">
        {activeTicket && (
          <div className="space-y-5 text-left">
            <div>
              <h3 className="font-heading font-semibold text-base text-textPrimary leading-snug">{activeTicket.title}</h3>
              <p className="text-xs text-textSecondary mt-0.5">Ticket ID: <strong className="text-textPrimary">{activeTicket.id}</strong> | Asset ID: <strong className="text-textPrimary">{activeTicket.assetId}</strong></p>
            </div>

            <table className="w-full text-xs border-collapse">
              <tbody className="divide-y divide-borderCol">
                <tr><td className="py-2.5 text-textSecondary text-xs">Asset Name</td><td className="py-2.5 font-semibold text-textPrimary text-xs text-right">{activeTicket.assetName}</td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Severity</td><td className="py-2.5 text-right"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${getSeverityClass(activeTicket.severity)}`}>{activeTicket.severity}</span></td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Workflow Stage</td><td className="py-2.5 font-semibold text-textPrimary text-xs text-right">{activeTicket.stage}</td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Repair Crew</td><td className="py-2.5 text-textPrimary text-xs text-right">{activeTicket.assignedTo}</td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Date Created</td><td className="py-2.5 text-textPrimary text-xs text-right">{activeTicket.dateCreated}</td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Estimated Cost</td><td className="py-2.5 font-bold text-textPrimary text-xs text-right">${activeTicket.cost}</td></tr>
                <tr><td className="py-2.5 text-textSecondary text-xs">Est. Downtime</td><td className="py-2.5 font-semibold text-textPrimary text-xs text-right">{activeTicket.downtime} days</td></tr>
              </tbody>
            </table>

            <div className="border-t border-borderCol pt-4 space-y-2">
              <h4 className="font-heading font-semibold text-sm text-textPrimary">Diagnostic Details</h4>
              <p className="text-xs text-textSecondary leading-relaxed">{activeTicket.description}</p>
            </div>
          </div>
        )}
      </BaseModal>

      {/* Create Ticket Modal */}
      <BaseModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Maintenance Ticket">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Asset to Service</label>
            <select 
              className="form-control"
              value={form.assetId}
              onChange={(e) => setForm({...form, assetId: e.target.value})}
              required
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.tag})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Problem / Repair Summary</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Screen repair, broken hinge"
              value={form.title}
              onChange={(e) => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Severity Level</label>
              <select 
                className="form-control"
                value={form.severity}
                onChange={(e) => setForm({...form, severity: e.target.value})}
                required
              >
                <option value="Low">Low (Operational)</option>
                <option value="Medium">Medium (Partially Degraded)</option>
                <option value="Critical">Critical (Device Offline)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Assigned Vendor / Staff</label>
              <input 
                type="text" 
                className="form-control"
                value={form.assignedTo}
                onChange={(e) => setForm({...form, assignedTo: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Est. Cost ($)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 150"
                value={form.cost}
                onChange={(e) => setForm({...form, cost: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Est. Downtime (Days)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 3"
                value={form.downtime}
                onChange={(e) => setForm({...form, downtime: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Failure Description & Diagnostics</label>
            <textarea 
              className="form-control"
              placeholder="Input failure details..."
              rows={3}
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Publish Ticket</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default Maintenance;
