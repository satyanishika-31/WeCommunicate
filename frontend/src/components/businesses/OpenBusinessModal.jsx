import React, { useEffect, useState } from 'react';
import { Store, Plus, Trash2, Upload, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { businessService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';

const categories = [
  { id: 'BAKING', label: 'Home Baking & Cakes' },
  { id: 'TUITION', label: 'Tuition & Coaching' },
  { id: 'TAILORING', label: 'Tailoring & Boutique' },
  { id: 'BEAUTY', label: 'Beauty & Salon' },
  { id: 'FITNESS', label: 'Fitness & Yoga' },
  { id: 'ART', label: 'Art & Handicrafts' },
  { id: 'FOOD', label: 'Home Food & Catering' },
  { id: 'OTHER', label: 'Other Services' },
];

const OpenBusinessModal = ({ isOpen, onClose, onCreated }) => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('BAKING');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState(user?.phone || '');
  const [timings, setTimings] = useState('09:00 AM - 08:00 PM');
  const [services, setServices] = useState([
    { name: 'Custom Cake / Service', price: 500 },
  ]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setContact(user?.phone || '');
    }
  }, [isOpen, user?.phone]);

  const handleAddService = () => {
    setServices([...services, { name: '', price: 0 }]);
  };

  const handleRemoveService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleServiceChange = (index, field, value) => {
    const next = [...services];
    next[index][field] = value;
    setServices(next);
  };

  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 5)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setImages(selectedImages);
    event.target.value = '';
  };

  const removeImage = (index) => {
    setImages((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim() || !description.trim()) return;

    setLoading(true);
    setSubmitError('');
    const formData = new FormData();
    formData.append('businessName', businessName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('contact', contact);
    formData.append('timings', timings);
    formData.append('services', JSON.stringify(services.filter((service) => service.name.trim())));
    images.forEach((image) => formData.append('images', image.file));

    try {
      const res = await businessService.create(formData, user);
      if (!res.success || !res.business) {
        setSubmitError(res.message || 'Unable to register your business.');
        return;
      }

      if (onCreated) onCreated(res.business);
      onClose();
      setBusinessName('');
      setDescription('');
      images.forEach((image) => URL.revokeObjectURL(image.url));
      setImages([]);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || 'Unable to register your business.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Open Your Resident Business">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 custom-scrollbar">
        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Business Name
          </label>
          <input
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Priya's Homemade Bakehouse"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm font-semibold text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your offerings, organic ingredients, experience..."
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Contact Phone
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
              Operating Hours
            </label>
            <input
              type="text"
              value={timings}
              onChange={(e) => setTimings(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>
        </div>

        {/* Services & Prices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider">
              Services & Menu Items
            </label>
            <button
              type="button"
              onClick={handleAddService}
              className="text-xs text-[#542612] dark:text-[#F7F0DF] font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Service
            </button>
          </div>

          <div className="space-y-2">
            {services.map((srv, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={srv.name}
                  onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30"
                />
                <input
                  type="number"
                  placeholder="Price ₹"
                  value={srv.price}
                  onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                  className="w-24 px-3 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30"
                />
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="p-2 text-[#542612] hover:bg-[#F7F0DF] rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider">
              Add Your Work
            </label>
            <span className="text-[11px] text-[#542612]/60 dark:text-[#F7F0DF]/60">
              {images.length}/5 images
            </span>
          </div>
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#542612]/30 bg-[#F7F0DF] px-4 py-3 text-xs font-bold text-[#542612] transition-colors hover:bg-[#EDE2CB] dark:border-[#F7F0DF]/30 dark:bg-[#542612] dark:text-[#F7F0DF]">
            <Upload className="h-4 w-4" />
            Upload photos of your work
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div key={`${image.name}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg">
                  <img src={image.url} alt={`Work sample ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove work sample ${index + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-[#542612] p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {submitError && (
          <p className="text-xs font-semibold text-red-700">{submitError}</p>
        )}

        <div className="pt-3 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={Store}>
            Register Business
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OpenBusinessModal;
