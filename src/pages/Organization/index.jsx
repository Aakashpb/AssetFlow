import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import DataTable from '../../components/Tables/DataTable';
import BaseModal from '../../components/Modals/BaseModal';
import { Building2, UserPlus, Search, Laptop, Smartphone, Armchair, Car, Monitor, Landmark } from 'lucide-react';

const Organization = () => {
  const { show } = useToast();
  
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Employee', department: 'Research & Development' });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setDepartments(mockApi.getDepartments());
    setCategories(mockApi.getCategories());
    setEmployees(mockApi.getEmployees());
    setAssets(mockApi.getAssets());
  };

  const getCategoryIcon = (iconName) => {
    const icons = {
      laptop: Laptop,
      smartphone: Smartphone,
      armchair: Armchair,
      car: Car,
      monitor: Monitor
    };
    return icons[iconName] || Laptop;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mockApi.addEmployee(form);
    show('Member Registered', `Successfully added ${form.name} to the directory.`, 'success');
    setForm({ name: '', email: '', role: 'Employee', department: 'Research & Development' });
    setIsOpen(false);
    refreshData();
  };

  // Filter employees
  const filteredEmployees = employees.filter(e => {
    const query = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      e.role.toLowerCase().includes(query) ||
      e.department.toLowerCase().includes(query)
    );
  });

  const columns = [
    { field: 'avatar', label: 'Avatar', render: (val, row) => (
      <div className="w-7 h-7 rounded-full bg-hoverBg text-textPrimary font-semibold text-[10px] border border-borderCol flex items-center justify-center">
        {val}
      </div>
    )},
    { field: 'name', label: 'Full Name' },
    { field: 'email', label: 'Corporate Email' },
    { field: 'department', label: 'Department' },
    { field: 'role', label: 'System Role', render: (val) => (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
        val === 'Admin' ? 'bg-primary/10 text-primary' : 
        val === 'Asset Manager' ? 'bg-secondary/10 text-secondary' : 'bg-slate-500/10 text-slate-500'
      }`}>
        {val}
      </span>
    )}
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Organization Setup</h2>
          <p className="text-xs text-textSecondary">Configure departmental units, categories registry, and staff directory.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Departments Divisions */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-textPrimary mb-3">Departments Division</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {departments.map(dept => {
            const deptAssets = assets.filter(a => {
              const emp = employees.find(e => e.id === a.assignedTo);
              return emp && emp.department === dept.name;
            });
            
            return (
              <div key={dept.id} className="bg-cardBg border border-borderCol rounded-lg p-4 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <Landmark className="w-4 h-4" />
                  <span className="font-semibold text-xs text-textSecondary uppercase tracking-wider">{dept.name}</span>
                </div>
                <div className="mt-2 space-y-1 text-xs">
                  <div>Head: <strong className="text-textPrimary">{dept.head}</strong></div>
                  <div>Budget: <strong className="text-textPrimary">${dept.budget.toLocaleString()}</strong></div>
                  <div>Assigned Units: <strong className="text-textPrimary">{deptAssets.length}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Categories counts */}
      <div>
        <h3 className="font-heading font-semibold text-sm text-textPrimary mb-3">Active Categories</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {categories.map(cat => {
            const Icon = getCategoryIcon(cat.icon);
            const catAssets = assets.filter(a => a.category === cat.name).length;
            
            return (
              <div key={cat.id} className="bg-cardBg border border-borderCol rounded-lg p-4 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm text-textPrimary">{cat.name}</div>
                  <span className="text-xs text-textMuted">{catAssets} Items</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Catalog Table */}
      <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden">
        <div className="px-5 py-4 border-b border-borderCol flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <span className="font-semibold text-sm text-textPrimary">Staff Directory & Permissions</span>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search employee catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-mainBg border border-borderCol rounded-md text-textPrimary text-xs focus:outline-none"
            />
          </div>
        </div>
        <div className="p-5">
          <DataTable columns={columns} data={filteredEmployees} />
        </div>
      </div>

      {/* Add Employee Modal */}
      <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Team Member">
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Full Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Clark Kent"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Corporate Email</label>
            <input 
              type="email" 
              className="form-control"
              placeholder="e.g. clark.k@assetflow.com"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Department</label>
              <select 
                className="form-control"
                value={form.department}
                onChange={(e) => setForm({...form, department: e.target.value})}
                required
              >
                <option value="Research & Development">Research & Development</option>
                <option value="IT Operations">IT Operations</option>
                <option value="Operations">Operations</option>
                <option value="Legal">Legal</option>
                <option value="Executive Office">Executive Office</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">System Role</label>
              <select 
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({...form, role: e.target.value})}
                required
              >
                <option value="Employee">Employee</option>
                <option value="Department Head">Department Head</option>
                <option value="Asset Manager">Asset Manager</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Add Member</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default Organization;
