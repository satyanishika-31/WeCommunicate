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

  if (!currentComplaint) return null;

  const timelineSteps = [
    { key: 'PENDING', label: 'Complaint Raised', icon: Clock },
    { key: 'ASSIGNED', label: 'Assigned to Tech', icon: User },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCircle2 },
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
    const res = await complaintService.updateStatus(currentComplaint._id, newStatus);
    if (res.success && res.complaint) {
      setCurrentComplaint(res.complaint);
      if (onUpdateStatus) onUpdateStatus(res.complaint);
    }
    setUpdating(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Complaint Detail & Timeline"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F7F0DF] dark:bg-[#542612]/60 p-4 rounded-2xl border border-[#542612]/15 dark:border-[#F7F0DF]/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge type={currentComplaint.category} size="sm" />
              <Badge type={currentComplaint.status} size="sm" />
            </div>
            <h4 className="font-extrabold text-base text-[#542612] dark:text-white">
              {currentComplaint.title}
            </h4>
            <div className="text-xs text-[#542612]/70 dark:text-[#542612]/60 mt-0.5">
              Raised by {currentComplaint.raisedBy?.name || 'Resident'} • {currentComplaint.block?.name || 'Block A'} ({currentComplaint.house?.houseNumber || 'Flat 203'})
            </div>
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

        {/* Management Controls for Admin & Block Manager */}
        {(role === 'ADMIN' || role === 'BLOCK_MANAGER') && (
          <div className="pt-4 border-t border-[#542612]/15 dark:border-[#F7F0DF]/20 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]/60 dark:text-[#542612]/70">
              Update Status (Manager Control)
            </h5>
            <div className="grid grid-cols-3 gap-2">
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
                Resolve
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
