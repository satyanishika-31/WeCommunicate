import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Wrench, ShieldAlert, ArrowRight, User } from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { complaintService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const ComplaintDetailModal = ({ isOpen, onClose, complaint, onUpdateStatus }) => {
  const { role } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState(complaint);
  const [assignedHandlerInput, setAssignedHandlerInput] = useState(complaint?.assignedHandlerName || '');
  const [resolutionNotesInput, setResolutionNotesInput] = useState(complaint?.resolutionNotes || '');

  if (!currentComplaint) return null;

  const timelineSteps = [
    { key: 'PENDING', label: 'Complaint Raised & Logged', icon: Clock },
    { key: 'ASSIGNED', label: 'Assigned to Technician', icon: User },
    { key: 'IN_PROGRESS', label: 'In Progress / Servicing', icon: Wrench },
    { key: 'RESOLVED', label: 'Issue Resolved & Verified', icon: CheckCircle2 },
  ];

  const getStepIndex = (st) => {
    switch (st) {
      case 'PENDING': return 0;
      case 'ASSIGNED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'RESOLVED': return 3;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentComplaint.status);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    const res = await complaintService.updateStatus(currentComplaint._id, {
      status: newStatus,
      assignedHandlerName: assignedHandlerInput,
      resolutionNotes: resolutionNotesInput,
    });
    if (res.success && res.complaint) {
      setCurrentComplaint(res.complaint);
      if (onUpdateStatus) onUpdateStatus(res.complaint);
    }
    setUpdating(false);
  };

  const routeLabel = {
    RESIDENT_APP: 'Resident App (Direct)',
    SECURITY_GUARD: 'Gate Guard Intake Desk',
    PHONE_ESCALATION: 'Direct Phone Call to Committee',
    OFFICE_REGISTER: 'Physical Office Register',
    OTHER: 'General Channel',
  }[currentComplaint.intakeRoute] || 'Resident App';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Maintenance Ticket & Status Pipeline"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 font-sans">
        {/* Header Summary */}
        <div className="bg-[#F7F0DF] dark:bg-[#542612]/60 p-4 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-[#542612] text-white shadow-xs">
                {currentComplaint.ticketId || `#CMP-${currentComplaint._id?.slice(-4)}`}
              </span>
              <Badge type={currentComplaint.category} size="sm" />
              <Badge type={currentComplaint.status} size="sm" />
            </div>

            <span className="text-[11px] font-bold text-[#542612]/70 dark:text-[#F7F0DF]/80 bg-[#542612]/10 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
              Route: {routeLabel}
            </span>
          </div>

          <h4 className="font-extrabold text-base sm:text-lg text-[#542612] dark:text-white">
            {currentComplaint.title}
          </h4>

          <div className="text-xs text-[#542612]/70 dark:text-[#F7F0DF]/70">
            Unit: <strong>{currentComplaint.flatNumber || currentComplaint.house?.houseNumber || 'Flat 203'}</strong> • Raised by {currentComplaint.raisedBy?.name || 'Resident'}
          </div>
        </div>

        {/* Complaint Description */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#542612]/70 mb-2">
            Issue Description
          </h5>
          <p className="text-sm text-[#542612] dark:text-[#F7F0DF] leading-relaxed bg-[#F5EFE1] dark:bg-[#542612] p-4 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20">
            {currentComplaint.description}
          </p>
        </div>

        {/* PROGRESSIVE TIMELINE ANIMATION */}
        <div>
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#542612]/70 mb-4">
            Resolution Timeline
          </h5>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#F7F0DF] dark:before:bg-[#542612]">
            {timelineSteps.map((step, idx) => {
              const isCompleted = idx <= currentIndex;
              const isCurrent = idx === currentIndex;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative flex items-start gap-4"
                >
                  {/* Circle Indicator */}
                  <motion.div
                    animate={isCurrent ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold z-10 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-[#542612] to-[#542612] ring-4 ring-[#F7F0DF] dark:ring-[#542612]/60'
                        : 'bg-[#542612] dark:bg-[#542612]'
                    }`}
                  >
                    {isCompleted ? '✓' : idx + 1}
                  </motion.div>

                  <div
                    className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-[#F7F0DF]/70 dark:bg-[#542612]/40 border-[#F7F0DF] dark:border-[#542612]/80 shadow-sm'
                        : isCompleted
                        ? 'bg-[#F5EFE1] dark:bg-[#542612] border-[#542612]/15 dark:border-[#F7F0DF]/20'
                        : 'bg-[#F7F0DF]/50 dark:bg-[#542612]/30 border-dashed border-[#542612]/20 dark:border-[#F7F0DF]/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isCompleted ? 'text-[#542612] dark:text-[#F7F0DF]' : 'text-[#542612]/60'}`} />
                        <span className={`font-bold text-xs ${isCompleted ? 'text-[#542612] dark:text-white' : 'text-[#542612]/70'}`}>
                          {step.label}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#542612] text-white">
                          Current Stage
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Technician Handler & Resolution Details Display */}
        {(currentComplaint.assignedHandlerName || currentComplaint.resolutionNotes) && (
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300/60 dark:border-emerald-800/40 space-y-1.5 text-xs">
            {currentComplaint.assignedHandlerName && (
              <div className="font-bold text-emerald-800 dark:text-emerald-300">
                🛠️ Assigned Technician / Team: <span className="underline">{currentComplaint.assignedHandlerName}</span>
              </div>
            )}
            {currentComplaint.resolutionNotes && (
              <div className="text-emerald-700 dark:text-emerald-400">
                ✅ Resolution Log: <em>"{currentComplaint.resolutionNotes}"</em>
              </div>
            )}
          </div>
        )}

        {/* Management Controls for Admin & Block Manager */}
        {(role === 'ADMIN' || role === 'BLOCK_MANAGER') && (
          <div className="pt-4 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#542612]/70">
              Update Status & Resolution Log (Manager Control)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#542612]/70 dark:text-[#F7F0DF]/70 mb-1">
                  Assigned Staff / Vendor
                </label>
                <input
                  type="text"
                  value={assignedHandlerInput}
                  onChange={(e) => setAssignedHandlerInput(e.target.value)}
                  placeholder="e.g. Ramesh - Lift Tech"
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#542612]/70 dark:text-[#F7F0DF]/70 mb-1">
                  Resolution Notes / Work Performed
                </label>
                <input
                  type="text"
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  placeholder="e.g. Sensor replaced, inspected"
                  className="w-full px-3 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <Button
                variant={currentComplaint.status === 'PENDING' ? 'primary' : 'secondary'}
                size="sm"
                loading={updating}
                onClick={() => handleStatusChange('PENDING')}
              >
                Mark Pending
              </Button>
              <Button
                variant={currentComplaint.status === 'IN_PROGRESS' ? 'primary' : 'secondary'}
                size="sm"
                loading={updating}
                onClick={() => handleStatusChange('IN_PROGRESS')}
              >
                In Progress
              </Button>
              <Button
                variant={currentComplaint.status === 'RESOLVED' ? 'primary' : 'secondary'}
                size="sm"
                loading={updating}
                onClick={() => handleStatusChange('RESOLVED')}
              >
                Resolve & Log
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
