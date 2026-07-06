import client from './api';

const T = '/travel';

export const travelPartnersApi = {
  // Proposals
  listProposals: () => client.get(`${T}/proposals`).then(r => r.data),
  createProposal: (data) => client.post(`${T}/proposals`, data).then(r => r.data),
  updateProposal: (id, data) => client.patch(`${T}/proposals/${id}`, data).then(r => r.data),
  sendProposal: (id) => client.post(`${T}/proposals/${id}/send`).then(r => r.data),
  deleteProposal: (id) => client.delete(`${T}/proposals/${id}`).then(r => r.data),
  publicView: (code) => client.get(`${T}/public/${code}`).then(r => r.data),
  publicDecision: (code, decision, comment='') => client.post(`${T}/public/${code}/decision`, { decision, comment }).then(r => r.data),
  // Bookings
  listBookings: () => client.get(`${T}/bookings`).then(r => r.data),
  deleteBooking: (id) => client.delete(`${T}/bookings/${id}`).then(r => r.data),
  // Catalog
  hotels: {
    list: () => client.get(`${T}/catalog/hotels`).then(r => r.data),
    create: (d) => client.post(`${T}/catalog/hotels`, d).then(r => r.data),
    remove: (id) => client.delete(`${T}/catalog/hotels/${id}`).then(r => r.data),
  },
  attractions: {
    list: () => client.get(`${T}/catalog/attractions`).then(r => r.data),
    create: (d) => client.post(`${T}/catalog/attractions`, d).then(r => r.data),
    remove: (id) => client.delete(`${T}/catalog/attractions/${id}`).then(r => r.data),
  },
  airlines: {
    list: () => client.get(`${T}/catalog/airlines`).then(r => r.data),
    create: (d) => client.post(`${T}/catalog/airlines`, d).then(r => r.data),
    remove: (id) => client.delete(`${T}/catalog/airlines/${id}`).then(r => r.data),
  },
};
