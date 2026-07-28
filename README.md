# BNB Inventory Manager

A modern, high-performance operational inventory web application built for Bed & Breakfast (BnB) and Airbnb hosts. Effortlessly track everyday supplies, record purchase and usage history, monitor damage, and automatically synchronize data with Google Sheets.

---

## 🌟 Key Features

### 📊 Executive Dashboard & Inventory Overview
* **Real-time Overview Cards**: Displays Total Items Tracked, Restock Alerts, Total Inventory Stock, Total Inventory Valuation (₱), and Storage Locations.
* **Low Stock Alerts**: Instant list highlighting items at or below minimum threshold levels.
* **Master Inventory Table/Cards**: Detailed listing with filtering by **Item Name**, **Category**, and **Tags**. Shows calculated current stock, latest unit cost, reorder quantities, and storage locations.

### 🔄 Use Case & Transaction Flows
1. **Master Inventory Management**: Add, edit, or delete items. Current stock and item cost are dynamically derived from transactions.
2. **Purchase Recording**:
   * Record new inventory purchases with date, item, unit, quantity, unit cost, and notes.
   * Automatically updates Master Inventory **Current Stock** and updates the **Latest Unit Cost**.
3. **Item Usage Tracking**:
   * Track supply usage across specific BnB rooms/locations.
   * Deducts quantity from Master Inventory **Current Stock**.
4. **Damage Tracking**:
   * Log damaged, broken, or expired items with room location and descriptions.
   * Deducts quantity from Master Inventory **Current Stock**.

---

## ⚡ Google Sheets Seamless Auto-Sync Integration

* **One-Time OAuth Connection**: Connect your Google account and set your Google Sheet ID once. Connection state and access token are securely persisted in `localStorage`.
* **Automatic Silent Reconnect**: On app launch or page refresh, the application automatically restores your connection and synchronizes with your Google Sheet.
* **Automatic Real-Time Sync**: Any transaction action—saving/editing an item, recording a purchase, logging item usage, recording damage, or deleting an item—automatically updates your Google Sheet tabs in the background.
* **Google Sync Settings Modal**: Easily configure Spreadsheet ID, connect/disconnect Google accounts, or trigger manual Import/Export actions anytime.

### Google Sheet Tab Schema
The app automatically formats and synchronizes 5 distinct sheet tabs:
1. **Dashboard**: Summary metrics (`Number of Low Stock`, `Current total cost`, `List of Items with Low Stock`).
2. **MasterInventory**: (`Category`, `ItemName`, `Unit`, `CurrentStock`, `Minimum`, `ReorderQty`, `Cost`, `Storage`, `Status`, `Tags`, `Note`).
3. **Purchases**: (`Date`, `ItemName`, `Unit`, `Quantity`, `Cost`, `Note`).
4. **Usage**: (`Date`, `ItemName`, `Unit`, `Quantity`, `Note`, `Room`).
5. **Damages**: (`Date`, `ItemName`, `Quantity`, `Description`, `Location`).

---

## 🎨 Design & UI Architecture

* **Modern Design System**: CSS custom properties for theme colors, glassmorphic header cards, backdrop filters, soft drop-shadows, and smooth micro-animations.
* **Responsive Multi-Column Layout**: Optimized for all screen sizes with wide desktop space utilization (`max-width: 1400px`).
* **Tabbed View Navigation**: Seamless switching between:
  - 📦 **Inventory & Dashboard**
  - 🛒 **Purchases**
  - 📋 **Item Usage**
  - ⚠️ **Damage Tracker**
  - ⚙️ **Google Sync Settings**
* **Standardized Form Components**: Custom styled `<select>` controls and `<input>` groups with clear typography using Google Fonts (`Plus Jakarta Sans` & `Inter`).
* **Interactive Toast System**: Floating notifications giving instant visual feedback for transaction saves, sync successes, and warnings.

---

## 🚀 Getting Started

1. Clone or open the repository directory.
2. Open `index.html` in any modern web browser or serve via a local web server (e.g., Live Server or `npx serve .`).
3. Click **Google Sync Settings** in the top navigation or section header to enter your Google Sheet ID and connect your Google Account.
