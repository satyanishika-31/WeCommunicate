import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, Wrench, Plus, Trash2, X, UserPlus, Phone, Mail } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Header from '../../components/layout/Header';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import ComplaintCard from '../../components/complaints/ComplaintCard';
import ComplaintDetailModal from '../../components/complaints/ComplaintDetailModal';
import { useAuth } from '../../context/AuthContext';
import { metaService, complaintService } from '../../api/services';

const BlockManagerDashboard = () => {
  const { user } = useAuth();
  const [blockResidents, setBlockResidents] = useState([]);
  const [blockComplaints, setBlockComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Add User Modal State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userFlat, setUserFlat] = useState('');
  const [userResidentType, setUserResidentType] = useState('OWNER');

  const myBlockName = user?.block?.name || 'Emerald Tower (Block A)';

  const fetchData = async () => {
    setLoading(true);
    const [uList, cList] = await Promise.all([
      metaService.getUsers(),
      complaintService.getAll(),
    ]);

    setBlockResidents(uList || []);
    setBlockComplaints(cList || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    await metaService.addUser({
      name: userName,
      email: userEmail,
      phone: userPhone || '+91 98765 00000',
      houseNumber: userFlat || 'A-101',
      residentType: userResidentType,
      role: 'USER',
      blockName: myBlockName,
    });

    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserFlat('');
    setShowAddUserModal(false);
    fetchData();
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete resident "${name}"?`)) {
      await metaService.deleteUser(id);
      fetchData();
    }
  };

  return (
    <PageContainer>
      <Header />

      <div className="space-y-6 font-sans">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#542612] via-[#63351E] to-[#542612] text-white p-6 lg:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#542612]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#542612]/20 text-[#F7F0DF] border border-[#542612]/30 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight">
                Community Manager Desk — {myBlockName}
              </h1>
              <p className="text-xs text-[#F7F0DF]">
                Overseeing community residents, adding/deleting users, and resolving maintenance issues
              </p>
            </div>
          </div>
          <Badge type="BLOCK_MANAGER" size="md" />
        </div>

        {/* Complaints in My Block */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-[#542612] dark:text-white flex items-center gap-2 font-serif">
              <Wrench className="w-5 h-5 text-[#542612]" />
              Complaints Logged in {myBlockName}
            </h3>
            <span className="text-xs font-bold text-[#542612]/60">
              {blockComplaints.length} Total
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blockComplaints.map((comp) => (
              <ComplaintCard
                key={comp._id}
                complaint={comp}
                onClick={(c) => setSelectedComplaint(c)}
              />
            ))}
          </div>
        </div>

        {/* Resident Management (Add & Delete Users) */}
        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-[#542612] dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#542612]" />
                Community User Management Directory
              </h3>
              <p className="text-xs text-[#542612]/70">
                As a Community Manager, you can add new residents or remove existing users.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#542612] hover:bg-[#542612] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Add Resident / User
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {blockResidents.map((res) => (
              <motion.div
                key={res._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612]/60 border border-[#542612]/15 dark:border-[#F7F0DF]/20 flex items-center justify-between text-xs group hover:border-[#542612]/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={res.profileImage} name={res.name} size="md" />
                  <div className="min-w-0">
                    <span className="font-bold text-[#542612] dark:text-white block truncate text-sm">
                      {res.name}
                    </span>
                    <span className="text-[#542612] font-semibold block">
                      Flat {res.house?.houseNumber || 'A-101'}
                    </span>
                    <span className="text-[10px] text-[#542612]/60 block truncate">
                      {res.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteUser(res._id, res.name)}
                  title="Delete Resident User"
                  className="p-2 text-[#542612]/60 hover:text-[#542612] hover:bg-[#F7F0DF] dark:hover:bg-[#542612]/40 rounded-xl transition-colors shrink-0 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Add User */}
      <AnimatePresence>
        {showAddUserModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#F5EFE1] dark:bg-[#542612] w-full max-w-md rounded-3xl p-6 border border-[#542612]/20 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#542612]/15 dark:border-[#F7F0DF]/20 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#542612]" />
                  <h3 className="font-bold text-lg text-[#542612] dark:text-white">
                    Add New Community Resident
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="p-1 text-[#542612]/60 hover:text-[#542612] dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Resident Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="vikram@community.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                      Flat / House Unit
                    </label>
                    <input
                      type="text"
                      value={userFlat}
                      onChange={(e) => setUserFlat(e.target.value)}
                      placeholder="e.g. A-104"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1">
                    Resident Type
                  </label>
                  <select
                    value={userResidentType}
                    onChange={(e) => setUserResidentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 text-[#542612] dark:text-white focus:outline-none focus:border-[#542612]"
                  >
                    <option value="OWNER">Owner</option>
                    <option value="TENANT">Tenant</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#542612] hover:bg-[#542612] text-white font-bold transition-colors"
                  >
                    Add Resident
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Timeline Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
          onUpdateStatus={fetchData}
        />
      )}
    </PageContainer>
  );
};

export default BlockManagerDashboard;
