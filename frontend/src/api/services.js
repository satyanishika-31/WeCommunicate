import API from './axios';
import {
  initialPosts,
  initialEvents,
  initialBusinesses,
  initialComplaints,
  initialNotifications,
  initialUsers,
  initialBlocks,
  initialHouses,
  initialCommunities
} from './mockData';

// Local storage backed state for offline/demo robustness
const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(`wecomm_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(`wecomm_${key}`, JSON.stringify(value));
  } catch (e) {}
};

// Initialize persistent mock stores
let mockPosts = getStored('posts', initialPosts);
let mockEvents = getStored('events', initialEvents);
let mockBusinesses = getStored('businesses', initialBusinesses);
let mockComplaints = getStored('complaints', initialComplaints);
let mockNotifications = getStored('notifications', initialNotifications);
let mockUsers = getStored('users', initialUsers);
let mockBlocks = getStored('blocks', initialBlocks);
let mockHouses = getStored('houses', initialHouses);
let mockCommunities = getStored('communities', initialCommunities);

// AUTH SERVICES
export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (err) {
      // Check for user-specified admin credentials admin@gmail.com / 1234567890
      if (
        credentials.email?.toLowerCase() === 'admin@gmail.com' &&
        credentials.password === '1234567890'
      ) {
        const adminUser = {
          _id: 'u_admin_special',
          name: 'System Admin',
          email: 'admin@gmail.com',
          role: 'ADMIN',
          residentType: 'OWNER',
          community: 'Emerald Towers Enclave',
          profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
        };
        return {
          success: true,
          token: 'mock-jwt-token-admin-' + Date.now(),
          user: adminUser,
        };
      }

      // Fallback matching mock user
      const found = mockUsers.find(
        (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
      ) || mockUsers[0];
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: found,
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      const newUser = {
        _id: 'u_' + Date.now(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'USER',
        residentType: userData.residentType || 'OWNER',
        community: userData.community || 'Emerald Towers Enclave',
        block: mockBlocks.find((b) => b._id === userData.block) || mockBlocks[0],
        house: mockHouses.find((h) => h._id === userData.house) || { houseNumber: userData.houseNumber || 'A-101' },
        profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      };
      mockUsers.push(newUser);
      setStored('users', mockUsers);
      return {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user: newUser,
      };
    }
  },

  getMe: async () => {
    try {
      const response = await API.get('/auth/me');
      return response.data;
    } catch (err) {
      const savedUser = getStored('current_user', mockUsers[0]);
      return { success: true, user: savedUser };
    }
  },
};

// POSTS SERVICE
export const postService = {
  getAll: async () => {
    try {
      const res = await API.get('/posts');
      if (res.data?.posts && res.data.posts.length > 0) return res.data.posts;
      return mockPosts;
    } catch (err) {
      return mockPosts;
    }
  },

  create: async (postData) => {
    try {
      const res = await API.post('/posts', postData);
      return res.data;
    } catch (err) {
      const currentUser = getStored('current_user', mockUsers[0]);
      const newPost = {
        _id: 'p_' + Date.now(),
        author: currentUser,
        type: postData.type || 'GENERAL',
        title: postData.title,
        description: postData.description,
        image: postData.image || null,
        likes: [],
        comments: [],
        block: postData.block ? mockBlocks.find(b => b._id === postData.block) : currentUser.block,
        createdAt: new Date().toISOString(),
      };
      mockPosts.unshift(newPost);
      setStored('posts', mockPosts);
      return { success: true, post: newPost };
    }
  },

  toggleLike: async (postId, userId) => {
    try {
      const res = await API.put(`/posts/${postId}/like`);
      return res.data;
    } catch (err) {
      const post = mockPosts.find((p) => p._id === postId);
      if (post) {
        const hasLiked = post.likes.includes(userId);
        if (hasLiked) {
          post.likes = post.likes.filter((id) => id !== userId);
        } else {
          post.likes.push(userId);
        }
        setStored('posts', mockPosts);
      }
      return { success: true, post };
    }
  },

  addComment: async (postId, text, currentUser) => {
    try {
      const res = await API.post(`/posts/${postId}/comment`, { text });
      return res.data;
    } catch (err) {
      const post = mockPosts.find((p) => p._id === postId);
      if (post) {
        const newComment = {
          _id: 'c_' + Date.now(),
          user: currentUser,
          text,
          createdAt: new Date().toISOString(),
        };
        post.comments.push(newComment);
        setStored('posts', mockPosts);
      }
      return { success: true, post };
    }
  },
};

// EVENTS SERVICE
export const eventService = {
  getAll: async () => {
    try {
      const res = await API.get('/events');
      if (res.data?.events && res.data.events.length > 0) return res.data.events;
      return mockEvents;
    } catch (err) {
      return mockEvents;
    }
  },

  create: async (eventData, currentUser) => {
    try {
      const res = await API.post('/events', eventData);
      return res.data;
    } catch (err) {
      const newEvent = {
        _id: 'e_' + Date.now(),
        createdBy: currentUser,
        title: eventData.title,
        description: eventData.description,
        poster: eventData.poster || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1000',
        date: eventData.date,
        time: eventData.time,
        venue: eventData.venue,
        attendees: [currentUser._id],
        createdAt: new Date().toISOString(),
      };
      mockEvents.unshift(newEvent);
      setStored('events', mockEvents);
      return { success: true, event: newEvent };
    }
  },

  toggleRSVP: async (eventId, userId) => {
    try {
      const res = await API.put(`/events/${eventId}/rsvp`);
      return res.data;
    } catch (err) {
      const event = mockEvents.find((e) => e._id === eventId);
      if (event) {
        if (event.attendees.includes(userId)) {
          event.attendees = event.attendees.filter((id) => id !== userId);
        } else {
          event.attendees.push(userId);
        }
        setStored('events', mockEvents);
      }
      return { success: true, event };
    }
  },
};

// BUSINESSES SERVICE
export const businessService = {
  getAll: async () => {
    try {
      const res = await API.get('/businesses');
      if (res.data?.businesses && res.data.businesses.length > 0) return res.data.businesses;
      return mockBusinesses;
    } catch (err) {
      return mockBusinesses;
    }
  },

  create: async (businessData, currentUser) => {
    try {
      const res = await API.post('/businesses', businessData);
      return res.data;
    } catch (err) {
      const newBusiness = {
        _id: 'bs_' + Date.now(),
        owner: currentUser,
        businessName: businessData.businessName,
        category: businessData.category,
        description: businessData.description,
        images: businessData.images || ['https://images.unsplash.com/photo-1556742049-0a67daf4005a?auto=format&fit=crop&q=80&w=600'],
        services: businessData.services || [{ name: 'Standard Service', price: 500 }],
        contact: businessData.contact || currentUser.phone,
        timings: businessData.timings || '09:00 AM - 07:00 PM',
        status: 'PENDING',
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString()
      };
      mockBusinesses.unshift(newBusiness);
      setStored('businesses', mockBusinesses);
      return { success: true, business: newBusiness };
    }
  },

  updateStatus: async (businessId, status) => {
    try {
      const res = await API.put(`/businesses/${businessId}/status`, { status });
      return res.data;
    } catch (err) {
      const b = mockBusinesses.find((item) => item._id === businessId);
      if (b) {
        b.status = status;
        setStored('businesses', mockBusinesses);
      }
      return { success: true, business: b };
    }
  },

  addReview: async (businessId, reviewData, currentUser) => {
    try {
      const res = await API.post(`/businesses/${businessId}/reviews`, reviewData);
      return res.data;
    } catch (err) {
      const business = mockBusinesses.find((item) => item._id === businessId);
      if (!business) {
        return { success: false, message: 'Business not found.' };
      }

      const review = {
        _id: `review_${Date.now()}`,
        rating: reviewData.rating,
        comment: reviewData.comment,
        author: currentUser,
        createdAt: new Date().toISOString(),
      };
      const reviews = [...(business.reviews || []), review];
      const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);
      business.reviews = reviews;
      business.rating = Number((totalRating / reviews.length).toFixed(1));
      business.reviewsCount = reviews.length;
      setStored('businesses', mockBusinesses);
      return { success: true, business, review };
    }
  }
};

// COMPLAINTS SERVICE
export const complaintService = {
  getAll: async () => {
    try {
      const res = await API.get('/complaints');
      if (res.data?.complaints && res.data.complaints.length > 0) return res.data.complaints;
      return mockComplaints;
    } catch (err) {
      return mockComplaints;
    }
  },

  create: async (complaintData, currentUser) => {
    try {
      const res = await API.post('/complaints', complaintData);
      return res.data;
    } catch (err) {
      const now = new Date().toISOString();
      const newComplaint = {
        _id: 'c_' + Date.now(),
        title: complaintData.title,
        description: complaintData.description,
        category: complaintData.category,
        status: 'PENDING',
        block: currentUser.block || mockBlocks[0],
        house: currentUser.house || mockHouses[0],
        raisedBy: currentUser,
        createdAt: now,
        updatedAt: now,
        timeline: [
          { status: 'PENDING', label: 'Complaint Raised', timestamp: now, note: 'Logged by resident' }
        ]
      };
      mockComplaints.unshift(newComplaint);
      setStored('complaints', mockComplaints);
      return { success: true, complaint: newComplaint };
    }
  },

  updateStatus: async (complaintId, status, note = '') => {
    try {
      const res = await API.put(`/complaints/${complaintId}/status`, { status });
      return res.data;
    } catch (err) {
      const c = mockComplaints.find((comp) => comp._id === complaintId);
      if (c) {
        c.status = status;
        const now = new Date().toISOString();
        c.updatedAt = now;
        const labelMap = {
          PENDING: 'Complaint Raised',
          ASSIGNED: 'Assigned to Technician',
          IN_PROGRESS: 'In Progress',
          RESOLVED: 'Resolved'
        };
        c.timeline.push({
          status,
          label: labelMap[status] || status,
          timestamp: now,
          note: note || `Status updated to ${status}`
        });
        setStored('complaints', mockComplaints);
      }
      return { success: true, complaint: c };
    }
  }
};

// NOTIFICATIONS SERVICE
export const notificationService = {
  getAll: async () => {
    try {
      const res = await API.get('/notifications');
      if (res.data?.notifications) return res.data.notifications;
      return mockNotifications;
    } catch (err) {
      return mockNotifications;
    }
  },

  markAllAsRead: async () => {
    try {
      await API.put('/notifications/read-all');
    } catch (err) {}
    mockNotifications = mockNotifications.map((n) => ({ ...n, isRead: true }));
    setStored('notifications', mockNotifications);
    return { success: true };
  }
};

// META SERVICES (Communities, Blocks, Houses, Users)
export const metaService = {
  getCommunities: async () => {
    try {
      const res = await API.get('/communities');
      if (res.data?.communities) return res.data.communities;
      return mockCommunities;
    } catch (err) {
      return mockCommunities;
    }
  },

  addCommunity: async (communityData) => {
    const newCommunity = {
      _id: 'comm_' + Date.now(),
      name: communityData.name,
      location: communityData.location || 'Central Sector',
      code: communityData.code || ('COMM-' + Math.floor(100 + Math.random() * 900)),
      totalBlocks: Number(communityData.totalBlocks) || 3,
      totalFlats: Number(communityData.totalFlats) || 100,
      managerName: communityData.managerName || 'Assigned Manager',
      residentCount: 0,
      createdAt: new Date().toISOString(),
    };
    mockCommunities.unshift(newCommunity);
    setStored('communities', mockCommunities);
    return { success: true, community: newCommunity };
  },

  deleteCommunity: async (communityId) => {
    mockCommunities = mockCommunities.filter((c) => c._id !== communityId);
    setStored('communities', mockCommunities);
    return { success: true };
  },

  getBlocks: async () => {
    try {
      const res = await API.get('/blocks');
      if (res.data?.blocks) return res.data.blocks;
      return mockBlocks;
    } catch (err) {
      return mockBlocks;
    }
  },
  getHouses: async () => {
    try {
      const res = await API.get('/houses');
      if (res.data?.houses) return res.data.houses;
      return mockHouses;
    } catch (err) {
      return mockHouses;
    }
  },
  getUsers: async () => {
    try {
      const res = await API.get('/users');
      if (res.data?.users) return res.data.users;
      return mockUsers;
    } catch (err) {
      return mockUsers;
    }
  },

  addUser: async (userData) => {
    const newUser = {
      _id: 'u_' + Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+91 98765 00000',
      role: userData.role || 'USER',
      residentType: userData.residentType || 'OWNER',
      community: userData.community || 'Emerald Towers Enclave',
      house: { houseNumber: userData.houseNumber || 'A-101' },
      block: { name: userData.blockName || 'Emerald Tower' },
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    };
    mockUsers.unshift(newUser);
    setStored('users', mockUsers);
    return { success: true, user: newUser };
  },

  deleteUser: async (userId) => {
    mockUsers = mockUsers.filter((u) => u._id !== userId);
    setStored('users', mockUsers);
    return { success: true };
  }
};
