import React, { useEffect, useState } from 'react';
import { Store, Plus, Trash2, Upload, X, Edit3 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { businessService } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { getMediaUrl } from '../../utils/media';

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

const EditBusinessModal = ({ isOpen, onClose, business, onUpdated, onDelete }) => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('OTHER');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [timings, setTimings] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [services, setServices] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (business && isOpen) {
      setBusinessName(business.businessName || '');
      setCategory(business.category || 'OTHER');
      setDescription(business.description || '');
      setContact(business.contact || business.owner?.phone || user?.phone || '');
      setTimings(business.timings || '09:00 AM - 08:00 PM');
      setPriceRange(business.priceRange || '');
      
      const srvList = (business.services && business.services.length > 0)
        ? business.services.map((s) => ({
            name: s.name || '',
            minPrice: s.minPrice !== undefined && s.minPrice !== null ? s.minPrice : (s.price ?? ''),
            maxPrice: s.maxPrice !== undefined && s.maxPrice !== null && s.maxPrice !== s.minPrice && s.maxPrice !== s.price ? s.maxPrice : '',
            price: s.price ?? '',
          }))
        : [{ name: '', minPrice: '', maxPrice: '', price: '' }];
      setServices(srvList);

      setExistingImages(business.images || []);
      setNewImages([]);
      setSubmitError('');
    }
  }, [business, isOpen, user?.phone]);

  const handleAddService = () => {
    setServices([...services, { name: '', minPrice: '', maxPrice: '', price: '' }]);
  };

  const handleRemoveService = (index) => {
    const remaining = services.filter((_, i) => i !== index);
    setServices(remaining.length > 0 ? remaining : [{ name: '', minPrice: '', maxPrice: '', price: '' }]);
  };

  const handleServiceChange = (index, field, value) => {
    const next = [...services];
    next[index][field] = value;
    if (field === 'minPrice') {
      next[index].price = value;
    }
    setServices(next);
  };

  const handleNewImageChange = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type && file.type.startsWith('image/'));
    if (!files.length) return;

    const currentTotal = existingImages.length + newImages.length;
    const remainingSlots = 5 - currentTotal;
    if (remainingSlots <= 0) {
      alert('You can have a maximum of 5 images in total.');
      event.target.value = '';
      return;
    }

    const added = files.slice(0, remainingSlots).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...added]);
    event.target.value = '';
  };

  const removeExistingImage = (index) => {
    setExistingImages((current) => current.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages((current) => {
      URL.revokeObjectURL(current[index].url);
      return current.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim() || !description.trim()) {
      setSubmitError('Business name and description are required.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    const cleanedServices = services
      .filter((s) => s.name && s.name.trim())
      .map((s) => {
        const rawMin = s.minPrice !== '' && s.minPrice !== undefined ? s.minPrice : s.price;
        const rawMax = s.maxPrice;

        const numMin = rawMin !== '' && rawMin !== undefined && !isNaN(Number(rawMin)) ? Number(rawMin) : 0;
        const numMax = rawMax !== '' && rawMax !== undefined && !isNaN(Number(rawMax)) ? Number(rawMax) : null;

        const hasRange = numMax !== null && numMax > numMin;
        const formatted = hasRange ? `₹${numMin} - ₹${numMax}` : (numMin > 0 ? `₹${numMin}` : '');

        return {
          name: s.name.trim(),
          price: numMin,
          minPrice: numMin,
          maxPrice: hasRange ? numMax : numMin,
          priceRange: formatted,
        };
      });

    let finalPriceRange = priceRange.trim();
    if (!finalPriceRange && cleanedServices.length > 0) {
      const minVals = cleanedServices.map((s) => s.minPrice).filter((p) => p > 0);
      const maxVals = cleanedServices.map((s) => s.maxPrice).filter((p) => p > 0);
      if (minVals.length > 0) {
        const lowest = Math.min(...minVals);
        const highest = maxVals.length > 0 ? Math.max(...maxVals) : lowest;
        finalPriceRange = lowest === highest ? `₹${lowest}` : `₹${lowest} - ₹${highest}`;
      }
    }

    const formData = new FormData();
    formData.append('businessName', businessName.trim());
    formData.append('category', category);
    formData.append('description', description.trim());
    formData.append('contact', contact.trim());
    formData.append('timings', timings.trim());
    if (finalPriceRange) {
      formData.append('priceRange', finalPriceRange);
    }
    formData.append('services', JSON.stringify(cleanedServices));
    formData.append('existingImages', JSON.stringify(existingImages));
    newImages.forEach((img) => formData.append('images', img.file));

    try {
      const res = await businessService.update(business._id, formData);
      if (!res.success || !res.business) {
        setSubmitError(res.message || 'Unable to update your business.');
        return;
      }

      newImages.forEach((img) => URL.revokeObjectURL(img.url));
      if (onUpdated) onUpdated(res.business);
      onClose();
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || 'Unable to update your business.');
    } finally {
      setLoading(false);
    }
  };

  const totalImagesCount = existingImages.length + newImages.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Business Details">
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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider">
              Overall Price Range (Optional)
            </label>
            <span className="text-[11px] text-[#542612]/60 dark:text-[#F7F0DF]/60">
              Auto-calculated from items if blank
            </span>
          </div>
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. ₹300 – ₹2,500"
            className="w-full px-4 py-2.5 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
          />
        </div>

        {/* Services & Prices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider block">
                Services & Menu Items
              </label>
              <span className="text-[11px] text-[#542612]/70 dark:text-[#F7F0DF]/70">
                Add fixed price (Min only) or price range (Min – Max)
              </span>
            </div>
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
              <div
                key={idx}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-[#F7F0DF]/40 dark:bg-[#542612]/30 border border-[#542612]/10 dark:border-[#F7F0DF]/20"
              >
                <input
                  type="text"
                  placeholder="Service / Item Name"
                  value={srv.name}
                  onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
                />
                <div className="flex items-center gap-1.5">
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#542612]/50 dark:text-[#F7F0DF]/50">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Min / Price"
                      value={srv.minPrice !== undefined && srv.minPrice !== null ? srv.minPrice : (srv.price ?? '')}
                      onChange={(e) => handleServiceChange(idx, 'minPrice', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#542612]/40 dark:text-[#F7F0DF]/40">
                    –
                  </span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#542612]/50 dark:text-[#F7F0DF]/50">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max (opt)"
                      value={srv.maxPrice !== undefined && srv.maxPrice !== null ? srv.maxPrice : ''}
                      onChange={(e) => handleServiceChange(idx, 'maxPrice', e.target.value)}
                      className="w-full pl-6 pr-2 py-2 rounded-xl bg-[#F7F0DF] dark:bg-[#542612] text-xs text-[#542612] dark:text-white border border-[#542612]/20 dark:border-[#F7F0DF]/30 focus:outline-none focus:ring-2 focus:ring-[#542612]"
                    />
                  </div>
                  {services.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Photos & Work Gallery */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider">
              Photos & Work Gallery
            </label>
            <span className="text-[11px] text-[#542612]/60 dark:text-[#F7F0DF]/60">
              {totalImagesCount}/5 images
            </span>
          </div>

          {/* Upload Button */}
          {totalImagesCount < 5 && (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#542612]/30 bg-[#F7F0DF] px-4 py-3 text-xs font-bold text-[#542612] transition-colors hover:bg-[#EDE2CB] dark:border-[#F7F0DF]/30 dark:bg-[#542612] dark:text-[#F7F0DF]">
              <Upload className="h-4 w-4" />
              Add more photos of your work
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleNewImageChange}
                className="hidden"
              />
            </label>
          )}

          {/* Image Previews */}
          {totalImagesCount > 0 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {existingImages.map((imgUrl, index) => (
                <div key={`existing-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border border-[#542612]/20">
                  <img src={getMediaUrl(imgUrl)} alt={`Existing photo ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-red-600 p-1 text-white opacity-80 hover:opacity-100 transition-opacity"
                    title="Delete existing photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {newImages.map((image, index) => (
                <div key={`new-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-[#542612]">
                  <img src={image.url} alt={`New upload ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    aria-label={`Remove new photo ${index + 1}`}
                    className="absolute right-1 top-1 rounded-full bg-[#542612] p-1 text-white opacity-80 hover:opacity-100 transition-opacity"
                    title="Remove newly added photo"
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

        <div className="pt-3 flex items-center justify-between gap-3">
          {onDelete && business?._id ? (
            <button
              type="button"
              onClick={() => onDelete(business._id)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Business
            </button>
          ) : <div />}

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={Edit3}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditBusinessModal;
