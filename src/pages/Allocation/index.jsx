import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import DataTable from '../../components/Tables/DataTable';
import BaseModal from '../../components/Modals/BaseModal';
import { ArrowLeftRight, Check, X } from 'lucide-react';

const Allocation = () => {
  const { user } = useAuth();
  const { show } = useToast();
  
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const [form, setForm] = useState({
    assetId: '', toEmployee: '', purpose: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const list = mockApi.getTransferRequests();
    setTransfers(list);
    
    const allAssets = mockApi.getAssets();
    setAssets(allAssets);
    if (allAssets.length > 0 && !form.assetId) {
      setForm(prev => ({ ...prev, assetId: allAssets[0].id }));
    }

    const allEmps = mockApi.getEmployees();
    setEmployees(allEmps);
    if (allEmps.length > 0 && !form.toEmployee) {
      setForm(prev => ({ ...prev, toEmployee: allEmps[0].id }));
    }
  };

  const handleOpenRequest = () => {
    if (assets.length === 0 || employees.length === 0) {
      show('Error', 'No assets or employees available to request transfer.', 'error');
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mockApi.addTransferRequest({
      assetId: form.assetId,
      toEmployee: form.toEmployee,
      purpose: form.purpose
    });
    show('Request Submitted', 'Transfer request has been routed for departmental approval.', 'success');
    setForm(prev => ({ ...prev, purpose: '' }));
    setIsOpen(false);
    refreshData();
  };

  const handleApprove = (req) => {
    mockApi.handleTransferApproval(req.id, true);
    show('Request Approved', `Asset ${req.assetName} allocated to ${req.toEmployeeName}.`, 'success');
    refreshData();
  };

  const handleReject = (req) => {
    mockApi.handleTransferApproval(req.id, false);
    show('Request Declined', 'The transfer request was rejected.', 'warning');
    refreshData();
  };

  const columns = [
    { field: 'assetName', label: 'Asset Name' },
    { field: 'fromEmployee', label: 'Current Holder', render: (val) => {
      if (val === 'Inventory') return <span className="text-textSecondary italic">Inventory</span>;
      return val;
    }},
    { field: 'toEmployeeName', label: 'Recipient' },
    { field: 'requestDate', label: 'Requested On' },
    { field: 'purpose', label: 'Purpose' },
    { field: 'status', label: 'Transfer Status', render: (val) => {
      const isPending = val === 'Pending Approval';
      return (
        <span className={`badge ${isPending ? 'badge-pending' : 'badge-available'}`}>
          {val}
        </span>
      );
    }}
  ];

  // Access rights check
  const canApprove = user?.role === 'Admin' || user?.role === 'Asset Manager' || user?.role === 'Department Head';

  const tableActions = canApprove ? [
    {
      label: 'Approve',
      icon: Check,
      class: 'btn-primary bg-emerald-600 hover:bg-emerald-700 text-white border-none',
      onclick: handleApprove,
      visible: (row) => row.status === 'Pending Approval'
    },
    {
      label: 'Decline',
      icon: X,
      class: 'btn-danger bg-rose-600 hover:bg-rose-700 text-white border-none',
      onclick: handleReject,
      visible: (row) => row.status === 'Pending Approval'
    }
  ] : [];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Allocations & Transfers Queue</h2>
          <p className="text-xs text-textSecondary">Track asset assignments and authorize divisional transfers.</p>
        </div>
        <button 
          onClick={handleOpenRequest}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Request Transfer</span>
        </button>
      </div>

      <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-borderCol">
          <span className="font-semibold text-sm text-textPrimary">Pending Authorization Requests</span>
        </div>
        <div className="p-5">
          <DataTable columns={columns} data={transfers} actions={tableActions} />
        </div>
      </div>

      {/* Request Modal */}
      <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Request Resource Allocation / Transfer">
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Target Asset</label>
            <select 
              className="form-control"
              value={form.assetId}
              onChange={(e) => setForm({...form, assetId: e.target.value})}
              required
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.tag}) [{a.status}]</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Recipient Employee</label>
            <select 
              className="form-control"
              value={form.toEmployee}
              onChange={(e) => setForm({...form, toEmployee: e.target.value})}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Business Purpose</label>
            <textarea 
              className="form-control"
              placeholder="Describe the reason for this allocation or location change..."
              rows={3}
              value={form.purpose}
              onChange={(e) => setForm({...form, purpose: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Route Transfer Request</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default Allocation;
