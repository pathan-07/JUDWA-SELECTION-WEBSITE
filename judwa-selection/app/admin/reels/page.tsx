'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit, Play, Loader, Video, Upload } from 'lucide-react';
import Link from 'next/link';
import { SiteReel, loadReels, saveReels } from '@/lib/reelsData';
import { uploadMedia } from '@/lib/mediaUpload';
import { DEFAULT_REELS_SETTINGS, ReelsSettings, loadReelsSettings, saveReelsSettings } from '@/lib/reelsSettings';

const emptyForm = {
  title: '',
  thumbnail: '',
  videoUrl: '',
  ctaLabel: '',
  ctaLink: '',
  is_active: true,
};

export default function ReelsManagementPage() {
  const [loading, setLoading] = useState(false);
  const [reels, setReels] = useState<SiteReel[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const [reelsSettings, setReelsSettings] = useState<ReelsSettings>(DEFAULT_REELS_SETTINGS);

  useEffect(() => {
    loadReels().then(setReels);
    setReelsSettings(loadReelsSettings());
  }, []);

  const toggleAutoScroll = () => {
    const next = { ...reelsSettings, autoScroll: !reelsSettings.autoScroll };
    setReelsSettings(next);
    saveReelsSettings(next);
    toast.success(next.autoScroll ? 'Reels auto-slide turned on' : 'Reels auto-slide turned off');
  };

  const persist = async (next: SiteReel[], successMessage: string) => {
    try {
      const target = await saveReels(next);
      setReels(next);
      toast.success(target === 'local' ? `${successMessage} (saved on this device only — database not connected)` : successMessage);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save reel');
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const upload = async (file: File, field: 'thumbnail' | 'videoUrl') => {
    setLoading(true);
    try {
      const url = await uploadMedia(file, 'reels');
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    upload(file, 'thumbnail');
  };

  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // Supabase free-plan upload limit

  const handleVideoSelect = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Please choose a video file (MP4)');
      return;
    }
    if (file.size > MAX_VIDEO_SIZE) {
      toast.error('Video too large. Please use an MP4 under 50MB.');
      return;
    }
    upload(file, 'videoUrl');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.ctaLabel || !formData.ctaLink) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);

    let saved: boolean;
    if (editingId) {
      saved = await persist(
        reels.map(reel =>
          reel.id === editingId
            ? {
                ...reel,
                title: formData.title,
                ctaLabel: formData.ctaLabel,
                ctaLink: formData.ctaLink,
                isActive: formData.is_active,
                thumbnail: formData.thumbnail || reel.thumbnail,
                videoUrl: formData.videoUrl || reel.videoUrl,
              }
            : reel
        ),
        'Reel updated successfully!'
      );
    } else {
      const newReel: SiteReel = {
        id: Date.now().toString(),
        title: formData.title,
        thumbnail: formData.thumbnail || 'https://via.placeholder.com/300x500?text=Reel',
        videoUrl: formData.videoUrl || undefined,
        ctaLabel: formData.ctaLabel,
        ctaLink: formData.ctaLink,
        isActive: formData.is_active,
      };
      saved = await persist([...reels, newReel], 'Reel added successfully!');
    }

    setLoading(false);
    if (!saved) return;
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (reel: SiteReel) => {
    setFormData({
      title: reel.title,
      thumbnail: reel.thumbnail,
      videoUrl: reel.videoUrl || '',
      ctaLabel: reel.ctaLabel,
      ctaLink: reel.ctaLink,
      is_active: reel.isActive,
    });
    setEditingId(reel.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this reel?')) {
      persist(reels.filter(reel => reel.id !== id), 'Reel deleted successfully!');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage Reels</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" /> Add Reel
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auto-slide toggle for the storefront reels strip */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Auto-slide</h2>
            <p className="text-sm text-gray-600">Reels on the homepage scroll automatically</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reelsSettings.autoScroll}
            onClick={toggleAutoScroll}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
              reelsSettings.autoScroll ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                reelsSettings.autoScroll ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Reel' : 'Add New Reel'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Photo</label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600 w-fit">
                  <Upload className="w-4 h-4" />
                  {formData.thumbnail ? 'Change photo' : 'Upload from gallery'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleThumbnailSelect(e.target.files?.[0])}
                  />
                </label>
                {formData.thumbnail && (
                  <img src={formData.thumbnail} alt="Reel cover preview" className="mt-3 w-32 h-48 object-cover rounded-lg border border-gray-200" />
                )}
              </div>

              {/* Video Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reel Video (MP4, max 50MB)</label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600 w-fit">
                  <Video className="w-4 h-4" />
                  {formData.videoUrl ? 'Change video' : 'Upload MP4 video'}
                  <input
                    type="file"
                    accept="video/mp4,video/*"
                    className="hidden"
                    onChange={e => handleVideoSelect(e.target.files?.[0])}
                  />
                </label>
                {formData.videoUrl && (
                  <video src={formData.videoUrl} controls className="mt-3 w-48 h-64 object-cover rounded-lg border border-gray-200" />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Without a video, the reel just shows the cover photo when tapped.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Fashion Lookbook"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* CTA Label */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CTA Button Text *
                </label>
                <input
                  type="text"
                  name="ctaLabel"
                  value={formData.ctaLabel}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* CTA Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  CTA Link (Product / Category / Collection) *
                </label>
                <input
                  type="text"
                  name="ctaLink"
                  value={formData.ctaLink}
                  onChange={handleInputChange}
                  placeholder="e.g., /products?category=boys"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Publish this reel
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
                >
                  {loading && <Loader className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Reel' : 'Add Reel'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reels.map((reel) => (
            <div key={reel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition flex flex-col">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gray-200 group">
                <img
                  src={reel.thumbnail}
                  alt={reel.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center">
                  <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{reel.title}</h3>
                  </div>
                  {reel.isActive && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full flex-shrink-0 ml-2">
                      Live
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 flex-1">
                  CTA: <span className="font-semibold text-gray-800">{reel.ctaLabel}</span> → {reel.ctaLink}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(reel)}
                    className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1 transition"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(reel.id)}
                    className="flex-1 px-3 py-2 border border-red-300 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 flex items-center justify-center gap-1 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {reels.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No reels yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition mx-auto"
            >
              <Plus className="w-5 h-5" /> Create First Reel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

