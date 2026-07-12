USE assetflow_db;

-- 1. Seed Departments
INSERT INTO departments (id, name, head, budget) VALUES
('dept-1', 'Research & Development', 'Alexander Vance', 750000.00),
('dept-2', 'IT Operations', 'Marcus Brody', 450000.00),
('dept-3', 'Operations', 'Sarah Connor', 300000.00),
('dept-4', 'Legal', 'Ellen Ripley', 150000.00),
('dept-5', 'Executive Office', 'Bruce Wayne', 900000.00)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Employees catalog
INSERT INTO employees (id, name, email, department, role, avatar) VALUES
('emp-1', 'Alexander Vance', 'alex.vance@assetflow.com', 'Executive Office', 'Admin', 'AV'),
('emp-2', 'Marcus Brody', 'marcus.b@assetflow.com', 'IT Operations', 'Asset Manager', 'MB'),
('emp-3', 'Sarah Connor', 'sarah.c@assetflow.com', 'Operations', 'Department Head', 'SC'),
('emp-4', 'Ellen Ripley', 'ellen.r@assetflow.com', 'Legal', 'Employee', 'ER'),
('emp-5', 'Bruce Wayne', 'bruce.w@assetflow.com', 'Executive Office', 'Employee', 'BW')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Seed Users (with hashed 'password': $2b$10$TdfP1Q/j0.0uV1zX1g/yUugpI7v7OqM0WlmVwzQ1i0jR.3jG1wz4e)
INSERT INTO users (uid, name, email, password, department, role, provider, createdAt, lastLoginAt) VALUES
('admin-uid', 'Alexander Vance', 'alex.vance@assetflow.com', '$2b$10$TdfP1Q/j0.0uV1zX1g/yUugpI7v7OqM0WlmVwzQ1i0jR.3jG1wz4e', 'Executive Office', 'Admin', 'Email/Password', NOW(), NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Seed Assets Registry
INSERT INTO assets (id, tag, name, category, status, assignedTo, cost, purchaseDate, warrantyExpiry, location, qrCode) VALUES
('asset-1', 'AF-LP-001', 'MacBook Pro 16" M3', 'Laptops', 'Allocated', 'emp-1', 2499.00, '2026-01-15', '2027-01-15', 'HQ - Floor 4', 'AF-LP-001:MacBook Pro 16" M3:Allocated'),
('asset-2', 'AF-LP-002', 'ThinkPad P1 Gen 6', 'Laptops', 'Available', NULL, 1899.00, '2026-02-10', '2027-02-10', 'IT Staging Lab', 'AF-LP-002:ThinkPad P1 Gen 6:Available'),
('asset-3', 'AF-PH-001', 'iPhone 15 Pro 256GB', 'Smartphones', 'Allocated', 'emp-2', 1099.00, '2026-01-20', '2027-01-20', 'HQ - Floor 2', 'AF-PH-001:iPhone 15 Pro 256GB:Allocated'),
('asset-4', 'AF-CH-001', 'Herman Miller Aeron', 'Furniture', 'Allocated', 'emp-3', 1450.00, '2026-03-05', '2029-03-05', 'HQ - Suite 10', 'AF-CH-001:Herman Miller Aeron:Allocated'),
('asset-5', 'AF-VE-001', 'Tesla Model 3 Long Range', 'Vehicles', 'Available', NULL, 42000.00, '2026-04-12', '2030-04-12', 'Executive Garage', 'AF-VE-001:Tesla Model 3 Long Range:Available')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Seed Maintenance Tickets
INSERT INTO maintenance_tickets (id, assetId, title, description, priority, status, assignedTo, cost, downtime, createdAt, updatedAt) VALUES
('ticket-1', 'asset-1', 'Battery Degraded', 'Unusual battery drain (lasting less than 3 hours under load).', 'Medium', 'Scheduled', 'Marcus Brody', 150.00, 1, NOW(), NOW()),
('ticket-2', 'asset-3', 'Screen Shattered', 'Accidental drop; requires full front glass assembly replacement.', 'High', 'In Progress', 'IT Ops Repair', 350.00, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. Seed Resource Bookings
INSERT INTO bookings (id, assetId, title, start, end, userId) VALUES
('booking-1', 'asset-5', 'Executive Offsite Commute', DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 2.5 DAY), 'emp-1')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. Seed Notifications
INSERT INTO notifications (id, title, message, type, `read`, time, createdAt) VALUES
('notif-1', 'Critical Stock Warning', 'Laptops categories allocation limit is nearing 90%. Request stock update.', 'warning', FALSE, '10 minutes ago', NOW()),
('notif-2', 'Asset Transfer Pending', 'Transfer of AF-CH-001 requires approval signature from Legal department.', 'request', FALSE, '1 hour ago', NOW()),
('notif-3', 'Audit Compliant Alert', 'Routine audit checklist successfully finalized with 100% resolution.', 'success', TRUE, '1 day ago', NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. Seed Asset Log History
INSERT INTO asset_history (assetId, action, date, user) VALUES
('asset-1', 'Asset registered in system', '2026-01-15', 'Alexander Vance'),
('asset-1', 'Assigned to Alexander Vance', '2026-01-16', 'Marcus Brody'),
('asset-3', 'Asset registered in system', '2026-01-20', 'Alexander Vance')
;
