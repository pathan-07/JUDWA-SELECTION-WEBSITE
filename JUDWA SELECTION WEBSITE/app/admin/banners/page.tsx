'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Edit, Upload, Loader } from 'lucide-react';
import Link from 'next/link';
import { SiteBanner, loadBanners, saveBanners } from '@/lib/banners';
import { uploadMedia } from '@/lib/mediaUpload';
import {
  BannerSize,
  BannerSizeSettings,
  DEFAULT_BANNER_SIZE_SETTINGS,
  DESKTOP_BANNER_PRESETS,
  MOBILE_BANNER_PRESETS,
  isValidBannerSize,
  loadBannerSizeSettings,
  saveBannerSizeSettings,
} from '@/lib/bannerSizeSettings';

function SizePicker({
  title,
  hint,
  presets,
  value,
  onChange,
}: {
  title: string;
  hint: string;
  presets: (BannerSize & { label: string })[];
  value: BannerSize;
  onChange: (size: BannerSize) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mb-3">{hint}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(preset => {
          const active = preset.width === value.width && preset.height === value.height;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange({ width: preset.width, height: preset.height })}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                active ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {preset.label} ({preset.width}×{preset.height})
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={100}
          max={5000}
          value={value.width}
          onChange={e => onChange({ ...value, width: Number(e.target.value) })}
          aria-label={`${title} width`}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-gray-500">×</span>
        <input
          type="number"
          min={100}
          max={5000}
          value={value.height}
          onChange={e => onChange({ ...value, height: Number(e.target.value) })}
          aria-label={`${title} height`}
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <span className="text-xs text-gray-500">px (width × height)</span>
      </div>
      {isValidBannerSize(value) && (
        <div
          className="mt-3 max-w-xs bg-gray-100 border border-dashed border-gray-400 rounded flex items-center justify-center text-[11px] text-gray-500"
          style={{ aspectRatio: `${value.width} / ${value.height}` }}
        >
          Preview shape
        </div>
      )}
    </div>
  );
}

const emptyForm = {
  title: '',
  subtitle: '',
  link: '',
  image: '',
  is_active: true,
  show_text: false,
  show_button: true,
};

export default function BannersManagementPage() {
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [bannerSize, setBannerSize] = useState<BannerSizeSettings>(DEFAULT_BANNER_SIZE_SETTINGS);

  useEffect(() => {
    loadBanners().then(setBanners);
    setBannerSize(loadBannerSizeSettings());
  }, []);

  const saveBannerSize = () => {
    if (!isValidBannerSize(bannerSize.desktop) || !isValidBannerSize(bannerSize.mobile)) {
      toast.error('Width and height must be between 100 and 5000 px');
      return;
    }
    saveBannerSizeSettings(bannerSize);
    toast.success('Banner size saved');
  };

  const persist = async (next: SiteBanner[], successMessage: string) => {
    try {
      const target = await saveBanners(next);
      setBanners(next);
      toast.success(target === 'local' ? `${successMessage} (saved on this device only — database not connected)` : successMessage);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setLoading(true);
    try {
      const url = await uploadMedia(file, 'banners');
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.link) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);

    let saved: boolean;
    if (editingId) {
      saved = await persist(
        banners.map(banner =>
          banner.id === editingId
            ? { ...banner, title: formData.title, subtitle: formData.subtitle, link: formData.link, isActive: formData.is_active, showText: formData.show_text, showButton: formData.show_button, image: formData.image || banner.image }
            : banner
        ),
        'Banner updated successfully!'
      );
    } else {
      const newBanner: SiteBanner = {
        id: Date.now().toString(),
        title: formData.title,
        subtitle: formData.subtitle,
        link: formData.link,
        image: formData.image || 'https://via.placeholder.com/1200x400?text=Banner',
        isActive: formData.is_active,
        showText: formData.show_text,
        showButton: formData.show_button,
        order: banners.length + 1,
      };
      saved = await persist([...banners, newBanner], 'Banner added successfully!');
    }

    setLoading(false);
    if (!saved) return;
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (banner: SiteBanner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      link: banner.link,
      image: banner.image,
      is_active: banner.isActive,
      show_text: banner.showText === true,
      show_button: banner.showButton !== false,
    });
    setEditingId(banner.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      persist(banners.filter(banner => banner.id !== id), 'Banner deleted successfully!');
    }
  };

  const toggleBannerOption = (id: string, key: 'showText' | 'showButton') => {
    const next = banners.map(banner => {
      if (banner.id !== id) return banner;
      const current = key === 'showText' ? banner.showText === true : banner.showButton !== false;
      return { ...banner, [key]: !current };
    });
    persist(next, key === 'showText' ? 'Banner text updated' : 'Banner button updated');
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Banners</h1>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" /> Add Banner
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner size */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Banner Size</h2>
          <p className="text-sm text-gray-500 mb-5">
            Choose the shape of the homepage banner. Upload your banner images at exactly this size so they fit perfectly.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <SizePicker
              title="Computer / Tablet"
              hint="Used on screens wider than 768px."
              presets={DESKTOP_BANNER_PRESETS}
              value={bannerSize.desktop}
              onChange={desktop => setBannerSize(prev => ({ ...prev, desktop }))}
            />
            <SizePicker
              title="Mobile"
              hint="Used on phones. The same image is centred and trimmed to this shape."
              presets={MOBILE_BANNER_PRESETS}
              value={bannerSize.mobile}
              onChange={mobile => setBannerSize(prev => ({ ...prev, mobile }))}
            />
          </div>
          <button
            type="button"
            onClick={saveBannerSize}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Save Banner Size
          </button>
        </div>
        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Banner' : 'Add New Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload size:{' '}
                  <span className="font-semibold">
                    {bannerSize.desktop.width} × {bannerSize.desktop.height} px
                  </span>{' '}
                  (set under Banner Size above). Keep important content in the centre so it also shows on phones.
                </p>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600 w-fit">
                  <Upload className="w-4 h-4" />
                  {formData.image ? 'Change image' : 'Upload from gallery'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageSelect(e.target.files?.[0])}
                  />
                </label>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    className="mt-3 w-full max-w-md object-cover rounded-lg border border-gray-200"
                    style={{ aspectRatio: `${bannerSize.desktop.width} / ${bannerSize.desktop.height}` }}
                  />
                )}
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
                  placeholder="e.g., Summer Collection 2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subtitle
                </label>
                <textarea
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g., Discover the latest trending styles"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Link *
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
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
                  Active Banner
                </label>
              </div>

              {/* Show Text Overlay */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_text"
                  checked={formData.show_text}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Show title &amp; subtitle on banner
                </label>
              </div>

              {/* Show Shop Now button */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="show_button"
                  checked={formData.show_button}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Show &quot;Shop Now&quot; button (if off, the whole banner opens the link)
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
                  {editingId ? 'Update Banner' : 'Add Banner'}
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

        {/* Banners List */}
        <div className="space-y-6">
          {banners.map((banner, index) => (
            <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row">
                {/* Banner Image */}
                <div className="md:w-1/3 h-40 md:h-auto bg-gray-200 relative flex-shrink-0">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Banner Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold mb-1">BANNER {index + 1}</p>
                        <h3 className="text-2xl font-bold text-gray-900">{banner.title}</h3>
                      </div>
                      {banner.isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {([
                        { key: 'showText', label: 'Text on banner', on: banner.showText === true },
                        { key: 'showButton', label: 'Shop Now button', on: banner.showButton !== false },
                      ] as const).map(option => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => toggleBannerOption(banner.id, option.key)}
                          aria-pressed={option.on}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <span className={`relative inline-block w-8 h-4 rounded-full transition ${option.on ? 'bg-blue-600' : 'bg-gray-300'}`}>
                            <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${option.on ? 'left-[18px]' : 'left-0.5'}`} />
                          </span>
                          {option.label}: {option.on ? 'ON' : 'OFF'}
                        </button>
                      ))}
                    </div>
                    {banner.subtitle && (
                      <p className="text-gray-600 mb-3">{banner.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-500">Link: {banner.link}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-4 py-2 border border-blue-300 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 flex items-center gap-2 transition"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 flex items-center gap-2 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && !showForm && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-500 text-lg mb-4">No banners yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition mx-auto"
              >
                <Plus className="w-5 h-5" /> Create First Banner
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

