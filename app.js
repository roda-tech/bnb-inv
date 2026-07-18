const STORAGE_KEY = 'bnb-inventory-manager';

const initialItems = [
  { id: 1, name: 'Bed sheets', category: 'Linen', quantity: 24, price: 18.5, minStock: 12, unit: 'sets', location: '1801-1804', notes: 'Keep 2 extra sets for turn-over' },
  { id: 2, name: 'Detergent', category: 'Cleaning', quantity: 6, price: 7.25, minStock: 4, unit: 'bottles', location: 'Housekeeping closet', notes: 'Order before weekend check-ins' },
  { id: 3, name: 'Toilet paper', category: 'Restroom', quantity: 3, price: 1.8, minStock: 6, unit: 'rolls', location: '1802', notes: 'High use item' },
  { id: 4, name: 'Hand soap', category: 'Restroom', quantity: 8, price: 3.4, minStock: 4, unit: 'bottles', location: '1803', notes: 'Refill during room prep' }
];

let items = loadItems();
let editingItemId = null;

const inventoryList = document.getElementById('inventory-list');
const statsEl = document.getElementById('stats');
const form = document.getElementById('item-form');
const resetBtn = document.getElementById('reset-data');
const formTitle = document.getElementById('form-title');
const cancelEditBtn = document.getElementById('cancel-edit');
const submitBtn = form.querySelector('button[type="submit"]');

function normalizeItems(itemsToNormalize) {
  return itemsToNormalize.map((item) => ({
    ...item,
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
    minStock: Number(item.minStock ?? 0),
    category: item.category ?? 'General',
    unit: item.unit ?? 'units',
    location: item.location ?? 'Unassigned',
    notes: item.notes ?? ''
  }));
}

function loadItems() {
  const migrationKey = `${STORAGE_KEY}-migrated`;
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!localStorage.getItem(migrationKey) && stored) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(migrationKey, 'true');
    return normalizeItems(initialItems);
  }

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

  localStorage.setItem(migrationKey, 'true');
  return normalizeItems(initialItems);
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getStatus(item) {
  if (item.quantity === 0) return 'out-of-stock';
  if (item.quantity <= item.minStock) return 'low-stock';
  return 'in-stock';
}

function render() {
  renderStats();
  renderInventory();
}

function renderStats() {
  const totalItems = items.length;
  const lowStockItems = items.filter((item) => getStatus(item) === 'low-stock' || getStatus(item) === 'out-of-stock').length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

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
      <div class="stat-value">$${totalValue.toFixed(2)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Locations tracked</div>
      <div class="stat-value">${new Set(items.map((item) => item.location)).size}</div>
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

function populateForm(item) {
  editingItemId = item.id;
  formTitle.textContent = 'Edit inventory item';
  submitBtn.textContent = 'Update item';
  cancelEditBtn.classList.remove('hidden');

  form.elements.name.value = item.name;
  form.elements.category.value = item.category;
  form.elements.quantity.value = item.quantity;
  form.elements.price.value = item.price;
  form.elements.minStock.value = item.minStock;
  form.elements.unit.value = item.unit;
  form.elements.location.value = item.location;
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
        <span>Current: ${item.quantity} ${item.unit}</span>
      </div>
      <div class="meta-row">
        <span>Price: $${item.price.toFixed(2)} each</span>
        <span>Value: $${(item.quantity * item.price).toFixed(2)}</span>
      </div>
      <div class="meta-row">
        <span>Min: ${item.minStock} ${item.unit}</span>
        <span>Location: ${item.location}</span>
      </div>
      <p>${item.notes || 'No notes added.'}</p>
      <div class="actions">
        <button class="small-btn" data-action="increase" data-id="${item.id}">+1</button>
        <button class="small-btn" data-action="decrease" data-id="${item.id}">-1</button>
        <button class="small-btn" data-action="restock" data-id="${item.id}">Restock to min</button>
        <button class="small-btn" data-action="edit" data-id="${item.id}">Edit</button>
      </div>
    `;

    inventoryList.appendChild(card);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const updatedValues = {
    name: formData.get('name').toString().trim(),
    category: formData.get('category').toString().trim(),
    quantity: Number(formData.get('quantity')),
    price: Number(formData.get('price')),
    minStock: Number(formData.get('minStock')),
    unit: formData.get('unit').toString().trim(),
    location: formData.get('location').toString().trim(),
    notes: formData.get('notes').toString().trim()
  };

  if (editingItemId !== null) {
    items = items.map((item) => item.id === editingItemId ? { ...item, ...updatedValues } : item);
  } else {
    items.unshift({ id: Date.now(), ...updatedValues });
  }

  saveItems();
  render();
  resetForm();
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

  items = items.map((item) => {
    if (item.id !== itemId) return item;

    if (action === 'increase') {
      return { ...item, quantity: item.quantity + 1 };
    }

    if (action === 'decrease') {
      return { ...item, quantity: Math.max(0, item.quantity - 1) };
    }

    if (action === 'restock') {
      return { ...item, quantity: item.minStock };
    }

    return item;
  });

  saveItems();
  render();
});

cancelEditBtn.addEventListener('click', () => {
  resetForm();
});

resetBtn.addEventListener('click', () => {
  items = initialItems.map((item) => ({ ...item }));
  saveItems();
  render();
  resetForm();
});

resetForm();
render();
