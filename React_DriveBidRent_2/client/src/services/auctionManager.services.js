// client/src/services/auctionManager.services.js

import axiosInstance from "../utils/axiosInstance.util.js";

export const auctionManagerServices = {
  // Dashboard
  getDashboard: () => axiosInstance.get('/auction-manager/dashboard'),

  // Requests
  getRequests: () => axiosInstance.get('/auction-manager/requests'),

  // Pending Cars
  getPending: () => axiosInstance.get('/auction-manager/pending'),
  getReview: (id) => axiosInstance.get(`/auction-manager/get-review/${id}`),
  updateStatus: (id, status) => axiosInstance.post(`/auction-manager/update-status/${id}`, { status }),
  getPendingCarDetails: (id) => axiosInstance.get(`/auction-manager/pending-car-details/${id}`),

  // Approved Cars
  getApproved: () => axiosInstance.get('/auction-manager/approved'),

  // Assign Mechanic
  getAssignMechanic: (id) => axiosInstance.get(`/auction-manager/assign-mechanic/${id}`),
  assignMechanic: (id, data) => axiosInstance.post(`/auction-manager/assign-mechanic/${id}`, data),

  // Auction Actions
  startAuction: (id) => axiosInstance.post(`/auction-manager/start-auction/${id}`),
  stopAuction: (id) => axiosInstance.post(`/auction-manager/stop-auction/${id}`),

  // View Bids
  viewBids: (id) => axiosInstance.get(`/auction-manager/view-bids/${id}`),

  // Backwards-compatible aliases
  getBids: (id) => axiosInstance.get(`/auction-manager/view-bids/${id}`),
  endAuction: (id) => axiosInstance.post(`/auction-manager/stop-auction/${id}`),

  // Profile
  getProfile: () => axiosInstance.get('/auction-manager/profile'),
  updatePhone: (phone) => axiosInstance.post('/auction-manager/update-phone', { phone }),
  changePassword: (data) => axiosInstance.post('/auction-manager/change-password', data)
};  