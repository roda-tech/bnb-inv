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
2. **MasterInventory**: (`Category`, `ItemName`, `Unit`, `CurrentStock`, `Minimum`, `ReorderQty`, `Cost`, `Storage`, `Status`, `Tags`, `Note`, `Supplier`).
3. **Purchases**: (`Date`, `ItemName`, `Unit`, `Quantity`, `Cost`, `Supplier`, `Note`).
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
  - 💸 **Expense Tracker** (New)
  - ⚙️ **Google Sync Settings**
* **Standardized Form Components**: Custom styled `<select>` controls and `<input>` groups with clear typography using Google Fonts (`Plus Jakarta Sans` & `Inter`).
* **Interactive Toast System**: Floating notifications giving instant visual feedback for transaction saves, sync successes, and warnings.

---

## 🚀 Getting Started

1. Clone or open the repository directory.
2. Open `index.html` in any modern web browser or serve via a local web server (e.g., Live Server or `npx serve .`).
3. Click **Google Sync Settings** in the top navigation or section header to enter your Google Sheet ID and connect your Google Account.


## 2026/08/01 Deployment (vercel)
- **Google Sheet Connection Updates**
    - if Google Sheet is disconnected then pop up to reconnect should be displayed first, then ask user if they want to sync or not.
    - If master list is updated locally and is ahead of Google Sheet, then pop up to sync should be displayed then force export to sheet should be done after user confirmation.
    - If Google Sheet is updated locally and is ahead of master list, then pop up to sync should be displayed then force import from sheet should be done after user confirmation.   
- **Purchases**
    - add ability to edit/delete purchase records, if record is deleted then the latest unit cost should be updated to the next latest unit cost, and if no other records are available then set unit cost to 0.

## 2026/08/02 Deployment (vercel)
- **Master List Updates**
    - Add supplier per item
    - Add ability to navigate to purchase, use and damage on item from master list, automatically setting Cost to latest unit cost, supplier an reorder quantity
    - bugfix: Low Stock Items count is 0 always.
- **Purchases**
    - separate note and supplier field
- **UX improvements**
    - Make low-stock list collapsible
    - sorting on filter alphabetical
- **Expense Tracker** (New)
   enable user to track expenses for the business
   - google sheet 
      sheet name: Expenses
      columns: Date, Type, Amount, Notes, ModeofPayment, Status, Tag
   - Fields
      - Date
      - Notes
      - Amount
      - Mode of Payment
      - Types of Expenses ( Not a fixed list, can add new one but suggest already existing types )
         - Supplies
         - Maintenance
         - Cleaner
         - Electricity Bill
         - Water Bill
         - Internet Bill
         - Association Dues
         - Other
      - Status (Paid or Pending)f
      - Tag

## 2026/08/03 Deployment (vercel)
- **All Tabs except Master List**
    - Add Year and Month Filter
    - Display current month records only by default
- **Manager's Notes**
   - Add new tab: Manager's Notes, the panel should enable manager to create note items list with status tracking, not affected by overall Year and Month filter
   - Google Sheet specs
      name: ManagersNotes
      columns: Date, Notes, Room, Status (Urgent, Pending or Completed), StatusId
   - Add a stat card for number of Urgent/Pending notes, on clicking the card, view should transition to Manager's panel
   - UI Fields
      - Date
      - Notes (wide text area)
      - Room
      - Status (Urgent, Pending, Dismissed, Completed)
   - StatusId depends on status value, Urgent - 1, Pending - 2, Completed - 3, Dismissed - 4, record sorting will be based on ascending StatusId and descending date.
   - task status change buttons at the bottom, then change the upper status on click.
- **Master List**
   - Added inactive status for items that have 0 minimum stock and 0 stock and will not repurchased anymore.


## 2026/08/04 Deployment (vercel)
- **Updates/Fixes**
    - fix UI for status/date with long item name
    - panel change on stat-cards: lowstock, expense and notes
    - add date range and status filter on Managers notes
    - Add item button on the transactions
    - view item from restock item list

## TODO List
- **Master List Updates**
    - add shortcut to item for the restock items
    - Add itemID - HOLD
    - Add ability to add image per item (store image on google drive), save image url on google sheet

- **Purchases**
    - add image per purchase, should update item image when item is updated, set image to image from latest transaction when updated.
   
- **Reports**
   - Monthly inventory flow
   - Monthly Expenses + Purchases 
      - should be able to filer by month, year and expense type.
   - Check for KPI reports for inventory

- **UX improvements**
   - better looking select item name options