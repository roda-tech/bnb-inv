const STORAGE_KEY = 'bnb-inventory-manager';
const PURCHASES_KEY = 'bnb-inventory-manager-purchases';
const USAGE_KEY = 'bnb-inventory-manager-usage';
const DAMAGE_KEY = 'bnb-inventory-manager-damage';

const initialItems = [
  {
    id: 1,
    name: 'Bed sheets',
    category: 'Linen',
    openingStock: 24,
    price: 18.5,
    minStock: 12,
    reorderQty: 12,
    unit: 'sets',
    storage: '1801-1804',
    tags: 'bed,linen',
    notes: 'Keep 2 extra sets for turnover'
  },
  {
    id: 2,
    name: 'Detergent',
    category: 'Cleaning',
    openingStock: 6,
    price: 7.25,
    minStock: 4,
    reorderQty: 6,
    unit: 'bottles',
    storage: 'Housekeeping closet',
    tags: 'cleaning,soap',
    notes: 'Order before weekend check-ins'
  },
  {
    id: 3,
    name: 'Toilet paper',
    category: 'Restroom',
    openingStock: 3,
    price: 1.8,
    minStock: 6,
    reorderQty: 12,
    unit: 'rolls',
    storage: '1802',
    tags: 'restroom,essentials',
    notes: 'High use item'
  },
  {
    id: 4,
    name: 'Hand soap',
    category: 'Restroom',
    openingStock: 8,
    price: 3.4,
    minStock: 4,
    reorderQty: 8,
    unit: 'bottles',
    storage: '1803',
    tags: 'restroom,cleaning',
    notes: 'Refill during room prep'
  }
];

const initialPurchases = [];
const initialUsages = [];
const initialDamages = [];

let items = loadItems();
let purchases = loadPurchases();
let usages = loadUsages();
let damages = loadDamages();
let editingItemId = null;

const inventoryList = document.getElementById('inventory-list');
const statsEl = document.getElementById('stats');
const lowStockList = document.getElementById('low-stock-list');
const filterName = document.getElementById('filter-name');
const filterCategory = document.getElementById('filter-category');
const filterTags = document.getElementById('filter-tags');
const form = document.getElementById('item-form');
const resetBtn = document.getElementById('reset-data');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const submitBtn = form.querySelector('button[type="submit"]');
const purchaseForm = document.getElementById('purchase-form');
const purchaseList = document.getElementById('purchase-list');
const purchaseItemSelect = purchaseForm.elements.itemId;
const purchaseUnitInput = purchaseForm.elements.unit;
const usageForm = document.getElementById('usage-form');
const usageList = document.getElementById('usage-list');
const usageItemSelect = usageForm.elements.itemId;
const usageUnitInput = usageForm.elements.unit;
const damageForm = document.getElementById('damage-form');
const damageList = document.getElementById('damage-list');
const damageItemSelect = damageForm.elements.itemId;
const unitDatalist = document.getElementById('unit-options');
const googleClientIdInput = document.getElementById('google-client-id');
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

function normalizeItems(itemsToNormalize) {
  return itemsToNormalize.map((item) => ({
    ...item,
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

function loadItems() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return normalizeItems(parsed);
      }
    } catch (error) {
      console.error('Failed to parse saved inventory', error);
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
      if (Array.isArray(parsed)) {
        return normalizePurchases(parsed);
      }
    } catch (error) {
      console.error('Failed to parse saved purchases', error);
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
      if (Array.isArray(parsed)) {
        return normalizeUsages(parsed);
      }
    } catch (error) {
      console.error('Failed to parse saved usages', error);
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
      if (Array.isArray(parsed)) {
        return normalizeDamages(parsed);
      }
    } catch (error) {
      console.error('Failed to parse saved damages', error);
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

function getPurchaseQuantity(item) {
  return purchases
    .filter((purchase) => purchase.itemId === item.id)
    .reduce((sum, purchase) => sum + purchase.quantity, 0);
}

function getUsageQuantity(item) {
  return usages
    .filter((usage) => usage.itemId === item.id)
    .reduce((sum, usage) => sum + usage.quantity, 0);
}

function getDamageQuantity(item) {
  return damages
    .filter((damage) => damage.itemId === item.id)
    .reduce((sum, damage) => sum + damage.quantity, 0);
}

function getCurrentStock(item) {
  const purchased = getPurchaseQuantity(item);
  const used = getUsageQuantity(item);
  const damaged = getDamageQuantity(item);
  return item.openingStock + purchased - used - damaged;
}

function getLatestCost(item) {
  const itemPurchases = purchases
    .filter((purchase) => purchase.itemId === item.id)
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
  purchases.forEach((purchase) => {
    if (purchase.unit) units.add(purchase.unit.toString().trim().toLowerCase());
  });
  usages.forEach((usage) => {
    if (usage.unit) units.add(usage.unit.toString().trim().toLowerCase());
  });
  return [...units].filter(Boolean).sort();
}

function updateUnitDatalist() {
  const units = getKnownUnits();
  unitDatalist.innerHTML = units.map((unit) => `<option value="${unit}"></option>`).join('');
}

function updateSheetStatus(message, connected = sheetConnected) {
  sheetStatus.textContent = message;
  sheetConnected = connected;
  googleConnectBtn.classList.toggle('hidden', connected);
  googleDisconnectBtn.classList.toggle('hidden', !connected);
}

function handleGoogleOAuthRedirect() {
  const hash = window.location.hash.substring(1);
  if (!hash) {
    return;
  }

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
  return purchases.map((purchase) => {
    const item = items.find((entry) => entry.id === purchase.itemId);
    return [purchase.date, item ? item.name : 'Unknown', purchase.unit, purchase.quantity, purchase.cost.toFixed(2), purchase.note];
  });
}

function getUsageRows() {
  return usages.map((usage) => {
    const item = items.find((entry) => entry.id === usage.itemId);
    return [usage.date, item ? item.name : 'Unknown', usage.unit, usage.quantity, usage.note, usage.room];
  });
}

function getDamageRows() {
  return damages.map((damage) => {
    const item = items.find((entry) => entry.id === damage.itemId);
    return [damage.date, item ? item.name : 'Unknown', damage.quantity, damage.description, damage.location];
  });
}

function normalizeHeader(value) {
  return value.toString().trim().toLowerCase();
}

function getSpreadsheetId() {
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
  if (sheetNames.length === 0) {
    return;
  }

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
  await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedSheetName}!A1?valueInputOption=RAW`, {
    method: 'PUT',
    body: JSON.stringify({
      range: `${sheetName}!A1`,
      majorDimension: 'ROWS',
      values: rows
    })
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
  return sheetConnected && spreadsheetId !== '';
}

async function syncTransactionsToSheet() {
  if (!canSyncWithSheet()) {
    updateSheetStatus('Not connected or missing sheet ID.', false);
    return;
  }

  updateSheetStatus('Syncing transactions to Google Sheet...', true);
  try {
    const spreadsheetId = getSpreadsheetId();
    const metadata = await getSpreadsheetMetadata();
    const existingSheets = (metadata.sheets || []).map((sheet) => sheet.properties.title);
    const missingSheets = Object.keys(SHEET_SPECS).filter((sheetName) => !existingSheets.includes(sheetName));
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
    updateSheetStatus(`Export complete at ${lastSheetSync.toLocaleTimeString()}.`, true);
  } catch (error) {
    updateSheetStatus(`Export failed: ${error.message || 'Unknown error'}`, false);
  }
}

function scheduleSheetSync() {
  if (sheetConnected) {
    syncTransactionsToSheet();
  }
}

function hasTransactions(itemId) {
  return purchases.some((purchase) => purchase.itemId === itemId)
    || usages.some((usage) => usage.itemId === itemId)
    || damages.some((damage) => damage.itemId === itemId);
}

function getFilteredItems() {
  const nameTerm = filterName.value.trim().toLowerCase();
  const categoryTerm = filterCategory.value.trim().toLowerCase();
  const tagsTerm = filterTags.value.trim().toLowerCase();

  return items.filter((item) => {
    const matchesName = nameTerm === '' || item.name.toLowerCase().includes(nameTerm);
    const matchesCategory = categoryTerm === '' || item.category.toLowerCase().includes(categoryTerm);
    const matchesTags = tagsTerm === '' || item.tags.toLowerCase().includes(tagsTerm);
    return matchesName && matchesCategory && matchesTags;
  });
}

function render() {
  renderStats();
  renderLowStockList();
  renderInventory();
  renderPurchaseItems();
  renderUsageItems();
  renderDamageItems();
  renderUsages();
  renderDamages();
  renderPurchases();
  updateUnitDatalist();
}

function renderStats() {
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

  statsEl.innerHTML = `
    <div class="stat-box">
      <div class="stat-label">Total items</div>
      <div class="stat-value">${totalItems}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Needs restock</div>
      <div class="stat-value">${lowStockItems}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Current stock</div>
      <div class="stat-value">${totalUnits}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Inventory value</div>
      <div class="stat-value">₱${totalValue.toFixed(2)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Locations tracked</div>
      <div class="stat-value">${new Set(items.map((item) => item.storage)).size}</div>
    </div>
  `;
}

function resetForm() {
  form.reset();
  editingItemId = null;
  formTitle.textContent = 'Add inventory item';
  submitBtn.textContent = 'Save item';
  cancelEditBtn.classList.add('hidden');
}

function resetPurchaseForm() {
  purchaseForm.reset();
  purchaseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  purchaseItemSelect.value = items.length > 0 ? items[0].id : '';
  const selectedItem = items[0];
  purchaseUnitInput.value = selectedItem ? selectedItem.unit : '';
  updateUnitDatalist();
}

function resetUsageForm() {
  usageForm.reset();
  usageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  usageItemSelect.value = items.length > 0 ? items[0].id : '';
  const selectedItem = items[0];
  usageUnitInput.value = selectedItem ? selectedItem.unit : '';
  updateUnitDatalist();
}

function resetDamageForm() {
  damageForm.reset();
  damageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  damageItemSelect.value = items.length > 0 ? items[0].id : '';
  const selectedItem = items[0];
  damageForm.elements.location.value = selectedItem ? selectedItem.storage : '';
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
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderInventory() {
  inventoryList.innerHTML = '';
  const filteredItems = getFilteredItems();

  if (filteredItems.length === 0) {
    inventoryList.innerHTML = '<p>No inventory items match those filters.</p>';
    return;
  }

  filteredItems.forEach((item) => {
    const currentStock = getCurrentStock(item);
    const cost = getLatestCost(item);
    const card = document.createElement('article');
    card.className = 'inventory-card';
    const status = getStatus(item);

    card.innerHTML = `
      <div class="panel-header">
        <h3>${item.name}</h3>
        <span class="badge ${status}">${status.replace('-', ' ')}</span>
      </div>
      <div class="meta-row">
        <span>Category: ${item.category}</span>
        <span>Current: ${currentStock} ${item.unit}</span>
      </div>
      <div class="meta-row">
        <span>Opening: ${item.openingStock} ${item.unit}</span>
        <span>Latest cost: ₱${cost.toFixed(2)}</span>
      </div>
      <div class="meta-row">
        <span>Min: ${item.minStock} ${item.unit}</span>
        <span>Reorder: ${item.reorderQty} ${item.unit}</span>
      </div>
      <div class="meta-row">
        <span>Storage: ${item.storage}</span>
        <span>Tags: ${item.tags || 'none'}</span>
      </div>
      <p>${item.notes || 'No notes added.'}</p>
      <div class="actions">
        <button class="small-btn" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="small-btn" data-action="delete" data-id="${item.id}" ${hasTransactions(item.id) ? "style='background-color: gray;' disabled title='Cannot delete item with existing records'" : ''}>Delete</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });
}

function renderPurchaseItems() {
  const selectedValue = purchaseItemSelect.value;
  purchaseItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');

  if (selectedValue && [...purchaseItemSelect.options].some((option) => option.value === selectedValue)) {
    purchaseItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(purchaseItemSelect.value));
  if (selectedItem) {
    purchaseUnitInput.value = selectedItem.unit;
  }
  updateUnitDatalist();
}

function renderUsageItems() {
  const selectedValue = usageItemSelect.value;
  usageItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');

  if (selectedValue && [...usageItemSelect.options].some((option) => option.value === selectedValue)) {
    usageItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(usageItemSelect.value));
  if (selectedItem) {
    usageUnitInput.value = selectedItem.unit;
  }
  updateUnitDatalist();
}

function renderDamageItems() {
  const selectedValue = damageItemSelect.value;
  damageItemSelect.innerHTML = items.map((item) => `<option value="${item.id}">${item.name}</option>`).join('');

  if (selectedValue && [...damageItemSelect.options].some((option) => option.value === selectedValue)) {
    damageItemSelect.value = selectedValue;
  }

  const selectedItem = items.find((item) => item.id === Number(damageItemSelect.value));
  if (selectedItem) {
    damageForm.elements.location.value = selectedItem.storage;
  }
}

function renderLowStockList() {
  lowStockList.innerHTML = '';
  const lowStockItems = items
    .filter((item) => getStatus(item) === 'low-stock' || getStatus(item) === 'out-of-stock')
    .sort((a, b) => getCurrentStock(a) - getCurrentStock(b));

  if (lowStockItems.length === 0) {
    lowStockList.innerHTML = '<li>No low stock items.</li>';
    return;
  }

  lowStockItems.forEach((item) => {
    const currentStock = getCurrentStock(item);
    const listItem = document.createElement('li');
    listItem.innerHTML = `
      <strong>${item.name}</strong>
      <span>${currentStock} ${item.unit} left (min ${item.minStock})</span>
    `;
    lowStockList.appendChild(listItem);
  });
}

function renderPurchases() {
  purchaseList.innerHTML = '';

  if (purchases.length === 0) {
    purchaseList.innerHTML = '<p>No purchase records yet.</p>';
    return;
  }

  purchases
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((purchase) => {
      const item = items.find((itemEntry) => itemEntry.id === purchase.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="panel-header">
          <h3>${item ? item.name : 'Unknown item'}</h3>
          <span class="badge in-stock">${purchase.date}</span>
        </div>
        <div class="meta-row">
          <span>Quantity: ${purchase.quantity} ${purchase.unit}</span>
          <span>Cost: ₱${purchase.cost.toFixed(2)} each</span>
        </div>
        <div class="meta-row">
          <span>Value: ₱${(purchase.quantity * purchase.cost).toFixed(2)}</span>
          <span>Note: ${purchase.note || 'None'}</span>
        </div>
      `;

      purchaseList.appendChild(card);
    });
}

function renderUsages() {
  usageList.innerHTML = '';

  if (usages.length === 0) {
    usageList.innerHTML = '<p>No usage records yet.</p>';
    return;
  }

  usages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((usage) => {
      const item = items.find((itemEntry) => itemEntry.id === usage.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="panel-header">
          <h3>${item ? item.name : 'Unknown item'}</h3>
          <span class="badge out-of-stock">${usage.date}</span>
        </div>
        <div class="meta-row">
          <span>Quantity used: ${usage.quantity} ${usage.unit}</span>
          <span>Room: ${usage.room || 'N/A'}</span>
        </div>
        <div class="meta-row">
          <span>Note: ${usage.note || 'None'}</span>
        </div>
      `;

      usageList.appendChild(card);
    });
}

function renderDamages() {
  damageList.innerHTML = '';

  if (damages.length === 0) {
    damageList.innerHTML = '<p>No damage records yet.</p>';
    return;
  }

  damages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((damage) => {
      const item = items.find((itemEntry) => itemEntry.id === damage.itemId);
      const currentStock = item ? getCurrentStock(item) : 0;
      const location = item ? item.storage : damage.location || 'N/A';
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="panel-header">
          <h3>${item ? item.name : 'Unknown item'}</h3>
          <span class="badge low-stock">${damage.date}</span>
        </div>
        <div class="meta-row">
          <span>Quantity damaged: ${damage.quantity} ${item ? item.unit : ''}</span>
          <span>Remaining: ${currentStock} ${item ? item.unit : ''}</span>
        </div>
        <div class="meta-row">
          <span>Location: ${location}</span>
          <span>Description: ${damage.description || 'None'}</span>
        </div>
      `;

      damageList.appendChild(card);
    });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const updatedValues = {
    name: formData.get('name').toString().trim(),
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
  } else {
    items.unshift({ id: Date.now(), ...updatedValues });
  }

  saveState();
  render();
  resetForm();
});

purchaseItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(purchaseItemSelect.value));
  if (selectedItem) {
    purchaseUnitInput.value = selectedItem.unit;
  }
});

usageItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(usageItemSelect.value));
  if (selectedItem) {
    usageUnitInput.value = selectedItem.unit;
  }
});

damageItemSelect.addEventListener('change', () => {
  const selectedItem = items.find((item) => item.id === Number(damageItemSelect.value));
  if (selectedItem) {
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
  scheduleSheetSync();
});

usageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(usageForm);
  const usage = {
    id: Date.now(),
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    unit: formData.get('unit').toString().trim().toLowerCase(),
    quantity: Number(formData.get('quantity')),
    room: formData.get('room').toString().trim(),
    note: formData.get('note').toString().trim()
  };

  usages.unshift(usage);
  saveState();
  render();
  resetUsageForm();
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
  scheduleSheetSync();
});

filterName.addEventListener('input', render);
filterCategory.addEventListener('input', render);
filterTags.addEventListener('input', render);

googleConnectBtn.addEventListener('click', async () => {
  const clientId = googleClientIdInput.value.toString().trim();
  const spreadsheetId = getSpreadsheetId();

  if (!clientId) {
    updateSheetStatus('Enter a valid client ID first.', false);
    return;
  }

  if (!spreadsheetId) {
    updateSheetStatus('Enter a spreadsheet ID first.', false);
    return;
  }

  updateSheetStatus('Connecting to Google...', false);

  try {
    sheetAuthState = `bnb-inv-${Date.now()}`;
    const scope = 'https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets';
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', `${window.location.origin}/oauth-callback.html`);
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
        if (event.origin !== window.location.origin) {
          return;
        }

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
    updateSheetStatus(`Connected: ${authResult.message || 'Google OAuth completed successfully.'}`, true);
  } catch (error) {
    sheetAccessToken = null;
    updateSheetStatus(`Connection failed: ${error.message || 'Unknown error'}`, false);
  }
});

googleDisconnectBtn.addEventListener('click', () => {
  sheetConnected = false;
  sheetAccessToken = null;
  sheetAuthState = null;
  updateSheetStatus('Disconnected from Google Sheets.', false);
});

sheetImportBtn.addEventListener('click', async () => {
  if (!canSyncWithSheet()) {
    updateSheetStatus('Connect first to import.', false);
    return;
  }

  updateSheetStatus('Validating workbook structure...', true);
  try {
    const metadata = await validateWorkbookStructure();
    const sheets = metadata.sheets || [];
    const sheetNames = sheets.map((sheet) => sheet.properties.title);
    if (sheetNames.length === 0) {
      throw new Error('Workbook is empty. Please export first to create the required sheets.');
    }

    const readSheetValues = async (sheetName) => {
    const spreadsheetId = getSpreadsheetId();
    const response = await googleSheetsFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}`);
    return response.values || [];
  };

    const dashboardRows = await readSheetValues('Dashboard');
    const masterInventoryRows = await readSheetValues('MasterInventory');
    const purchaseRows = await readSheetValues('Purchases');
    const usageRows = await readSheetValues('Usage');
    const damageRows = await readSheetValues('Damages');

    if (masterInventoryRows.length < 2) {
      throw new Error('The workbook does not contain inventory records yet. Export first to populate MasterInventory.');
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
    })).filter((purchase) => purchase.itemId !== 0);

    const importedUsages = usageRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 20000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      unit: (row[2] || '').toString().trim().toLowerCase(),
      quantity: Number(row[3] || 0),
      room: row[5] || '',
      note: row[4] || ''
    })).filter((usage) => usage.itemId !== 0);

    const importedDamages = damageRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 30000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      quantity: Number(row[2] || 0),
      location: row[4] || '',
      description: row[3] || ''
    })).filter((damage) => damage.itemId !== 0);

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
    updateSheetStatus(`Import complete: ${items.length} items, ${purchases.length} purchases, ${usages.length} usages, ${damages.length} damages.`, true);
  } catch (error) {
    updateSheetStatus(`Import failed: ${error.message || 'Unknown error'}`, false);
  }
});

sheetExportBtn.addEventListener('click', async () => {
  if (!canSyncWithSheet()) {
    updateSheetStatus('Connect first to export.', false);
    return;
  }

  await syncTransactionsToSheet();
});

inventoryList.addEventListener('click', (event) => {
  const target = event.target.closest('button[data-action]');
  if (!target) return;

  const itemId = Number(target.dataset.id);
  const action = target.dataset.action;

  if (action === 'edit') {
    const itemToEdit = items.find((item) => item.id === itemId);
    if (itemToEdit) {
      populateForm(itemToEdit);
    }
    return;
  }

  if (action === 'delete') {
    const itemToDelete = items.find((item) => item.id === itemId);
    if (!itemToDelete) return;
    if (hasTransactions(itemId)) {
      window.alert(`Cannot delete ${itemToDelete.name} because it has purchase, usage, or damage records.`);
      return;
    }

    const confirmed = window.confirm(`Delete ${itemToDelete.name}? This will permanently remove the item.`);
    if (!confirmed) return;

    items = items.filter((item) => item.id !== itemId);
    saveState();
    render();
  }
});

resetForm();
resetPurchaseForm();
resetUsageForm();
resetDamageForm();
render();
window.addEventListener('load', handleGoogleOAuthRedirect);
