/**
 * AssetFlow ERP - UI Components Library
 */

// Global Toast System
const Toast = {
  container: null,
  
  init() {
    if (!document.getElementById("toast-container")) {
      this.container = document.createElement("div");
      this.container.id = "toast-container";
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById("toast-container");
    }
  },
  
  show(title, message, type = "success") {
    if (!this.container) this.init();
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    
    let iconName = "check-circle";
    if (type === "warning") iconName = "alert-triangle";
    if (type === "error") iconName = "alert-circle";
    if (type === "info") iconName = "info";
    
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${message}</div>
      </div>
    `;
    
    this.container.appendChild(toast);
    lucide.createIcons();
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }
};

// Procedural Visual QR Code Generator (SVG Finder Patterns + Random Matrix)
function generateMockQR(dataString) {
  // SVG Header with finder patterns (three corners)
  const size = 100;
  const pixelGridSize = 25;
  const px = size / pixelGridSize;
  
  // Make a beautiful vector QR Code mock representation
  let svg = `<svg viewBox="0 0 ${size} ${size}" class="qr-code-svg" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  
  // Outer squares (Finder Patterns)
  // Top-left
  svg += `<rect x="0" y="0" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svg += `<rect x="${px}" y="${px}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svg += `<rect x="${px * 2}" y="${px * 2}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Top-right
  svg += `<rect x="${size - px * 7}" y="0" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svg += `<rect x="${size - px * 6}" y="${px}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svg += `<rect x="${size - px * 5}" y="${px * 2}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Bottom-left
  svg += `<rect x="0" y="${size - px * 7}" width="${px * 7}" height="${px * 7}" fill="black"/>`;
  svg += `<rect x="${px}" y="${size - px * 6}" width="${px * 5}" height="${px * 5}" fill="white"/>`;
  svg += `<rect x="${px * 2}" y="${size - px * 5}" width="${px * 3}" height="${px * 3}" fill="black"/>`;
  
  // Seedable pseudo-random grid to look identical for the same string
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    hash = dataString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Draw random-looking data pixels (skipping corner finder areas)
  for (let r = 0; r < pixelGridSize; r++) {
    for (let c = 0; c < pixelGridSize; c++) {
      // Avoid finder zones
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= pixelGridSize - 8;
      const isBottomLeft = r >= pixelGridSize - 8 && c < 8;
      
      if (!isTopLeft && !isTopRight && !isBottomLeft) {
        // Deterministic bit based on hash
        const val = Math.abs(Math.sin(hash + r * 13 + c * 37));
        if (val > 0.45) {
          svg += `<rect x="${c * px}" y="${r * px}" width="${px}" height="${px}" fill="black"/>`;
        }
      }
    }
  }
  svg += `</svg>`;
  return svg;
}

// Data Table Renderer
function renderDataTable(containerId, data, columns, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="folder-open" class="empty-state-icon"></i>
        <div class="empty-state-title">No records found</div>
        <div class="empty-state-desc">Try clearing filters or adding new items.</div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  let tableHtml = `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
  `;
  
  // Header Columns
  columns.forEach(col => {
    tableHtml += `<th>${col.label}</th>`;
  });
  
  if (options.actions) {
    tableHtml += `<th>Actions</th>`;
  }
  
  tableHtml += `
          </tr>
        </thead>
        <tbody>
  `;
  
  // Table Body Rows
  data.forEach((row, rowIndex) => {
    tableHtml += `<tr>`;
    columns.forEach(col => {
      let cellValue = "";
      if (col.render) {
        cellValue = col.render(row[col.field], row);
      } else {
        cellValue = row[col.field] !== undefined ? row[col.field] : "—";
      }
      tableHtml += `<td>${cellValue}</td>`;
    });
    
    // Action buttons cell
    if (options.actions) {
      tableHtml += `<td><div style="display:flex; gap:6px;">`;
      options.actions.forEach(action => {
        // Check dynamic visibility based on role or row status
        if (action.visible && !action.visible(row)) {
          return;
        }
        tableHtml += `
          <button class="btn btn-sm ${action.class || 'btn-secondary'}" onclick="${action.onclick}(${rowIndex}, '${row.id || row.assetId}')">
            ${action.icon ? `<i data-lucide="${action.icon}" style="width:14px; height:14px;"></i>` : ""}
            ${action.label}
          </button>
        `;
      });
      tableHtml += `</div></td>`;
    }
    tableHtml += `</tr>`;
  });
  
  tableHtml += `
        </tbody>
      </table>
    </div>
  `;
  
  container.innerHTML = tableHtml;
  lucide.createIcons();
}

// Kanban Maintenance Board Renderer
function renderKanbanBoard(containerId, tasks, onMoveCallback, onDetailsCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const columns = [
    { key: "Backlog", label: "Backlog" },
    { key: "Scheduled", label: "Scheduled" },
    { key: "In Progress", label: "In Progress" },
    { key: "Review", label: "Under Review" },
    { key: "Completed", label: "Completed" }
  ];
  
  let boardHtml = `<div class="kanban-board">`;
  
  columns.forEach(col => {
    const colTasks = tasks.filter(t => t.stage === col.key);
    
    boardHtml += `
      <div class="kanban-column" data-stage="${col.key}">
        <div class="kanban-column-header">
          <span class="kanban-column-title">${col.label}</span>
          <span class="kanban-card-count">${colTasks.length}</span>
        </div>
        <div class="kanban-cards-wrapper" id="kanban-col-${col.key}" ondragover="event.preventDefault()" ondrop="app.handleKanbanDrop(event, '${col.key}')">
    `;
    
    colTasks.forEach(task => {
      const severityClass = `severity-${task.severity.toLowerCase()}`;
      boardHtml += `
        <div class="kanban-card" draggable="true" ondragstart="app.handleKanbanDragStart(event, '${task.id}')" onclick="${onDetailsCallback}('${task.id}')">
          <div style="display:flex; justify-content:between; align-items:start; gap:8px;">
            <span class="kanban-card-title" style="flex:1;">${task.title}</span>
            <span class="severity-badge ${severityClass}">${task.severity}</span>
          </div>
          
          <div class="kanban-card-meta">
            <span class="kanban-card-tag">${task.assetId}</span>
            <span>Est. Cost: $${task.cost}</span>
          </div>
          
          <div class="kanban-card-footer">
            <span style="display:flex; align-items:center; gap:4px;">
              <i data-lucide="user" style="width:12px; height:12px;"></i>
              ${task.assignedTo}
            </span>
          </div>
          
          <div class="kanban-card-actions" onclick="event.stopPropagation()">
            <div style="display:flex; justify-content:space-between; width:100%; margin-top:4px;">
              ${col.key !== 'Backlog' ? `
                <button class="kanban-card-btn" title="Move Left" onclick="app.moveMaintenanceTicket('${task.id}', 'prev')">
                  <i data-lucide="chevron-left" style="width:14px; height:14px;"></i>
                </button>
              ` : '<div></div>'}
              
              ${col.key !== 'Completed' ? `
                <button class="kanban-card-btn" title="Move Right" onclick="app.moveMaintenanceTicket('${task.id}', 'next')">
                  <i data-lucide="chevron-right" style="width:14px; height:14px;"></i>
                </button>
              ` : '<div></div>'}
            </div>
          </div>
        </div>
      `;
    });
    
    boardHtml += `
        </div>
      </div>
    `;
  });
  
  boardHtml += `</div>`;
  container.innerHTML = boardHtml;
  lucide.createIcons();
}

// Calendar Reservation Grid Renderer
function renderCalendarGrid(containerId, bookings, currentDate, resources, onSelectCell) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  
  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevTotalDays = new Date(year, month, 0).getDate();
  
  let calendarHtml = `
    <div class="calendar-grid">
      <div class="calendar-day-label">Sun</div>
      <div class="calendar-day-label">Mon</div>
      <div class="calendar-day-label">Tue</div>
      <div class="calendar-day-label">Wed</div>
      <div class="calendar-day-label">Thu</div>
      <div class="calendar-day-label">Fri</div>
      <div class="calendar-day-label">Sat</div>
  `;
  
  const cells = [];
  
  // Fill leading empty cells (previous month days)
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({
      dayNum: prevTotalDays - i,
      monthType: "other-month",
      dateObj: new Date(year, month - 1, prevTotalDays - i)
    });
  }
  
  // Fill current month days
  const today = new Date();
  for (let i = 1; i <= totalDays; i++) {
    const d = new Date(year, month, i);
    const isToday = d.getDate() === today.getDate() && 
                    d.getMonth() === today.getMonth() && 
                    d.getFullYear() === today.getFullYear();
    cells.push({
      dayNum: i,
      monthType: isToday ? "today" : "current-month",
      dateObj: d
    });
  }
  
  // Fill trailing empty cells (next month days)
  const remaining = 42 - cells.length; // standard 6-week layout
  for (let i = 1; i <= remaining; i++) {
    cells.push({
      dayNum: i,
      monthType: "other-month",
      dateObj: new Date(year, month + 1, i)
    });
  }
  
  // Render days
  cells.forEach(cell => {
    const formattedDate = cell.dateObj.toISOString().split('T')[0];
    
    // Find bookings on this specific day
    const dayBookings = bookings.filter(b => {
      const bDateStr = b.startTime.split('T')[0];
      return bDateStr === formattedDate;
    });
    
    calendarHtml += `
      <div class="calendar-cell ${cell.monthType}" onclick="app.openBookingModal('${formattedDate}')" style="cursor: pointer;">
        <div class="calendar-day-num">${cell.dayNum}</div>
        <div style="display:flex; flex-direction:column; gap:4px; overflow-y:auto; flex:1;">
    `;
    
    dayBookings.forEach(b => {
      // Find resource type to style appropriately
      const res = resources.find(r => r.id === b.resourceId);
      const typeClass = res ? res.type.toLowerCase() : "room";
      const displayTime = b.startTime.split('T')[1].substring(0, 5);
      
      calendarHtml += `
        <div class="calendar-event ${typeClass}" title="${b.userName}: ${b.purpose} (${displayTime})" onclick="event.stopPropagation(); app.showBookingDetails('${b.id}')">
          ${displayTime} ${b.resourceName}
        </div>
      `;
    });
    
    calendarHtml += `
        </div>
      </div>
    `;
  });
  
  calendarHtml += `</div>`;
  container.innerHTML = calendarHtml;
  lucide.createIcons();
}

// Chart Render Wrap Manager (Chart.js integration)
const AppCharts = {
  instances: {},
  
  destroyAll() {
    Object.keys(this.instances).forEach(key => {
      if (this.instances[key]) {
        this.instances[key].destroy();
      }
    });
    this.instances = {};
  },
  
  renderDashboardCharts(theme, assetData, maintenanceData) {
    this.destroyAll();
    
    const isDark = theme === "dark";
    const textPrimary = isDark ? "#f8fafc" : "#0f172a";
    const textSecondary = isDark ? "#94a3b8" : "#64748b";
    const gridColor = isDark ? "#242f47" : "#e2e8f0";
    
    // Chart 1: Asset categories distribution
    const catCanvas = document.getElementById("asset-categories-chart");
    if (catCanvas) {
      const categories = [...new Set(assetData.map(a => a.category))];
      const counts = categories.map(cat => assetData.filter(a => a.category === cat).length);
      
      this.instances.category = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: categories,
          datasets: [{
            data: counts,
            backgroundColor: [
              '#3b82f6', // blue
              '#14b8a6', // teal
              '#8b5cf6', // purple
              '#f59e0b', // amber
              '#64748b'  // slate
            ],
            borderWidth: isDark ? 2 : 1,
            borderColor: isDark ? '#131926' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textSecondary,
                font: { family: 'Inter', size: 11 }
              }
            }
          },
          cutout: '70%'
        }
      });
    }
    
    // Chart 2: Maintenance cost overview by category
    const mntCanvas = document.getElementById("maintenance-cost-chart");
    if (mntCanvas) {
      // Summarize costs per category
      const categories = [...new Set(assetData.map(a => a.category))];
      const costSums = categories.map(cat => {
        // Find assets belonging to this category
        const catAssets = assetData.filter(a => a.category === cat).map(a => a.id);
        // Sum maintenance cost for these assets
        return maintenanceData
          .filter(m => catAssets.includes(m.assetId))
          .reduce((sum, current) => sum + current.cost, 0);
      });
      
      this.instances.cost = new Chart(mntCanvas, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [{
            label: 'Total Expenses ($)',
            data: costSums,
            backgroundColor: '#14b8a6',
            borderRadius: 6,
            barThickness: 20
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textSecondary, font: { family: 'Inter', size: 10 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textSecondary, font: { family: 'Inter', size: 10 } }
            }
          }
        }
      });
    }
  }
};
