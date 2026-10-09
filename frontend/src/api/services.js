import API from './axios';

const data = (request) => request.then((response) => response.data);

export const authService = {
  login: (credentials) => data(API.post('/auth/login', {
    ...credentials,
    email: credentials.email?.trim().toLowerCase(),
  })),
  register: (userData) => data(API.post('/auth/register', {
    ...userData,
    email: userData.email?.trim().toLowerCase(),
  })),
  getMe: () => data(API.get('/auth/me')),
};

export const postService = {
  getAll: async () => (await data(API.get('/posts'))).posts || [],
  create: (postData) => data(API.post('/posts', postData)),
  delete: (postId) => data(API.delete(`/posts/${postId}`)),
  togglePin: (postId) => data(API.patch(`/posts/${postId}/pin`)),
  acknowledge: (postId) => data(API.post(`/posts/${postId}/acknowledge`)),
  toggleLike: (postId) => data(API.post(`/posts/${postId}/like`)),
  addComment: (postId, text) => data(API.post(`/posts/${postId}/comment`, { text })),
  deleteComment: (postId, commentId) => data(API.delete(`/posts/${postId}/comment/${commentId}`)),
};

export const eventService = {
  getAll: async () => (await data(API.get('/events'))).events || [],
  create: (eventData) => data(API.post('/events', eventData)),
  toggleRSVP: (eventId) => data(API.post(`/events/${eventId}/rsvp`)),
};

export const businessService = {
  getAll: async () => (await data(API.get('/businesses'))).businesses || [],
  create: (businessData) => data(API.post('/businesses', businessData)),
  updateStatus: (businessId, status) => {
    const endpoint = {
      ACTIVE: 'approve',
      PAUSED: 'pause',
      CLOSED: 'close',
    }[status];
    if (!endpoint) {
      return Promise.reject(new Error(`Unsupported business status: ${status}`));
    }
    return data(API.put(`/businesses/${businessId}/${endpoint}`));
  },
  addReview: (businessId, reviewData) => data(API.post(`/businesses/${businessId}/reviews`, reviewData)),
};

export const complaintService = {
  getAll: async () => (await data(API.get('/complaints'))).complaints || [],
  create: (complaintData) => data(API.post('/complaints', complaintData)),
  updateStatus: (complaintId, payload) => {
    const body = typeof payload === 'string' ? { status: payload } : payload;
    return data(API.put(`/complaints/${complaintId}/status`, body));
  },
};

export const notificationService = {
  getAll: async () => (await data(API.get('/notifications'))).notifications || [],
  markAllAsRead: () => data(API.put('/notifications/read-all')),
};

export const metaService = {
  getCommunities: async () => (await data(API.get('/communities'))).communities || [],
  getCommunityDetails: async (communityId) => await data(API.get(`/communities/${communityId}/details`)),
  addCommunity: (communityData) => data(API.post('/communities', communityData)),
  deleteCommunity: (communityId) => data(API.delete(`/communities/${communityId}`)),
  assignCommunityHead: (communityId, headData) => data(API.post(`/communities/${communityId}/assign-head`, headData)),
  createBlockManager: (communityId, managerData) => data(API.post(`/communities/${communityId}/create-block-manager`, managerData)),
  getBlocks: async () => (await data(API.get('/blocks'))).blocks || [],
  getHouses: async () => (await data(API.get('/houses'))).houses || [],
  getUsers: async () => (await data(API.get('/users'))).users || [],
  addUser: (userData) => data(API.post('/auth/register', userData)),
  deleteUser: (userId) => data(API.delete(`/users/${userId}`)),
  updateUser: (userId, userData) => data(API.put(`/users/${userId}`, userData)),
};

export const recordService = {
  getAll: async (category) => (await data(API.get('/records' + (category ? `?category=${category}` : '')))).records || [],
  create: (recordData) => data(API.post('/records', recordData)),
  delete: (recordId) => data(API.delete(`/records/${recordId}`)),
};
