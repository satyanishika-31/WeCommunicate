import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Briefcase,
  AlertCircle,
  Plus,
} from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import Header from '../components/layout/Header';
import { recordService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const CATEGORIES = [
  { id: 'ALL', label: 'All Documents', icon: BookOpen },
  { id: 'BYLAWS', label: 'Bylaws & Rules', icon: ShieldCheck },
  { id: 'AGM_MINUTES', label: 'AGM Minutes', icon: Calendar },
  { id: 'HANDOVER_LOG', label: 'Committee Handover', icon: Briefcase },
  { id: 'FINANCIAL_AUDIT', label: 'Audits & Finance', icon: FileText },
];

const Records = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'BLOCK_MANAGER';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'BYLAWS',
    documentRef: '',
    fileUrl: '',
    fileSize: '1.2 MB',
    fileType: 'PDF',
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const data = await recordService.getAll(selectedCategory === 'ALL' ? '' : selectedCategory);
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.fileUrl) {
      setError('Title and File URL are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await recordService.create(formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'BYLAWS',
        documentRef: '',
        fileUrl: '',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        description: '',
        effectiveDate: new Date().toISOString().split('T')[0],
      });
      fetchRecords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to upload document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this official record?')) return;
    try {
      await recordService.delete(id);
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert('Failed to delete record: ' + (err?.response?.data?.message || err.message));
    }
  };

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.title.toLowerCase().includes(q) ||
      rec.documentRef?.toLowerCase().includes(q) ||
      rec.description?.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer>
      <Header />
      <div className="max-w-6xl mx-auto space-y-6 pb-12 mt-4">
        <div className="bg-gradient-to-r from-[#542612] via-[#6d3218] to-[#803d1e] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
            <BookOpen className="w-64 h-64 -mr-16" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#EAA627]/30 text-[#F5C767] border border-[#EAA627]/40 mb-3 inline-block">
              RWA Governance Repository
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Society Records & Bylaws</h1>
            <p className="text-[#F7F0DF]/90 text-sm leading-relaxed">
              Permanent institutional repository for registered society bylaws, AGM minutes, resolution logs,
              and committee handover dossiers. Preserved across committee tenure changes.
            </p>

            {isAdminOrManager && (
              <div className="mt-5">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#EAA627] hover:bg-[#d4941f] text-[#33160a] font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Archive / Upload New Record
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-[#542612]/10 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#542612] text-white shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search reference or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#542612]"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400">Loading society repository...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
            <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <h3 className="text-base font-bold text-zinc-700 dark:text-zinc-300">No records found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'Try matching a different keyword.' : 'No documents have been archived in this category yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((doc) => {
              const categoryBadge = {
                BYLAWS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                AGM_MINUTES: 'bg-blue-50 text-blue-700 border-blue-200',
                HANDOVER_LOG: 'bg-amber-50 text-amber-700 border-amber-200',
                FINANCIAL_AUDIT: 'bg-purple-50 text-purple-700 border-purple-200',
              }[doc.category] || 'bg-zinc-100 text-zinc-700 border-zinc-200';

              return (
                <motion.div
                  key={doc._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${categoryBadge}`}>
                        {doc.category.replace('_', ' ')}
                      </span>
                      {doc.documentRef && (
                        <span className="text-[11px] font-mono text-zinc-400 font-medium">
                          Ref: {doc.documentRef}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-2.5">
                      {doc.title}
                    </h3>

                    {doc.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 line-clamp-2">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span>Effective: {new Date(doc.effectiveDate || doc.createdAt).toLocaleDateString()}</span>
                      {doc.fileSize && <span>Size: {doc.fileSize}</span>}
                      {doc.uploadedBy?.name && <span>By: {doc.uploadedBy.name}</span>}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#542612]/10 hover:bg-[#542612]/20 text-[#542612] dark:text-[#EAA627] text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> View / Download ({doc.fileType || 'PDF'})
                    </a>

                    {isAdminOrManager && (
                      <button
                        onClick={() => handleDelete(doc._id)}
                        className="text-zinc-400 hover:text-red-500 p-1.5 rounded-md transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">
                  Archive Society Record
                </h2>
                <p className="text-xs text-zinc-500 mb-4">
                  Add an immutable institutional record to the community repository.
                </p>

                {error && (
                  <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Document Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Society Bye-laws (Amended 2024)"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                      >
                        <option value="BYLAWS">Bylaws & Rules</option>
                        <option value="AGM_MINUTES">AGM Minutes & Resolutions</option>
                        <option value="HANDOVER_LOG">Committee Handover Dossier</option>
                        <option value="FINANCIAL_AUDIT">Financial & Audit Report</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Document Reference #
                      </label>
                      <input
                        type="text"
                        value={formData.documentRef}
                        onChange={(e) => setFormData({ ...formData, documentRef: e.target.value })}
                        placeholder="e.g. AGM-2024-RES-04"
                        className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Document File Link / URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.fileUrl}
                      onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                      placeholder="https://... or link to cloud PDF"
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Description / Summary
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Summary of resolutions or rules contained in this document..."
                      className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#542612]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#542612] text-white hover:bg-[#3d1b0c]"
                    >
                      {submitting ? 'Archiving...' : 'Save & Archive'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageContainer>
  );
};

export default Records;
