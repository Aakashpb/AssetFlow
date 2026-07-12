import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import BaseModal from '../../components/Modals/BaseModal';
import { ClipboardCheck, CheckSquare, Plus, ArrowLeft } from 'lucide-react';

const Audit = () => {
  const { show } = useToast();
  
  const [audits, setAudits] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [activeAudit, setActiveAudit] = useState(null);
  
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [isDiscrepancyOpen, setIsDiscrepancyOpen] = useState(false);
  
  const [newForm, setNewForm] = useState({ name: '', scheduledDate: '' });
  const [discForm, setDiscForm] = useState({
    auditId: '', assetId: '', assetName: '', issueType: 'Location Discrepancy', details: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const list = mockApi.getAudits();
    setAudits(list);
    setAssets(mockApi.getAssets());
    
    // Auto-update active screen if viewing one
    if (activeAudit) {
      const updated = list.find(a => a.id === activeAudit.id);
      setActiveAudit(updated);
    }
  };

  const handleCreateAudit = (e) => {
    e.preventDefault();
    mockApi.addAuditCycle(newForm);
    show('Audit Scheduled', 'Successfully generated audit checklist.', 'success');
    setNewForm({ name: '', scheduledDate: '' });
    setIsNewOpen(false);
    refreshData();
  };

  const handleVerify = (auditId, assetId) => {
    mockApi.verifyAuditItem(auditId, assetId, 'Verified and matched serial details.', false);
    show('Asset Verified', 'Verification logged successfully.', 'success');
    refreshData();
  };

  const openDiscrepancyModal = (auditId, assetId, name) => {
    setDiscForm({
      auditId,
      assetId,
      assetName: name,
      issueType: 'Location Discrepancy',
      details: ''
    });
    setIsDiscrepancyOpen(true);
  };

  const handleDiscrepancySubmit = (e) => {
    e.preventDefault();
    mockApi.verifyAuditItem(
      discForm.auditId,
      discForm.assetId,
      `[${discForm.issueType}] ${discForm.details}`,
      true,
      discForm.issueType
    );
    show('Discrepancy Logged', 'Successfully reported asset discrepancy.', 'warning');
    setIsDiscrepancyOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-6 text-left">
      {!activeAudit ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-heading text-textPrimary">Structured Compliance Audits</h2>
              <p className="text-xs text-textSecondary">Schedule and execute inventory validations to audit discrepancies.</p>
            </div>
            <button 
              onClick={() => setIsNewOpen(true)}
              className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Audit Cycle</span>
            </button>
          </div>

          <div className="space-y-4">
            {audits.map(audit => (
              <div key={audit.id} className="bg-cardBg border border-borderCol rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                    audit.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {audit.status}
                  </span>
                  <h4 className="font-heading font-semibold text-base text-textPrimary">{audit.name}</h4>
                  <p className="text-xs text-textSecondary">Scheduled Date: {audit.scheduledDate}</p>
                </div>

                <div className="flex items-center gap-8 pr-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{audit.progress}%</div>
                    <span className="text-xs text-textMuted">{audit.checkedCount} / {audit.totalCount} Verified</span>
                  </div>
                  <div>
                    <button 
                      onClick={() => setActiveAudit(audit)}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{audit.status === 'Completed' ? 'View Results' : 'Perform Audit'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold font-heading text-textPrimary">{activeAudit.name}</h2>
              <p className="text-xs text-textSecondary">Interactive Verification checklist and reported discrepancies.</p>
            </div>
            <button 
              onClick={() => setActiveAudit(null)}
              className="btn btn-secondary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Audits List</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Checklist panel */}
            <div className="lg:col-span-3 bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="px-5 py-4 border-b border-borderCol flex justify-between items-center">
                <span className="font-semibold text-sm text-textPrimary">Verification Checklist</span>
                <span className="text-xs text-textSecondary font-medium">{activeAudit.checkedCount} / {activeAudit.totalCount} Verified</span>
              </div>
              <div className="p-5 divide-y divide-borderCol max-h-[500px] overflow-y-auto">
                {activeAudit.checklist.map(item => {
                  const asset = assets.find(a => a.id === item.assetId);
                  if (!asset) return null;
                  
                  const isPending = item.status === 'Pending';
                  
                  return (
                    <div key={item.assetId} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                      <div>
                        <div className="font-semibold text-sm text-textPrimary">{asset.name}</div>
                        <p className="text-xs text-textSecondary mt-0.5">Tag: {asset.tag} | Location: {asset.location}</p>
                        {item.notes && <p className="text-[11px] text-primary mt-1">Notes: "{item.notes}"</p>}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isPending ? (
                          activeAudit.status !== 'Completed' && (
                            <>
                              <button 
                                onClick={() => handleVerify(activeAudit.id, item.assetId)}
                                className="btn btn-sm btn-primary bg-emerald-600 hover:bg-emerald-700 text-white border-none text-[10px]"
                              >
                                Verify
                              </button>
                              <button 
                                onClick={() => openDiscrepancyModal(activeAudit.id, item.assetId, asset.name)}
                                className="btn btn-sm btn-danger bg-rose-600 hover:bg-rose-700 text-white border-none text-[10px]"
                              >
                                Discrepancy
                              </button>
                            </>
                          )
                        ) : (
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Discrepancies panel */}
            <div className="lg:col-span-2 bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden h-fit">
              <div className="px-5 py-4 border-b border-borderCol">
                <span className="font-semibold text-sm text-textPrimary">Flagged Discrepancies ({activeAudit.discrepancies.length})</span>
              </div>
              <div className="p-5 divide-y divide-borderCol">
                {activeAudit.discrepancies.length === 0 ? (
                  <div className="text-center py-6 text-xs text-textSecondary">No discrepancies reported in this audit cycle.</div>
                ) : (
                  activeAudit.discrepancies.map((disc, idx) => (
                    <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-1 text-xs text-left">
                      <div className="flex justify-between items-start gap-2.5">
                        <strong className="text-textPrimary text-sm leading-tight">{disc.assetName}</strong>
                        <span className="bg-rose-500/10 text-rose-500 text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex-shrink-0">
                          {disc.issue}
                        </span>
                      </div>
                      <span className="text-textSecondary mt-0.5">Asset ID: <strong>{disc.assetId}</strong></span>
                      <p className="text-textSecondary leading-normal mt-1 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded text-[11px] italic">
                        "{disc.details}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Audit Modal */}
      <BaseModal isOpen={isNewOpen} onClose={() => setIsNewOpen(false)} title="Create Compliance Audit Cycle">
        <form onSubmit={handleCreateAudit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Audit Title / Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Q3 2026 Inventory Verification"
              value={newForm.name}
              onChange={(e) => setNewForm({...newForm, name: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Scheduled Date</label>
            <input 
              type="date" 
              className="form-control"
              value={newForm.scheduledDate}
              onChange={(e) => setNewForm({...newForm, scheduledDate: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsNewOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Schedule Audit Cycle</button>
          </div>
        </form>
      </BaseModal>

      {/* Discrepancy Form Modal */}
      <BaseModal isOpen={isDiscrepancyOpen} onClose={() => setIsDiscrepancyOpen(false)} title="Flag Audit Discrepancy">
        <form onSubmit={handleDiscrepancySubmit} className="space-y-4 text-left">
          <h4 className="font-semibold text-sm text-textPrimary">{discForm.assetName}</h4>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Issue Category</label>
            <select 
              className="form-control"
              value={discForm.issueType}
              onChange={(e) => setDiscForm({...discForm, issueType: e.target.value})}
              required
            >
              <option value="Location Discrepancy">Location Discrepancy (Wrong room/branch)</option>
              <option value="Damaged / Needs Maintenance">Damaged / Needs Maintenance</option>
              <option value="Missing Asset">Missing Asset (Cannot locate)</option>
              <option value="Incorrect Holder Assignment">Incorrect Holder Assignment</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Discovery Details / Notes</label>
            <textarea 
              className="form-control"
              placeholder="Describe what you observed during the audit inspection..."
              rows={3}
              value={discForm.details}
              onChange={(e) => setDiscForm({...discForm, details: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsDiscrepancyOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Flag Discrepancy</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default Audit;
