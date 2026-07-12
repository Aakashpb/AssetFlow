CREATE DATABASE IF NOT EXISTS assetflow_db;
USE assetflow_db;

-- 1. Departments table
CREATE TABLE IF NOT EXISTS departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  head VARCHAR(100) NOT NULL,
  budget DECIMAL(15, 2) NOT NULL
);

-- 2. Employees catalog
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL
);

-- 3. Users accounts (for authentication)
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL,
  lastLoginAt DATETIME NOT NULL
);

-- 4. Assets Registry
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(50) PRIMARY KEY,
  tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  assignedTo VARCHAR(50) NULL,
  cost DECIMAL(15, 2) NOT NULL,
  purchaseDate DATE NOT NULL,
  warrantyExpiry DATE NOT NULL,
  location VARCHAR(100) NOT NULL,
  qrCode TEXT NULL
);

-- 5. Maintenance Tickets
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id VARCHAR(50) PRIMARY KEY,
  assetId VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  assignedTo VARCHAR(50) NULL,
  cost DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  downtime INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

-- 6. Resource Bookings Calendar
CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  assetId VARCHAR(50) NOT NULL,
  title VARCHAR(150) NOT NULL,
  start DATETIME NOT NULL,
  end DATETIME NOT NULL,
  userId VARCHAR(50) NOT NULL,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);

-- 7. System Notifications list
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  `read` BOOLEAN NOT NULL DEFAULT FALSE,
  time VARCHAR(50) NOT NULL,
  createdAt DATETIME NOT NULL
);

-- 8. Asset Log History
CREATE TABLE IF NOT EXISTS asset_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assetId VARCHAR(50) NOT NULL,
  action VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  user VARCHAR(100) NOT NULL,
  FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
);
