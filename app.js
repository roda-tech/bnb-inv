const STORAGE_KEY = 'bnb-inventory-manager';
const PURCHASES_KEY = 'bnb-inventory-manager-purchases';
const USAGE_KEY = 'bnb-inventory-manager-usage';
const DAMAGE_KEY = 'bnb-inventory-manager-damage';
const EXPENSES_KEY = 'bnb-inventory-manager-expenses';
const MANAGER_NOTES_KEY = 'bnb-inventory-manager-notes';
const SHEET_SETTINGS_KEY = 'bnb-inventory-sheet-settings';
const SHEET_TOKEN_KEY = 'bnb-inventory-sheet-token';
const LAST_LOCAL_UPDATE_KEY = 'bnb-inventory-last-local-update';
const LAST_REMOTE_SYNC_KEY = 'bnb-inventory-last-remote-sync';

const GOOGLE_CLIENT_ID = '619005833964-795a62342hefkqc9t3qv4afmb8clia5e.apps.googleusercontent.com';

const initialItems = [];
const initialPurchases = [];
const initialUsages = [];
const initialDamages = [];
const initialExpenses = [];
const initialManagerNotes = [];

let items = loadItems();
let purchases = loadPurchases();
let usages = loadUsages();
let damages = loadDamages();
let expenses = loadExpenses();
let managerNotes = loadManagerNotes();
let editingItemId = null;
let editingPurchaseId = null;
let editingUsageId = null;
let editingDamageId = null;
let editingExpenseId = null;
let editingManagerNoteId = null;

// DOM Elements
const inventoryList = document.getElementById('inventory-list');
const statsEl = document.getElementById('stats');
const lowStockList = document.getElementById('low-stock-list');
const lowStockCardView = document.getElementById('low-stock-card-view');
const lowStockCountBadge = document.getElementById('low-stock-count-badge');
const filterName = document.getElementById('filter-name');
const filterCategory = document.getElementById('filter-category');
const filterTags = document.getElementById('filter-tags');
const filterSort = document.getElementById('filter-sort');
const yearSelect = document.getElementById('data-year-select');
const monthSelect = document.getElementById('data-month-select');

const form = document.getElementById('item-form');
const formTitle = document.getElementById('form-title');
const formItemNameInput = document.getElementById('item-name-input');
const cancelEditBtn = document.getElementById('cancel-edit');
const submitBtn = document.getElementById('submit-item-btn');
const triggerAddItemBtn = document.getElementById('trigger-add-item-btn');

const purchaseForm = document.getElementById('purchase-form');
const purchaseList = document.getElementById('purchase-list');
const purchaseItemSelect = purchaseForm ? purchaseForm.elements.itemId : null;
const purchaseUnitInput = purchaseForm ? purchaseForm.elements.unit : null;
const purchaseFormTitle = document.getElementById('purchase-form-title');
const cancelPurchaseEditBtn = document.getElementById('cancel-purchase-edit');
const purchaseSubmitBtn = document.getElementById('purchase-submit-btn');
const triggerAddPurchaseBtn = document.getElementById('trigger-add-purchase-btn');

const usageForm = document.getElementById('usage-form');
const usageList = document.getElementById('usage-list');
const usageItemSelect = usageForm ? usageForm.elements.itemId : null;
const usageUnitInput = usageForm ? usageForm.elements.unit : null;
const usageFormTitle = document.getElementById('usage-form-title');
const cancelUsageEditBtn = document.getElementById('cancel-usage-edit');
const usageSubmitBtn = document.getElementById('usage-submit-btn');
const triggerAddUsageBtn = document.getElementById('trigger-add-usage-btn');

const damageForm = document.getElementById('damage-form');
const damageList = document.getElementById('damage-list');
const damageItemSelect = damageForm ? damageForm.elements.itemId : null;
const damageFormTitle = document.getElementById('damage-form-title');
const cancelDamageEditBtn = document.getElementById('cancel-damage-edit');
const damageSubmitBtn = document.getElementById('damage-submit-btn');
const triggerAddDamageBtn = document.getElementById('trigger-add-damage-btn');

const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-list');
const expenseFormTitle = document.getElementById('expense-form-title');
const expenseFormTypeInput = document.getElementById('expense-type');
const cancelExpenseEditBtn = document.getElementById('cancel-expense-edit');
const expenseSubmitBtn = document.getElementById('expense-submit-btn');
const triggerAddExpenseBtn = document.getElementById('trigger-add-expense-btn');

const managerNotesList = document.getElementById('manager-notes-list');
const managerNotesDateFrom = document.getElementById('manager-notes-date-from');
const managerNotesDateTo = document.getElementById('manager-notes-date-to');
const managerNotesStatusFilter = document.getElementById('manager-notes-status-filter');
const managerNotesForm = document.getElementById('manager-notes-form');
const managerNotesFormTitle = document.getElementById('manager-notes-form-title');
const managerNotesFormNotesInput = document.getElementById('manager-note-notes');
const cancelManagerNotesEditBtn = document.getElementById('cancel-manager-notes-edit');
const managerNotesSubmitBtn = document.getElementById('manager-notes-submit-btn');
const triggerAddManagerNotesBtn = document.getElementById('trigger-add-note-btn');


const unitDatalist = document.getElementById('unit-options');
const expenseTypeDatalist = document.getElementById('expense-type-options');
const expenseModeDatalist = document.getElementById('expense-mode-options');
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

// Sync Prompt Modal Elements
const syncPromptModal = document.getElementById('sync-prompt-modal');
const syncPromptTitle = document.getElementById('sync-prompt-title');
const syncPromptMessage = document.getElementById('sync-prompt-message');
const syncPromptConfirmBtn = document.getElementById('sync-prompt-confirm-btn');
const syncPromptCancelBtn = document.getElementById('sync-prompt-cancel-btn');
const closeSyncPromptBtn = document.getElementById('close-sync-prompt-btn');

let sheetConnected = false;
let sheetAccessToken = null;
let sheetAuthState = null;
let lastSheetSync = null;
let activeSyncPrompt = null;

function markLocalUpdate() {
  localStorage.setItem(LAST_LOCAL_UPDATE_KEY, Date.now().toString());
}

function markRemoteSync() {
  const now = Date.now().toString();
  localStorage.setItem(LAST_REMOTE_SYNC_KEY, now);
  localStorage.setItem(LAST_LOCAL_UPDATE_KEY, now);
}

function getLastLocalUpdate() {
  return Number(localStorage.getItem(LAST_LOCAL_UPDATE_KEY) || 0);
}

function getLastRemoteSync() {
  return Number(localStorage.getItem(LAST_REMOTE_SYNC_KEY) || 0);
}

function showSyncPromptModal({ title, message, confirmText = 'Confirm & Sync', cancelText = 'Cancel / Skip', onConfirm, onCancel }) {
  if (!syncPromptModal) return;

  if (syncPromptTitle) syncPromptTitle.textContent = title;
  if (syncPromptMessage) syncPromptMessage.textContent = message;
  if (syncPromptConfirmBtn) syncPromptConfirmBtn.textContent = confirmText;
  if (syncPromptCancelBtn) syncPromptCancelBtn.textContent = cancelText;

  activeSyncPrompt = { onConfirm, onCancel };
  syncPromptModal.classList.remove('hidden');
}

function closeSyncPromptModal() {
  if (syncPromptModal) syncPromptModal.classList.add('hidden');
  activeSyncPrompt = null;
}

if (syncPromptConfirmBtn) {
  syncPromptConfirmBtn.addEventListener('click', async () => {
    const callback = activeSyncPrompt?.onConfirm;
    closeSyncPromptModal();
    if (callback) await callback();
  });
}

if (syncPromptCancelBtn) {
  syncPromptCancelBtn.addEventListener('click', () => {
    const callback = activeSyncPrompt?.onCancel;
    closeSyncPromptModal();
    if (callback) callback();
  });
}

if (closeSyncPromptBtn) {
  closeSyncPromptBtn.addEventListener('click', closeSyncPromptModal);
}

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
    storage: item.storage ?? '',
    tags: item.tags ?? '',
    supplier: item.supplier ?? '',
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
    supplier: purchase.supplier ?? '',
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

function normalizeExpenses(expensesToNormalize) {
  return expensesToNormalize.map((expense) => ({
    ...expense,
    id: Number(expense.id) || Date.now() + Math.floor(Math.random() * 1000),
    date: expense.date || new Date().toISOString().slice(0, 10),
    type: expense.type ? expense.type.toString().trim() : 'Other',
    amount: Number(expense.amount ?? 0),
    notes: expense.notes ?? '',
    modeOfPayment: expense.modeOfPayment ?? '',
    status: expense.status ?? 'Pending',
    tag: expense.tag ?? ''
  }));
}

function normalizeManagerNotes(managerNotesToNormalize) {
  return managerNotesToNormalize.map((note) => {
    const normalizedStatus = note.status ?? 'Pending';
    const statusDetails = getManagerNoteStatusDetails(normalizedStatus, note.statusId);
    return {
      ...note,
      id: Number(note.id) || Date.now() + Math.floor(Math.random() * 1000),
      date: note.date || new Date().toISOString().slice(0, 10),
      notes: note.notes ? note.notes.toString().trim() : '',
      room: note.room ?? '',
      status: statusDetails.status,
      statusId: statusDetails.statusId
    };
  });
}

function getManagerNoteStatusDetails(status, fallbackStatusId = null) {
  const normalizedStatus = (status || 'Pending').toString().trim() || 'Pending';
  const statusMap = {
    Urgent: 1,
    Pending: 2,
    Completed: 3,
    Dismissed: 4
  };

  const resolvedStatus = Object.prototype.hasOwnProperty.call(statusMap, normalizedStatus) ? normalizedStatus : 'Pending';
  return {
    status: resolvedStatus,
    statusId: fallbackStatusId ?? statusMap[resolvedStatus] ?? 5
  };
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

function loadExpenses() {
  const stored = localStorage.getItem(EXPENSES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeExpenses(parsed);
    } catch (e) {
      console.error('Failed to parse saved expenses', e);
    }
  }
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(initialExpenses));
  return normalizeExpenses(initialExpenses);
}

function loadManagerNotes() {
  const stored = localStorage.getItem(MANAGER_NOTES_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeManagerNotes(parsed);
    } catch (e) {
      console.error('Failed to parse saved manager notes', e);
    }
  }
  localStorage.setItem(MANAGER_NOTES_KEY, JSON.stringify(initialManagerNotes));
  return normalizeManagerNotes(initialManagerNotes);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  localStorage.setItem(USAGE_KEY, JSON.stringify(usages));
  localStorage.setItem(DAMAGE_KEY, JSON.stringify(damages));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  localStorage.setItem(MANAGER_NOTES_KEY, JSON.stringify(managerNotes));
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
  const minStock = Number(item.minStock ?? 0);

  if (minStock === 0) {
    return currentStock <= 0 ? 'inactive' : 'in-stock';
  }

  if (currentStock <= 0) return 'out-of-stock';
  if (currentStock <= minStock) return 'low-stock';
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

function updateExpenseDatalists() {
  if (expenseTypeDatalist) {
    const expenseTypes = [...new Set(expenses.map((expense) => expense.type).filter(Boolean))];
    const suggestedTypes = ['Supplies', 'Maintenance', 'Cleaner', 'Electricity Bill', 'Water Bill', 'Internet Bill', 'Association Dues', 'Other'];
    const combinedTypes = [...new Set([...suggestedTypes, ...expenseTypes])];
    expenseTypeDatalist.innerHTML = combinedTypes.map((type) => `<option value="${type}"></option>`).join('');
  }

  if (expenseModeDatalist) {
    const modes = [...new Set(expenses.map((expense) => expense.modeOfPayment).filter(Boolean))];
    const suggestedModes = ['Cash', 'GCash', 'Bank Transfer', 'Credit Card', 'Cheque'];
    const combinedModes = [...new Set([...suggestedModes, ...modes])];
    expenseModeDatalist.innerHTML = combinedModes.map((mode) => `<option value="${mode}"></option>`).join('');
  }
}

function updateSheetStatus(message, connected = sheetConnected) {
  sheetConnected = connected;
  if (sheetStatus) sheetStatus.textContent = message;
  
  if (googleConnectBtn) googleConnectBtn.classList.toggle('hidden', connected);
  if (googleDisconnectBtn) googleDisconnectBtn.classList.toggle('hidden', !connected);

  if (syncStatusBadge && syncStatusText) {
    syncStatusBadge.className = `sync-badge ${connected ? 'online' : 'offline'}`;
    syncStatusText.textContent = connected ? 'Google Sheets: Connected' : 'Google Sheets: Disconnected';
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

function selectTab(selectedTab){
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === selectedTab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  tabPanels.forEach((panel) => {
    const isActive = panel.id === selectedTab;
    panel.classList.toggle('active', isActive);
  });
}

if (statsEl) {
  statsEl.addEventListener('click', (event) => {
    const target = event.target.closest('[data-go-to-tab]');
    if (target) {
      selectTab(target.dataset.goToTab);
      if (target.id === 'stat-card-low-stock' && lowStockCardView) {
        lowStockCardView.open = true;
        lowStockCardView.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  statsEl.addEventListener('keydown', (event) => {
    const target = event.target.closest('[data-go-to-tab]');
    if (!target) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTab(target.dataset.goToTab);
      if (target.id === 'stat-card-low-stock' && lowStockCardView) {
        lowStockCardView.open = true;
        lowStockCardView.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
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
  MasterInventory: ['Category', 'ItemName', 'Unit', 'CurrentStock', 'Minimum', 'ReorderQty', 'Cost', 'Storage', 'Status', 'Tags', 'Supplier', 'Note'],
  Purchases: ['Date', 'ItemName', 'Unit', 'Quantity', 'Cost', 'Supplier', 'Note'],
  Usage: ['Date', 'ItemName', 'Unit', 'Quantity', 'Note', 'Room'],
  Damages: ['Date', 'ItemName', 'Quantity', 'Description', 'Location'],
  Expenses: ['Date', 'Type', 'Amount', 'Notes', 'ModeofPayment', 'Status', 'Tag'],
  ManagersNotes: ['Date', 'Notes', 'Room', 'Status', 'StatusId']
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
    item.supplier,
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

function getExpenseRows() {
  return expenses.map((expense) => [
    expense.date,
    expense.type,
    Number(expense.amount || 0).toFixed(2),
    expense.notes,
    expense.modeOfPayment,
    expense.status,
    expense.tag
  ]);
}

function getManagerNotesRows() {
  return managerNotes.map((note) => [
    note.date,
    note.notes,
    note.room,
    note.status,
    note.statusId ?? (note.status === 'Urgent' ? 1 : note.status === 'Pending' ? 2 : note.status === 'Completed' ? 3 : note.status === 'Dismissed' ? 4 : 5)
  ]);
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

  try {
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

  } catch (error) {
    throw new Error(`Error fetching Google Sheets data: ${error.message}`);
  }
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

async function checkMetadataAndReconnectImport() {
  let isOk = true;

  //TODO: For testing purposes, also for no connection feature
  // let checkingOff = true;
  // if (checkingOff) {
  //   return isOk;
  // }

  try { 
    const metadata = await getSpreadsheetMetadata();
  } catch (error) {
    console.error('Error fetching spreadsheet metadata:', error);
    updateSheetStatus('Google Sheets is disconnected.', false);
    isOk = false;
    showSyncPromptModal({
      title: 'Google Sheet Disconnected',
      message: `Google Sheet is currently disconnected. Reconnect your Google Account to continue. This will also import sheet data to your local inventory.`,
      confirmText: 'Connect & Sync Now',
      onConfirm: async () => {
        await connectGoogleSheets();
      }
    });
  }

  return isOk;
}

async function syncTransactionsToSheet(silent = false , actionDescription = `transaction`) {
  
  if (!canSyncWithSheet()) {
    if (!silent) showToast('Not connected to Google Sheets.', 'error');
    return;
  }

  updateSheetStatus('Syncing data to Google Sheet...', true);

  try {
    metadata = await getSpreadsheetMetadata();
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
      clearSheet('Damages'),
      clearSheet('Expenses'),
      clearSheet('ManagersNotes')
    ]);

    await Promise.all([
      writeSheetRows('Dashboard', getDashboardRows()),
      writeSheetRows('MasterInventory', [SHEET_SPECS.MasterInventory, ...getMasterInventoryRows()]),
      writeSheetRows('Purchases', [SHEET_SPECS.Purchases, ...getPurchaseRows()]),
      writeSheetRows('Usage', [SHEET_SPECS.Usage, ...getUsageRows()]),
      writeSheetRows('Damages', [SHEET_SPECS.Damages, ...getDamageRows()]),
      writeSheetRows('Expenses', [SHEET_SPECS.Expenses, ...getExpenseRows()]),
      writeSheetRows('ManagersNotes', [SHEET_SPECS.ManagersNotes, ...getManagerNotesRows()])
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
  syncTransactionsToSheet(actionDescription = 'update');
}

function hasTransactions(itemId) {
  return purchases.some((p) => p.itemId === itemId)
    || usages.some((u) => u.itemId === itemId)
    || damages.some((d) => d.itemId === itemId);
}

function sortItemsByName(itemsToSort, direction = 'asc') {
  return [...itemsToSort].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    return direction === 'desc' ? -comparison : comparison;
  });
}

function populateDateFilters() {
  if (!yearSelect || !monthSelect) return;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  yearSelect.innerHTML = '';
  monthSelect.innerHTML = '';
  //if expenses is not empty, only populate the year and month and set repopulate 
  // Year and Month that have expensesx
  if (expenses.length > 0) {
    const expenseYears = new Set(expenses.map((expense) => {
      const date = new Date(expense.date);
      return date.getFullYear();
    }));

    expenseYears.forEach((year) => {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    });

    // Populate the month dropdown
    const expenseMonths = new Set(expenses.map((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() + 1; // Months are zero-based
    }));

    expenseMonths.forEach((month) => {
      const option = document.createElement('option');
      option.value = String(month);
      option.textContent = monthNames[month - 1];
      monthSelect.appendChild(option);
    });
  } else {
    for (let year = currentYear - 2; year <= currentYear + 2; year += 1) {
      const option = document.createElement('option');
      option.value = String(year);
      option.textContent = String(year);
      yearSelect.appendChild(option);
    }

    monthNames.forEach((name, index) => {
      const option = document.createElement('option');
      option.value = String(index + 1);
      option.textContent = name;
      monthSelect.appendChild(option);
    });
  }

  yearSelect.value = String(currentYear);
  monthSelect.value = String(currentMonth);
}

function getSelectedYearMonth() {
  const currentDate = new Date();
  const fallbackYear = currentDate.getFullYear();
  const fallbackMonth = currentDate.getMonth() + 1;

  const selectedYear = yearSelect ? Number(yearSelect.value || fallbackYear) : fallbackYear;
  const selectedMonth = monthSelect ? Number(monthSelect.value || fallbackMonth) : fallbackMonth;

  return { year: selectedYear, month: selectedMonth };
}

function matchesSelectedYearMonth(dateValue, year, month) {
  if (typeof dateValue !== 'string') return false;

  const parts = dateValue.split('-');
  if (parts.length !== 3) return false;

  const [dateYear, dateMonth] = parts.map((part) => Number(part));
  return dateYear === year && dateMonth === month;
}

function getFilteredTransactions(transactions) {
  const { year, month } = getSelectedYearMonth();
  return transactions.filter((transaction) => matchesSelectedYearMonth(transaction.date, year, month));
}

function getFilteredItems() {
  const nameTerm = filterName ? filterName.value.trim().toLowerCase() : '';
  const categoryTerm = filterCategory ? filterCategory.value.trim().toLowerCase() : '';
  const tagsTerm = filterTags ? filterTags.value.trim().toLowerCase() : '';
  const sortDirection = filterSort && filterSort.value === 'name-desc' ? 'desc' : 'asc';

  const filteredItems = items.filter((item) => {
    const matchesName = nameTerm === '' || item.name.toLowerCase().includes(nameTerm);
    const matchesCategory = categoryTerm === '' || item.category.toLowerCase().includes(categoryTerm);
    const matchesTags = tagsTerm === '' || item.tags.toLowerCase().includes(tagsTerm);
    return matchesName && matchesCategory && matchesTags;
  });

  return sortItemsByName(filteredItems, sortDirection);
}

/* --- Rendering Views & UI Components --- */
populateDateFilters();

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
  renderExpenses();
  renderManagerNotes();
  updateUnitDatalist();
  updateExpenseDatalists();
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
  //current month's total expenses
  const { year, month } = getSelectedYearMonth();
  const totalExpenseValue = expenses.reduce((sum, expense) => {
    if (!matchesSelectedYearMonth(expense.date, year, month)) {
      return sum;
    }
    return sum + expense.amount;
  }, 0);

  const urgentPendingNotes = managerNotes.filter((note) => {
    const status = note.status.toLowerCase();
    return status === 'urgent' || status === 'pending';
  }).length;


  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon primary">📦</div>
      <div class="stat-info">
        <span class="stat-label">Total Items</span>
        <span class="stat-val">${totalItems}</span>
      </div>
    </div>
    <div class="stat-card" id="stat-card-low-stock" data-go-to-tab="tab-inventory" role="button" tabindex="0" title="Open Inventory">
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
    <div class="stat-card" data-go-to-tab="tab-expenses" role="button" tabindex="0" title="Open Expenses Tab">
      <div class="stat-icon info">💸</div>
      <div class="stat-info">
        <span class="stat-label">This Month's Expenses</span>
        <span class="stat-val">₱${totalExpenseValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
    </div>
    <div class="stat-card" data-go-to-tab="tab-managers-notes" role="button" tabindex="0" title="Open Manager's Notes">
      <div class="stat-icon warning">📝</div>
      <div class="stat-info">
        <span class="stat-label">Urgent/Pending Notes</span>
        <span class="stat-val">${urgentPendingNotes}</span>
      </div>
    </div>
  `;
}

function resetForm() {
  if (!form) return;
  form.reset();
  editingItemId = null;
  formTitle.textContent = 'Add Inventory Item';
  submitBtn.textContent = 'Save item';
  cancelEditBtn.classList.add('hidden');
}

function resetPurchaseForm() {
  if (!purchaseForm) return;
  purchaseForm.reset();
  editingPurchaseId = null;
  if (purchaseFormTitle) purchaseFormTitle.textContent = 'Record Purchase';
  if (purchaseSubmitBtn) purchaseSubmitBtn.textContent = 'Record Purchase';
  if (cancelPurchaseEditBtn) cancelPurchaseEditBtn.classList.add('hidden');
  purchaseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    purchaseItemSelect.value = items[0].id;
    if (purchaseUnitInput) purchaseUnitInput.value = items[0].unit;
  }
  purchaseItemSelect.focus();
}

function resetUsageForm() {
  if (!usageForm) return;
  usageForm.reset();
  editingUsageId = null;
  if (usageFormTitle) usageFormTitle.textContent = 'Record Usage';
  if (usageSubmitBtn) usageSubmitBtn.textContent = 'Record Usage';
  if (cancelUsageEditBtn) cancelUsageEditBtn.classList.add('hidden');
  usageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    usageItemSelect.value = items[0].id;
    if (usageUnitInput) usageUnitInput.value = items[0].unit;
  }
  usageItemSelect.focus();
}

function resetDamageForm() {
  if (!damageForm) return;
  damageForm.reset();
  editingDamageId = null;
  if (damageFormTitle) damageFormTitle.textContent = 'Record Damage';
  if (damageSubmitBtn) damageSubmitBtn.textContent = 'Record Damage';
  if (cancelDamageEditBtn) cancelDamageEditBtn.classList.add('hidden');
  damageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  if (items.length > 0) {
    damageItemSelect.value = items[0].id;
    damageForm.elements.location.value = items[0].storage;
  }
  damageItemSelect.focus();
}

function resetExpenseForm() {
  if (!expenseForm) return;
  expenseForm.reset();
  editingExpenseId = null;
  if (expenseFormTitle) expenseFormTitle.textContent = 'Log Expense';
  if (expenseSubmitBtn) expenseSubmitBtn.textContent = 'Save Expense';
  if (cancelExpenseEditBtn) cancelExpenseEditBtn.classList.add('hidden');
  expenseForm.elements.date.value = new Date().toISOString().slice(0, 10);
  expenseForm.elements.status.value = 'Pending';
  expenseForm.elements.amount.value = '0.00';
  expenseFormTypeInput.focus();
}

function resetManagerNotesForm() {
  if (!managerNotesForm) return;
  managerNotesForm.reset();
  editingManagerNoteId = null;
  if (managerNotesFormTitle) managerNotesFormTitle.textContent = 'Add Manager Note';
  if (managerNotesSubmitBtn) managerNotesSubmitBtn.textContent = 'Save Note';
  if (cancelManagerNotesEditBtn) cancelManagerNotesEditBtn.classList.add('hidden');
  managerNotesForm.elements.date.value = new Date().toISOString().slice(0, 10);
  managerNotesForm.elements.status.value = 'Pending';
  managerNotesFormNotesInput.focus();
}

function populatePurchaseForm(purchase) {
  if (!purchaseForm) return;
  editingPurchaseId = purchase.id;
  if (purchaseFormTitle) purchaseFormTitle.textContent = 'Edit Purchase';
  if (purchaseSubmitBtn) purchaseSubmitBtn.textContent = 'Update Purchase';
  if (cancelPurchaseEditBtn) cancelPurchaseEditBtn.classList.remove('hidden');

  purchaseForm.elements.date.value = purchase.date;
  purchaseForm.elements.itemId.value = purchase.itemId;
  purchaseForm.elements.unit.value = purchase.unit;
  purchaseForm.elements.quantity.value = purchase.quantity;
  purchaseForm.elements.cost.value = purchase.cost;
  purchaseForm.elements.supplier.value = purchase.supplier;
  purchaseForm.elements.note.value = purchase.note;
  purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function populateUsageForm(usage) {
  if (!usageForm) return;
  editingUsageId = usage.id;
  if (usageFormTitle) usageFormTitle.textContent = 'Edit Usage';
  if (usageSubmitBtn) usageSubmitBtn.textContent = 'Update Usage';
  if (cancelUsageEditBtn) cancelUsageEditBtn.classList.remove('hidden');

  usageForm.elements.date.value = usage.date;
  usageForm.elements.itemId.value = usage.itemId;
  usageForm.elements.unit.value = usage.unit;
  usageForm.elements.quantity.value = usage.quantity;
  usageForm.elements.room.value = usage.room;
  usageForm.elements.note.value = usage.note;
  usageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function populateDamageForm(damage) {
  if (!damageForm) return;
  editingDamageId = damage.id;
  if (damageFormTitle) damageFormTitle.textContent = 'Edit Damage';
  if (damageSubmitBtn) damageSubmitBtn.textContent = 'Update Damage';
  if (cancelDamageEditBtn) cancelDamageEditBtn.classList.remove('hidden');

  damageForm.elements.date.value = damage.date;
  damageForm.elements.itemId.value = damage.itemId;
  damageForm.elements.quantity.value = damage.quantity;
  damageForm.elements.location.value = damage.location;
  damageForm.elements.description.value = damage.description;
  damageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function populateExpenseForm(expense) {
  if (!expenseForm) return;
  editingExpenseId = expense.id;
  if (expenseFormTitle) expenseFormTitle.textContent = 'Edit Expense';
  if (expenseSubmitBtn) expenseSubmitBtn.textContent = 'Update Expense';
  if (cancelExpenseEditBtn) cancelExpenseEditBtn.classList.remove('hidden');

  expenseForm.elements.date.value = expense.date;
  expenseForm.elements.type.value = expense.type;
  expenseForm.elements.amount.value = expense.amount;
  expenseForm.elements.status.value = expense.status || 'Pending';
  expenseForm.elements.modeOfPayment.value = expense.modeOfPayment || '';
  expenseForm.elements.tag.value = expense.tag || '';
  expenseForm.elements.notes.value = expense.notes || '';
  expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function populateManagerNotesForm(note) {
  if (!managerNotesForm) return;
  editingManagerNoteId = note.id;
  if (managerNotesFormTitle) managerNotesFormTitle.textContent = 'Edit Manager Note';
  if (managerNotesSubmitBtn) managerNotesSubmitBtn.textContent = 'Update Note';
  if (cancelManagerNotesEditBtn) cancelManagerNotesEditBtn.classList.remove('hidden');

  managerNotesForm.elements.date.value = note.date;
  managerNotesForm.elements.notes.value = note.notes;
  managerNotesForm.elements.room.value = note.room || '';
  managerNotesForm.elements.status.value = note.status || 'Pending';
  managerNotesForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  form.elements.supplier.value = item.supplier;
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
    if (status === 'inactive') badgeText = 'Inactive';

    card.dataset.itemId = item.id;
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

      ${item.supplier ? `<p class="card-notes">Supplier: ${item.supplier}</p>` : ''}

      <div class="card-actions">
        <button type="button" class="btn btn-secondary btn-sm" data-action="edit" data-id="${item.id}">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="delete" data-id="${item.id}" ${hasTransactions(item.id) ? "disabled title='Cannot delete item with transaction history'" : ''}>Delete</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="purchase" data-id="${item.id}">Purchase</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="usage" data-id="${item.id}">Use</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="damage" data-id="${item.id}">Damage</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });
}

function renderPurchaseItems() {
  if (!purchaseItemSelect) return;
  const selectedValue = purchaseItemSelect.value;
  const sortedItems = sortItemsByName(items);
  purchaseItemSelect.innerHTML = sortedItems.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

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
  const sortedItems = sortItemsByName(items);
  usageItemSelect.innerHTML = sortedItems.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

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
  const sortedItems = sortItemsByName(items);
  damageItemSelect.innerHTML = sortedItems.map((item) => `<option value="${item.id}">${item.name} (${getCurrentStock(item)} ${item.unit})</option>`).join('');

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
    li.dataset.itemId = item.id;
    li.tabIndex = 0;
    li.role = 'button';
    li.className = 'low-stock-item';
    li.innerHTML = `
      <strong>${item.name}</strong>
      <span>${currentStock} ${item.unit} left (min ${item.minStock})</span>
    `;
    lowStockList.appendChild(li);
  });
}

function findInventoryCardByItemId(itemId) {
  if (!inventoryList) return null;
  return inventoryList.querySelector(`.inventory-card[data-item-id="${itemId}"]`);
}

function scrollToInventoryCard(itemId) {
  const card = findInventoryCardByItemId(itemId);
  if (!card) return false;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('highlighted');
  window.setTimeout(() => card.classList.remove('highlighted'), 1800);
  return true;
}

function renderPurchases() {
  if (!purchaseList) return;
  purchaseList.innerHTML = '';

  const filteredPurchases = getFilteredTransactions(purchases);

  if (filteredPurchases.length === 0) {
    purchaseList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No purchase records logged yet for the selected period.</p>';
    return;
  }

  filteredPurchases
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((p) => {
      const item = items.find((e) => e.id === p.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge in-stock date">📅 ${p.date}</span>
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
        
        ${p.supplier ? `<p class="card-notes"> Supplier: ${p.supplier}</p>` : ''}

        ${p.note ? `<p class="card-notes">Note: ${p.note}</p>` : ''}

        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="edit-purchase" data-id="${p.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-purchase" data-id="${p.id}">Delete Record</button>
        </div>
      `;

      purchaseList.appendChild(card);
    });
}

function renderUsages() {
  if (!usageList) return;
  usageList.innerHTML = '';

  const filteredUsages = getFilteredTransactions(usages);

  if (filteredUsages.length === 0) {
    usageList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No usage records logged yet for the selected period.</p>';
    return;
  }

  filteredUsages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((u) => {
      const item = items.find((e) => e.id === u.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge out-of-stock date">📅 ${u.date}</span>
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
          <button type="button" class="btn btn-secondary btn-sm" data-action="edit-usage" data-id="${u.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-usage" data-id="${u.id}">Delete Record</button>
        </div>
      `;

      usageList.appendChild(card);
    });
}

function renderDamages() {
  if (!damageList) return;
  damageList.innerHTML = '';

  const filteredDamages = getFilteredTransactions(damages);

  if (filteredDamages.length === 0) {
    damageList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No damage records logged yet for the selected period.</p>';
    return;
  }

  filteredDamages
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((d) => {
      const item = items.find((e) => e.id === d.itemId);
      const card = document.createElement('article');
      card.className = 'transaction-card';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${item ? item.name : 'Unknown Item'}</h3>
          <span class="badge low-stock date">📅 ${d.date}</span>
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
          <button type="button" class="btn btn-secondary btn-sm" data-action="edit-damage" data-id="${d.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-damage" data-id="${d.id}">Delete Record</button>
        </div>
      `;

      damageList.appendChild(card);
    });
}

function renderExpenses() {
  if (!expenseList) return;
  expenseList.innerHTML = '';

  const filteredExpenses = getFilteredTransactions(expenses);

  if (filteredExpenses.length === 0) {
    expenseList.innerHTML = '<p class="text-muted" style="grid-column: 1/-1;">No expense records logged yet for the selected period.</p>';
    return;
  }

  filteredExpenses
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach((expense) => {
      const card = document.createElement('article');
      card.className = 'transaction-card';
      const statusClass = expense.status === 'Paid' ? 'paid' : 'pending';

      card.innerHTML = `
        <div class="card-top">
          <h3 class="card-title">${expense.type || 'Other'}</h3>
          <span class="badge ${statusClass}">${expense.status || 'Pending'}</span>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Amount</span>
            <span class="meta-value">₱${Number(expense.amount || 0).toFixed(2)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Date</span>
            <span class="meta-value">${expense.date}</span>
          </div>
          <div class="meta-item" style="grid-column: 1/-1;">
            <span class="meta-label">Payment Mode</span>
            <span class="meta-value">${expense.modeOfPayment || 'Not set'}</span>
          </div>
        </div>

        ${expense.tag ? `<p class="card-notes">Tag: ${expense.tag}</p>` : ''}
        ${expense.notes ? `<p class="card-notes">${expense.notes}</p>` : ''}

        <div class="card-actions">
          <button type="button" class="btn btn-secondary btn-sm" data-action="edit-expense" data-id="${expense.id}">Edit</button>
          <button type="button" class="btn btn-secondary btn-sm" data-action="delete-expense" data-id="${expense.id}">Delete</button>
        </div>
      `;

      expenseList.appendChild(card);
    });
}

function getFilteredManagerNotes() {
  const fromDate = managerNotesDateFrom ? managerNotesDateFrom.value : '';
  const toDate = managerNotesDateTo ? managerNotesDateTo.value : '';
  const statusFilter = managerNotesStatusFilter ? managerNotesStatusFilter.value : 'all';

  return managerNotes
    .filter((note) => {
      const matchesDateFrom = !fromDate || note.date >= fromDate;
      const matchesDateTo = !toDate || note.date <= toDate;
      const matchesStatus = statusFilter === 'all' || (note.status || 'Pending').toLowerCase() === statusFilter.toLowerCase();
      return matchesDateFrom && matchesDateTo && matchesStatus;
    })
    .sort((a, b) => {
      if (a.statusId !== b.statusId) {
        return a.statusId - b.statusId;
      }
      return b.date.localeCompare(a.date);
    });
}

function renderManagerNotes() {
  if (!managerNotesList) return;
  managerNotesList.innerHTML = '';

  const filteredNotes = getFilteredManagerNotes();

  if (filteredNotes.length === 0) {
    const activeFilterText = (managerNotesDateFrom && managerNotesDateFrom.value) || (managerNotesDateTo && managerNotesDateTo.value) || (managerNotesStatusFilter && managerNotesStatusFilter.value !== 'all')
      ? 'No manager notes match the selected filters.'
      : 'No manager notes logged yet.';

    managerNotesList.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">${activeFilterText}</p>`;
    return;
  }

  filteredNotes.forEach((note) => {
    const card = document.createElement('article');
    card.className = 'transaction-card';
    const statusClass = note.status === 'Urgent' ? 'warning' : note.status === 'Completed' ? 'paid' : note.status === 'Dismissed' ? 'dismissed' : 'pending';

    card.innerHTML = `
      <div class="card-top">
        <h3 class="card-title">${note.notes || 'Manager note'}</h3>
        <span class="badge ${statusClass}">${note.status || 'Pending'}</span>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Date</span>
          <span class="meta-value">${note.date}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Room</span>
          <span class="meta-value">${note.room || 'General'}</span>
        </div>
      </div>

      <div class="card-actions">
        ${['Urgent', 'Pending', 'Dismissed', 'Completed']
          .filter((status) => status !== (note.status || 'Pending'))
          .map((status) => {
            const statusClass = status.toLowerCase();
            return `<button type="button" class="btn btn-secondary btn-sm btn-status-${statusClass}" data-action="set-manager-note-status" data-id="${note.id}" data-status="${status}">${status}</button>`;
          })
          .join('')}
        <button type="button" class="btn btn-secondary btn-sm" data-action="edit-manager-note" data-id="${note.id}">Edit</button>
        <button type="button" class="btn btn-secondary btn-sm" data-action="delete-manager-note" data-id="${note.id}">Delete</button>
      </div>
    `;

    managerNotesList.appendChild(card);
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
    supplier: formData.get('supplier').toString().trim(),
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
  scheduleSheetSync(actionDescription = 'master item save');
});

if (cancelEditBtn) {
  cancelEditBtn.addEventListener('click', resetForm);
}

if (cancelPurchaseEditBtn) {
  cancelPurchaseEditBtn.addEventListener('click', resetPurchaseForm);
}

if (cancelUsageEditBtn) {
  cancelUsageEditBtn.addEventListener('click', resetUsageForm);
}

if (cancelDamageEditBtn) {
  cancelDamageEditBtn.addEventListener('click', resetDamageForm);
}

if (cancelExpenseEditBtn) {
  cancelExpenseEditBtn.addEventListener('click', resetExpenseForm);
}

if (cancelManagerNotesEditBtn) {
  cancelManagerNotesEditBtn.addEventListener('click', resetManagerNotesForm);
}

if (triggerAddItemBtn) {
  triggerAddItemBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetForm();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    formItemNameInput.focus();
  });
}

if (triggerAddPurchaseBtn) {
  triggerAddPurchaseBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetPurchaseForm();
    purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (triggerAddUsageBtn) {
  triggerAddUsageBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetUsageForm();
    usageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (triggerAddDamageBtn) {
  triggerAddDamageBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetDamageForm();
    damageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (triggerAddExpenseBtn) {
  triggerAddExpenseBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetExpenseForm();
    expenseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (triggerAddManagerNotesBtn) {
  triggerAddManagerNotesBtn.addEventListener('click', () => {
    if (!checkMetadataAndReconnectImport()) {
      return;
    }
    resetManagerNotesForm();
    managerNotesForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
  if (!checkMetadataAndReconnectImport()) {
    return;
  }

  const formData = new FormData(purchaseForm);
  const purchasePayload = {
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    unit: formData.get('unit').toString().trim().toLowerCase(),
    quantity: Number(formData.get('quantity')),
    cost: Number(formData.get('cost')),
    supplier: formData.get('supplier').toString().trim(),
    note: formData.get('note').toString().trim()
  };

  if (editingPurchaseId !== null) {
    purchases = purchases.map((purchase) => purchase.id === editingPurchaseId ? { ...purchase, ...purchasePayload } : purchase);
    showToast('Purchase transaction updated successfully', 'success');
  } else {
    purchases.unshift({ id: Date.now(), ...purchasePayload });
    showToast('Purchase transaction recorded successfully', 'success');
  }

  saveState();
  render();
  resetPurchaseForm();
  scheduleSheetSync(actionDescription = 'purchase transaction');
});

usageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!checkMetadataAndReconnectImport()) {
    return;
  }

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

  const usagePayload = {
    date: formData.get('date').toString(),
    itemId,
    unit: formData.get('unit').toString().trim().toLowerCase(),
    quantity,
    room: formData.get('room').toString().trim(),
    note: formData.get('note').toString().trim()
  };

  if (editingUsageId !== null) {
    usages = usages.map((usage) => usage.id === editingUsageId ? { ...usage, ...usagePayload } : usage);
    showToast('Usage record updated successfully', 'success');
  } else {
    usages.unshift({ id: Date.now(), ...usagePayload });
    showToast('Usage record added successfully', 'success');
  }

  saveState();
  render();
  resetUsageForm();
  syncTransactionsToSheet(actionDescription = 'usage transaction');
});

damageForm.addEventListener('submit', (event) => { 
  event.preventDefault();
  if (!checkMetadataAndReconnectImport()) {
    return;
  }

  const formData = new FormData(damageForm);
  const damagePayload = {
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    quantity: Number(formData.get('quantity')),
    location: formData.get('location').toString().trim(),
    description: formData.get('description').toString().trim()
  };

  if (editingDamageId !== null) {
    damages = damages.map((damage) => damage.id === editingDamageId ? { ...damage, ...damagePayload } : damage);
    showToast('Damage record updated successfully', 'success');
  } else {
    damages.unshift({ id: Date.now(), ...damagePayload });
    showToast('Damage record added successfully', 'success');
  }

  saveState();
  render();
  resetDamageForm();
  syncTransactionsToSheet(actionDescription = 'damage transaction');
});

expenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!checkMetadataAndReconnectImport()) {
    return;
  }

  const formData = new FormData(expenseForm);
  const expensePayload = {
    date: formData.get('date').toString(),
    type: formData.get('type').toString().trim() || 'Other',
    amount: Number(formData.get('amount')),
    notes: formData.get('notes').toString().trim(),
    modeOfPayment: formData.get('modeOfPayment').toString().trim(),
    status: formData.get('status').toString().trim() || 'Pending',
    tag: formData.get('tag').toString().trim()
  };

  if (editingExpenseId !== null) {
    expenses = expenses.map((expense) => expense.id === editingExpenseId ? { ...expense, ...expensePayload } : expense);
    showToast('Expense updated successfully', 'success');
  } else {
    expenses.unshift({ id: Date.now(), ...expensePayload });
    showToast('Expense saved successfully', 'success');
  }

  saveState();
  render();
  resetExpenseForm();
  syncTransactionsToSheet(actionDescription = 'expense transaction');
});

if (managerNotesForm) {
  managerNotesForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    const formData = new FormData(managerNotesForm);
    const statusDetails = getManagerNoteStatusDetails(formData.get('status').toString().trim() || 'Pending');
    const notePayload = {
      date: formData.get('date').toString(),
      notes: formData.get('notes').toString().trim(),
      room: formData.get('room').toString().trim(),
      status: statusDetails.status,
      statusId: statusDetails.statusId
    };

    if (editingManagerNoteId !== null) {
      managerNotes = managerNotes.map((note) => note.id === editingManagerNoteId ? { ...note, ...notePayload } : note);
      showToast('Manager note updated successfully', 'success');
    } else {
      managerNotes.unshift({ id: Date.now(), ...notePayload });
      showToast('Manager note saved successfully', 'success');
    }

    saveState();
    render();
    resetManagerNotesForm();
    syncTransactionsToSheet(actionDescription = 'manager note');
  });
}

if (filterName) filterName.addEventListener('input', render);
if (filterCategory) filterCategory.addEventListener('input', render);
if (filterTags) filterTags.addEventListener('input', render);
if (filterSort) filterSort.addEventListener('change', render);
if (yearSelect) yearSelect.addEventListener('change', render);
if (monthSelect) monthSelect.addEventListener('change', render);

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
    const expenseRows = await readSheetValues('Expenses');
    const managerNotesRows = await readSheetValues('ManagersNotes');

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
      supplier: row[10] || '',
      notes: row[11] || ''
    }));

    const importedItemMap = new Map(importedItems.map((item) => [item.name.toLowerCase(), item]));
    const importedPurchases = purchaseRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 10000,
      date: row[0] || '',
      itemId: importedItemMap.get((row[1] || '').toString().trim().toLowerCase())?.id || 0,
      unit: (row[2] || '').toString().trim().toLowerCase(),
      quantity: Number(row[3] || 0),
      cost: Number(row[4] || 0),
      supplier: row[5] || '',
      note: row[6] || ''
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

    const importedExpenses = expenseRows.slice(1).map((row, index) => ({
      id: Date.now() + index + 40000,
      date: row[0] || '',
      type: row[1] || 'Other',
      amount: Number(row[2] || 0),
      notes: row[3] || '',
      modeOfPayment: row[4] || '',
      status: row[5] || 'Pending',
      tag: row[6] || ''
    }));

    const importedManagerNotes = managerNotesRows.slice(1).map((row, index) => {
      const status = row[3] || 'Pending';
      const statusIdValue = row[4] ?? (status === 'Urgent' ? 1 : status === 'Pending' ? 2 : status === 'Completed' ? 3 : status === 'Dismissed' ? 4 : 5);
      return {
        id: Date.now() + index + 50000,
        date: row[0] || '',
        notes: row[1] || '',
        room: row[2] || '',
        status,
        statusId: statusIdValue
      };
    });

    items = importedItems;
    purchases = importedPurchases;
    usages = importedUsages;
    damages = importedDamages;
    expenses = importedExpenses;
    managerNotes = importedManagerNotes;

    saveState();
    render();
    resetForm();
    resetPurchaseForm();
    resetUsageForm();
    resetDamageForm();
    resetManagerNotesForm();
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

  if (!checkMetadataAndReconnectImport()) {
    return;
  }

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
    syncTransactionsToSheet(actionDescription = 'item deletion');
    return;
  }

  if (action === 'purchase') {
    const itemToPurchase = items.find((item) => item.id === itemId);
    if (itemToPurchase) {
      resetPurchaseForm();
      purchaseForm.elements.itemId.value = itemToPurchase.id;
      purchaseForm.elements.unit.value = itemToPurchase.unit;
      purchaseForm.elements.cost.value = itemToPurchase.price || 0;
      purchaseForm.elements.quantity.value = itemToPurchase.reorderQty || 1;
      purchaseForm.elements.supplier.value = itemToPurchase.supplier || '';

      selectTab('tab-purchases');
      purchaseForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (action === 'usage') {
    const itemToUse = items.find((item) => item.id === itemId);
    if (itemToUse) {
      resetUsageForm();
      usageForm.elements.itemId.value = itemToUse.id;
      usageForm.elements.unit.value = itemToUse.unit;

      selectTab('tab-usage');
      usageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  if (action === 'damage') {
    const itemToDamage = items.find((item) => item.id === itemId);
    if (itemToDamage) {
      resetDamageForm();
      damageForm.elements.itemId.value = itemToDamage.id;
      damageForm.elements.location.value = itemToDamage.storage;

      selectTab('tab-damage');
      damageForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
});

if (lowStockList) {
  lowStockList.addEventListener('click', (event) => {
    const target = event.target.closest('li[data-item-id]');
    if (!target) return;

    const itemId = Number(target.dataset.itemId);
    selectTab('tab-inventory');
    if (lowStockCardView) {
      lowStockCardView.open = true;
      lowStockCardView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    scrollToInventoryCard(itemId);
  });

  lowStockList.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target.closest('li[data-item-id]');
    if (!target) return;

    event.preventDefault();
    const itemId = Number(target.dataset.itemId);
    selectTab('tab-inventory');
    if (lowStockCardView) {
      lowStockCardView.open = true;
      lowStockCardView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    scrollToInventoryCard(itemId);
  });
}

if (purchaseList) {
  purchaseList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    if (!target) return;

    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    const purchaseId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'edit-purchase') {
      const purchaseToEdit = purchases.find((p) => p.id === purchaseId);
      if (purchaseToEdit) populatePurchaseForm(purchaseToEdit);
      return;
    }

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
    syncTransactionsToSheet(actionDescription = 'purchase deletion');
  });
}

if (usageList) {
  usageList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    
    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    if (!target) return;
    const usageId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'edit-usage') {
      const usageToEdit = usages.find((u) => u.id === usageId);
      if (usageToEdit) populateUsageForm(usageToEdit);
      return;
    }

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
    syncTransactionsToSheet(actionDescription = 'usage deletion');
  });
}

if (damageList) {
  damageList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');
    
    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    if (!target) return;    
    const damageId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'edit-damage') {
      const damageToEdit = damages.find((d) => d.id === damageId);
      if (damageToEdit) populateDamageForm(damageToEdit);
      return;
    }

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
    syncTransactionsToSheet(actionDescription = 'damage deletion');
  });
}

if (expenseList) {
  expenseList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');

    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    if (!target) return;
    const expenseId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'edit-expense') {
      const expenseToEdit = expenses.find((expense) => expense.id === expenseId);
      if (expenseToEdit) populateExpenseForm(expenseToEdit);
      return;
    }

    const expenseToDelete = expenses.find((expense) => expense.id === expenseId);
    if (!expenseToDelete) return;

    const confirmed = window.confirm(`Delete expense record for "${expenseToDelete.type}"?`);
    if (!confirmed) return;

    expenses = expenses.filter((expense) => expense.id !== expenseId);
    saveState();
    render();
    showToast(`Deleted expense record for "${expenseToDelete.type}"`, 'info');
    syncTransactionsToSheet(actionDescription = 'expense deletion');
  });
}

if (managerNotesList) {
  managerNotesList.addEventListener('click', (event) => {
    const target = event.target.closest('button[data-action]');

    if (!checkMetadataAndReconnectImport()) {
      return;
    }

    if (!target) return;
    const noteId = Number(target.dataset.id);
    const action = target.dataset.action;

    if (action === 'set-manager-note-status') {
      const nextStatus = target.dataset.status;
      const noteToUpdate = managerNotes.find((note) => note.id === noteId);
      if (noteToUpdate) {
        const statusDetails = getManagerNoteStatusDetails(nextStatus);
        managerNotes = managerNotes.map((note) => note.id === noteId ? { ...note, ...statusDetails } : note);
        saveState();
        render();
        showToast(`Status changed to ${statusDetails.status}`, 'success');
        syncTransactionsToSheet(actionDescription = 'manager note status change');
      }
      return;
    }

    if (action === 'edit-manager-note') {
      const noteToEdit = managerNotes.find((note) => note.id === noteId);
      if (noteToEdit) populateManagerNotesForm(noteToEdit);
      return;
    }

    const noteToDelete = managerNotes.find((note) => note.id === noteId);
    if (!noteToDelete) return;

    const confirmed = window.confirm('Delete this manager note?');
    if (!confirmed) return;

    managerNotes = managerNotes.filter((note) => note.id !== noteId);
    saveState();
    render();
    showToast('Manager note deleted successfully', 'info');
    syncTransactionsToSheet(actionDescription = 'manager note deletion');
  });
}

if (managerNotesDateFrom) {
  managerNotesDateFrom.addEventListener('change', renderManagerNotes);
  managerNotesDateFrom.addEventListener('input', renderManagerNotes);
}

if (managerNotesDateTo) {
  managerNotesDateTo.addEventListener('change', renderManagerNotes);
  managerNotesDateTo.addEventListener('input', renderManagerNotes);
}

if (managerNotesStatusFilter) {
  managerNotesStatusFilter.addEventListener('change', renderManagerNotes);
}

function handleRouting() {
    const path = window.location.pathname;
    const homeSection = document.getElementById('main-content');
    const privacySection = document.getElementById('privacy-content');

    if (path === '#privacy' || path === '/privacy/') {
      console.log('Privacy policy route detected');
    } else {
      console.log(path);
      console.log('Privacy policy route not detected, defaulting to home');
    }

    return true;
}

/* --- Initialization --- */
setupTabs();
setupSyncModal();
resetForm();
resetPurchaseForm();
resetUsageForm();
resetDamageForm();
resetExpenseForm();
resetManagerNotesForm();
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
      checkMetadataAndReconnectImport();
      persistSheetSettings();
    }
  } else if (savedSettings.sheetId) {
    updateSheetStatus('Google Sheet ID set. Connect to sync.', false);
  }
}

window.addEventListener('load', async () => {
  console.log('Window loaded. Initializing app...');
  if (handleRouting()){
    handleGoogleOAuthRedirect();
  }

  await initializeGoogleSync();
});

// Select elements
const anchor = document.getElementById('top-anchor');
const button = document.getElementById('floating-btn');

// Create the observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // isIntersecting is true when the top anchor is visible
    if (entry.isIntersecting) {
      button.classList.add('hidden-btn');
    } else {
      button.classList.remove('hidden-btn');
    }
  });
}, {
  root: null, // defaults to the browser viewport
  threshold: 0 // triggers as soon as even 1 pixel changes
});

// Start observing the top anchor
observer.observe(anchor);

// Optional: Scroll to top functionality
button.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
