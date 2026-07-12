// Mock API Service with LocalStorage persistence

const SEED_DATA = {
  employees: [
    { id: "EMP-001", name: "Alexander Vance", email: "alex.vance@assetflow.com", role: "Admin", department: "IT Operations", avatar: "AV" },
    { id: "EMP-002", name: "Sarah Connor", email: "sarah.c@assetflow.com", role: "Asset Manager", department: "Facilities", avatar: "SC" },
    { id: "EMP-003", name: "Bruce Wayne", email: "bruce.w@assetflow.com", role: "Department Head", department: "Executive Office", avatar: "BW" },
    { id: "EMP-004", name: "Diana Prince", email: "diana.p@assetflow.com", role: "Employee", department: "Legal", avatar: "DP" },
    { id: "EMP-005", name: "Tony Stark", email: "tony.s@assetflow.com", role: "Department Head", department: "Research & Development", avatar: "TS" },
    { id: "EMP-006", name: "Peter Parker", email: "peter.p@assetflow.com", role: "Employee", department: "Research & Development", avatar: "PP" },
    { id: "EMP-007", name: "Natasha Romanoff", email: "natasha.r@assetflow.com", role: "Employee", department: "Operations", avatar: "NR" },
    { id: "EMP-008", name: "Steve Rogers", email: "steve.r@assetflow.com", role: "Employee", department: "Operations", avatar: "SR" }
  ],
  
  categories: [
    { id: "CAT-001", name: "IT Hardware", count: 12, icon: "laptop" },
    { id: "CAT-002", name: "Mobile Devices", count: 8, icon: "smartphone" },
    { id: "CAT-003", name: "Office Furniture", count: 15, icon: "armchair" },
    { id: "CAT-004", name: "Vehicles", count: 3, icon: "car" },
    { id: "CAT-005", name: "AV Equipment", count: 6, icon: "monitor" }
  ],
  
  departments: [
    { id: "DEP-001", name: "Executive Office", head: "Bruce Wayne", budget: 250000 },
    { id: "DEP-002", name: "Research & Development", head: "Tony Stark", budget: 1200000 },
    { id: "DEP-003", name: "IT Operations", head: "Alexander Vance", budget: 500000 },
    { id: "DEP-004", name: "Operations", head: "Natasha Romanoff", budget: 400000 },
    { id: "DEP-005", name: "Legal", head: "Diana Prince", budget: 150000 }
  ],

  assets: [
    {
      id: "AST-1001",
      name: "MacBook Pro 16\" M3 Max",
      tag: "AF-LAP-1001",
      serial: "C02F87XAM3MX",
      category: "IT Hardware",
      status: "Allocated",
      location: "Headquarters - Room 402",
      cost: 3499,
      purchaseDate: "2025-11-12",
      assignedTo: "EMP-006",
      image: "laptop-m3.jpg",
      colorCode: "#3b82f6",
      history: [
        { date: "2025-11-12", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2025-11-15", action: "Allocated to Peter Parker", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1002",
      name: "Dell UltraSharp 32\" 4K Monitor",
      tag: "AF-MON-1002",
      serial: "MX-091823-32U",
      category: "IT Hardware",
      status: "Allocated",
      location: "Headquarters - Room 402",
      cost: 799,
      purchaseDate: "2025-12-05",
      assignedTo: "EMP-006",
      image: "monitor-32.jpg",
      colorCode: "#3b82f6",
      history: [
        { date: "2025-12-05", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2025-12-06", action: "Allocated to Peter Parker", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1003",
      name: "iPhone 15 Pro Max 512GB",
      tag: "AF-MOB-1003",
      serial: "DNPD78291XIP15",
      category: "Mobile Devices",
      status: "Available",
      location: "IT Storage Locker B",
      cost: 1399,
      purchaseDate: "2026-01-20",
      assignedTo: null,
      image: "iphone15.jpg",
      colorCode: "#14b8a6",
      history: [
        { date: "2026-01-20", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2026-03-10", action: "Returned to Inventory", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1004",
      name: "Herman Miller Aeron Chair (Size B)",
      tag: "AF-FUR-1004",
      serial: "HM-AERON-9812A",
      category: "Office Furniture",
      status: "Allocated",
      location: "London Office - Desk 12",
      cost: 1450,
      purchaseDate: "2024-06-18",
      assignedTo: "EMP-004",
      image: "aeron.jpg",
      colorCode: "#8b5cf6",
      history: [
        { date: "2024-06-18", action: "Asset Registered", user: "Sarah Connor" },
        { date: "2024-06-20", action: "Allocated to Diana Prince", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1005",
      name: "Tesla Model Y Long Range",
      tag: "AF-VEH-1005",
      serial: "5YJ3E1EBXLF87612",
      category: "Vehicles",
      status: "Available",
      location: "HQ Underground Parking Bay 3",
      cost: 48990,
      purchaseDate: "2025-05-10",
      assignedTo: null,
      image: "teslay.jpg",
      colorCode: "#f59e0b",
      history: [
        { date: "2025-05-10", action: "Asset Purchased & Registered", user: "Bruce Wayne" },
        { date: "2026-02-15", action: "Maintenance completed - Tire Rotation", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1006",
      name: "Epson EB-L730U Laser Projector",
      tag: "AF-AV-1006",
      serial: "EPS-L730U-9921",
      category: "AV Equipment",
      status: "Maintenance",
      location: "HQ Conference Room Alpha",
      cost: 3800,
      purchaseDate: "2024-09-02",
      assignedTo: null,
      image: "projector.jpg",
      colorCode: "#ef4444",
      history: [
        { date: "2024-09-02", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2026-07-05", action: "Sent to Maintenance (Bulb warning)", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1007",
      name: "iPad Pro 12.9\" M2 256GB",
      tag: "AF-TAB-1007",
      serial: "DLX-M2IPAD-129",
      category: "Mobile Devices",
      status: "Allocated",
      location: "Remote",
      cost: 1099,
      purchaseDate: "2025-08-14",
      assignedTo: "EMP-007",
      image: "ipad.jpg",
      colorCode: "#14b8a6",
      history: [
        { date: "2025-08-14", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2025-08-16", action: "Allocated to Natasha Romanoff", user: "Sarah Connor" }
      ]
    },
    {
      id: "AST-1008",
      name: "ThinkPad P1 Gen 6 Workstation",
      tag: "AF-LAP-1008",
      serial: "LNV-TP-P1G6-8812",
      category: "IT Hardware",
      status: "Allocated",
      location: "HQ Lab 1",
      cost: 2899,
      purchaseDate: "2025-10-01",
      assignedTo: "EMP-005",
      image: "thinkpad.jpg",
      colorCode: "#3b82f6",
      history: [
        { date: "2025-10-01", action: "Asset Registered", user: "Alexander Vance" },
        { date: "2025-10-02", action: "Allocated to Tony Stark", user: "Alexander Vance" }
      ]
    }
  ],

  bookings: [
    {
      id: "BKG-101",
      resourceId: "RES-201",
      resourceName: "Tesla Model Y Long Range",
      userId: "EMP-005",
      userName: "Tony Stark",
      startTime: "2026-07-13T09:00:00",
      endTime: "2026-07-13T17:00:00",
      purpose: "Client site visit in Greenwich"
    },
    {
      id: "BKG-102",
      resourceId: "RES-202",
      resourceName: "HQ Conference Room Alpha",
      userId: "EMP-003",
      userName: "Bruce Wayne",
      startTime: "2026-07-14T10:00:00",
      endTime: "2026-07-14T12:00:00",
      purpose: "Board of Directors Quarterly Review"
    },
    {
      id: "BKG-103",
      resourceId: "RES-203",
      resourceName: "AR Headset Prototype",
      userId: "EMP-006",
      userName: "Peter Parker",
      startTime: "2026-07-12T14:00:00",
      endTime: "2026-07-12T16:00:00",
      purpose: "Optical tracking recalibration test"
    }
  ],

  resources: [
    { id: "RES-201", name: "Tesla Model Y Long Range", type: "Vehicle", description: "Fleet Vehicle #3, Parking Bay 3. Range: 310mi.", status: "Available" },
    { id: "RES-202", name: "HQ Conference Room Alpha", type: "Room", description: "12-person capacity, fully equipped with AV setup & whiteboard.", status: "Available" },
    { id: "RES-203", name: "AR Headset Prototype", type: "Device", description: "Next-gen R&D testing hardware, optical calibration build.", status: "Available" },
    { id: "RES-204", name: "Mobile Testing Kit (iOS/Android)", type: "Device", description: "QA testing package containing smartphones & test platforms.", status: "Available" }
  ],

  maintenance: [
    {
      id: "MNT-301",
      assetId: "AST-1006",
      assetName: "Epson EB-L730U Laser Projector",
      title: "Replace Projector Lamp & Filters",
      description: "Warning indicator triggered. Device shuts down after 30 minutes due to internal temperature. Lamp has exceeded 3,000 hours.",
      severity: "Medium",
      stage: "In Progress",
      cost: 250,
      downtime: 4,
      dateCreated: "2026-07-05",
      assignedTo: "Tech Support Team"
    },
    {
      id: "MNT-302",
      assetId: "AST-1005",
      assetName: "Tesla Model Y Long Range",
      title: "Windshield Crack Repair",
      description: "Small stone chip expanded into a 4-inch crack on front passenger side. Needs professional glass repair.",
      severity: "Low",
      stage: "Scheduled",
      cost: 150,
      downtime: 1,
      dateCreated: "2026-07-10",
      assignedTo: "Fleet Auto Care"
    },
    {
      id: "MNT-303",
      assetId: "AST-1001",
      assetName: "MacBook Pro 16\" M3 Max",
      title: "Battery Health Inspection",
      description: "System reporting Service Recommended. Battery health index at 74% with 420 cycles. Needs replacement.",
      severity: "Low",
      stage: "Backlog",
      cost: 299,
      downtime: 2,
      dateCreated: "2026-07-08",
      assignedTo: "Apple Authorized Service"
    },
    {
      id: "MNT-304",
      assetId: "AST-1002",
      assetName: "Dell UltraSharp 32\" 4K Monitor",
      title: "Fix Screen Flickering Issue",
      description: "Screen blinks black every few minutes when running at 60Hz. Test with alternate Thunderbolt cables first, then check board.",
      severity: "Medium",
      stage: "Review",
      cost: 0,
      downtime: 3,
      dateCreated: "2026-07-06",
      assignedTo: "Tech Support Team"
    },
    {
      id: "MNT-305",
      assetId: "AST-1008",
      assetName: "ThinkPad P1 Gen 6 Workstation",
      title: "RAM Upgrade to 64GB",
      description: "Upgrade requested by R&D department. Purchase 2x32GB DDR5 modules and install them in secondary channel.",
      severity: "Low",
      stage: "Completed",
      cost: 180,
      downtime: 0,
      dateCreated: "2026-07-01",
      assignedTo: "IT Helpdesk"
    }
  ],

  audits: [
    {
      id: "AUD-401",
      name: "Q2 2026 High-Value Asset Audit",
      scheduledDate: "2026-07-15",
      status: "In Progress",
      progress: 62.5,
      checkedCount: 5,
      totalCount: 8,
      discrepancies: [
        { assetId: "AST-1006", assetName: "Epson EB-L730U Laser Projector", issue: "Maintenance Status Discrepancy", details: "Found in closet instead of Conference Room Alpha; bulb inoperative." },
        { assetId: "AST-1003", assetName: "iPhone 15 Pro Max 512GB", issue: "Location Discrepancy", details: "Listed in Storage B, but was in Tech Lock Desk 4." }
      ],
      checklist: [
        { assetId: "AST-1001", checked: true, status: "Verified", notes: "Matched serial and user." },
        { assetId: "AST-1002", checked: true, status: "Verified", notes: "Matched location and serial." },
        { assetId: "AST-1003", checked: true, status: "Discrepancy", notes: "Location discrepancy." },
        { assetId: "AST-1004", checked: true, status: "Verified", notes: "Remote confirmation via video." },
        { assetId: "AST-1005", checked: false, status: "Pending", notes: "" },
        { assetId: "AST-1006", checked: true, status: "Discrepancy", notes: "Maintenance discrepancy." },
        { assetId: "AST-1007", checked: false, status: "Pending", notes: "" },
        { assetId: "AST-1008", checked: false, status: "Pending", notes: "" }
      ]
    },
    {
      id: "AUD-402",
      name: "Q1 2026 R&D Equipment Audit",
      scheduledDate: "2026-04-10",
      status: "Completed",
      progress: 100,
      checkedCount: 4,
      totalCount: 4,
      discrepancies: [],
      checklist: [
        { assetId: "AST-1008", checked: true, status: "Verified", notes: "Matched serial and user." }
      ]
    }
  ],

  transferRequests: [
    {
      id: "TRF-501",
      assetId: "AST-1003",
      assetName: "iPhone 15 Pro Max 512GB",
      fromEmployee: "Inventory",
      toEmployee: "EMP-008",
      toEmployeeName: "Steve Rogers",
      requestDate: "2026-07-11",
      status: "Pending Approval",
      purpose: "Required for field operations testing."
    },
    {
      id: "TRF-502",
      assetId: "AST-1007",
      assetName: "iPad Pro 12.9\" M2 256GB",
      fromEmployee: "EMP-007",
      toEmployee: "EMP-004",
      toEmployeeName: "Diana Prince",
      requestDate: "2026-07-10",
      status: "Pending Approval",
      purpose: "Transfer to legal division for contract reviews."
    }
  ],

  notifications: [
    { id: "NTF-601", title: "New Asset Request", message: "Steve Rogers requested iPhone 15 Pro Max allocation.", type: "request", time: "2 hours ago", read: false },
    { id: "NTF-602", title: "Maintenance Completed", message: "ThinkPad P1 Gen 6 RAM upgrade is complete.", type: "success", time: "1 day ago", read: true },
    { id: "NTF-603", title: "Upcoming Audit", message: "Q2 2026 High-Value Asset Audit starts in 3 days.", type: "warning", time: "2 days ago", read: true },
    { id: "NTF-604", title: "Booking Conflict Prevented", message: "Room Alpha overlap blocked for Peter Parker.", type: "error", time: "3 days ago", read: true }
  ],
  
  logs: [
    { id: "LOG-001", user: "Alexander Vance", action: "User alex.vance logged in", timestamp: "2026-07-12T09:45:00", ip: "192.168.1.52" },
    { id: "LOG-002", user: "Alexander Vance", action: "Registered MacBook Pro 16\" (AST-1001)", timestamp: "2025-11-12T10:15:00", ip: "192.168.1.52" },
    { id: "LOG-003", user: "Sarah Connor", action: "Allocated AST-1001 to EMP-006", timestamp: "2025-11-15T14:30:00", ip: "192.168.1.53" }
  ]
};

// Helper: load state
const loadState = () => {
  const saved = localStorage.getItem("af_state");
  if (!saved) {
    localStorage.setItem("af_state", JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(saved);
};

// Helper: save state
const saveState = (data) => {
  localStorage.setItem("af_state", JSON.stringify(data));
};

export const mockApi = {
  // Common Data Fetch
  getData: () => {
    return loadState();
  },

  // Assets
  getAssets: () => {
    return loadState().assets;
  },
  
  addAsset: (asset) => {
    const data = loadState();
    const newId = `AST-${1000 + data.assets.length + 1}`;
    const newTag = `AF-${asset.category.substring(0, 3).toUpperCase()}-${1000 + data.assets.length + 1}`;
    const newAsset = {
      id: newId,
      tag: newTag,
      ...asset,
      status: "Available",
      assignedTo: null,
      history: [
        { date: new Date().toISOString().split('T')[0], action: "Asset Registered", user: "Alexander Vance" }
      ]
    };
    data.assets.push(newAsset);
    saveState(data);
    
    // Add activity log
    mockApi.addLog("Alexander Vance", `Registered asset ${asset.name} (${newId})`);
    return newAsset;
  },

  updateAssetStatus: (assetId, fields) => {
    const data = loadState();
    const assetIndex = data.assets.findIndex(a => a.id === assetId);
    if (assetIndex !== -1) {
      const asset = data.assets[assetIndex];
      const prevStatus = asset.status;
      
      data.assets[assetIndex] = {
        ...asset,
        status: fields.status,
        location: fields.location || asset.location,
        assignedTo: fields.assignedTo || null,
        history: [
          ...asset.history,
          {
            date: new Date().toISOString().split('T')[0],
            action: `Status changed from ${prevStatus} to ${fields.status}`,
            user: "Alexander Vance"
          }
        ]
      };
      saveState(data);
      mockApi.addLog("Alexander Vance", `Updated status for asset ${asset.name} to ${fields.status}`);
      return data.assets[assetIndex];
    }
    return null;
  },

  // Bookings
  getBookings: () => {
    return loadState().bookings;
  },

  getResources: () => {
    return loadState().resources;
  },

  addBooking: (booking) => {
    const data = loadState();
    
    // Simple conflict validation
    const hasConflict = data.bookings.some(b => {
      if (b.resourceId !== booking.resourceId) return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      const newStart = new Date(`${booking.startDate}T${booking.startTime}`);
      const newEnd = new Date(`${booking.endDate}T${booking.endTime}`);
      return newStart < bEnd && newEnd > bStart;
    });

    if (hasConflict) {
      throw new Error("Double-booking Conflict: Selected resource is already reserved during this time slot.");
    }

    const resource = data.resources.find(r => r.id === booking.resourceId);
    const employee = data.employees.find(e => e.id === booking.userId) || { name: "Alex Vance" };
    
    const newBooking = {
      id: `BKG-${100 + data.bookings.length + 1}`,
      resourceId: booking.resourceId,
      resourceName: resource ? resource.name : "Unknown Resource",
      userId: booking.userId,
      userName: employee.name,
      startTime: `${booking.startDate}T${booking.startTime}`,
      endTime: `${booking.endDate}T${booking.endTime}`,
      purpose: booking.purpose
    };
    
    data.bookings.push(newBooking);
    saveState(data);
    mockApi.addLog(employee.name, `Booked resource ${newBooking.resourceName}`);
    return newBooking;
  },

  deleteBooking: (bookingId) => {
    const data = loadState();
    data.bookings = data.bookings.filter(b => b.id !== bookingId);
    saveState(data);
    mockApi.addLog("Alexander Vance", `Cancelled booking ${bookingId}`);
  },

  // Transfers/Allocations
  getTransferRequests: () => {
    return loadState().transferRequests;
  },

  addTransferRequest: (request) => {
    const data = loadState();
    const asset = data.assets.find(a => a.id === request.assetId);
    const recipient = data.employees.find(e => e.id === request.toEmployee);
    
    const newRequest = {
      id: `TRF-${500 + data.transferRequests.length + 1}`,
      assetId: request.assetId,
      assetName: asset ? asset.name : "Unknown Asset",
      fromEmployee: asset && asset.assignedTo ? data.employees.find(e => e.id === asset.assignedTo)?.name || "Employee" : "Inventory",
      toEmployee: request.toEmployee,
      toEmployeeName: recipient ? recipient.name : "Unknown Recipient",
      requestDate: new Date().toISOString().split('T')[0],
      status: "Pending Approval",
      purpose: request.purpose
    };
    
    data.transferRequests.push(newRequest);
    saveState(data);
    
    // Add notification
    data.notifications.unshift({
      id: `NTF-${600 + data.notifications.length + 1}`,
      title: "New Transfer Request",
      message: `${newRequest.toEmployeeName} requested allocation for ${newRequest.assetName}.`,
      type: "request",
      time: "Just now",
      read: false
    });
    saveState(data);
    
    mockApi.addLog(newRequest.fromEmployee, `Requested transfer of asset ${newRequest.assetName} to ${newRequest.toEmployeeName}`);
    return newRequest;
  },

  handleTransferApproval: (requestId, approved) => {
    const data = loadState();
    const requestIndex = data.transferRequests.findIndex(r => r.id === requestId);
    if (requestIndex !== -1) {
      const request = data.transferRequests[requestIndex];
      request.status = approved ? "Approved" : "Rejected";
      
      if (approved) {
        // Perform allocation change in assets
        const assetIndex = data.assets.findIndex(a => a.id === request.assetId);
        if (assetIndex !== -1) {
          const asset = data.assets[assetIndex];
          asset.assignedTo = request.toEmployee;
          asset.status = "Allocated";
          asset.history.push({
            date: new Date().toISOString().split('T')[0],
            action: `Transferred to ${request.toEmployeeName} via Request ${request.id}`,
            user: "Alexander Vance"
          });
        }
      }
      
      saveState(data);
      mockApi.addLog("Alexander Vance", `${approved ? "Approved" : "Rejected"} transfer request ${requestId}`);
      return request;
    }
    return null;
  },

  // Maintenance
  getMaintenance: () => {
    return loadState().maintenance;
  },

  addMaintenanceTicket: (ticket) => {
    const data = loadState();
    const asset = data.assets.find(a => a.id === ticket.assetId);
    
    const newTicket = {
      id: `MNT-${300 + data.maintenance.length + 1}`,
      assetId: ticket.assetId,
      assetName: asset ? asset.name : "Unknown Asset",
      title: ticket.title,
      description: ticket.description,
      severity: ticket.severity,
      stage: "Backlog",
      cost: parseFloat(ticket.cost) || 0,
      downtime: parseInt(ticket.downtime) || 0,
      dateCreated: new Date().toISOString().split('T')[0],
      assignedTo: ticket.assignedTo || "IT Helpdesk"
    };
    
    data.maintenance.push(newTicket);
    
    // Change asset status to Maintenance
    const assetIndex = data.assets.findIndex(a => a.id === ticket.assetId);
    if (assetIndex !== -1) {
      data.assets[assetIndex].status = "Maintenance";
      data.assets[assetIndex].history.push({
        date: new Date().toISOString().split('T')[0],
        action: `Sent to Maintenance: ${ticket.title}`,
        user: "Alexander Vance"
      });
    }

    saveState(data);
    mockApi.addLog("Alexander Vance", `Created maintenance ticket ${newTicket.id} for ${newTicket.assetName}`);
    return newTicket;
  },

  updateMaintenanceStage: (ticketId, stage) => {
    const data = loadState();
    const ticketIndex = data.maintenance.findIndex(m => m.id === ticketId);
    if (ticketIndex !== -1) {
      data.maintenance[ticketIndex].stage = stage;
      
      // If completed, set asset back to Available
      if (stage === "Completed") {
        const ticket = data.maintenance[ticketIndex];
        const assetIndex = data.assets.findIndex(a => a.id === ticket.assetId);
        if (assetIndex !== -1) {
          data.assets[assetIndex].status = "Available";
          data.assets[assetIndex].assignedTo = null;
          data.assets[assetIndex].history.push({
            date: new Date().toISOString().split('T')[0],
            action: `Returned from maintenance: ${ticket.title}`,
            user: "Alexander Vance"
          });
        }
      }
      
      saveState(data);
      mockApi.addLog("Alexander Vance", `Updated maintenance ticket ${ticketId} stage to ${stage}`);
      return data.maintenance[ticketIndex];
    }
    return null;
  },

  // Audits
  getAudits: () => {
    return loadState().audits;
  },

  verifyAuditItem: (auditId, assetId, notes, isDiscrepancy, discrepancyType) => {
    const data = loadState();
    const auditIndex = data.audits.findIndex(a => a.id === auditId);
    if (auditIndex !== -1) {
      const audit = data.audits[auditIndex];
      const checkItemIndex = audit.checklist.findIndex(c => c.assetId === assetId);
      if (checkItemIndex !== -1) {
        const item = audit.checklist[checkItemIndex];
        const asset = data.assets.find(a => a.id === assetId);
        
        item.checked = true;
        item.status = isDiscrepancy ? "Discrepancy" : "Verified";
        item.notes = notes;
        
        if (isDiscrepancy) {
          audit.discrepancies.push({
            assetId,
            assetName: asset ? asset.name : "Unknown",
            issue: discrepancyType || "Audit Discrepancy",
            details: notes
          });
        }
        
        // Update stats
        audit.checkedCount = audit.checklist.filter(c => c.checked).length;
        audit.progress = Math.round((audit.checkedCount / audit.totalCount) * 100 * 10) / 10;
        
        if (audit.progress === 100) {
          audit.status = "Completed";
        }
        
        saveState(data);
        mockApi.addLog("Alexander Vance", `Audited asset ${asset ? asset.name : assetId} in cycle ${auditId}`);
        return audit;
      }
    }
    return null;
  },

  addAuditCycle: (audit) => {
    const data = loadState();
    const newCycle = {
      id: `AUD-${400 + data.audits.length + 1}`,
      name: audit.name,
      scheduledDate: audit.scheduledDate,
      status: "In Progress",
      progress: 0,
      checkedCount: 0,
      totalCount: data.assets.length,
      discrepancies: [],
      checklist: data.assets.map(a => ({
        assetId: a.id,
        checked: false,
        status: "Pending",
        notes: ""
      }))
    };
    data.audits.unshift(newCycle);
    saveState(data);
    mockApi.addLog("Alexander Vance", `Scheduled new audit cycle: ${audit.name}`);
    return newCycle;
  },

  // Employees
  getEmployees: () => {
    return loadState().employees;
  },

  addEmployee: (employee) => {
    const data = loadState();
    const newEmp = {
      id: `EMP-${String(data.employees.length + 1).padStart(3, '0')}`,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department,
      avatar: employee.name.split(' ').map(n => n[0]).join('').toUpperCase()
    };
    data.employees.push(newEmp);
    saveState(data);
    mockApi.addLog("Alexander Vance", `Created employee entry for ${newEmp.name}`);
    return newEmp;
  },

  // Departments & Categories
  getDepartments: () => {
    return loadState().departments;
  },

  getCategories: () => {
    return loadState().categories;
  },

  addDepartment: (dept) => {
    const data = loadState();
    const newDept = {
      id: `DEP-${String(data.departments.length + 1).padStart(3, '0')}`,
      name: dept.name,
      head: dept.head,
      budget: parseFloat(dept.budget) || 0
    };
    data.departments.push(newDept);
    saveState(data);
    mockApi.addLog("Alexander Vance", `Added department ${newDept.name}`);
    return newDept;
  },

  addCategory: (cat) => {
    const data = loadState();
    const newCat = {
      id: `CAT-${String(data.categories.length + 1).padStart(3, '0')}`,
      name: cat.name,
      count: 0,
      icon: cat.icon || "laptop"
    };
    data.categories.push(newCat);
    saveState(data);
    mockApi.addLog("Alexander Vance", `Added asset category ${newCat.name}`);
    return newCat;
  },

  // Notifications
  getNotifications: () => {
    return loadState().notifications;
  },

  markNotificationRead: (id) => {
    const data = loadState();
    const index = data.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      data.notifications[index].read = true;
      saveState(data);
    }
  },

  clearNotifications: () => {
    const data = loadState();
    data.notifications = [];
    saveState(data);
  },

  // Activity Logs
  getLogs: () => {
    return loadState().logs;
  },

  addLog: (user, action) => {
    const data = loadState();
    data.logs.unshift({
      id: `LOG-${String(data.logs.length + 1).padStart(3, '0')}`,
      user,
      action,
      timestamp: new Date().toISOString(),
      ip: "192.168.1.52"
    });
    saveState(data);
  }
};
