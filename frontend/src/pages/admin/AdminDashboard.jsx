import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Building,
  Wrench,
  Store,
  Plus,
  Trash2,
  MapPin,
  CheckCircle2,
  X,
  Building2,
  Hash,
  Search,
} from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Header from '../../components/layout/Header';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { metaService, complaintService, businessService } from '../../api/services';

import { useAuth } from '../../context/AuthContext';
import {
  Phone,
  Mail,
  UserCheck,
  Home as HomeIcon,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isCommunityHead = currentUser?.role === 'COMMUNITY_HEAD';

  const [activeTab, setActiveTab] = useState('COMMUNITIES'); // COMMUNITIES | RESIDENTS | BLOCKS | BUSINESS_APPROVALS
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [houses, setHouses] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Community Modal state
  const [showAddCommModal, setShowAddCommModal] = useState(false);
  const [commName, setCommName] = useState('');
  const [commLocation, setCommLocation] = useState('');
  const [commCode, setCommCode] = useState('');
  const [commBlocksText, setCommBlocksText] = useState('Block A, Block B, Block C, Block D');
  const [commFlatsText, setCommFlatsText] = useState('101, 102, 103, 104, 201, 202, 203, 204');
  const [commManager, setCommManager] = useState('');

  // Selected Community Detail Modal
  const [selectedCommunityDetail, setSelectedCommunityDetail] = useState(null);
  const [communityDetailsLoading, setCommunityDetailsLoading] = useState(false);

  // Assign / Create Community Head Modal
  const [showAssignHeadModal, setShowAssignHeadModal] = useState(false);
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [headPhone, setHeadPhone] = useState('');
  const [headPassword, setHeadPassword] = useState('');
  const [headBlock, setHeadBlock] = useState('');
  const [headFlat, setHeadFlat] = useState('');

  // Create Block Manager Modal (Community Head or Admin)
  const [showCreateManagerModal, setShowCreateManagerModal] = useState(false);
  const [mgrName, setMgrName] = useState('');
  const [mgrEmail, setMgrEmail] = useState('');
  const [mgrPhone, setMgrPhone] = useState('');
  const [mgrPassword, setMgrPassword] = useState('');
  const [mgrBlock, setMgrBlock] = useState('');
  const [mgrFlat, setMgrFlat] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [cList, uList, bList, hList, compList, bsList] = await Promise.all([
      metaService.getCommunities(),
      metaService.getUsers(),
      metaService.getBlocks(),
      metaService.getHouses(),
      complaintService.getAll(),
      businessService.getAll(),
    ]);
    setCommunities(cList || []);
    setUsers(uList || []);
    setBlocks(bList || []);
    setHouses(hList || []);
    setComplaints(compList || []);
    setBusinesses(bsList || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCommunityDetail = async (community) => {
    setCommunityDetailsLoading(true);
    setSelectedCommunityDetail({ community });
    try {
      const details = await metaService.getCommunityDetails(community._id);
      setSelectedCommunityDetail(details);
    } catch (err) {
      console.error('Failed to get community details:', err);
    } finally {
      setCommunityDetailsLoading(false);
    }
  };

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!commName.trim()) return;
    try {
      const bList = commBlocksText.split(',').map((b) => b.trim()).filter(Boolean);
      const fList = commFlatsText.split(',').map((f) => f.trim()).filter(Boolean);

      await metaService.addCommunity({
        name: commName.trim(),
        location: commLocation.trim() || 'Central Sector',
        code: commCode.trim() || ('COMM-' + Math.floor(100 + Math.random() * 900)),
        totalBlocks: bList.length || 4,
        totalFlats: fList.length || 120,
        blocksList: bList,
        flatsList: fList,
        managerName: commManager.trim() || 'Pending Assignment',
      });
      setCommName('');
      setCommLocation('');
      setCommCode('');
      setCommManager('');
      setShowAddCommModal(false);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create community');
    }
  };

  const handleAssignCommunityHead = async (e) => {
    e.preventDefault();
    if (!selectedCommunityDetail?.community?._id) return;
    try {
      await metaService.assignCommunityHead(selectedCommunityDetail.community._id, {
        name: headName.trim(),
        email: headEmail.trim().toLowerCase(),
        phone: headPhone.trim(),
        password: headPassword,
        houseNumber: headFlat.trim() ? `${headBlock ? headBlock + '-' : ''}${headFlat.trim()}` : 'A-101',
      });
      setShowAssignHeadModal(false);
      setHeadName('');
      setHeadEmail('');
      setHeadPhone('');
      setHeadPassword('');
      setHeadBlock('');
      setHeadFlat('');
      await handleOpenCommunityDetail(selectedCommunityDetail.community);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to assign Community Head');
    }
  };

  const handleCreateBlockManager = async (e) => {
    e.preventDefault();
    if (!selectedCommunityDetail?.community?._id || !mgrBlock) {
      alert('Please select or specify a block');
      return;
    }
    try {
      await metaService.createBlockManager(selectedCommunityDetail.community._id, {
        name: mgrName.trim(),
        email: mgrEmail.trim().toLowerCase(),
        phone: mgrPhone.trim(),
        password: mgrPassword,
        blockName: mgrBlock.trim(),
        houseNumber: mgrFlat.trim() || `${mgrBlock}-101`,
      });
      setShowCreateManagerModal(false);
      setMgrName('');
      setMgrEmail('');
      setMgrPhone('');
      setMgrPassword('');
      setMgrBlock('');
      setMgrFlat('');
      await handleOpenCommunityDetail(selectedCommunityDetail.community);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create Block Manager');
    }
  };

  const handleDeleteCommunity = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete community "${name}"?`)) {
      await metaService.deleteCommunity(id);
      fetchData();
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove user "${name}" from system?`)) {
      await metaService.deleteUser(id);
      fetchData();
    }
  };

  const handleApproveBusiness = async (id, status) => {
    await businessService.updateStatus(id, status);
    fetchData();
  };

  return (
    <PageContainer>
      <Header />

      <div className="space-y-6 font-sans">
        {/* Admin Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#542612] via-[#63351E] to-[#542612] text-white p-6 lg:p-8 rounded-3xl shadow-xl border border-[#542612]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#542612]/20 text-[#F7F0DF] border border-[#542612]/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">
                System Admin Portal — Communities & Governance
              </h1>
              <p className="text-xs text-[#F7F0DF]">
                Logged in as <strong>admin@gmail.com</strong> • Full authority over communities, residents, blocks, and approvals
              </p>
            </div>
          </div>

          <Badge type="ADMIN" size="md" />
        </div>

        {/* Top Summary Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F5EFE1] dark:bg-[#542612] p-5 rounded-2xl border border-[#542612]/15 shadow-xs">
            <div className="flex items-center justify-between text-[#542612]/60 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Communities</span>
              <Building2 className="w-4 h-4 text-[#542612]" />
            </div>
            <div className="text-2xl font-extrabold text-[#542612] dark:text-white font-serif">
              {communities.length}
            </div>
          </div>

          <div className="bg-[#F5EFE1] dark:bg-[#542612] p-5 rounded-2xl border border-[#542612]/15 shadow-xs">
            <div className="flex items-center justify-between text-[#542612]/60 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Residents</span>
              <Users className="w-4 h-4 text-[#542612]" />
            </div>
            <div className="text-2xl font-extrabold text-[#542612] dark:text-white font-serif">
              {users.length}
            </div>
          </div>

          <div className="bg-[#F5EFE1] dark:bg-[#542612] p-5 rounded-2xl border border-[#542612]/15 shadow-xs">
            <div className="flex items-center justify-between text-[#542612]/60 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Maintenance Issues</span>
              <Wrench className="w-4 h-4 text-[#542612]" />
            </div>
            <div className="text-2xl font-extrabold text-[#542612] dark:text-white font-serif">
              {complaints.length}
            </div>
          </div>

          <div className="bg-[#F5EFE1] dark:bg-[#542612] p-5 rounded-2xl border border-[#542612]/15 shadow-xs">
            <div className="flex items-center justify-between text-[#542612]/60 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Resident Businesses</span>
              <Store className="w-4 h-4 text-[#542612]" />
            </div>
            <div className="text-2xl font-extrabold text-[#542612] dark:text-white font-serif">
              {businesses.length}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-[#542612]/20 dark:border-[#F7F0DF]/20 pb-1 flex-wrap gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'COMMUNITIES', label: 'Communities Hub', count: communities.length },
              { id: 'RESIDENTS', label: 'All Residents', count: users.length },
              { id: 'BLOCKS', label: 'Blocks & Towers', count: blocks.length },
              { id: 'BUSINESS_APPROVALS', label: 'Business Approvals', count: businesses.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-[#542612] text-[#542612] dark:text-[#F7F0DF]'
                    : 'border-transparent text-[#542612]/70 hover:text-[#542612] dark:hover:text-white'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {activeTab === 'COMMUNITIES' && (
            <button
              onClick={() => setShowAddCommModal(true)}
              className="px-4 py-2 rounded-xl bg-[#542612] hover:bg-[#542612] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Community
            </button>
          )}
        </div>

        {/* TAB 1: COMMUNITIES HUB (ADD, VIEW INFO, DELETE) */}
        {activeTab === 'COMMUNITIES' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communities.map((comm) => (
                <motion.div
                  key={comm._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleOpenCommunityDetail(comm)}
                  className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/20 shadow-sm hover:shadow-lg transition-all relative space-y-4 cursor-pointer hover:border-[#542612]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#542612] text-[#F7F0DF] flex items-center justify-center font-bold text-lg shadow-sm">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#542612] dark:text-white flex items-center gap-2">
                          {comm.name}
                          <ChevronRight className="w-4 h-4 text-[#542612]/60" />
                        </h3>
                        <span className="text-xs text-[#542612]/70 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#542612]" />
                          {comm.location || 'Central Sector'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteCommunity(comm._id, comm.name)}
                          title="Delete Community"
                          className="p-2 text-[#542612]/60 hover:text-[#542612] hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/40 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Information Details Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F7F0DF] dark:bg-[#542612]/60 p-3 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Code</span>
                      <span className="font-bold text-[#542612] dark:text-white">{comm.code}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Blocks</span>
                      <span className="font-bold text-[#542612] dark:text-white">
                        {comm.blocksList?.length || comm.totalBlocks} Towers
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Flats</span>
                      <span className="font-bold text-[#542612] dark:text-white">{comm.totalFlats} Units</span>
                    </div>
                  </div>

                  {/* Community Head Banner */}
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-[#542612]/80 border border-[#542612]/15 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#542612]" />
                      <div>
                        <span className="text-[10px] text-[#542612]/60 font-bold uppercase block">Community Head</span>
                        <span className="font-bold text-[#542612] dark:text-[#F7F0DF]">
                          {comm.communityHead?.name || comm.managerName || 'Not Assigned'}
                        </span>
                      </div>
                    </div>
                    {comm.communityHead?.phone && (
                      <span className="text-[11px] text-[#542612]/80 font-mono">
                        {comm.communityHead.phone}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20">
                    <span className="text-[#542612]/70">
                      Click to view Community Head, Blocks & Residents
                    </span>
                    <span className="text-[10px] text-[#542612] font-bold bg-[#542612]/10 px-2 py-0.5 rounded-md">
                      View Details →
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: RESIDENTS */}
        {activeTab === 'RESIDENTS' && (
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#542612]/15 dark:border-[#F7F0DF]/20 text-[#542612]/60 uppercase font-bold">
                <tr>
                  <th className="py-3 px-4">Resident Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Community</th>
                  <th className="py-3 px-4">Flat Unit</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0DF] dark:divide-[#542612]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/40">
                    <td className="py-3.5 px-4 font-bold text-[#542612] dark:text-white flex items-center gap-2">
                      <Avatar src={u.profileImage} name={u.name} size="sm" />
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#542612]/70">{u.email}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#542612] dark:text-[#F7F0DF]">
                      {u.community || 'Emerald Towers Enclave'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#542612]">
                      {u.house?.houseNumber || 'A-101'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge type={u.role} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(u._id, u.name)}
                        className="p-1.5 text-[#542612]/60 hover:text-[#542612] hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/40 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BLOCKS */}
        {activeTab === 'BLOCKS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blocks.map((bl) => (
              <div
                key={bl._id}
                className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-lg text-[#542612] dark:text-white">
                    {bl.name} (Block {bl.blockNumber})
                  </h3>
                  <span className="text-xs font-bold bg-[#542612]/10 text-[#542612] px-3 py-1 rounded-full">
                    {bl.totalFlats} Flats
                  </span>
                </div>
                <p className="text-xs text-[#542612]/70">
                  Assigned Manager: <strong>Vikramaditya Das (A-201)</strong>
                </p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: BUSINESS APPROVALS */}
        {activeTab === 'BUSINESS_APPROVALS' && (
          <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#542612] dark:text-white">
              Resident Business Applications & Approvals
            </h3>

            <div className="space-y-3">
              {businesses.map((b) => (
                <div
                  key={b._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612]/60 border border-[#542612]/15 dark:border-[#F7F0DF]/20 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={b.owner?.profileImage} name={b.owner?.name} size="md" />
                    <div>
                      <h4 className="font-bold text-sm text-[#542612] dark:text-white">
                        {b.businessName}
                      </h4>
                      <span className="text-[#542612]/70">
                        Owner: {b.owner?.name} • Category: {b.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge type={b.status || 'ACTIVE'} size="sm" />
                    {b.status === 'PENDING' && (
                      <Button
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleApproveBusiness(b._id, 'ACTIVE')}
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Add New Community */}
      <AnimatePresence>
        {showAddCommModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5EFE1] dark:bg-[#542612] w-full max-w-md rounded-3xl p-6 border border-[#542612]/20 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#542612]/15 dark:border-[#F7F0DF]/20 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#542612]" />
                  <h3 className="font-bold text-lg text-[#542612] dark:text-white">
                    Add New Community
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddCommModal(false)}
                  className="p-1 text-[#542612]/60 hover:text-[#542612] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCommunity} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Community / Society Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={commName}
                    onChange={(e) => setCommName(e.target.value)}
                    placeholder="e.g. Palm Groves Residency"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Location / Sector
                  </label>
                  <input
                    type="text"
                    value={commLocation}
                    onChange={(e) => setCommLocation(e.target.value)}
                    placeholder="e.g. Sector 18, Expressway Drive"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Community Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={commCode}
                    onChange={(e) => setCommCode(e.target.value)}
                    placeholder="e.g. COMM-501"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Block Names (comma-separated, e.g. Block A, Block B, Block C)
                  </label>
                  <input
                    type="text"
                    value={commBlocksText}
                    onChange={(e) => setCommBlocksText(e.target.value)}
                    placeholder="Block A, Block B, Block C"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Flats List (comma-separated, e.g. 101, 102, 103, 201)
                  </label>
                  <input
                    type="text"
                    value={commFlatsText}
                    onChange={(e) => setCommFlatsText(e.target.value)}
                    placeholder="101, 102, 103, 201, 202, 203"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddCommModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#542612] hover:bg-[#542612] text-white font-bold transition-colors cursor-pointer"
                  >
                    Create Community
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Community Details View (Community Head Info, Block Managers, Residents) */}
      <AnimatePresence>
        {selectedCommunityDetail && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5EFE1] dark:bg-[#542612] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 border border-[#542612]/20 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-[#542612]/15 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#542612] text-[#F7F0DF] flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xl text-[#542612] dark:text-white">
                      {selectedCommunityDetail.community?.name}
                    </h3>
                    <p className="text-xs text-[#542612]/70">
                      {selectedCommunityDetail.community?.location || 'Central Sector'} • Code: {selectedCommunityDetail.community?.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommunityDetail(null)}
                  className="p-1.5 text-[#542612]/60 hover:text-[#542612] rounded-xl hover:bg-[#F7F0DF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: COMMUNITY HEAD CARD */}
              <div className="bg-[#F7F0DF] dark:bg-[#542612]/60 p-5 rounded-2xl border border-[#542612]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#542612]" />
                    <h4 className="font-serif font-bold text-base text-[#542612] dark:text-white">
                      Community Head Information
                    </h4>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAssignHeadModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-[#542612] text-white text-xs font-bold hover:bg-[#63351E] transition-colors"
                    >
                      {selectedCommunityDetail.communityHead ? 'Update Head' : 'Assign / Create Head'}
                    </button>
                  )}
                </div>

                {selectedCommunityDetail.communityHead ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white dark:bg-[#542612] rounded-xl border border-[#542612]/10">
                      <span className="text-[10px] text-[#542612]/60 font-bold uppercase block">Full Name</span>
                      <span className="font-bold text-sm text-[#542612] dark:text-white">
                        {selectedCommunityDetail.communityHead.name}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#542612] rounded-xl border border-[#542612]/10">
                      <span className="text-[10px] text-[#542612]/60 font-bold uppercase block">Phone Number</span>
                      <span className="font-bold text-sm text-[#542612] dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#542612]" />
                        {selectedCommunityDetail.communityHead.phone || 'Not Provided'}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#542612] rounded-xl border border-[#542612]/10">
                      <span className="text-[10px] text-[#542612]/60 font-bold uppercase block">Email Address</span>
                      <span className="font-semibold text-xs text-[#542612] dark:text-white flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-[#542612]" />
                        {selectedCommunityDetail.communityHead.email}
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-[#542612] rounded-xl border border-[#542612]/10">
                      <span className="text-[10px] text-[#542612]/60 font-bold uppercase block">Block & Flat Number</span>
                      <span className="font-bold text-sm text-[#542612] dark:text-white flex items-center gap-1.5 mt-0.5">
                        <HomeIcon className="w-3.5 h-3.5 text-[#542612]" />
                        {selectedCommunityDetail.communityHead.houseNumber || 'Flat A-101'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-white/70 dark:bg-[#542612] rounded-xl border border-dashed border-[#542612]/30 text-center text-xs text-[#542612]/70">
                    No Community Head currently assigned for this society. Click "Assign / Create Head" to create credentials.
                  </div>
                )}
              </div>

              {/* SECTION 2: BLOCKS & BLOCK MANAGERS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#542612] dark:text-white">
                      Blocks & Block Managers
                    </h4>
                    <p className="text-xs text-[#542612]/60">
                      Community Head can create credentials for Block Managers
                    </p>
                  </div>
                  {(isAdmin || isCommunityHead) && (
                    <button
                      onClick={() => {
                        const firstBlock = selectedCommunityDetail.blocks?.[0]?.name || selectedCommunityDetail.community?.blocksList?.[0] || 'Block A';
                        setMgrBlock(firstBlock);
                        setShowCreateManagerModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#542612] text-white text-xs font-bold hover:bg-[#63351E] flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create Block Manager
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedCommunityDetail.blocks?.length > 0 ? selectedCommunityDetail.blocks : (selectedCommunityDetail.community?.blocksList || []).map(b => ({ name: b }))).map((blk, idx) => (
                    <div
                      key={blk._id || idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#542612] border border-[#542612]/15 text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#542612] dark:text-white">
                          {blk.name}
                        </span>
                        <Badge type="BLOCK_MANAGER" size="sm" />
                      </div>

                      {blk.manager ? (
                        <div className="space-y-1 text-[#542612]/80">
                          <div className="flex items-center gap-1 font-semibold text-[#542612] dark:text-white">
                            <UserCheck className="w-3.5 h-3.5 text-[#542612]" />
                            {blk.manager.name}
                          </div>
                          <div className="text-[11px] flex items-center gap-1 text-[#542612]/60">
                            <Phone className="w-3 h-3" />
                            {blk.manager.phone || 'Phone not set'}
                          </div>
                          <div className="text-[11px] flex items-center gap-1 text-[#542612]/60">
                            <Mail className="w-3 h-3" />
                            {blk.manager.email}
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#542612]/60 italic">
                          No Block Manager assigned yet.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: RESIDENTS IN THIS COMMUNITY */}
              <div className="space-y-3">
                <h4 className="font-serif font-bold text-base text-[#542612] dark:text-white flex items-center justify-between">
                  <span>Residents Directory ({selectedCommunityDetail.residents?.length || 0})</span>
                  <span className="text-xs font-normal text-[#542612]/60">Who lives in this community</span>
                </h4>

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-[#542612]/15 bg-white dark:bg-[#542612]">
                  {selectedCommunityDetail.residents && selectedCommunityDetail.residents.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F0DF] dark:bg-[#542612]/60 text-[#542612]/60 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Name</th>
                          <th className="py-2.5 px-3">Phone</th>
                          <th className="py-2.5 px-3">Flat / Unit</th>
                          <th className="py-2.5 px-3">Type</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F7F0DF]">
                        {selectedCommunityDetail.residents.map((r) => (
                          <tr key={r._id} className="hover:bg-[#F7F0DF]/40">
                            <td className="py-2 px-3 font-semibold text-[#542612] dark:text-white">
                              {r.name}
                            </td>
                            <td className="py-2 px-3 text-[#542612]/70 font-mono text-[11px]">
                              {r.phone || '—'}
                            </td>
                            <td className="py-2 px-3 font-bold text-[#542612]">
                              {r.houseNumber || '—'}
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#542612]/10 text-[#542612]">
                                {r.residentType || 'OWNER'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-xs text-[#542612]/60">
                      No registered residents found in this community yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Assign / Create Community Head Credentials (Admin Only) */}
      <AnimatePresence>
        {showAssignHeadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5EFE1] dark:bg-[#542612] w-full max-w-md rounded-3xl p-6 border border-[#542612]/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#542612]/15 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#542612]" />
                  <h3 className="font-bold text-lg text-[#542612] dark:text-white">
                    Assign Community Head Credentials
                  </h3>
                </div>
                <button onClick={() => setShowAssignHeadModal(false)} className="p-1 text-[#542612]/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignCommunityHead} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Head Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Head Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={headEmail}
                    onChange={(e) => setHeadEmail(e.target.value)}
                    placeholder="head@society.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={headPhone}
                    onChange={(e) => setHeadPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                      Block
                    </label>
                    <input
                      type="text"
                      value={headBlock}
                      onChange={(e) => setHeadBlock(e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                      Flat Number
                    </label>
                    <input
                      type="text"
                      value={headFlat}
                      onChange={(e) => setHeadFlat(e.target.value)}
                      placeholder="e.g. 101"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={headPassword}
                    onChange={(e) => setHeadPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignHeadModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#F7F0DF] font-bold text-[#542612]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#542612] hover:bg-[#63351E] text-white font-bold"
                  >
                    Save Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Create Block Manager Credentials */}
      <AnimatePresence>
        {showCreateManagerModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5EFE1] dark:bg-[#542612] w-full max-w-md rounded-3xl p-6 border border-[#542612]/20 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#542612]/15 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#542612]" />
                  <h3 className="font-bold text-lg text-[#542612] dark:text-white">
                    Create Block Manager Credentials
                  </h3>
                </div>
                <button onClick={() => setShowCreateManagerModal(false)} className="p-1 text-[#542612]/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBlockManager} className="space-y-3 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Select Block *
                  </label>
                  {selectedCommunityDetail?.community?.blocksList && selectedCommunityDetail.community.blocksList.length > 0 ? (
                    <select
                      value={mgrBlock}
                      onChange={(e) => setMgrBlock(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                    >
                      {selectedCommunityDetail.community.blocksList.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={mgrBlock}
                      onChange={(e) => setMgrBlock(e.target.value)}
                      placeholder="e.g. Block A"
                      className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Manager Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={mgrName}
                    onChange={(e) => setMgrName(e.target.value)}
                    placeholder="e.g. Anita Roy"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Manager Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={mgrEmail}
                    onChange={(e) => setMgrEmail(e.target.value)}
                    placeholder="blockhead@society.com"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={mgrPhone}
                    onChange={(e) => setMgrPhone(e.target.value)}
                    placeholder="+91 98765 11223"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Flat Number
                  </label>
                  <input
                    type="text"
                    value={mgrFlat}
                    onChange={(e) => setMgrFlat(e.target.value)}
                    placeholder="e.g. 201"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={mgrPassword}
                    onChange={(e) => setMgrPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] border border-[#542612]/20 text-[#542612] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateManagerModal(false)}
                    className="px-4 py-2 rounded-xl bg-[#F7F0DF] font-bold text-[#542612]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#542612] hover:bg-[#63351E] text-white font-bold"
                  >
                    Create Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageContainer>
  );
};

export default AdminDashboard;
