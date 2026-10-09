import React, { useState } from 'react';
import { Upload, Wrench } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { complaintService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const categories = [
  'WATER',
  'ELECTRICITY',
  'LIFT',
  'CLEANING',
  'SECURITY',
  'PARKING',
  'MAINTENANCE',
  'OTHER',
];

const intakeRoutes = [
  { id: 'RESIDENT_APP', label: 'Resident App (Direct)' },
  { id: 'SECURITY_GUARD', label: 'Security Guard Intake (Gate)' },
  { id: 'PHONE_ESCALATION', label: 'Phone Call to Committee' },
  { id: 'OFFICE_REGISTER', label: 'Physical Register Book' },
];

const RaiseComplaintModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WATER');
  const [description, setDescription] = useState('');
  const [intakeRoute, setIntakeRoute] = useState('RESIDENT_APP');
  const [flatNumber, setFlatNumber] = useState(user?.houseNumber || 'A-101');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    const res = await complaintService.create(
      { title, category, description, intakeRoute, flatNumber },
      user
    );
    setLoading(false);

    if (res.success && res.complaint) {
      if (onCreated) onCreated(res.complaint);
      onClose();
      setTitle('');
      setDescription('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register Maintenance Ticket">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs sm:text-sm font-semibold text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Reporting Channel / Route
            </label>
            <select
              value={intakeRoute}
              onChange={(e) => setIntakeRoute(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs sm:text-sm font-semibold text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            >
              {intakeRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Flat / Unit Number
          </label>
          <input
            type="text"
            required
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
            placeholder="e.g. Block B - 402"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs sm:text-sm text-[#542612] dark:text-white placeholder-[#542612]/50 border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Complaint Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lift in Block A making strange noise"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white placeholder-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Detailed Description
          </label>
          <textarea
            rows={4}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue location, floor number, and urgency..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white placeholder-[#542612] border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        {/* Drag & Drop Photo Area */}
        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Attach Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-[#542612]/20 dark:border-[#F7F0DF]/30 hover:border-[#542612] dark:hover:border-[#F7F0DF] rounded-2xl p-6 text-center bg-[#F7F0DF]/50 dark:bg-[#542612]/30 cursor-pointer transition-colors">
            <Upload className="w-8 h-8 text-[#542612] mx-auto mb-2" />
            <span className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] block">
              Drag & drop photos or browse
            </span>
            <span className="text-[11px] text-[#542612]/60 block mt-1">
              Supports JPG, PNG up to 5MB
            </span>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Wrench}>
            Submit Complaint
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RaiseComplaintModal;
