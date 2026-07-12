import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import { generateMockQR } from '../../utils/qrGenerator';
import BaseModal from '../../components/Modals/BaseModal';
import { 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit,
  Laptop,
  Smartphone,
  Armchair,
  Car,
  Monitor,
  Package,
  UploadCloud
} from 'lucide-react';

const Assets = () => {
  const { user } = useAuth();
  const { show } = useToast();
  
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Active selected asset
  const [activeAsset, setActiveAsset] = useState(null);

  // Form states
  const [regForm, setRegForm] = useState({
    name: '', category: 'IT Hardware', serial: '', location: '', cost: '', purchaseDate: ''
  });
  
  const [editForm, setEditForm] = useState({
    id: '', status: '', location: '', assignedTo: ''
  });

  useEffect(() => {
    setAssets(mockApi.getAssets());
    setEmployees(mockApi.getEmployees());
  }, []);

  const refreshAssets = () => {
    setAssets(mockApi.getAssets());
  };

  const getCategoryIcon = (catName) => {
    const cats = {
      "IT Hardware": Laptop,
      "Mobile Devices": Smartphone,
      "Office Furniture": Armchair,
      "Vehicles": Car,
      "AV Equipment": Monitor
    };
    return cats[catName] || Package;
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Tag', 'Serial', 'Category', 'Status', 'Location', 'Cost ($)', 'Purchase Date'];
    const rows = assets.map(a => [a.id, a.name, a.tag, a.serial, a.category, a.status, a.location, a.cost, a.purchaseDate]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AssetFlow_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    show('Export Successful', 'Inventory list downloaded as CSV.', 'success');
  };

  // Register Asset
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    try {
      mockApi.addAsset({
        name: regForm.name,
        category: regForm.category,
        serial: regForm.serial,
        location: regForm.location,
        cost: parseFloat(regForm.cost),
        purchaseDate: regForm.purchaseDate,
        colorCode: '#3b82f6'
      });
      show('Asset Registered', `Successfully added ${regForm.name} to inventory.`, 'success');
      setRegForm({ name: '', category: 'IT Hardware', serial: '', location: '', cost: '', purchaseDate: '' });
      setIsRegOpen(false);
      refreshAssets();
    } catch (err) {
      show('Error', 'Failed to register asset.', 'error');
    }
  };

  // Edit status open
  const openEditModal = (asset) => {
    setEditForm({
      id: asset.id,
      status: asset.status,
      location: asset.location,
      assignedTo: asset.assignedTo || ''
    });
    setActiveAsset(asset);
    setIsEditOpen(true);
  };

  // Save edit status
  const handleEditSubmit = (e) => {
    e.preventDefault();
    mockApi.updateAssetStatus(editForm.id, {
      status: editForm.status,
      location: editForm.location,
      assignedTo: editForm.assignedTo
    });
    show('Status Updated', 'Changes saved successfully.', 'success');
    setIsEditOpen(false);
    refreshAssets();
  };

  // Details popover open
  const openDetails = (asset) => {
    setActiveAsset(asset);
    setIsDetailsOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    const statuses = {
      available: 'bg-emerald-500/10 text-emerald-500',
      allocated: 'bg-blue-500/10 text-blue-500',
      maintenance: 'bg-rose-500/10 text-rose-500',
      retired: 'bg-slate-500/10 text-slate-500'
    };
    return statuses[status.toLowerCase()] || 'bg-slate-500/10 text-slate-500';
  };

  // Filter logic
  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serial.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    const matchesStatus = !selectedStatus || a.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Hardware & Resource Registry</h2>
          <p className="text-xs text-textSecondary">Full searchable index of physical and virtual assets.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            onClick={exportCSV}
            className="btn btn-secondary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
            <button 
              onClick={() => setIsRegOpen(true)}
              className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Asset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div className="flex flex-wrap gap-2.5">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-filter text-xs border border-borderCol rounded-md bg-cardBg py-2 px-3 text-textPrimary cursor-pointer focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="IT Hardware">IT Hardware</option>
            <option value="Mobile Devices">Mobile Devices</option>
            <option value="Office Furniture">Office Furniture</option>
            <option value="Vehicles">Vehicles</option>
            <option value="AV Equipment">AV Equipment</option>
          </select>

          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select-filter text-xs border border-borderCol rounded-md bg-cardBg py-2 px-3 text-textPrimary cursor-pointer focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search assets name, tag, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cardBg border border-borderCol rounded-md text-textPrimary text-xs focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Asset Grid view */}
      {filteredAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-cardBg border border-borderCol rounded-md">
          <Package className="w-12 h-12 text-textMuted mb-4" />
          <div className="font-heading font-semibold text-lg text-textPrimary">No assets found</div>
          <p className="text-sm text-textSecondary max-w-xs mt-1">Try modifying active filters or add a new asset to register.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAssets.map(asset => {
            const CatIcon = getCategoryIcon(asset.category);
            const assignedEmp = employees.find(e => e.id === asset.assignedTo);
            const displayUser = assignedEmp ? assignedEmp.name : 'Available';
            const userAvatar = assignedEmp ? assignedEmp.avatar : 'AV';
            
            return (
              <div key={asset.id} className="bg-cardBg border border-borderCol hover:border-primary rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
                <div 
                  className="h-28 relative flex items-center justify-center text-white" 
                  style={{ background: `linear-gradient(135deg, ${asset.colorCode || '#3b82f6'}, #1e1b4b)` }}
                >
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-0.5 rounded-sm">
                    {asset.tag}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(asset.status)}`}>
                      {asset.status}
                    </span>
                  </div>
                  <CatIcon className="w-10 h-10 opacity-30" />
                </div>
                
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <h4 className="font-semibold text-sm text-textPrimary group-hover:text-primary transition-colors line-clamp-1" title={asset.name}>
                    {asset.name}
                  </h4>
                  
                  <div className="flex justify-between items-center text-xs text-textSecondary border-b border-borderCol pb-2">
                    <span>Cat: {asset.category}</span>
                    <span>Loc: {asset.location}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-hoverBg text-textPrimary font-semibold text-[9px] border border-borderCol flex items-center justify-center" title={displayUser}>
                        {userAvatar}
                      </div>
                      <span className="text-textSecondary truncate max-w-[100px]">{displayUser}</span>
                    </div>
                    <span className="font-bold text-textPrimary">${asset.cost.toLocaleString()}</span>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => openDetails(asset)}
                      className="btn btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    {(user?.role === 'Admin' || user?.role === 'Asset Manager') && (
                      <button 
                        onClick={() => openEditModal(asset)}
                        className="btn btn-secondary btn-sm flex-shrink-0 cursor-pointer"
                        title="Edit Status"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* A. Register Modal */}
      <BaseModal isOpen={isRegOpen} onClose={() => setIsRegOpen(false)} title="Register New Corporate Asset">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Asset Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. MacBook Pro M3"
              value={regForm.name}
              onChange={(e) => setRegForm({...regForm, name: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Category</label>
              <select 
                className="form-control"
                value={regForm.category}
                onChange={(e) => setRegForm({...regForm, category: e.target.value})}
                required
              >
                <option value="IT Hardware">IT Hardware</option>
                <option value="Mobile Devices">Mobile Devices</option>
                <option value="Office Furniture">Office Furniture</option>
                <option value="Vehicles">Vehicles</option>
                <option value="AV Equipment">AV Equipment</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Serial Number</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. SN-87123A"
                value={regForm.serial}
                onChange={(e) => setRegForm({...regForm, serial: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Initial Location</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. headquarters Storage Room"
              value={regForm.location}
              onChange={(e) => setRegForm({...regForm, location: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Cost Basis ($)</label>
              <input 
                type="number" 
                className="form-control"
                placeholder="e.g. 1500"
                value={regForm.cost}
                onChange={(e) => setRegForm({...regForm, cost: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Purchase Date</label>
              <input 
                type="date" 
                className="form-control"
                value={regForm.purchaseDate}
                onChange={(e) => setRegForm({...regForm, purchaseDate: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Asset Photo Upload</label>
            <div 
              onClick={() => show('Simulate Drop', 'Image file simulation registered.', 'info')}
              className="border-2 border-dashed border-borderCol hover:border-primary rounded-md p-6 text-center cursor-pointer bg-mainBg/30 hover:bg-hoverBg flex flex-col items-center gap-2 transition-all"
            >
              <UploadCloud className="w-8 h-8 text-textMuted" />
              <span className="text-xs text-textSecondary">Drag files here or click to select image</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsRegOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Register Asset</button>
          </div>
        </form>
      </BaseModal>

      {/* B. Edit Status Modal */}
      <BaseModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Asset Status">
        <form onSubmit={handleEditSubmit} className="space-y-4 text-left">
          <h4 className="font-semibold text-sm text-textPrimary">{activeAsset?.name}</h4>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Asset Lifecycle Status</label>
            <select 
              className="form-control"
              value={editForm.status}
              onChange={(e) => setEditForm({...editForm, status: e.target.value})}
            >
              <option value="Available">Available (Inventory)</option>
              <option value="Allocated">Allocated (In Use)</option>
              <option value="Maintenance">Maintenance / Service</option>
              <option value="Retired">Retired / Out of Service</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Current / New Location</label>
            <input 
              type="text" 
              className="form-control"
              value={editForm.location}
              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Assigned Employee</label>
            <select 
              className="form-control"
              value={editForm.assignedTo}
              onChange={(e) => setEditForm({...editForm, assignedTo: e.target.value})}
            >
              <option value="">-- Unassigned (Inventory) --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsEditOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Save Status Details</button>
          </div>
        </form>
      </BaseModal>

      {/* C. Details Modal */}
      <BaseModal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Asset Lifecycle Details" size="lg">
        {activeAsset && (
          <div className="space-y-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className="font-heading font-semibold text-lg text-textPrimary leading-snug">{activeAsset.name}</h3>
                  <p className="text-xs text-textSecondary mt-0.5">Tag ID: <strong className="text-textPrimary">{activeAsset.tag}</strong> | Serial: <strong className="text-textPrimary">{activeAsset.serial}</strong></p>
                </div>
                
                <table className="w-full text-sm border-collapse">
                  <tbody className="divide-y divide-borderCol">
                    <tr><td className="py-2.5 text-textSecondary text-xs">Category</td><td className="py-2.5 font-semibold text-textPrimary text-xs text-right">{activeAsset.category}</td></tr>
                    <tr><td className="py-2.5 text-textSecondary text-xs">Status</td><td className="py-2.5 text-right"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(activeAsset.status)}`}>{activeAsset.status}</span></td></tr>
                    <tr>
                      <td className="py-2.5 text-textSecondary text-xs">Assigned To</td>
                      <td className="py-2.5 font-semibold text-textPrimary text-xs text-right">
                        {employees.find(e => e.id === activeAsset.assignedTo)?.name || 'Unassigned (Stored in inventory)'}
                      </td>
                    </tr>
                    <tr><td className="py-2.5 text-textSecondary text-xs">Location</td><td className="py-2.5 text-textPrimary text-xs text-right">{activeAsset.location}</td></tr>
                    <tr><td className="py-2.5 text-textSecondary text-xs">Purchase Date</td><td className="py-2.5 text-textPrimary text-xs text-right">{activeAsset.purchaseDate}</td></tr>
                    <tr><td className="py-2.5 text-textSecondary text-xs">Cost Basis</td><td className="py-2.5 font-bold text-textPrimary text-xs text-right">${activeAsset.cost.toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-hoverBg/40 border border-borderCol rounded-md">
                {generateMockQR(`${window.location.origin}#/registry?asset=${activeAsset.id}`)}
                <span className="text-[10px] font-semibold text-textSecondary uppercase tracking-wider mt-3">Scan Asset Tag</span>
              </div>
            </div>

            <div className="border-t border-borderCol pt-5">
              <h4 className="font-heading font-semibold text-sm text-textPrimary mb-3">Lifecycle History Timeline</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-borderCol">
                {(activeAsset.history || []).map((h, idx) => (
                  <div key={idx} className="relative flex flex-col text-xs gap-0.5 text-left">
                    <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full border border-cardBg bg-primary" />
                    <span className="text-[10px] text-textMuted">{h.date}</span>
                    <strong className="text-textPrimary text-sm mt-0.5">{h.action}</strong>
                    <span className="text-textSecondary mt-0.5">Triggered by {h.user || 'System'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
};

export default Assets;
