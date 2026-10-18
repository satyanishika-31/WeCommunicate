import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Megaphone,
  Calendar,
  Store,
  MessageSquare,
  Upload,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import Button from '../components/common/Button';
import { postService } from '../api/services';

const types = [
  { id: 'NOTICE', label: 'Official Notice', icon: Megaphone, desc: 'Water outage, maintenance, society updates' },
  { id: 'EVENT', label: 'Community Event', icon: Calendar, desc: 'Festivals, meetings, sports & workshops' },
  { id: 'BUSINESS', label: 'Resident Business', icon: Store, desc: 'Home baked goodies, tuition, services' },
  { id: 'GENERAL', label: 'Community Post', icon: MessageSquare, desc: 'Discussion, lost & found, neighbor help' },
];

const CreatePost = () => {
  const navigate = useNavigate();

  const [type, setType] = useState('GENERAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isUrgent, setIsUrgent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sample stock photos for quick drag-drop demonstration
  const stockImages = [
    'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
  ];

  useEffect(() => {
    return () => {
      if (imageFile) URL.revokeObjectURL(imageFile.previewUrl);
    };
  }, [imageFile]);

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.alert('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      window.alert('Image must be 5 MB or smaller.');
      event.target.value = '';
      return;
    }

    setImageFile(Object.assign(file, { previewUrl: URL.createObjectURL(file) }));
    setImageUrl('');
    event.target.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setSubmitError('Title and description are required.');
      return;
    }

    setLoading(true);
    setSubmitError('');
    try {
      const postData = imageFile ? new FormData() : {
        type,
        title,
        description,
        image: imageUrl.trim() ? imageUrl : null,
        isUrgent: type === 'NOTICE' ? isUrgent : false,
      };

      if (imageFile) {
        postData.append('type', type);
        postData.append('title', title);
        postData.append('description', description);
        postData.append('isUrgent', type === 'NOTICE' ? String(isUrgent) : 'false');
        postData.append('image', imageFile);
      }

      const res = await postService.create(postData);
      if (res.success) {
        navigate('/home');
      } else {
        setSubmitError(res.message || 'Failed to publish post.');
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <Header />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#542612]/70 hover:text-[#542612] dark:hover:text-[#F7F0DF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="bg-[#F5EFE1] dark:bg-[#542612] rounded-3xl p-6 lg:p-8 border border-[#542612]/15 dark:border-[#F7F0DF]/20 shadow-xl space-y-6">
          <div className="border-b border-[#542612]/10 dark:border-[#F7F0DF]/10 pb-4">
            <h1 className="font-serif text-2xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              What would you like to share?
            </h1>
            <p className="text-xs text-[#542612]/70 dark:text-[#F7F0DF]/80 mt-1">
              Select post category and share updates with your society neighbors
            </p>
          </div>

          {/* Type Selector Grid */}
          <div className="grid grid-cols-2 gap-3">
            {types.map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setType(item.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#542612] bg-[#F7F0DF]/30 dark:bg-[#542612] shadow-sm'
                      : 'border-[#542612]/10 dark:border-[#F7F0DF]/20 hover:border-[#542612]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#542612] text-white' : 'bg-[#F7F0DF] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#542612] dark:text-[#F7F0DF] font-bold" />}
                  </div>
                  <h4 className="font-extrabold text-sm text-[#542612] dark:text-white">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-[#542612]/70 dark:text-[#F7F0DF]/70 mt-0.5 line-clamp-1">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Post Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
                Post Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lost puppy found near Block A playground"
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white placeholder-[#542612]/40 border border-[#542612]/20 dark:border-[#F7F0DF]/20 focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider mb-1.5">
                Description
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Share full details, timings, contact info..."
                className="w-full px-4 py-3 rounded-2xl bg-[#F7F0DF] dark:bg-[#542612] text-sm text-[#542612] dark:text-white placeholder-[#542612]/40 border border-[#542612]/20 dark:border-[#F7F0DF]/20 focus:outline-none focus:ring-2 focus:ring-[#542612]"
              />
            </div>

            {/* Drag and Drop Image Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#542612] dark:text-[#F7F0DF] uppercase tracking-wider">
                  Photo Attachment (Optional)
                </label>
                {(imageUrl || imageFile) && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImageFile(null);
                    }}
                    className="text-xs text-[#542612] underline hover:text-[#542612]"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <div className="border-2 border-dashed border-[#542612]/20 dark:border-[#F7F0DF]/20 hover:border-[#542612] rounded-2xl p-5 text-center bg-[#F7F0DF]/60 dark:bg-[#542612]/40">
                <Upload className="w-8 h-8 text-[#542612] dark:text-[#F7F0DF] mx-auto mb-2" />
                <span className="text-xs font-bold text-[#542612] dark:text-[#F7F0DF] block">
                  {imageFile || imageUrl ? 'Photo selected! Click below to change or remove' : 'No photo attached. Select a photo below (optional):'}
                </span>

                <label className="inline-flex items-center gap-2 mt-3 px-3 py-2 text-xs font-bold rounded-xl bg-[#542612] text-white cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  Upload from device
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="sr-only"
                  />
                </label>

                {imageFile && (
                  <img
                    src={imageFile.previewUrl}
                    alt="Selected upload preview"
                    className="w-full max-h-48 object-cover rounded-xl mt-3"
                  />
                )}

                {/* Stock Image Presets */}
                <div className="flex justify-center items-center gap-2 mt-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl('');
                      setImageFile(null);
                    }}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${
                      !imageUrl && !imageFile ? 'bg-[#542612] text-white border-[#542612]' : 'bg-[#F5EFE1] text-[#542612] border-[#542612]/25'
                    }`}
                  >
                    No Image
                  </button>
                  {stockImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Preset"
                      onClick={() => {
                        setImageUrl(img);
                        setImageFile(null);
                      }}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        imageUrl === img && !imageFile ? 'border-[#542612] scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {type === 'NOTICE' && (
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded cursor-pointer"
                />
                <label htmlFor="urgentNotice" className="text-xs font-bold text-red-700 dark:text-red-300 cursor-pointer">
                  Mark as URGENT Broadcast (Triggers delivery confirmation requirement & alert banner)
                </label>
              </div>
            )}

            <div className="pt-3 flex justify-end gap-3">
              {submitError && (
                <p className="mr-auto self-center text-xs font-semibold text-red-700 dark:text-red-300">
                  {submitError}
                </p>
              )}
              <Button variant="secondary" onClick={() => navigate('/home')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading} icon={Sparkles}>
                Publish to Community
              </Button>
            </div>
          </form>
        </div>
      </div>
    </PageContainer>
  );
};

export default CreatePost;
