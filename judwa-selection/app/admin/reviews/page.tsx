'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Star, Eye, EyeOff, Plus, X, Pencil, Trash2, Upload, Loader, Check } from 'lucide-react';
import { DEFAULT_HOMEPAGE_SETTINGS, loadHomepageSettings, saveHomepageSettings } from '@/lib/homepageSettings';
import { STORE_REVIEW_ID, STORE_REVIEW_NAME, SiteReview, loadReviews, saveReviews } from '@/lib/reviewsData';
import { loadProducts } from '@/lib/productsData';
import { uploadMedia } from '@/lib/mediaUpload';

const tabs = [
  { id: 'pending', label: 'New (to approve)' },
  { id: 'visible', label: 'Visible' },
  { id: 'hidden', label: 'Hidden' },
  { id: 'featured', label: 'Featured on Homepage' },
] as const;

const today = () => new Date().toISOString().split('T')[0];
const emptyForm = { productId: '', customer: '', rating: '5', text: '', date: today(), photo: '' };

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('visible');
  const [productFilter, setProductFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [homepageSettings, setHomepageSettings] = useState(DEFAULT_HOMEPAGE_SETTINGS);

  useEffect(() => {
    setHomepageSettings(loadHomepageSettings());
    loadReviews({ admin: true }).then(all => {
      setReviews(all);
      if (all.some(r => r.status === 'pending')) setActiveTab('pending');
    });
    loadProducts({ admin: true }).then(all => {
      setProducts([{ id: STORE_REVIEW_ID, name: STORE_REVIEW_NAME }, ...all.map(p => ({ id: p.id, name: p.name.trim() }))]);
      // Opened from a product's "Reviews" button: start a review for that product
      const preselect = new URLSearchParams(window.location.search).get('product');
      if (preselect && all.some(p => p.id === preselect)) {
        setProductFilter(preselect);
        setForm({ ...emptyForm, productId: preselect });
        setShowForm(true);
      }
    });
  }, []);

  // Customers can add reviews while this page is open, so changes are applied to the latest saved list
  const persist = async (update: (list: SiteReview[]) => SiteReview[], message: string) => {
    setSaving(true);
    try {
      const next = update(await loadReviews({ admin: true }));
      const target = await saveReviews(next);
      setReviews(next);
      toast.success(target === 'local' ? `${message} (saved on this device only — database not connected)` : message);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleRealKidsSection = (show: boolean) => {
    const next = { ...homepageSettings, showRealKidsReviews: show };
    setHomepageSettings(next);
    saveHomepageSettings(next);
    toast.success(show ? 'Customer photos are now shown under reviews' : 'Customer photos are now hidden');
  };

  const filtered = reviews.filter(r => {
    if (productFilter !== 'all' && r.productId !== productFilter) return false;
    if (activeTab === 'featured') return r.featured;
    if (activeTab === 'pending') return r.status === 'pending';
    return activeTab === 'hidden' ? r.status === 'hidden' : r.status === 'approved';
  });
  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  const openNewForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, productId: productFilter !== 'all' ? productFilter : '' });
    setShowForm(true);
  };

  const startEdit = (review: SiteReview) => {
    setEditingId(review.id);
    setForm({
      productId: review.productId,
      customer: review.customer,
      rating: String(review.rating),
      text: review.text,
      date: review.date,
      photo: review.photo || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'reviews');
      setForm(prev => ({ ...prev, photo: url }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === form.productId);
    if (!product || !form.customer.trim() || !form.text.trim()) {
      toast.error('Please choose a product and fill customer name and review');
      return;
    }
    const fields = {
      productId: product.id,
      productName: product.name,
      customer: form.customer.trim().slice(0, 80),
      rating: Math.min(5, Math.max(1, parseInt(form.rating) || 5)),
      text: form.text.trim().slice(0, 1000),
      date: form.date || today(),
      photo: form.photo || undefined,
    };
    const update = (list: SiteReview[]) =>
      editingId
        ? list.map(r => (r.id === editingId ? { ...r, ...fields } : r))
        : [{ id: Date.now().toString(), ...fields, status: 'approved' as const, featured: false, adminAdded: true }, ...list];
    if (await persist(update, editingId ? 'Review updated' : 'Review added to the product page')) closeForm();
  };

  const toggleHidden = (id: string) =>
    persist(
      list => list.map(r => (r.id === id ? { ...r, status: r.status === 'approved' ? 'hidden' : 'approved' } : r)),
      'Review visibility updated'
    );

  const approve = (id: string) =>
    persist(list => list.map(r => (r.id === id ? { ...r, status: 'approved' } : r)), 'Review approved — now visible on the website');

  const hide = (id: string) =>
    persist(list => list.map(r => (r.id === id ? { ...r, status: 'hidden' } : r)), 'Review hidden');

  const toggleFeatured = (id: string) =>
    persist(list => list.map(r => (r.id === id ? { ...r, featured: !r.featured } : r)), 'Homepage feature updated');

  const deleteReview = (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    persist(list => list.filter(r => r.id !== id), 'Review deleted');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reviews</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customers can review products after delivery (from their order page). Approve them here to show on the website.
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Add Review
        </button>
      </div>

      {/* Homepage section visibility */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-900">Show customer photos under reviews on homepage</p>
          <p className="text-sm text-gray-600">
            {homepageSettings.showRealKidsReviews
              ? 'Photos uploaded with a review are shown below that review'
              : 'Reviews are shown as text only (photos hidden)'}
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={homepageSettings.showRealKidsReviews}
            onChange={e => toggleRealKidsSection(e.target.checked)}
            className="sr-only peer"
            aria-label="Show Real Kids Reviews section"
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {/* Add / Edit Review */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Review' : 'Add Review'}</h3>
            <button onClick={closeForm} aria-label="Close"><X className="w-5 h-5 text-gray-500" /></button>
          </div>
          <form onSubmit={submitReview} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="md:col-span-2 text-sm font-semibold text-gray-700">
              Product *
              <select
                value={form.productId}
                onChange={e => setForm(prev => ({ ...prev, productId: e.target.value }))}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal"
              >
                <option value="">Select a product</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Customer Name *
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={form.customer}
                onChange={e => setForm(prev => ({ ...prev, customer: e.target.value }))}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold text-gray-700">
                Rating
                <select
                  value={form.rating}
                  onChange={e => setForm(prev => ({ ...prev, rating: e.target.value }))}
                  className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal"
                >
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal"
                />
              </label>
            </div>
            <label className="md:col-span-2 text-sm font-semibold text-gray-700">
              Review *
              <textarea
                placeholder="What did the customer say?"
                value={form.text}
                onChange={e => setForm(prev => ({ ...prev, text: e.target.value }))}
                className="mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-normal"
                rows={3}
              />
            </label>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-gray-700 mb-1">Customer Photo (optional)</p>
              <div className="flex items-center gap-3">
                {form.photo && (
                  <div className="relative">
                    <img src={form.photo} alt="Review" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, photo: '' }))}
                      aria-label="Remove photo"
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 text-sm text-gray-600">
                  {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {form.photo ? 'Change photo' : 'Upload photo'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handlePhoto(e.target.files?.[0])} />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving || uploading}
              className="md:col-span-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
            >
              {editingId ? 'Update Review' : 'Save Review'}
            </button>
          </form>
        </div>
      )}

      {/* Product filter + tabs */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-2 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-600 text-white rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
        <select
          value={productFilter}
          onChange={e => setProductFilter(e.target.value)}
          aria-label="Filter by product"
          className="w-auto max-w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All products</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map(review => (
          <div key={review.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-gray-900">{review.customer}</h3>
                  {review.featured && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-semibold">Homepage</span>
                  )}
                  {review.status === 'hidden' && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full font-semibold">Hidden</span>
                  )}
                  {review.status === 'pending' && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">Waiting for approval</span>
                  )}
                  {!review.adminAdded && (
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full font-semibold">Verified buyer</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {review.productName} · {review.date}
                  {review.orderNumber && <> · Order #{review.orderNumber}</>}
                </p>
              </div>
              <div className="flex text-yellow-400 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-3">{review.text}</p>
            {review.photo && (
              <img src={review.photo} alt="Customer photo" className="w-16 h-16 object-cover rounded-lg border border-gray-200 mb-3" />
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-3 border-t border-gray-200">
              {review.status === 'pending' ? (
                <>
                  <button onClick={() => approve(review.id)} disabled={saving} className="text-green-700 hover:text-green-900 flex items-center gap-1 text-sm font-semibold">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button onClick={() => hide(review.id)} disabled={saving} className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm font-semibold">
                    <EyeOff className="w-4 h-4" /> Hide
                  </button>
                </>
              ) : (
                <button onClick={() => toggleHidden(review.id)} className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm font-semibold">
                  {review.status === 'hidden' ? <><Eye className="w-4 h-4" /> Show</> : <><EyeOff className="w-4 h-4" /> Hide</>}
                </button>
              )}
              <button onClick={() => startEdit(review)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-semibold">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => toggleFeatured(review.id)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1 text-sm font-semibold">
                <Star className="w-4 h-4" /> {review.featured ? 'Remove from Homepage' : 'Show on Homepage'}
              </button>
              <button onClick={() => deleteReview(review.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm font-semibold">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
            No reviews here yet. Click &ldquo;Add Review&rdquo; to add one.
          </div>
        )}
      </div>
    </div>
  );
}
