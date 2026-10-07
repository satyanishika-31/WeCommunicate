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

const AdminDashboard = () => {
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
  const [commBlocks, setCommBlocks] = useState('4');
  const [commFlats, setCommFlats] = useState('120');
  const [commManager, setCommManager] = useState('');

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

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!commName) return;
    await metaService.addCommunity({
      name: commName,
      location: commLocation,
      code: commCode || ('COMM-' + Math.floor(100 + Math.random() * 900)),
      totalBlocks: commBlocks,
      totalFlats: commFlats,
      managerName: commManager || 'Assigned Manager',
    });
    setCommName('');
    setCommLocation('');
    setCommCode('');
    setShowAddCommModal(false);
    fetchData();
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
                  className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/20 shadow-sm hover:shadow-md transition-shadow relative space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#542612] text-[#F7F0DF] flex items-center justify-center font-bold text-lg shadow-sm">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#542612] dark:text-white">
                          {comm.name}
                        </h3>
                        <span className="text-xs text-[#542612]/70 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#542612]" />
                          {comm.location || 'Central Sector'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCommunity(comm._id, comm.name)}
                      title="Delete Community"
                      className="p-2 text-[#542612]/60 hover:text-[#542612] hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Information Details Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F7F0DF] dark:bg-[#542612]/60 p-3 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Code</span>
                      <span className="font-bold text-[#542612] dark:text-white">{comm.code}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Blocks</span>
                      <span className="font-bold text-[#542612] dark:text-white">{comm.totalBlocks} Towers</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#542612]/60 font-bold block uppercase">Flats</span>
                      <span className="font-bold text-[#542612] dark:text-white">{comm.totalFlats} Units</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20">
                    <span className="text-[#542612]/70">
                      Assigned Manager: <strong className="text-[#542612] dark:text-[#F7F0DF]">{comm.managerName || 'Vikramaditya Das'}</strong>
                    </span>
                    <span className="text-[10px] text-[#542612] font-bold bg-[#542612]/10 px-2 py-0.5 rounded-md">
                      Active Community
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                      Total Blocks
                    </label>
                    <input
                      type="number"
                      value={commBlocks}
                      onChange={(e) => setCommBlocks(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                      Total Flats
                    </label>
                    <input
                      type="number"
                      value={commFlats}
                      onChange={(e) => setCommFlats(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Assigned Community Manager Name
                  </label>
                  <input
                    type="text"
                    value={commManager}
                    onChange={(e) => setCommManager(e.target.value)}
                    placeholder="e.g. Vikramaditya Das"
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
                    className="px-5 py-2.5 rounded-xl bg-[#542612] hover:bg-[#542612] text-white font-bold transition-colors"
                  >
                    Create Community
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
