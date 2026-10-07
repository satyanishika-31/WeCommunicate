import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Filter, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import ComplaintCard from '../components/complaints/ComplaintCard';
import ComplaintDetailModal from '../components/complaints/ComplaintDetailModal';
import RaiseComplaintModal from '../components/complaints/RaiseComplaintModal';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { complaintService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('ALL'); // ALL | MY | PENDING | IN_PROGRESS | RESOLVED
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [raiseModalOpen, setRaiseModalOpen] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    const data = await complaintService.getAll();
    setComplaints(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (filterTab === 'MY' && c.raisedBy?._id !== user?._id) return false;
    if (filterTab !== 'ALL' && filterTab !== 'MY' && c.status !== filterTab) return false;

    return (
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <PageContainer>
      <Header onSearch={(q) => setSearchQuery(q)} />

      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#542612] flex items-center justify-center border border-[#542612]/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Maintenance & Complaints
            </h1>
            <p className="text-sm text-[#542612]/70 dark:text-[#542612]/60">
              Raise maintenance requests and track live progress with complete status timelines
            </p>
          </div>
        </div>

        <Button onClick={() => setRaiseModalOpen(true)} icon={Plus}>
          Raise Complaint
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-[#542612]/20 dark:border-[#F7F0DF]/20 scrollbar-none">
        {[
          { id: 'ALL', label: 'All Society Complaints' },
          { id: 'MY', label: 'My Complaints' },
          { id: 'PENDING', label: 'Pending' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          { id: 'RESOLVED', label: 'Resolved' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              filterTab === tab.id
                ? 'bg-[#542612] dark:bg-[#F7F0DF] text-white dark:text-[#542612] shadow-md'
                : 'bg-[#F5EFE1] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20 dark:border-[#F7F0DF]/30 hover:bg-[#F7F0DF]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List Grid */}
      {filteredComplaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No complaints found"
          description="Everything is running smoothly! Click '+ Raise Complaint' if you need maintenance support."
          action={
            <Button onClick={() => setRaiseModalOpen(true)} size="sm">
              + Raise Complaint
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((comp) => (
            <ComplaintCard
              key={comp._id}
              complaint={comp}
              onClick={(c) => setSelectedComplaint(c)}
            />
          ))}
        </div>
      )}

      {/* Detail Timeline Modal */}
      {selectedComplaint && (
        <ComplaintDetailModal
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          complaint={selectedComplaint}
          onUpdateStatus={fetchComplaints}
        />
      )}

      {/* Raise Modal */}
      <RaiseComplaintModal
        isOpen={raiseModalOpen}
        onClose={() => setRaiseModalOpen(false)}
        onCreated={fetchComplaints}
      />
    </PageContainer>
  );
};

export default Complaints;
