import React, { useState, useEffect } from 'react';
import { Store, Plus, Search, Tag, Phone, Star, MessageSquare, Send } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import BusinessCard from '../components/businesses/BusinessCard';
import OpenBusinessModal from '../components/businesses/OpenBusinessModal';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { businessService } from '../api/services';
import { useAuth } from '../context/AuthContext';

const categories = [
  { id: 'ALL', label: 'All Services 🏪' },
  { id: 'BAKING', label: 'Home Bakers 🧁' },
  { id: 'TUITION', label: 'Tutors & Coaching 📚' },
  { id: 'TAILORING', label: 'Tailors & Fashion 🧵' },
  { id: 'BEAUTY', label: 'Beauty Services 💄' },
  { id: 'FITNESS', label: 'Fitness Trainers 🏋️' },
  { id: 'ART', label: 'Artists & Crafts 🎨' },
  { id: 'FOOD', label: 'Food & Catering 🍱' },
];

const Businesses = () => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [openModal, setOpenModal] = useState(false);
  const [viewBusiness, setViewBusiness] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    const data = await businessService.getAll();
    setBusinesses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleAddReview = async (event) => {
    event.preventDefault();
    if (!viewBusiness || !reviewComment.trim()) {
      setReviewError('Please add a comment before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');
    const result = await businessService.addReview(
      viewBusiness._id,
      { rating: reviewRating, comment: reviewComment.trim() },
      user
    );
    setIsSubmittingReview(false);

    if (!result.success) {
      setReviewError(result.message || 'Unable to add your review.');
      return;
    }

    setViewBusiness(result.business);
    setBusinesses((current) =>
      current.map((business) => business._id === result.business._id ? result.business : business)
    );
    setReviewComment('');
    setReviewRating(5);
  };

  const filteredBusinesses = businesses.filter((b) => {
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory;
    const matchesQuery =
      !searchQuery ||
      b.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner?.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCat && matchesQuery;
  });

  return (
    <PageContainer>
      <Header onSearch={(q) => setSearchQuery(q)} />

      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#542612]/10 text-[#542612] dark:text-[#542612] flex items-center justify-center border border-[#542612]/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#542612] dark:text-white tracking-tight">
              Discover Businesses in Your Community
            </h1>
            <p className="text-sm text-[#542612]/70 dark:text-[#542612]/60">
              Support home-run ventures, tutors, bakers, and fitness trainers right in your society
            </p>
          </div>
        </div>

        <Button
          onClick={() => setOpenModal(true)}
          icon={Plus}
          className="bg-gradient-to-r from-[#542612] via-[#542612] to-[#542612] hover:from-[#542612] hover:to-[#542612] border-[#542612]/30"
        >
          Open Your Business
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#542612] text-white shadow-md shadow-[#542612]/20'
                : 'bg-[#F5EFE1] dark:bg-[#542612] text-[#542612] dark:text-[#F7F0DF] border border-[#542612]/20 dark:border-[#F7F0DF]/30 hover:bg-[#F7F0DF]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Business Cards Grid */}
      {filteredBusinesses.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No businesses found"
          description="Be the first resident to list a business or home service in this category!"
          action={
            <Button onClick={() => setOpenModal(true)} size="sm">
              + Register Business
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((b) => (
            <BusinessCard
              key={b._id}
              business={b}
              onClick={(bItem) => setViewBusiness(bItem)}
            />
          ))}
        </div>
      )}

      {/* Business Detail Drawer / Modal */}
      {viewBusiness && (
        <Modal
          isOpen={!!viewBusiness}
          onClose={() => setViewBusiness(null)}
          title={viewBusiness.businessName}
        >
          <div className="space-y-5">
            {/* Header Image */}
            {viewBusiness.images && viewBusiness.images.length > 0 && (
              <img
                src={viewBusiness.images[0]}
                alt={viewBusiness.businessName}
                className="w-full h-48 rounded-2xl object-cover"
              />
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={viewBusiness.owner?.profileImage}
                  name={viewBusiness.owner?.name}
                  size="md"
                />
                <div>
                  <h4 className="font-bold text-sm text-[#542612] dark:text-white">
                    {viewBusiness.owner?.name || 'Resident Owner'}
                  </h4>
                  <span className="text-xs text-[#542612]/70">
                    {viewBusiness.owner?.house || 'Block B'} • {viewBusiness.timings || '09 AM - 08 PM'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-bold text-[#542612] bg-[#F7F0DF] dark:bg-[#542612]/40 px-3 py-1 rounded-xl text-xs">
                <Star className="w-3.5 h-3.5 fill-[#542612]" />
                <span>{viewBusiness.rating || 4.9}</span>
                <span className="font-medium text-[#542612]/60">
                  ({viewBusiness.reviewsCount || 0})
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#542612] dark:text-[#F7F0DF] leading-relaxed bg-[#F7F0DF] dark:bg-[#542612]/50 p-4 rounded-2xl">
              {viewBusiness.description}
            </p>

            {/* Services List */}
            {viewBusiness.services && viewBusiness.services.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]/60 mb-2">
                  Available Services & Pricing
                </h5>
                <div className="space-y-2">
                  {viewBusiness.services.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F5EFE1] dark:bg-[#542612] border border-[#542612]/15 dark:border-[#F7F0DF]/30/60 text-xs font-semibold"
                    >
                      <span className="text-[#542612] dark:text-[#F7F0DF]">
                        {s.name}
                      </span>
                      <span className="text-[#542612] dark:text-[#F7F0DF] font-extrabold">
                        {s.price ? `₹${s.price}` : 'Quote on request'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#542612]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#542612]">
                  Reviews & Comments
                </h5>
              </div>

              {(viewBusiness.reviews || []).length === 0 ? (
                <p className="text-xs text-[#542612]/60">No comments yet. Be the first to review this business.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {viewBusiness.reviews.map((review) => (
                    <div key={review._id} className="rounded-xl bg-[#F5EFE1] p-3 border border-[#542612]/10">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#542612]">
                          {review.author?.name || 'Resident'}
                        </span>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-[#542612]">
                          <Star className="w-3 h-3 fill-[#542612]" />
                          {review.rating}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#542612]/75">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleAddReview} className="space-y-3 border-t border-[#542612]/10 pt-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#542612]">
                Leave a rating and comment
              </label>
              <div className="flex items-center gap-1" aria-label="Choose a rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    aria-label={`${rating} star${rating === 1 ? '' : 's'}`}
                    onClick={() => setReviewRating(rating)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${rating <= reviewRating ? 'fill-[#542612] text-[#542612]' : 'text-[#542612]/30'}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="w-full rounded-xl border border-[#542612]/20 bg-[#F5EFE1] px-3 py-2 text-xs text-[#542612] placeholder:text-[#542612]/50 focus:outline-none focus:ring-2 focus:ring-[#542612]/30"
              />
              {reviewError && <p className="text-xs font-semibold text-red-700">{reviewError}</p>}
              <Button
                type="submit"
                icon={Send}
                loading={isSubmittingReview}
                size="sm"
                className="w-full"
              >
                Post Review
              </Button>
            </form>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="primary"
                icon={Phone}
                className="w-full"
                onClick={() =>
                  alert(`Contacting ${viewBusiness.owner?.name}: ${viewBusiness.contact || '+91 98123 45678'}`)
                }
              >
                Call / WhatsApp ({viewBusiness.contact || '+91 98123 45678'})
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Open Business Form */}
      <OpenBusinessModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onCreated={fetchBusinesses}
      />
    </PageContainer>
  );
};

export default Businesses;
