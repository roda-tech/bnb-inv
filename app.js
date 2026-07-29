const STORAGE_KEY = 'bnb-inventory-manager';
const PURCHASES_KEY = 'bnb-inventory-manager-purchases';
const USAGE_KEY = 'bnb-inventory-manager-usage';
const DAMAGE_KEY = 'bnb-inventory-manager-damage';
const SHEET_SETTINGS_KEY = 'bnb-inventory-sheet-settings';
const SHEET_TOKEN_KEY = 'bnb-inventory-sheet-token';

const GOOGLE_CLIENT_ID = '619005833964-795a62342hefkqc9t3qv4afmb8clia5e.apps.googleusercontent.com';

const initialItems = [];
const initialPurchases = [];
const initialUsages = [];
const initialDamages = [];

let items = loadItems();
let purchases = loadPurchases();
let usages = loadUsages();
let damages = loadDamages();
let editingItemId = null;

// DOM Elements
const inventoryList = document.getElementById('inventory-list');
const statsEl = document.getElementById('stats');
const lowStockList = document.getElementById('low-stock-list');
const lowStockCountBadge = document.getElementById('low-stock-count-badge');
const filterName = document.getElementById('filter-name');
const filterCategory = document.getElementById('filter-category');
const filterTags = document.getElementById('filter-tags');

const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const submitBtn = document.getElementById('submit-item-btn');
const triggerAddItemBtn = document.getElementById('trigger-add-item-btn');

const purchaseForm = document.getElementById('purchase-form');
const purchaseList = document.getElementById('purchase-list');
const purchaseItemSelect = purchaseForm ? purchaseForm.elements.itemId : null;
const purchaseUnitInput = purchaseForm ? purchaseForm.elements.unit : null;

const usageForm = document.getElementById('usage-form');
const usageList = document.getElementById('usage-list');
const usageItemSelect = usageForm ? usageForm.elements.itemId : null;
const usageUnitInput = usageForm ? usageForm.elements.unit : null;

const damageForm = document.getElementById('damage-form');
const damageList = document.getElementById('damage-list');
const damageItemSelect = damageForm ? damageForm.elements.itemId : null;

const unitDatalist = document.getElementById('unit-options');
const toastContainer = document.getElementById('toast-container');

// Sync Modal Elements
const syncModal = document.getElementById('sync-modal');
const openSyncModalBtn = document.getElementById('open-sync-modal-btn');
const closeSyncModalBtn = document.getElementById('close-sync-modal-btn');
const syncStatusBadge = document.getElementById('sync-status-badge');
const syncStatusText = document.getElementById('sync-status-text');

const sheetIdInput = document.getElementById('sheet-id');
const googleConnectBtn = document.getElementById('google-connect');
const googleDisconnectBtn = document.getElementById('google-disconnect');
const sheetImportBtn = document.getElementById('sheet-import');
const sheetExportBtn = document.getElementById('sheet-export');
const sheetStatus = document.getElementById('sheet-status');

let sheetConnected = false;
let sheetAccessToken = null;
let sheetAuthState = null;
let lastSheetSync = null;

/* --- Toast Notification System --- */
function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* --- Data Normalization --- */
function normalizeItems(itemsToNormalize) {
  return itemsToNormalize.map((item) => ({
    ...item,
    id: Number(item.id) || Date.now(),
    openingStock: Number(item.openingStock ?? item.quantity ?? 0),
    price: Number(item.price ?? 0),
    minStock: Number(item.minStock ?? 0),
    reorderQty: Number(item.reorderQty ?? 0),
    category: item.category ?? 'General',
    unit: (item.unit ?? 'units').toString().trim().toLowerCase(),
    storage: item.storage ?? 'Unassigned',
    tags: item.tags ?? '',
    notes: item.notes ?? ''
  }));
}

function normalizePurchases(purchasesToNormalize) {
  return purchasesToNormalize.map((purchase) => ({
    ...purchase,
    id: Number(purchase.id) || Date.now() + Math.floor(Math.random() * 1000),
    itemId: Number(purchase.itemId),
    quantity: Number(purchase.quantity ?? 0),
    cost: Number(purchase.cost ?? 0),
    date: purchase.date || new Date().toISOString().slice(0, 10),
    unit: purchase.unit ? purchase.unit.toString().trim().toLowerCase() : '',
    note: purchase.note ?? ''
  }));
}

function normalizeUsages(usagesToNormalize) {
  return usagesToNormalize.map((usage) => ({
    ...usage,
    id: Number(usage.id) || Date.now() + Math.floor(Math.random() * 1000),
    itemId: Number(usage.itemId),
    quantity: Number(usage.quantity ?? 0),
    date: usage.date || new Date().toISOString().slice(0, 10),
    unit: usage.unit ? usage.unit.toString().trim().toLowerCase() : '',
    room: usage.room ?? '',
    note: usage.note ?? ''
  }));
}

function normalizeDamages(damagesToNormalize) {
  return damagesToNormalize.map((damage) => ({
    ...damage,
    id: Number(damage.id) || Date.now() + Math.floor(Math.random() * 1000),
    itemId: Number(damage.itemId),
    quantity: Number(damage.quantity ?? 0),
    date: damage.date || new Date().toISOString().slice(0, 10),
    location: damage.location ?? '',
    description: damage.description ?? ''
  }));
}

/* --- Local Storage Load & Save --- */
function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeItems(parsed);
    } catch (e) {
      console.error('Failed to parse saved inventory', e);
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialItems));
  return normalizeItems(initialItems);
}

function loadPurchases() {
  const stored = localStorage.getItem(PURCHASES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizePurchases(parsed);
    } catch (e) {
      console.error('Failed to parse saved purchases', e);
    }
  }
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(initialPurchases));
  return normalizePurchases(initialPurchases);
}

function loadUsages() {
  const stored = localStorage.getItem(USAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeUsages(parsed);
    } catch (e) {
      console.error('Failed to parse saved usages', e);
    }
  }
  localStorage.setItem(USAGE_KEY, JSON.stringify(initialUsages));
  return normalizeUsages(initialUsages);
}

function loadDamages() {
  const stored = localStorage.getItem(DAMAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeDamages(parsed);
    } catch (e) {
      console.error('Failed to parse saved damages', e);
    }
  }
  localStorage.setItem(DAMAGE_KEY, JSON.stringify(initialDamages));
  return normalizeDamages(initialDamages);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  localStorage.setItem(USAGE_KEY, JSON.stringify(usages));
  localStorage.setItem(DAMAGE_KEY, JSON.stringify(damages));
}

function loadSheetSettings() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SHEET_SETTINGS_KEY) || '{}');
    return {
      sheetId: parsed.sheetId || '',
      connected: Boolean(parsed.connected)
    };
  } catch (error) {
    return { sheetId: '', connected: false };
  }
}

function persistSheetSettings() {
  localStorage.setItem(SHEET_SETTINGS_KEY, JSON.stringify({
    sheetId: getSpreadsheetId(),
    connected: sheetConnected
  }));

  if (sheetAccessToken) {
    localStorage.setItem(SHEET_TOKEN_KEY, sheetAccessToken);
  } else {
    localStorage.removeItem(SHEET_TOKEN_KEY);
  }
}

/* --- Calculations & Derivations --- */
function getPurchaseQuantity(item) {
  return purchases
    .filter((p) => p.itemId === item.id)
    .reduce((sum, p) => sum + p.quantity, 0);
}

function getUsageQuantity(item) {
  return usages
    .filter((u) => u.itemId === item.id)
    .reduce((sum, u) => sum + u.quantity, 0);
}

function getDamageQuantity(item) {
  return damages
    .filter((d) => d.itemId === item.id)
    .reduce((sum, d) => sum + d.quantity, 0);
}

function getCurrentStock(item) {
  const purchased = getPurchaseQuantity(item);
  const used = getUsageQuantity(item);
  const damaged = getDamageQuantity(item);
  return item.openingStock + purchased - used - damaged;
}

function getLatestCost(item) {
  const itemPurchases = purchases
    .filter((p) => p.itemId === item.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  return itemPurchases.length > 0 ? itemPurchases[0].cost : item.price;
}

function getStatus(item) {
  const currentStock = getCurrentStock(item);
  if (currentStock <= 0) return 'out-of-stock';
  if (currentStock <= item.minStock) return 'low-stock';
  return 'in-stock';
}

function getKnownUnits() {
  const units = new Set();
  items.forEach((item) => units.add(item.unit.toString().trim().toLowerCase()));
  purchases.forEach((p) => p.unit && units.add(p.unit.toString().trim().toLowerCase()));
  usages.forEach((u) => u.unit && units.add(u.unit.toString().trim().toLowerCase()));
  return [...units].filter(Boolean).sort();
}

function updateUnitDatalist() {
  if (!unitDatalist) return;
  const units = getKnownUnits();
  unitDatalist.innerHTML = units.map((u) => `<option value="${u}"></option>`).join('');
}

function updateSheetStatus(message, connected = sheetConnected) {
  sheetConnected = connected;
  if (sheetStatus) sheetStatus.textContent = message;
  
  if (googleConnectBtn) googleConnectBtn.classList.toggle('hidden', connected);
  if (googleDisconnectBtn) googleDisconnectBtn.classList.toggle('hidden', !connected);

  if (syncStatusBadge && syncStatusText) {
    syncStatusBadge.className = `sync-badge ${connected ? 'online' : 'offline'}`;
    syncStatusText.textContent = connected ? 'Sheets: Connected' : 'Sheets: Disconnected';
  }
}

/* --- Tab Switching Navigation --- */
function setupTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetTabId = button.dataset.tab;

      tabButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.id === targetTabId;
        panel.classList.toggle('active', isActive);
      });
    });
  });
}

/* --- Modal Dialog Handling --- */
function setupSyncModal() {
  if (!syncModal) return;

  const openModal = () => syncModal.classList.remove('hidden');
  const closeModal = () => syncModal.classList.add('hidden');

  if (openSyncModalBtn) openSyncModalBtn.addEventListener('click', openModal);
  if (syncStatusBadge) syncStatusBadge.addEventListener('click', openModal);
  if (closeSyncModalBtn) closeSyncModalBtn.addEventListener('click', closeModal);

  syncModal.addEventListener('click', (e) => {
    if (e.target === syncModal) closeModal();
  });
}

/* --- Google OAuth Handling --- */
function handleGoogleOAuthRedirect() {
  const hash = window.location.hash.substring(1);
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const error = params.get('error');
  const errorDescription = params.get('error_description');
  const state = params.get('state');

  if (window.opener && (accessToken || error)) {
    if (sheetAuthState && state && state !== sheetAuthState) {
      window.opener.postMessage({ type: 'google-oauth', error: 'Invalid OAuth state.' }, window.location.origin);
      window.close();
      return;
    }

    const message = accessToken
      ? 'Google OAuth completed successfully.'
      : `Google OAuth failed: ${errorDescription || error || 'Unknown error'}`;

    window.opener.postMessage({
      type: 'google-oauth',
      accessToken,
      error: error ? (errorDescription || error) : null,
      message
    }, window.location.origin);

    window.close();
  }
}

const SHEET_SPECS = {
  Dashboard: ['Number of Low Stock', 'Current total cost', 'List of Items with Low Stock'],
  MasterInventory: ['Category', 'ItemName', 'Unit', 'CurrentStock', 'Minimum', 'ReorderQty', 'Cost', 'Storage', 'Status', 'Tags', 'Note'],
  Purchases: ['Date', 'ItemName', 'Unit', 'Quantity', 'Cost', 'Note'],
  Usage: ['Date', 'ItemName', 'Unit', 'Quantity', 'Note', 'Room'],
  Damages: ['Date', 'ItemName', 'Quantity', 'Description', 'Location']
};

function getDashboardRows() {
  const lowStockItems = items.filter((item) => {
    const status = getStatus(item);
    return status === 'low-stock' || status === 'out-of-stock';
  });
  const currentTotalCost = items.reduce((sum, item) => sum + getCurrentStock(item) * getLatestCost(item), 0);
  return [
    ['Number of Low Stock', 'Current total cost', 'List of Items with Low Stock'],
    [lowStockItems.length, `₱${currentTotalCost.toFixed(2)}`, lowStockItems.map((item) => item.name).join(', ') || 'None']
  ];
}

function getMasterInventoryRows() {
  return items.map((item) => [
    item.category,
    item.name,
    item.unit,
    getCurrentStock(item),
    item.minStock,
    item.reorderQty,
    getLatestCost(item).toFixed(2),
    item.storage,
    getStatus(item).replace('-', ' '),
    item.tags,
    item.notes
  ]);
}

function getPurchaseRows() {
  return purchases.map((p) => {
    const item = items.find((e) => e.id === p.itemId);
    return [p.date, item ? item.name : 'Unknown', p.unit, p.quantity, p.cost.toFixed(2), p.note];
  });
}

function getUsageRows() {
  return usages.map((u) => {
    const item = items.find((e) => e.id === u.itemId);
    return [u.date, item ? item.name : 'Unknown', u.unit, u.quantity, u.note, u.room];
  });
}

function getDamageRows() {
  return damages.map((d) => {
    const item = items.find((e) => e.id === d.itemId);
    return [d.date, item ? item.name : 'Unknown', d.quantity, d.description, d.location];
  });
}

function normalizeHeader(value) {
  return value.toString().trim().toLowerCase();
}

function getSpreadsheetId() {
  if (!sheetIdInput) return '';
  const rawValue = sheetIdInput.value.toString().trim();
  const urlMatch = rawValue.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    const spreadsheetId = urlMatch[1];
    sheetIdInput.value = spreadsheetId;
    return spreadsheetId;
  }
  return rawValue;
}

async function googleSheetsFetch(path, options = {}) {
  if (!sheetAccessToken) {
    throw new Error('Google Sheets access token is not available.');
  }

  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${sheetAccessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Google Sheets request failed with status ${response.status}`);
  }

  return payload;
}

async function getSpreadsheetMetadata() {
  const spreadsheetId = getSpreadsheetId();
  return googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`);
}

async function validateWorkbookStructure() {
  const metadata = await getSpreadsheetMetadata();
  const sheets = metadata.sheets || [];
  if (sheets.length === 0) {
    throw new Error('Workbook is empty. Please export first to create the required sheets.');
  }

  const existingSheetNames = sheets.map((sheet) => sheet.properties.title);
  const missingSheets = Object.keys(SHEET_SPECS).filter((sheetName) => !existingSheetNames.includes(sheetName));
  if (missingSheets.length > 0) {
    throw new Error(`Workbook is missing required sheets: ${missingSheets.join(', ')}`);
  }

  for (const [sheetName, expectedColumns] of Object.entries(SHEET_SPECS)) {
    const spreadsheetId = getSpreadsheetId();
    const valuesResponse = await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!1:1`);
    const headers = (valuesResponse.values && valuesResponse.values[0]) || [];
    const normalizedHeaders = headers.map(normalizeHeader);
    const normalizedExpected = expectedColumns.map(normalizeHeader);
    if (normalizedHeaders.join('|') !== normalizedExpected.join('|')) {
      throw new Error(`Sheet ${sheetName} does not match the required columns.`);
    }
  }

  return metadata;
}

async function createMissingSheets(sheetNames) {
  if (sheetNames.length === 0) return;
  const spreadsheetId = getSpreadsheetId();
  const requests = sheetNames.map((sheetName) => ({ addSheet: { properties: { title: sheetName } } }));
  await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
    method: 'POST',
    body: JSON.stringify({ requests })
  });
}

async function writeSheetRows(sheetName, rows) {
  const spreadsheetId = getSpreadsheetId();
  const encodedSheetName = encodeURIComponent(sheetName);
  const path = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}!A1?valueInputOption=RAW`;
  await googleSheetsFetch(path, {
    method: 'PUT',
    body: JSON.stringify({ values: rows })
  });
}

async function clearSheet(sheetName) {
  const spreadsheetId = getSpreadsheetId();
  const encodedSheetName = encodeURIComponent(sheetName);
  await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}!A:Z:clear`, {
    method: 'POST',
    body: JSON.stringify({})
  });
}

function canSyncWithSheet() {
  const spreadsheetId = getSpreadsheetId();
  return sheetConnected && spreadsheetId !== '' && sheetAccessToken;
}

async function syncTransactionsToSheet(silent = false) {
  if (!canSyncWithSheet()) {
    if (!silent) showToast('Not connected to Google Sheets.', 'error');
    return;
  }

  updateSheetStatus('Syncing data to Google Sheet...', true);
  try {
    const metadata = await getSpreadsheetMetadata();
    const existingSheets = (metadata.sheets || []).map((s) => s.properties.title);
    const missingSheets = Object.keys(SHEET_SPECS).filter((name) => !existingSheets.includes(name));
    if (missingSheets.length > 0) {
      await createMissingSheets(missingSheets);
    }

    await Promise.all([
      clearSheet('Dashboard'),
      clearSheet('MasterInventory'),
      clearSheet('Purchases'),
      clearSheet('Usage'),
      clearSheet('Damages')
    ]);

    await Promise.all([
      writeSheetRows('Dashboard', getDashboardRows()),
      writeSheetRows('MasterInventory', [SHEET_SPECS.MasterInventory, ...getMasterInventoryRows()]),
      writeSheetRows('Purchases', [SHEET_SPECS.Purchases, ...getPurchaseRows()]),
      writeSheetRows('Usage', [SHEET_SPECS.Usage, ...getUsageRows()]),
      writeSheetRows('Damages', [SHEET_SPECS.Damages, ...getDamageRows()])
    ]);

    lastSheetSync = new Date();
    const timeStr = lastSheetSync.toLocaleTimeString();
    updateSheetStatus(`Connected • Last synced at ${timeStr}`, true);
    if (!silent) showToast(`Synced to Google Sheets at ${timeStr}`, 'success');
  } catch (error) {
    updateSheetStatus(`Sync failed: ${error.message || 'Unknown error'}`, false);
    if (!silent) showToast(`Google Sync Error: ${error.message}`, 'error');
  }
}

function scheduleSheetSync() {
  if (canSyncWithSheet()) {
    syncTransactionsToSheet(true);
  }
}

function hasTransactions(itemId) {
  return purchases.some((p) => p.itemId === itemId)
    || usages.some((u) => u.itemId === itemId)
    || damages.some((d) => d.itemId === itemId);
}

function getFilteredItems() {
  const nameTerm = filterName ? filterName.value.trim().toLowerCase() : '';
  const categoryTerm = filterCategory ? filterCategory.value.trim().toLowerCase() : '';
  const tagsTerm = filterTags ? filterTags.value.trim().toLowerCase() : '';

  return items.filter((item) => {
    const matchesName = nameTerm === '' || item.name.toLowerCase().includes(nameTerm);
    const matchesCategory = categoryTerm === '' || item.category.toLowerCase().includes(categoryTerm);
    const matchesTags = tagsTerm === '' || item.tags.toLowerCase().includes(tagsTerm);
    return matchesName && matchesCategory && matchesTags;
  });
}

/* --- Rendering Views & UI Components --- */
function render() {
  renderStats();
  renderLowStockList();
  renderInventory();
  renderPurchaseItems();
  renderUsageItems();
  renderDamageItems();
  renderPurchases();
  renderUsages();
  renderDamages();
  updateUnitDatalist();
}

function renderStats() {
  if (!statsEl) return;
  const totalItems = items.length;
  const lowStockItems = items.filter((item) => {
    const status = getStatus(item);
    return status === 'low-stock' || status === 'out-of-stock';
  }).length;
  const totalUnits = items.reduce((sum, item) => sum + getCurrentStock(item), 0);
  const totalValue = items.reduce((sum, item) => {
    const currentStock = getCurrentStock(item);
    return sum + currentStock * getLatestCost(item);
  }, 0);
  const storageLocations = new Set(items.map((item) => item.storage)).size;

  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon primary">📦</div>
      <div class="stat-info">
        <span class="stat-label">Total Items</span>
        <span class="stat-val">${totalItems}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon warning">⚠️</div>
      <div class="stat-info">
        <span class="stat-label">Needs Restock</span>
        <span class="stat-val">${lowStockItems}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon accent">📊</div>
      <div class="stat-info">
        <span class="stat-label">Total Stock Units</span>
        <span class="stat-val">${totalUnits}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon success">₱</div>
      <div class="stat-info">
        <span class="stat-label">Inventory Valuation</span>
        <span class="stat-val">₱${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon info">📍</div>
      <div class="stat-info">
        <span class="stat-label">Storage Locations</span>
        <span class="stat-val">${storageLocations}</span>
      </div>
    </div>
  `;
}

function resetForm() {
  if (!form) return;
  form.reset();
  editingItemId = null;
  formTitle.textContent = 'Add inventory item';
  submitBtn.textContent = 'Save item';
  cancelEditBtn.classList.add('hidden');
}

function resetPurchaseForm() {
  if (!purchaseForm) return;
  purchaseForm.reset();
  purchaseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    purchaseItemSelect.value = items[0].id;
    if (purchaseUnitInput) purchaseUnitInput.value = items[0].unit;
  }
}

function resetUsageForm() {
  if (!usageForm) return;
  usageForm.reset();
  usageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    usageItemSelect.value = items[0].id;
    if (usageUnitInput) usageUnitInput.value = items[0].unit;
  }
}

function resetDamageForm() {
  if (!damageForm) return;
  damageForm.reset();
  damageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    damageItemSelect.value = items[0].id;
    damageForm.elements.location.value = items[0].storage;
  }
}

function populateForm(item) {
  editingItemId = item.id;
  formTitle.textContent = 'Edit inventory item';
  submitBtn.textContent = 'Update item';
  cancelEditBtn.classList.remove('hidden');

  form.elements.name.value = item.name;
  form.elements.category.value = item.category;
  form.elements.openingStock.value = item.openingStock;
  form.elements.price.value = item.price;
  form.elements.minStock.value = item.minStock;
  form.elements.reorderQty.value = item.reorderQty;
  form.elements.unit.value = item.unit;
  form.elements.storage.value = item.storage;
  form.elements.tags.value = item.tags;
  form.elements.notes.value = item.notes;

  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderInventory() {
  if (!inventoryList) return;
  inventoryList.innerHTML = '';
  const filteredItems = getFilteredItems();

  if (filteredItems.length === 0) {
    inventoryList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1; padding: 20px; text-align: center;">No inventory items match your search filters.</p>';
    return;
  }

  filteredItems.forEach((item) => {
    const currentStock = getCurrentStock(item);
    const cost = getLatestCost(item);
    const status = getStatus(item);
    const card = document.createElement('article');
    card.className = 'inventory-card';

    let badgeText = 'In Stock';
    if (status === 'low-stock') badgeText = 'Low Stock';
    if (status === 'out-of-stock') badgeText = 'Out of Stock';

    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3 class="card-title">${item.name}</h3>
          <span class="chip chip-category">${item.category}</span>
        </div>
        <span class="badge ${status}">${badgeText}</span>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Current Stock</span>
          <span class="meta-value">${currentStock} ${item.unit}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Latest Unit Cost</span>
          <span class="meta-value">₱${cost.toFixed(2)}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Min Threshold</span>
          <span class="meta-value">${item.minStock} ${item.unit}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Reorder Qty</span>
          <span class="meta-value">${item.reorderQty} ${item.unit}</span>
        </div>
      </div>

      <div style="font-size: 0.825rem; color: var(--text-muted); display: flex; flex-wrap: wrap; gap: 8px;">
        <span>📍 ${item.storage}</span>
        ${item.tags ? `<span class="chip chip-tag">🏷️ ${item.tags}</span>` : ''}
      </div>

      ${item.notes ? `<p class="card-notes">"${item.notes}"</p>` : ''}

      <div class="card-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${item.id}">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="delete" data-id="${item.id}" ${hasTransactions(item.id) ? "disabled title='Cannot delete item with transaction history'" : ''}>Delete</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });
}

function renderPurchaseItems() {
  if (!purchaseItemSelect) return;
  const selectedValue = purchaseItemSelect.value;
  purchaseItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

  if (selectedValue && [...purchaseItemSelect.options].some((opt) => opt.value === selectedValue)) {
    purchaseItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(purchaseItemSelect.value));
  if (selectedItem && purchaseUnitInput) {
    purchaseUnitInput.value = selectedItem.unit;
  }
}

function renderUsageItems() {
  if (!usageItemSelect) return;
  const selectedValue = usageItemSelect.value;
  usageItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

  if (selectedValue && [...usageItemSelect.options].some((opt) => opt.value === selectedValue)) {
    usageItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(usageItemSelect.value));
  if (selectedItem && usageUnitInput) {
    usageUnitInput.value = selectedItem.unit;
  }
}

function renderDamageItems() {
  if (!damageItemSelect) return;
  const selectedValue = damageItemSelect.value;
  damageItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

  if (selectedValue && [...damageItemSelect.options].some((opt) => opt.value === selectedValue)) {
    damageItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(damageItemSelect.value));
  if (selectedItem && damageForm) {
    damageForm.elements.location.value = selectedItem.storage;
  }
}

function renderLowStockList() {
  if (!lowStockList) return;
  lowStockList.innerHTML = '';

  const lowStockItems = items
    .filter((item) => getStatus(item) === 'low-stock' || getStatus(item) === 'out-of-stock')
    .sort((a, b) => getCurrentStock(a) - getCurrentStock(b));

  if (lowStockCountBadge) {
    lowStockCountBadge.textContent = `${lowStockItems.length} items`;
  }

  if (lowStockItems.length === 0) {
    lowStockList.innerHTML = '<li><span>All items are sufficiently stocked!</span></li>';
    return;
  }

  lowStockItems.forEach((item) => {
    const currentStock = getCurrentStock(item);
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.name}</strong>
      <span>${currentStock} ${item.unit} left (min ${item.minStock})</span>
    `;
    lowStockList.appendChild(li);
  });
}

function renderPurchases() {
  if (!purchaseList) return;
  purchaseList.innerHTML = '';

  if (purchases.length === 0) {
    purchaseList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No purchase records logged yet.</p>';
    return;
  }

  purchases
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((p) => {
      const item = items.find((e) => e.id === p.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge in-stock">📅 ${p.date}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Quantity Added</span>
            <span class="meta-value">+${p.quantity} ${p.unit}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Unit Cost</span>
            <span class="meta-value">₱${p.cost.toFixed(2)}</span>
          </div>
          <div class="meta-item" style="grid-column: 1/-1;">
            <span class="meta-label">Total Purchase Value</span>
            <span class="meta-value">₱${(p.quantity * p.cost).toFixed(2)}</span>
          </div>
        </div>

        ${p.note ? `<p class="card-notes">Supplier/Note: ${p.note}</p>` : ''}

        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-purchase" data-id="${p.id}">Delete Record</button>
        </div>
      `;

      purchaseList.appendChild(card);
    });
}

function renderUsages() {
  if (!usageList) return;
  usageList.innerHTML = '';

  if (usages.length === 0) {
    usageList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No usage records logged yet.</p>';
    return;
  }

  usages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((u) => {
      const item = items.find((e) => e.id === u.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge out-of-stock">📅 ${u.date}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Quantity Used</span>
            <span class="meta-value">-${u.quantity} ${u.unit}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Room / Location</span>
            <span class="meta-value">${u.room || 'General'}</span>
          </div>
        </div>

        ${u.note ? `<p class="card-notes">Note: ${u.note}</p>` : ''}

        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-usage" data-id="${u.id}">Delete Record</button>
        </div>
      `;

      usageList.appendChild(card);
    });
}

function renderDamages() {
  if (!damageList) return;
  damageList.innerHTML = '';

  if (damages.length === 0) {
    damageList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No damage records logged yet.</p>';
    return;
  }

  damages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((d) => {
      const item = items.find((e) => e.id === d.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge low-stock">📅 ${d.date}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Quantity Damaged</span>
            <span class="meta-value">-${d.quantity} ${item ? item.unit : ''}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Location</span>
            <span class="meta-value">${d.location || 'Unassigned'}</span>
          </div>
        </div>

        ${d.description ? `<p class="card-notes">Details: ${d.description}</p>` : ''}

        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-damage" data-id="${d.id}">Delete Record</button>
        </div>
      `;

      damageList.appendChild(card);
    });
}

/* --- Event Handlers & Form Submissions --- */
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const name = formData.get('name').toString().trim();

  if (!name) {
    showToast('Item name is required.', 'error');
    return;
  }

  const duplicateItem = items.find((item) => item.name.toLowerCase() === name.toLowerCase() && item.id !== editingItemId);
  if (duplicateItem) {
    showToast('Item name must be unique.', 'error');
    return;
  }

  const updatedValues = {
    name,
    category: formData.get('category').toString().trim(),
    openingStock: Number(formData.get('openingStock')),
    price: Number(formData.get('price')),
    minStock: Number(formData.get('minStock')),
    reorderQty: Number(formData.get('reorderQty')),
    unit: formData.get('unit').toString().trim().toLowerCase(),
    storage: formData.get('storage').toString().trim(),
    tags: formData.get('tags').toString().trim(),
    notes: formData.get('notes').toString().trim()
  };

  if (editingItemId !== null) {
    items = items.map((item) => item.id === editingItemId ? { ...item, ...updatedValues } : item);
    showToast(`Updated item "${name}"`, 'success');
  } else {
    items.unshift({ id: Date.now(), ...updatedValues });
    showToast(`Added new item "${name}"`, 'success');
  }

  saveState();
  render();
  resetForm();
  scheduleSheetSync();
});

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', resetForm);
}

if (triggerAddItemBtn) {
  triggerAddItemBtn.addEventListener('click', () => {
    resetForm();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

purchaseItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(purchaseItemSelect.value));
  if (selectedItem && purchaseUnitInput) {
    purchaseUnitInput.value = selectedItem.unit;
  }
});

usageItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(usageItemSelect.value));
  if (selectedItem && usageUnitInput) {
    usageUnitInput.value = selectedItem.unit;
  }
});

damageItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(damageItemSelect.value));
  if (selectedItem && damageForm) {
    damageForm.elements.location.value = selectedItem.storage;
  }
});

purchaseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(purchaseForm);
  const purchase = {
    id: Date.now(),
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    unit: formData.get('unit').toString().trim().toLowerCase(),
    quantity: Number(formData.get('quantity')),
    cost: Number(formData.get('cost')),
    note: formData.get('note').toString().trim()
  };

  purchases.unshift(purchase);
  saveState();
  render();
  resetPurchaseForm();
  showToast('Purchase transaction recorded successfully', 'success');
  scheduleSheetSync();
});

usageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(usageForm);
  const itemId = Number(formData.get('itemId'));
  const quantity = Number(formData.get('quantity'));
  const item = items.find((i) => i.id === itemId);

  if (item) {
    const current = getCurrentStock(item);
    if (quantity > current) {
      showToast(`Warning: Usage quantity (${quantity}) exceeds current stock (${current})!`, 'error');
    }
  }

  const usage = {
    id: Date.now(),
    date: formData.get('date').toString(),
    itemId,
    unit: formData.get('unit').toString().trim().toLowerCase(),
    quantity,
    room: formData.get('room').toString().trim(),
    note: formData.get('note').toString().trim()
  };

  usages.unshift(usage);
  saveState();
  render();
  resetUsageForm();
  showToast('Usage record added successfully', 'success');
  scheduleSheetSync();
});

damageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(damageForm);
  const damage = {
    id: Date.now(),
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    quantity: Number(formData.get('quantity')),
    location: formData.get('location').toString().trim(),
    description: formData.get('description').toString().trim()
  };

  damages.unshift(damage);
  saveState();
  render();
  resetDamageForm();
  showToast('Damage record added successfully', 'success');
  scheduleSheetSync();
});

if (filterName) filterName.addEventListener('input', render);
if (filterCategory) filterCategory.addEventListener('input', render);
if (filterTags) filterTags.addEventListener('input', render);

/* --- Google Connection Handler --- */
async function connectGoogleSheets() {
  const clientId = GOOGLE_CLIENT_ID;
  const spreadsheetId = getSpreadsheetId();

  if (!spreadsheetId) {
    updateSheetStatus('Please enter a Google Sheet ID or URL.', false);
    showToast('Spreadsheet ID is required.', 'error');
    return;
  }

  updateSheetStatus('Connecting to Google...', false);

  try {
    sheetAuthState = `bnb-inv-${Date.now()}`;
    const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets';
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}${window.location.pathname}`);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('include_granted_scopes', 'true');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', sheetAuthState);

    const popup = window.open(authUrl.toString(), 'google-oauth', 'width=500,height=700');
    if (!popup) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    const authResult = await new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data && event.data.type === 'google-oauth') {
          window.removeEventListener('message', handleMessage);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data);
          }
        }
      };

      window.addEventListener('message', handleMessage);
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Google sign-in was cancelled.'));
        }
      }, 500);
    });

    sheetAccessToken = authResult.accessToken || null;
    persistSheetSettings();
    updateSheetStatus('Connected to Google Sheets', true);
    showToast('Successfully connected to Google Sheets!', 'success');

    if (sheetAccessToken) {
      await importFromSheet();
    }
  } catch (error) {
    sheetAccessToken = null;
    persistSheetSettings();
    updateSheetStatus(`Connection failed: ${error.message || 'Unknown error'}`, false);
    showToast(`Connection error: ${error.message}`, 'error');
  }
}

if (googleConnectBtn) googleConnectBtn.addEventListener('click', connectGoogleSheets);

if (googleDisconnectBtn) {
  googleDisconnectBtn.addEventListener('click', () => {
    sheetConnected = false;
    sheetAccessToken = null;
    sheetAuthState = null;
    persistSheetSettings();
    updateSheetStatus('Disconnected from Google Sheets.', false);
    showToast('Disconnected from Google Sheets', 'info');
  });
}

async function importFromSheet() {
  if (!canSyncWithSheet()) {
    updateSheetStatus('Connect first to import.', false);
    showToast('Connect to Google Sheets before importing.', 'error');
    return;
  }

  updateSheetStatus('Validating workbook structure...', true);
  try {
    const metadata = await validateWorkbookStructure();
    const sheets = metadata.sheets || [];
    const sheetNames = sheets.map((s) => s.properties.title);
    if (sheetNames.length === 0) {
      throw new Error('Workbook is empty. Please export first to create the required sheets.');
    }

    const readSheetValues = async (sheetName) => {
      const spreadsheetId = getSpreadsheetId();
      const response = await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}`);
      return response.values || [];
    };

    const masterInventoryRows = await readSheetValues('MasterInventory');
    const purchaseRows = await readSheetValues('Purchases');
    const usageRows = await readSheetValues('Usage');
    const damageRows = await readSheetValues('Damages');

    if (masterInventoryRows.length < 2) {
      throw new Error('Workbook contains no item records in MasterInventory.');
    }

    const importedItems = masterInventoryRows.slice(1).map((row, index) => ({
      id: Date.now() + index,
      name: row[1] || `Imported item ${index + 1}`,
      category: row[0] || 'General',
      openingStock: Number(row[3] || 0),
      price: Number(row[6] || 0),
      minStock: Number(row[4] || 0),
      reorderQty: Number(row[5] || 0),
      unit: (row[2] || 'units').toString().trim().toLowerCase(),
      storage: row[7] || 'Unassigned',
      tags: row[9] || '',
      notes: row[10] || ''
    }));

    const importedItemMap = new Map(importedItems.map((item) => [item.name.toLowerCase(), item]));
    const importedPurchases = purchaseRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 10000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      unit: (row[2] || '').toString().trim().toLowerCase(),
      quantity: Number(row[3] || 0),
      cost: Number(row[4] || 0),
      note: row[5] || ''
    })).filter((p) => p.itemId !== 0);

    const importedUsages = usageRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 20000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      unit: (row[2] || '').toString().trim().toLowerCase(),
      quantity: Number(row[3] || 0),
      room: row[5] || '',
      note: row[4] || ''
    })).filter((u) => u.itemId !== 0);

    const importedDamages = damageRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 30000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      quantity: Number(row[2] || 0),
      location: row[4] || '',
      description: row[3] || ''
    })).filter((d) => d.itemId !== 0);

    items = importedItems;
    purchases = importedPurchases;
    usages = importedUsages;
    damages = importedDamages;

    saveState();
    render();
    resetForm();
    resetPurchaseForm();
    resetUsageForm();
    resetDamageForm();
    updateSheetStatus(`Connected • Import complete (${items.length} items)`, true);
    showToast(`Imported ${items.length} items from Google Sheet`, 'success');
  } catch (error) {
    updateSheetStatus(`Import failed: ${error.message || 'Unknown error'}`, false);
    showToast(`Import Error: ${error.message}`, 'error');
  }
}

if (sheetImportBtn) {
  sheetImportBtn.addEventListener('click', importFromSheet);
}

if (sheetExportBtn) {
  sheetExportBtn.addEventListener('click', async () => {
    if (!canSyncWithSheet()) {
      showToast('Connect to Google Sheets first to export.', 'error');
      return;
    }
    await syncTransactionsToSheet();
  });
}

inventoryList.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;

  const itemId = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === 'edit') {
    const itemToEdit = items.find((item) => item.id === itemId);
    if (itemToEdit) populateForm(itemToEdit);
    return;
  }

  if (action === 'delete') {
    const itemToDelete = items.find((item) => item.id === itemId);
    if (!itemToDelete) return;
    if (hasTransactions(itemId)) {
      showToast(`Cannot delete "${itemToDelete.name}" with existing transactions.`, 'error');
      return;
    }

    const confirmed = window.confirm(`Delete "${itemToDelete.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    items = items.filter((item) => item.id !== itemId);
    saveState();
    render();
    showToast(`Deleted "${itemToDelete.name}"`, 'info');
    scheduleSheetSync();
  }
});

if (purchaseList) {
  purchaseList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action="delete-purchase"]');
    if (!target) return;
    const purchaseId = Number(target.dataset.id);
    const purchaseToDelete = purchases.find((p) => p.id === purchaseId);
    if (!purchaseToDelete) return;
    const item = items.find((i) => i.id === purchaseToDelete.itemId);
    const itemName = item ? item.name : 'Unknown Item';

    const confirmed = window.confirm(`Delete purchase record for "${itemName}" (${purchaseToDelete.quantity} ${purchaseToDelete.unit})?`);
    if (!confirmed) return;

    purchases = purchases.filter((p) => p.id !== purchaseId);
    saveState();
    render();
    showToast(`Deleted purchase record for "${itemName}"`, 'info');
    scheduleSheetSync();
  });
}

if (usageList) {
  usageList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action="delete-usage"]');
    if (!target) return;
    const usageId = Number(target.dataset.id);
    const usageToDelete = usages.find((u) => u.id === usageId);
    if (!usageToDelete) return;
    const item = items.find((i) => i.id === usageToDelete.itemId);
    const itemName = item ? item.name : 'Unknown Item';

    const confirmed = window.confirm(`Delete usage record for "${itemName}" (${usageToDelete.quantity} ${usageToDelete.unit})?`);
    if (!confirmed) return;

    usages = usages.filter((u) => u.id !== usageId);
    saveState();
    render();
    showToast(`Deleted usage record for "${itemName}"`, 'info');
    scheduleSheetSync();
  });
}

if (damageList) {
  damageList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action="delete-damage"]');
    if (!target) return;
    const damageId = Number(target.dataset.id);
    const damageToDelete = damages.find((d) => d.id === damageId);
    if (!damageToDelete) return;
    const item = items.find((i) => i.id === damageToDelete.itemId);
    const itemName = item ? item.name : 'Unknown Item';

    const confirmed = window.confirm(`Delete damage record for "${itemName}" (${damageToDelete.quantity} units)?`);
    if (!confirmed) return;

    damages = damages.filter((d) => d.id !== damageId);
    saveState();
    render();
    showToast(`Deleted damage record for "${itemName}"`, 'info');
    scheduleSheetSync();
  });
}

/* --- Initialization --- */
setupTabs();
setupSyncModal();
resetForm();
resetPurchaseForm();
resetUsageForm();
resetDamageForm();
render();

async function initializeGoogleSync() {
  const savedSettings = loadSheetSettings();
  if (savedSettings.sheetId && sheetIdInput) {
    sheetIdInput.value = savedSettings.sheetId;
  }

  const savedToken = localStorage.getItem(SHEET_TOKEN_KEY);
  if (savedToken && savedSettings.sheetId) {
    sheetAccessToken = savedToken;
    sheetConnected = true;
    updateSheetStatus('Verifying Google connection...', true);

    try {
      await getSpreadsheetMetadata();
      updateSheetStatus('Connected to Google Sheets', true);
    } catch (e) {
      console.warn('Saved Google token expired or invalid', e);
      sheetAccessToken = null;
      sheetConnected = false;
      persistSheetSettings();
      updateSheetStatus('Token expired. Please reconnect.', false);
    }
  } else if (savedSettings.sheetId) {
    updateSheetStatus('Google Sheet ID set. Connect to sync.', false);
  }
}

window.addEventListener('load', async () => {
  handleGoogleOAuthRedirect();
  await initializeGoogleSync();
});
