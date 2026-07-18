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

function normalizeItems(itemsToNormalize) {
  return itemsToNormalize.map((item) => ({
    ...item,
    openingStock: Number(item.openingStock ?? item.quantity ?? 0),
    price: Number(item.price ?? 0),
    minStock: Number(item.minStock ?? 0),
    reorderQty: Number(item.reorderQty ?? 0),
    category: item.category ?? 'General',
    unit: item.unit ?? 'units',
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

function render() {
  renderStats();
  renderInventory();
  renderPurchaseItems();
  renderUsageItems();
  renderDamageItems();
  renderUsages();
  renderDamages();
  renderPurchases();
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
}

function resetUsageForm() {
  usageForm.reset();
  usageForm.elements.date.value = new Date().toISOString().slice(0, 10);
  usageItemSelect.value = items.length > 0 ? items[0].id : '';
  const selectedItem = items[0];
  usageUnitInput.value = selectedItem ? selectedItem.unit : '';
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

  if (items.length === 0) {
    inventoryList.innerHTML = '<p>No inventory items added yet.</p>';
    return;
  }

  items.forEach((item) => {
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
        <button class="small-btn" data-action="delete" data-id="${item.id}">Delete</button>
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
    unit: formData.get('unit').toString().trim(),
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
    unit: formData.get('unit').toString().trim(),
    quantity: Number(formData.get('quantity')),
    cost: Number(formData.get('cost')),
    note: formData.get('note').toString().trim()
  };

  purchases.unshift(purchase);
  saveState();
  render();
  resetPurchaseForm();
});

usageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(usageForm);
  const usage = {
    id: Date.now(),
    date: formData.get('date').toString(),
    itemId: Number(formData.get('itemId')),
    unit: formData.get('unit').toString().trim(),
    quantity: Number(formData.get('quantity')),
    room: formData.get('room').toString().trim(),
    note: formData.get('note').toString().trim()
  };

  usages.unshift(usage);
  saveState();
  render();
  resetUsageForm();
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
    const confirmed = window.confirm(`Delete ${itemToDelete.name}? This will also remove its purchase, usage, and damage history.`);
    if (!confirmed) return;

    items = items.filter((item) => item.id !== itemId);
    purchases = purchases.filter((purchase) => purchase.itemId !== itemId);
    usages = usages.filter((usage) => usage.itemId !== itemId);
    damages = damages.filter((damage) => damage.itemId !== itemId);
    saveState();
    render();
    return;
  }
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
});

resetBtn.addEventListener('click', () => {
  items = initialItems.map((item) => ({ ...item }));
  purchases = initialPurchases.map((purchase) => ({ ...purchase }));
  usages = initialUsages.map((usage) => ({ ...usage }));
  damages = initialDamages.map((damage) => ({ ...damage }));
  saveState();
  render();
  resetForm();
  resetPurchaseForm();
  resetUsageForm();
  resetDamageForm();
});

resetForm();
resetPurchaseForm();
render();
