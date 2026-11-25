'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Layers, Upload } from 'lucide-react';
import { SiteCollection, loadCollections, saveCollections } from '@/lib/collectionsData';
import { uploadMedia } from '@/lib/mediaUpload';

const emptyForm = { name: '', subtitle: '', link: '', image: '', isActive: true };

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<SiteCollection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadCollections().then(setCollections);
  }, []);

  const persist = async (next: SiteCollection[], successMessage: string) => {
    try {
      const target = await saveCollections(next);
      setCollections(next);
      toast.success(target === 'local' ? `${successMessage} (saved on this device only — database not connected)` : successMessage);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
      return false;
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setBusy(true);
    try {
      const url = await uploadMedia(file, 'collections');
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.link.trim()) {
      toast.error('Collection name and link are required');
      return;
    }

    setBusy(true);
    const saved = editingId
      ? await persist(
          collections.map(c =>
            c.id === editingId
              ? { ...c, name: formData.name, subtitle: formData.subtitle, link: formData.link, isActive: formData.isActive, image: formData.image || c.image }
              : c
          ),
          'Collection updated'
        )
      : await persist(
          [
            ...collections,
            {
              id: Date.now().toString(),
              name: formData.name,
              subtitle: formData.subtitle,
              link: formData.link,
              image: formData.image || 'https://via.placeholder.com/400x300?text=Collection',
              isActive: formData.isActive,
            },
          ],
          'Collection created'
        );
    setBusy(false);
    if (saved) resetForm();
  };

  const handleEdit = (collection: SiteCollection) => {
    setFormData({
      name: collection.name,
      subtitle: collection.subtitle,
      link: collection.link,
      image: collection.image,
      isActive: collection.isActive,
    });
    setEditingId(collection.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this collection?')) return;
    persist(collections.filter(c => c.id !== id), 'Collection deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layers className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Collections</h2>
            <p className="text-sm text-gray-600 mt-1">Curated collection cards shown on the homepage</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Add Collection
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Collection' : 'New Collection'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Photo</label>
              <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600 w-fit">
                <Upload className="w-4 h-4" />
                {formData.image ? 'Change photo' : 'Upload from gallery'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageSelect(e.target.files?.[0])}
                />
              </label>
              {formData.image && (
                <img src={formData.image} alt="Collection preview" className="mt-3 w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200" />
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Collection Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Festive Collection"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
              <textarea
                value={formData.subtitle}
                onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Link *</label>
              <input
                type="text"
                value={formData.link}
                onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="e.g., /products?category=girls"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label className="text-sm font-semibold text-gray-700">Show on homepage</label>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={busy} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition">
                {editingId ? 'Update' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(collection => (
          <div key={collection.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-40 bg-gray-200">
              <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{collection.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${collection.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {collection.isActive ? 'Live' : 'Hidden'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{collection.subtitle}</p>
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button onClick={() => handleEdit(collection)} className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1 transition">
                  <Edit className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => handleDelete(collection.id)} className="flex-1 px-3 py-2 border border-red-300 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 flex items-center justify-center gap-1 transition">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

