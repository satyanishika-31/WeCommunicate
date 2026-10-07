// Clean initial society structure
export const initialCommunities = [
  {
    _id: 'comm_1',
    name: 'Emerald Towers Enclave',
    location: 'Central Avenue, Sector 4',
    code: 'EME-101',
    totalBlocks: 4,
    totalFlats: 140,
    managerName: 'Vikramaditya Das',
    residentCount: 120,
    createdAt: '2025-01-15T00:00:00Z',
  },
  {
    _id: 'comm_2',
    name: 'Sapphire Heights Society',
    location: 'Parkview Road, Sector 9',
    code: 'SAP-202',
    totalBlocks: 3,
    totalFlats: 90,
    managerName: 'Ananya Verma',
    residentCount: 75,
    createdAt: '2025-03-20T00:00:00Z',
  },
  {
    _id: 'comm_3',
    name: 'Ruby Court Residency',
    location: 'Grand Drive, Sector 12',
    code: 'RUB-303',
    totalBlocks: 2,
    totalFlats: 60,
    managerName: 'Priya Sundaram',
    residentCount: 50,
    createdAt: '2025-05-10T00:00:00Z',
  },
  {
    _id: 'comm_4',
    name: 'Diamond Crest Community',
    location: 'Skyline Boulevard, Sector 15',
    code: 'DIA-404',
    totalBlocks: 5,
    totalFlats: 200,
    managerName: 'Rahul Sharma',
    residentCount: 180,
    createdAt: '2025-07-01T00:00:00Z',
  },
];

export const initialBlocks = [
  { _id: 'b1', name: 'Emerald Tower', blockNumber: 'A', totalFlats: 40 },
  { _id: 'b2', name: 'Sapphire Heights', blockNumber: 'B', totalFlats: 40 },
  { _id: 'b3', name: 'Ruby Court', blockNumber: 'C', totalFlats: 30 },
  { _id: 'b4', name: 'Diamond Crest', blockNumber: 'D', totalFlats: 30 },
];

export const initialHouses = [
  { _id: 'h101', houseNumber: 'A-101', floorNumber: 1, block: 'b1', ownerName: 'Rahul Sharma' },
  { _id: 'h102', houseNumber: 'A-102', floorNumber: 1, block: 'b1', ownerName: 'Ananya Verma' },
  { _id: 'h201', houseNumber: 'A-201', floorNumber: 2, block: 'b1', ownerName: 'Vikramaditya Das' },
  { _id: 'h302', houseNumber: 'B-302', floorNumber: 3, block: 'b2', ownerName: 'Priya Sundaram' },
];

export const initialUsers = [
  {
    _id: 'u0',
    name: 'System Admin',
    email: 'admin@gmail.com',
    phone: '+91 99999 00000',
    role: 'ADMIN',
    residentType: 'OWNER',
    community: 'Emerald Towers Enclave',
    block: { _id: 'b4', name: 'Diamond Crest', blockNumber: 'D' },
    house: { _id: 'h501', houseNumber: 'D-501' },
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: 'u1',
    name: 'Rahul Sharma',
    email: 'rahul@wecommunicate.com',
    phone: '+91 98765 43210',
    role: 'USER',
    residentType: 'OWNER',
    community: 'Emerald Towers Enclave',
    block: { _id: 'b1', name: 'Emerald Tower', blockNumber: 'A' },
    house: { _id: 'h101', houseNumber: 'A-101' },
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: 'u2',
    name: 'Priya Sundaram',
    email: 'priya@wecommunicate.com',
    phone: '+91 98123 45678',
    role: 'USER',
    residentType: 'OWNER',
    community: 'Sapphire Heights Society',
    block: { _id: 'b2', name: 'Sapphire Heights', blockNumber: 'B' },
    house: { _id: 'h302', houseNumber: 'B-302' },
    profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: 'u3',
    name: 'Vikramaditya Das',
    email: 'manager@wecommunicate.com',
    phone: '+91 99887 76655',
    role: 'BLOCK_MANAGER',
    residentType: 'OWNER',
    community: 'Emerald Towers Enclave',
    block: { _id: 'b1', name: 'Emerald Tower', blockNumber: 'A' },
    house: { _id: 'h201', houseNumber: 'A-201' },
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  },
  {
    _id: 'u4',
    name: 'Community Admin',
    email: 'admin@wecommunicate.com',
    phone: '+91 90000 11111',
    role: 'ADMIN',
    residentType: 'OWNER',
    community: 'Emerald Towers Enclave',
    block: { _id: 'b4', name: 'Diamond Crest', blockNumber: 'D' },
    house: { _id: 'h501', houseNumber: 'D-501' },
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
  }
];

// Clean post links - ready for user customization
export const initialPosts = [
  {
    _id: 'p1',
    author: {
      _id: 'u4',
      name: 'Community Admin',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      role: 'ADMIN'
    },
    type: 'NOTICE',
    title: 'Water Supply Maintenance Announcement',
    description: 'Water supply will be temporarily unavailable tomorrow from 10:00 AM to 1:00 PM due to routine maintenance. Please store water in advance.',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=1000',
    likes: ['u1', 'u2', 'u3'],
    comments: [
      {
        _id: 'c1',
        user: { _id: 'u1', name: 'Rahul Sharma', profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
        text: 'Thank you for the notice! Will prepare stored water.',
        createdAt: '2026-10-06T09:30:00Z'
      }
    ],
    block: { _id: 'b1', name: 'Emerald Tower', blockNumber: 'A' },
    createdAt: '2026-10-06T08:00:00Z'
  },
  {
    _id: 'p2',
    author: {
      _id: 'u2',
      name: 'Priya Sundaram',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400'
    },
    type: 'BUSINESS',
    title: 'Priya’s Artisanal Bakehouse Pre-Orders Open',
    description: 'Fresh eggless sourdough breads, custom celebration cakes, and cookie boxes baked right here in Block B. Free delivery within the society.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1000',
    likes: ['u1', 'u4'],
    comments: [],
    block: { _id: 'b2', name: 'Sapphire Heights', blockNumber: 'B' },
    createdAt: '2026-10-06T10:45:00Z'
  }
];

export const initialEvents = [
  {
    _id: 'e1',
    title: 'Grand Community Festival & Cultural Gala',
    description: 'Join us for live music, food stalls, and family activities at the Central Clubhouse Lawn.',
    poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000',
    date: '2026-10-24T18:30:00.000Z',
    time: '06:30 PM - 10:30 PM',
    venue: 'Central Community Clubhouse Lawn',
    createdBy: { _id: 'u4', name: 'Community Admin' },
    attendees: ['u1', 'u2', 'u3'],
    createdAt: '2026-10-05T10:00:00Z'
  }
];

export const initialBusinesses = [
  {
    _id: 'bs1',
    owner: {
      _id: 'u2',
      name: 'Priya Sundaram',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      house: 'B-302',
      block: 'Block B'
    },
    businessName: 'Priya’s Artisanal Bakehouse',
    category: 'BAKING',
    description: 'Custom celebration cakes, eggless brownies, and fresh sourdough breads baked with organic ingredients.',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=600'
    ],
    services: [
      { name: 'Custom Cake (1kg)', price: 1200 },
      { name: 'Assorted Brownie Box', price: 450 }
    ],
    contact: '+91 98123 45678',
    timings: '09:00 AM - 08:00 PM',
    status: 'ACTIVE',
    rating: 4.9,
    reviewsCount: 15,
    reviews: []
  }
];

export const initialComplaints = [
  {
    _id: 'c101',
    title: 'Block A Elevator Maintenance Check',
    description: 'Elevator 2 in Block A requires inspection for smooth operation.',
    category: 'LIFT',
    status: 'IN_PROGRESS',
    block: { _id: 'b1', name: 'Emerald Tower', blockNumber: 'A' },
    house: { _id: 'h201', houseNumber: 'A-201' },
    raisedBy: { _id: 'u3', name: 'Vikramaditya Das', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400' },
    assignedTo: { _id: 'u4', name: 'Community Admin' },
    createdAt: '2026-10-04T11:00:00Z',
    updatedAt: '2026-10-05T09:30:00Z',
    timeline: [
      { status: 'PENDING', label: 'Complaint Raised', timestamp: '2026-10-04T11:00:00Z', note: 'Issue logged by resident' },
      { status: 'IN_PROGRESS', label: 'In Progress', timestamp: '2026-10-05T09:30:00Z', note: 'Technician inspecting elevator motor' }
    ]
  }
];

export const initialNotifications = [
  {
    _id: 'n1',
    type: 'NEW_NOTICE',
    title: '📢 Water Supply Maintenance',
    message: 'Water tank cleaning scheduled for Block A & B tomorrow 10 AM to 1 PM.',
    createdAt: '2026-10-06T08:05:00Z',
    isRead: false
  }
];
