import axios from 'axios';
import { mockApi } from './mockApi';

const API_BASE = 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure client JWT authorization interceptor
client.interceptors.request.use((config) => {
  const session = localStorage.getItem('af_user_session');
  if (session) {
    const { token } = JSON.parse(session);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (err) => Promise.reject(err));

const tryRequest = async (apiCall, mockFallback) => {
  try {
    return await apiCall();
  } catch (error) {
    // Check if network connection was refused/offline
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message.includes('Network Error'))) {
      console.warn('⚠️ Server unreachable. Falling back to Mock Storage Datastore.');
      return mockFallback();
    }
    // Propagate standard validation/authorization responses from MySQL backend
    throw error;
  }
};

export const api = {
  // Check backend server ping status
  ping: async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/ping');
      return data;
    } catch {
      return { status: 'offline' };
    }
  },

  // Auth Operations
  register: async (name, email, password, department) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/auth/register', { name, email, password, department });
        return data;
      },
      () => {
        return mockApi.register(name, email, password, department);
      }
    );
  },

  login: async (email, password) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/auth/login', { email, password });
        return data;
      },
      () => {
        const res = mockApi.login(email, password);
        if (res.success) {
          return { user: JSON.parse(localStorage.getItem('af_user_session')) };
        }
        throw new Error(res.error);
      }
    );
  },

  loginWithGoogle: async (googleUser) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/auth/google', googleUser);
        return data;
      },
      () => {
        mockApi.loginWithGoogle(googleUser);
        return { user: JSON.parse(localStorage.getItem('af_user_session')) };
      }
    );
  },

  // Assets CRUD
  getAssets: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.get('/assets');
        return data;
      },
      () => mockApi.getAssets()
    );
  },

  addAsset: async (form) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/assets', form);
        return data;
      },
      () => mockApi.addAsset(form)
    );
  },

  updateAsset: async (id, form) => {
    return tryRequest(
      async () => {
        const { data } = await client.put(`/assets/${id}`, form);
        return data;
      },
      () => mockApi.updateAsset(id, form)
    );
  },

  deleteAsset: async (id) => {
    return tryRequest(
      async () => {
        const { data } = await client.delete(`/assets/${id}`);
        return data;
      },
      () => mockApi.deleteAsset(id)
    );
  },

  // Catalogs Lookups
  getCatalogs: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.get('/assets/catalogs');
        return data;
      },
      () => {
        return {
          departments: mockApi.getDepartments(),
          employees: mockApi.getEmployees(),
          categories: mockApi.getCategories()
        };
      }
    );
  },

  // Employee Additions
  addEmployee: async (form) => {
    return tryRequest(
      async () => {
        // Handled via registers sync on real server, but route lookup sync is possible
        const { data } = await client.post('/assets/employees', form);
        return data;
      },
      () => mockApi.addEmployee(form)
    );
  },

  // Bookings Calendar
  getBookings: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.get('/bookings');
        return data;
      },
      () => mockApi.getBookings()
    );
  },

  addBooking: async (form) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/bookings', form);
        return data;
      },
      () => mockApi.addBooking(form)
    );
  },

  // Maintenance board CRUD
  getMaintenanceTickets: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.get('/maintenance');
        return data;
      },
      () => mockApi.getMaintenanceTickets()
    );
  },

  addMaintenanceTicket: async (form) => {
    return tryRequest(
      async () => {
        const { data } = await client.post('/maintenance', form);
        return data;
      },
      () => mockApi.addMaintenanceTicket(form)
    );
  },

  updateMaintenanceTicket: async (id, form) => {
    return tryRequest(
      async () => {
        const { data } = await client.put(`/maintenance/${id}`, form);
        return data;
      },
      () => mockApi.updateMaintenanceTicket(id, form)
    );
  },

  // Notifications alerts API
  getNotifications: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.get('/notifications');
        return data;
      },
      () => mockApi.getNotifications()
    );
  },

  markNotificationRead: async (id) => {
    return tryRequest(
      async () => {
        const { data } = await client.put(`/notifications/${id}/read`);
        return data;
      },
      () => mockApi.markNotificationRead(id)
    );
  },

  clearNotifications: async () => {
    return tryRequest(
      async () => {
        const { data } = await client.delete('/notifications');
        return data;
      },
      () => mockApi.clearNotifications()
    );
  }
};
