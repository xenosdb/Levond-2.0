import axios from 'axios';

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

const client = axios.create({ baseURL: API });

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('levond_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

client.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('levond_token');
      if (window.location.pathname.startsWith('/app')) window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

// ---- Auth ----
export const authApi = {
  signup: (data) => client.post('/auth/signup', data).then((r) => r.data),
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  me: () => client.get('/auth/me').then((r) => r.data),
};

// ---- Onboarding / Company / Team (LEAOS) ----
export const companyApi = {
  onboardingStatus: () => client.get('/onboarding/status').then((r) => r.data),
  completeOnboarding: (data) => client.post('/onboarding', data).then((r) => r.data),
  updateBranding: (data) => client.patch('/tenant/branding', data).then((r) => r.data),
  team: () => client.get('/team').then((r) => r.data),
  addMember: (data) => client.post('/team', data).then((r) => r.data),
  updateMember: (id, data) => client.patch(`/team/${id}`, data).then((r) => r.data),
  removeMember: (id) => client.delete(`/team/${id}`).then((r) => r.data),
  exportDb: () => client.get('/tenant/export').then((r) => r.data),
};

// ---- Dashboard ----
export const dashApi = {
  kpis: () => client.get('/dashboard/kpis').then((r) => r.data),
};

// ---- CRM ----
export const crmApi = {
  list: () => client.get('/crm/leads').then((r) => r.data),
  create: (data) => client.post('/crm/leads', data).then((r) => r.data),
  update: (id, data) => client.patch(`/crm/leads/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/crm/leads/${id}`).then((r) => r.data),
  tasks: () => client.get('/crm/tasks').then((r) => r.data),
  createTask: (data) => client.post('/crm/tasks', data).then((r) => r.data),
  createTasksBulk: (items) => client.post('/crm/tasks/bulk', items).then((r) => r.data),
  updateTask: (id, data) => client.patch(`/crm/tasks/${id}`, data).then((r) => r.data),
  removeTask: (id) => client.delete(`/crm/tasks/${id}`).then((r) => r.data),
};

// ---- Products ----
export const productsApi = {
  list: (type) => client.get('/products', { params: type ? { type } : {} }).then((r) => r.data),
  create: (data) => client.post('/products', data).then((r) => r.data),
  update: (id, data) => client.patch(`/products/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/products/${id}`).then((r) => r.data),
};

// ---- Restaurant ----
export const restApi = {
  tables: () => client.get('/restaurant/tables').then((r) => r.data),
  createTable: (data) => client.post('/restaurant/tables', data).then((r) => r.data),
  openOrder: (table_id) => client.post('/restaurant/orders/open', { table_id }).then((r) => r.data),
  addItem: (table_id, item) => client.post('/restaurant/orders/add_item', { table_id, item }).then((r) => r.data),
  closeOrder: (table_id, payment_method = 'cash') => client.post('/restaurant/orders/close', { table_id, payment_method }).then((r) => r.data),
};

// ---- Retail ----
export const retailApi = {
  sales: () => client.get('/retail/sales').then((r) => r.data),
  createSale: (items, payment_method = 'cash') => client.post('/retail/sales', { items, payment_method }).then((r) => r.data),
};

// ---- Contacts ----
export const contactsApi = {
  list: (role) => client.get('/contacts', { params: role ? { role } : {} }).then((r) => r.data),
  create: (data) => client.post('/contacts', data).then((r) => r.data),
  update: (id, data) => client.patch(`/contacts/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/contacts/${id}`).then((r) => r.data),
  get360: (id) => client.get(`/contacts/${id}/360`).then((r) => r.data),
  addInteraction: (id, data) => client.post(`/contacts/${id}/interactions`, data).then((r) => r.data),
};

// ---- AI Intelligence Inbox ----
export const intelligenceApi = {
  list: (status = 'active') => client.get('/intelligence', { params: { status } }).then((r) => r.data),
  scan: () => client.post('/intelligence/scan').then((r) => r.data),
  act: (id, action) => client.post(`/intelligence/${id}/action`, { action }).then((r) => r.data),
  automations: () => client.get('/intelligence/automations').then((r) => r.data),
  removeAutomation: (type) => client.delete(`/intelligence/automations/${type}`).then((r) => r.data),
};

// ---- Sales ----
export const salesApi = {
  list: () => client.get('/sales').then((r) => r.data),
  create: (data) => client.post('/sales', data).then((r) => r.data),
  confirm: (id) => client.post(`/sales/${id}/confirm`).then((r) => r.data),
  invoice: (id) => client.post(`/sales/${id}/invoice`).then((r) => r.data),
  remove: (id) => client.delete(`/sales/${id}`).then((r) => r.data),
};

// ---- Invoices ----
export const invoicesApi = {
  list: () => client.get('/invoices').then((r) => r.data),
  pay: (id) => client.post(`/invoices/${id}/pay`).then((r) => r.data),
  remove: (id) => client.delete(`/invoices/${id}`).then((r) => r.data),
};

// ---- Purchases ----
export const purchasesApi = {
  list: () => client.get('/purchases').then((r) => r.data),
  create: (data) => client.post('/purchases', data).then((r) => r.data),
  receive: (id) => client.post(`/purchases/${id}/receive`).then((r) => r.data),
  remove: (id) => client.delete(`/purchases/${id}`).then((r) => r.data),
};

// ---- Warehouses ----
export const warehousesApi = {
  list: () => client.get('/warehouses').then((r) => r.data),
  create: (data) => client.post('/warehouses', data).then((r) => r.data),
  remove: (id) => client.delete(`/warehouses/${id}`).then((r) => r.data),
};
export const transfersApi = {
  list: () => client.get('/inventory/transfers').then((r) => r.data),
  create: (data) => client.post('/inventory/transfers', data).then((r) => r.data),
};

// ---- Accounting ----
export const accountsApi = {
  list: () => client.get('/accounting/accounts').then((r) => r.data),
  create: (data) => client.post('/accounting/accounts', data).then((r) => r.data),
  remove: (id) => client.delete(`/accounting/accounts/${id}`).then((r) => r.data),
};
export const entriesApi = {
  list: () => client.get('/accounting/entries').then((r) => r.data),
  create: (data) => client.post('/accounting/entries', data).then((r) => r.data),
  remove: (id) => client.delete(`/accounting/entries/${id}`).then((r) => r.data),
};

// ---- Projects ----
export const projectsApi = {
  list: () => client.get('/projects').then((r) => r.data),
  create: (data) => client.post('/projects', data).then((r) => r.data),
  remove: (id) => client.delete(`/projects/${id}`).then((r) => r.data),
  tasks: (pid) => client.get(`/projects/${pid}/tasks`).then((r) => r.data),
  createTask: (data) => client.post('/tasks', data).then((r) => r.data),
  updateTask: (id, data) => client.patch(`/tasks/${id}`, data).then((r) => r.data),
  removeTask: (id) => client.delete(`/tasks/${id}`).then((r) => r.data),
};

// ---- Appointments ----
export const appointmentsApi = {
  list: () => client.get('/appointments').then((r) => r.data),
  create: (data) => client.post('/appointments', data).then((r) => r.data),
  update: (id, data) => client.patch(`/appointments/${id}`, data).then((r) => r.data),
  remove: (id) => client.delete(`/appointments/${id}`).then((r) => r.data),
};

// ---- Maintenance ----
export const maintenanceApi = {
  equipment: () => client.get('/maintenance/equipment').then((r) => r.data),
  createEquipment: (data) => client.post('/maintenance/equipment', data).then((r) => r.data),
  removeEquipment: (id) => client.delete(`/maintenance/equipment/${id}`).then((r) => r.data),
  workOrders: () => client.get('/maintenance/work_orders').then((r) => r.data),
  createWO: (data) => client.post('/maintenance/work_orders', data).then((r) => r.data),
  updateWO: (id, data) => client.patch(`/maintenance/work_orders/${id}`, data).then((r) => r.data),
  removeWO: (id) => client.delete(`/maintenance/work_orders/${id}`).then((r) => r.data),
};

// ---- Travel ----
export const travelApi = {
  list: () => client.get('/travel/bookings').then((r) => r.data),
  create: (data) => client.post('/travel/bookings', data).then((r) => r.data),
  remove: (id) => client.delete(`/travel/bookings/${id}`).then((r) => r.data),
};
