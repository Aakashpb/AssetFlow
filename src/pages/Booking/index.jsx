import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { mockApi } from '../../services/mockApi';
import BaseModal from '../../components/Modals/BaseModal';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';

const Booking = () => {
  const { user } = useAuth();
  const { show } = useToast();

  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState({
    resourceId: '',
    userId: 'EMP-001',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '17:00',
    purpose: ''
  });

  useEffect(() => {
    refreshData();
    const todayStr = new Date().toISOString().split('T')[0];
    setForm(prev => ({
      ...prev,
      startDate: todayStr,
      endDate: todayStr
    }));
  }, []);

  const refreshData = () => {
    setBookings(mockApi.getBookings());
    const res = mockApi.getResources();
    setResources(res);
    if (res.length > 0 && !form.resourceId) {
      setForm(prev => ({ ...prev, resourceId: res[0].id }));
    }
    setEmployees(mockApi.getEmployees());
  };

  const handleOpenModal = (dateStr = '') => {
    const activeDate = dateStr || new Date().toISOString().split('T')[0];
    setForm(prev => ({
      ...prev,
      startDate: activeDate,
      endDate: activeDate
    }));
    setIsOpen(true);
  };

  const handleDateClick = (arg) => {
    handleOpenModal(arg.dateStr);
  };

  const handleEventClick = (info) => {
    const bookingId = info.event.id;
    const b = bookings.find(item => item.id === bookingId);
    if (b) {
      const st = new Date(b.startTime);
      const et = new Date(b.endTime);
      alert(`Resource Reservation Details:\n\nResource: ${b.resourceName}\nBooked By: ${b.userName}\nDuration: ${st.toLocaleString()} - ${et.toLocaleString()}\nPurpose: "${b.purpose}"`);
    }
  };

  const handleCancelBooking = (id, resourceName) => {
    if (window.confirm(`Are you sure you want to cancel the reservation for ${resourceName}?`)) {
      mockApi.deleteBooking(id);
      show('Booking Cancelled', 'The reservation slot has been released.', 'info');
      refreshData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const startDateTime = `${form.startDate}T${form.startTime}:00`;
    const endDateTime = `${form.endDate}T${form.endTime}:00`;
    
    const stObj = new Date(startDateTime);
    const etObj = new Date(endDateTime);
    
    if (stObj >= etObj) {
      show('Validation Error', 'End Date/Time must be after Start Date/Time.', 'error');
      return;
    }

    try {
      mockApi.addBooking({
        resourceId: form.resourceId,
        userId: form.userId,
        startDate: form.startDate,
        startTime: form.startTime,
        endDate: form.endDate,
        endTime: form.endTime,
        purpose: form.purpose
      });
      show('Resource Booked', 'Booking scheduled successfully.', 'success');
      setForm(prev => ({ ...prev, purpose: '' }));
      setIsOpen(false);
      refreshData();
    } catch (err) {
      show('Double-booking Conflict', err.message, 'error');
    }
  };

  // Convert bookings state to FullCalendar event source
  const calendarEvents = bookings.map(b => {
    const res = resources.find(r => r.id === b.resourceId);
    let color = '#3b82f6'; // blue
    if (res?.type === 'Vehicle') color = '#f59e0b'; // amber
    if (res?.type === 'Device') color = '#14b8a6'; // teal

    return {
      id: b.id,
      title: `${b.resourceName} (${b.userName})`,
      start: b.startTime,
      end: b.endTime,
      backgroundColor: color,
      borderColor: color,
      textColor: '#ffffff'
    };
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-heading text-textPrimary">Shared Resources Booking Calendar</h2>
          <p className="text-xs text-textSecondary">Reserve rooms, vehicles, or test sets. Real-time overlap prevention in place.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Book Resource</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* FullCalendar Grid */}
        <div className="xl:col-span-3 bg-cardBg border border-borderCol rounded-lg shadow-sm p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            height="auto"
            themeSystem="standard"
          />
        </div>

        {/* Active reservations listing sidebar */}
        <div className="bg-cardBg border border-borderCol rounded-lg shadow-sm flex flex-col overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-borderCol flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm text-textPrimary">Active Reservations</span>
          </div>
          <div className="p-5 divide-y divide-borderCol max-h-[500px] overflow-y-auto">
            {bookings.length === 0 ? (
              <div className="text-center py-6 text-xs text-textSecondary">No active bookings.</div>
            ) : (
              bookings.map(b => {
                const st = new Date(b.startTime);
                const et = new Date(b.endTime);
                const isOwner = user?.role === 'Admin' || b.userId === 'EMP-001';
                
                return (
                  <div key={b.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-1 text-xs">
                    <div className="flex justify-between items-start gap-3">
                      <strong className="text-textPrimary text-sm leading-tight">{b.resourceName}</strong>
                      {isOwner && (
                        <button 
                          onClick={() => handleCancelBooking(b.id, b.resourceName)}
                          className="text-textMuted hover:text-danger cursor-pointer p-0.5 rounded transition-colors"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-textSecondary mt-0.5">
                      User: <strong>{b.userName}</strong> &bull; Date: {st.toLocaleDateString()}
                    </span>
                    <span className="text-textMuted mt-0.5">
                      Time: {st.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {et.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <p className="text-textSecondary mt-1 leading-relaxed italic">Purpose: "{b.purpose}"</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Book Resource Modal */}
      <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Reserve Shared Resource">
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Shared Resource</label>
            <select 
              className="form-control"
              value={form.resourceId}
              onChange={(e) => setForm({...form, resourceId: e.target.value})}
              required
            >
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Booked By (Staff Member)</label>
            <select 
              className="form-control"
              value={form.userId}
              onChange={(e) => setForm({...form, userId: e.target.value})}
              required
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.department}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Start Date</label>
              <input 
                type="date" 
                className="form-control"
                value={form.startDate}
                onChange={(e) => setForm({...form, startDate: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">Start Time</label>
              <input 
                type="time" 
                className="form-control"
                value={form.startTime}
                onChange={(e) => setForm({...form, startTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">End Date</label>
              <input 
                type="date" 
                className="form-control"
                value={form.endDate}
                onChange={(e) => setForm({...form, endDate: e.target.value})}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-textSecondary">End Time</label>
              <input 
                type="time" 
                className="form-control"
                value={form.endTime}
                onChange={(e) => setForm({...form, endTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-textSecondary">Booking Purpose</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Field testing in Sector 7"
              value={form.purpose}
              onChange={(e) => setForm({...form, purpose: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary text-xs">Cancel</button>
            <button type="submit" className="btn btn-primary text-xs">Schedule Booking</button>
          </div>
        </form>
      </BaseModal>
    </div>
  );
};

export default Booking;
