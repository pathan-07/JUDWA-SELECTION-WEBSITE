'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Shirt, Upload, X } from 'lucide-react';
import {
  UniformPair,
  SizePriceOverride,
  loadUniformPairs,
  saveUniformPairs,
  getPairTotal,
} from '@/lib/uniformPairs';
import { SizeGroup, loadSizeGroups } from '@/lib/sizes';
import { uploadMedia } from '@/lib/mediaUpload';

const emptyForm = {
  schoolName: '',
  image: '',
  shirtName: '',
  shirtPrice: '',
  shirtImage: '',
  pantName: '',
  pantPrice: '',
  pantImage: '',
  comboPrice: '',
  shirtSizes: [] as string[],
  pantSizes: [] as string[],
  shirtSizePrices: {} as Record<string, string>,
  pantSizePrices: {} as Record<string, string>,
  isActive: true,
};

type Piece = 'shirt' | 'pant';

function SizePriceSection({
  title,
  sizeGroups,
  selected,
  prices,
  basePrice,
  onToggle,
  onPriceChange,
}: {
  title: string;
  sizeGroups: SizeGroup[];
  selected: string[];
  prices: Record<string, string>;
  basePrice: string;
  onToggle: (size: string) => void;
  onPriceChange: (size: string, value: string) => void;
}) {
  return (
    <div className="md:col-span-3 border border-gray-200 rounded-lg p-4">
      <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
      <p className="text-xs text-gray-500 mb-3">
        Tap sizes to offer, then set each size&apos;s price (blank = base price ₹{basePrice || '0'}).
      </p>
      <div className="space-y-3">
        {sizeGroups.map(group => (
          <div key={group.id}>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{group.name}</p>
            <div className="flex flex-wrap gap-2">
              {group.sizes.map(size => {
                const checked = selected.includes(size);
                return (
                  <button
                    type="button"
                    key={size}
                    onClick={() => onToggle(size)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition ${
                      checked
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selected.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {selected.map(size => (
            <label key={size} className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
              <span className="text-sm font-semibold text-gray-900 w-10">{size}</span>
              <span className="text-gray-500 text-sm">₹</span>
              <input
                type="number"
                min={0}
                value={prices[size] || ''}
                onChange={e => onPriceChange(size, e.target.value)}
                placeholder={basePrice || '0'}
                className="w-full min-w-0 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mt-3">No sizes selected — customers will see the default school size list.</p>
      )}
    </div>
  );
}

export default function AdminSchoolPairingPage() {
  const [pairs, setPairs] = useState<UniformPair[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadUniformPairs({ admin: true }).then(setPairs);
    setSizeGroups(loadSizeGroups());
  }, []);

  const persist = async (next: UniformPair[], successMessage: string) => {
    try {
      const target = await saveUniformPairs(next);
      setPairs(next);
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

  const handleImageSelect = async (field: 'image' | 'shirtImage' | 'pantImage', file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setBusy(true);
    try {
      const url = await uploadMedia(file, 'uniforms');
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const toggleSize = (piece: Piece, size: string) => {
    const sizesKey = piece === 'shirt' ? 'shirtSizes' : 'pantSizes';
    const pricesKey = piece === 'shirt' ? 'shirtSizePrices' : 'pantSizePrices';
    setFormData(prev => {
      const isSelected = prev[sizesKey].includes(size);
      const nextPrices = { ...prev[pricesKey] };
      if (isSelected) delete nextPrices[size];
      return {
        ...prev,
        [sizesKey]: isSelected ? prev[sizesKey].filter(s => s !== size) : [...prev[sizesKey], size],
        [pricesKey]: nextPrices,
      };
    });
  };

  const handleSizePriceChange = (piece: Piece, size: string, value: string) => {
    const pricesKey = piece === 'shirt' ? 'shirtSizePrices' : 'pantSizePrices';
    setFormData(prev => ({ ...prev, [pricesKey]: { ...prev[pricesKey], [size]: value } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schoolName || !formData.shirtName || !formData.shirtPrice || !formData.pantName || !formData.pantPrice) {
      toast.error('Please fill all required fields');
      return;
    }

    // Stored as one list keyed by size; a size may have only a shirt price or only a pant price
    const bySize = new Map<string, SizePriceOverride>();
    formData.shirtSizes.forEach(size => {
      const price = formData.shirtSizePrices[size];
      if (price) bySize.set(size, { ...bySize.get(size), size, shirtPrice: parseFloat(price) });
    });
    formData.pantSizes.forEach(size => {
      const price = formData.pantSizePrices[size];
      if (price) bySize.set(size, { ...bySize.get(size), size, pantPrice: parseFloat(price) });
    });
    const sizePrices = Array.from(bySize.values());

    const payload = {
      schoolName: formData.schoolName,
      image: formData.image || undefined,
      shirtName: formData.shirtName,
      shirtPrice: parseFloat(formData.shirtPrice),
      shirtImage: formData.shirtImage || undefined,
      pantName: formData.pantName,
      pantPrice: parseFloat(formData.pantPrice),
      pantImage: formData.pantImage || undefined,
      comboPrice: formData.comboPrice ? parseFloat(formData.comboPrice) : null,
      shirtSizes: formData.shirtSizes,
      pantSizes: formData.pantSizes,
      availableSizes: undefined,
      sizePrices,
      isActive: formData.isActive,
    };

    setBusy(true);
    const saved = editingId
      ? await persist(pairs.map(p => (p.id === editingId ? { ...p, ...payload } : p)), 'Uniform pairing updated')
      : await persist([...pairs, { id: Date.now().toString(), ...payload }], 'Uniform pairing created');
    setBusy(false);
    if (saved) resetForm();
  };

  const handleEdit = (pair: UniformPair) => {
    const shirtSizes = pair.shirtSizes ?? pair.availableSizes ?? [];
    const pantSizes = pair.pantSizes ?? pair.availableSizes ?? [];
    const priceMap = (sizes: string[], field: 'shirtPrice' | 'pantPrice') =>
      Object.fromEntries(
        sizes.map(size => {
          const value = pair.sizePrices?.find(sp => sp.size === size)?.[field];
          return [size, value !== undefined ? value.toString() : ''];
        })
      );
    const shirtSizePrices = priceMap(shirtSizes, 'shirtPrice');
    const pantSizePrices = priceMap(pantSizes, 'pantPrice');

    setFormData({
      schoolName: pair.schoolName,
      image: pair.image || '',
      shirtName: pair.shirtName,
      shirtPrice: pair.shirtPrice.toString(),
      shirtImage: pair.shirtImage || '',
      pantName: pair.pantName,
      pantPrice: pair.pantPrice.toString(),
      pantImage: pair.pantImage || '',
      comboPrice: pair.comboPrice !== null ? pair.comboPrice.toString() : '',
      shirtSizes,
      pantSizes,
      shirtSizePrices,
      pantSizePrices,
      isActive: pair.isActive,
    });
    setEditingId(pair.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this uniform pairing?')) return;
    persist(pairs.filter(p => p.id !== id), 'Uniform pairing deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shirt className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Uniform Pairing</h2>
            <p className="text-sm text-gray-600 mt-1">
              Link a shirt with its matching pant so customers pick both sizes and see one total bill
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Add Pairing
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Uniform Pairing' : 'New Uniform Pairing'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-2">School Name *</label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={e => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="e.g., St. Xavier School"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Uniform Photo <span className="text-gray-400 font-normal">— shown to customers with the school name below it</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Best: a portrait photo of the full shirt + pant set (4:5, e.g. 800 × 1000 px).</p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600">
                  <Upload className="w-4 h-4" />
                  {formData.image ? 'Change photo' : 'Upload from gallery'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleImageSelect('image', e.target.files?.[0])}
                  />
                </label>
                {formData.image && (
                  <div className="relative w-20 h-24">
                    <img src={formData.image} alt="Uniform set" className="w-20 h-24 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      aria-label="Remove photo"
                      className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shirt Product Name *</label>
              <input
                type="text"
                value={formData.shirtName}
                onChange={e => setFormData(prev => ({ ...prev, shirtName: e.target.value }))}
                placeholder="e.g., St. Xavier Shirt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shirt Base Price (₹) *</label>
              <input
                type="number"
                value={formData.shirtPrice}
                onChange={e => setFormData(prev => ({ ...prev, shirtPrice: e.target.value }))}
                placeholder="350"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shirt Photo</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                {formData.shirtImage ? 'Change photo' : 'Upload from gallery'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageSelect('shirtImage', e.target.files?.[0])}
                />
              </label>
              {formData.shirtImage && (
                <div className="relative w-20 h-20 mt-2">
                  <img src={formData.shirtImage} alt="Shirt" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, shirtImage: '' }))}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pant Product Name *</label>
              <input
                type="text"
                value={formData.pantName}
                onChange={e => setFormData(prev => ({ ...prev, pantName: e.target.value }))}
                placeholder="e.g., St. Xavier Pant"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pant Base Price (₹) *</label>
              <input
                type="number"
                value={formData.pantPrice}
                onChange={e => setFormData(prev => ({ ...prev, pantPrice: e.target.value }))}
                placeholder="400"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pant Photo</label>
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition text-sm text-gray-600">
                <Upload className="w-4 h-4" />
                {formData.pantImage ? 'Change photo' : 'Upload from gallery'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageSelect('pantImage', e.target.files?.[0])}
                />
              </label>
              {formData.pantImage && (
                <div className="relative w-20 h-20 mt-2">
                  <img src={formData.pantImage} alt="Pant" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pantImage: '' }))}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Combo Price (₹) <span className="text-gray-400 font-normal">— optional override</span>
              </label>
              <input
                type="number"
                value={formData.comboPrice}
                onChange={e => setFormData(prev => ({ ...prev, comboPrice: e.target.value }))}
                placeholder="Leave blank to use shirt + pant total"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <label className="text-sm font-semibold text-gray-700">Active</label>
            </div>
            <div className="hidden md:block" />

            <SizePriceSection
              title="Shirt sizes & price per size"
              sizeGroups={sizeGroups}
              selected={formData.shirtSizes}
              prices={formData.shirtSizePrices}
              basePrice={formData.shirtPrice}
              onToggle={size => toggleSize('shirt', size)}
              onPriceChange={(size, value) => handleSizePriceChange('shirt', size, value)}
            />
            <SizePriceSection
              title="Pant sizes & price per size"
              sizeGroups={sizeGroups}
              selected={formData.pantSizes}
              prices={formData.pantSizePrices}
              basePrice={formData.pantPrice}
              onToggle={size => toggleSize('pant', size)}
              onPriceChange={(size, value) => handleSizePriceChange('pant', size, value)}
            />

            <div className="md:col-span-3 flex gap-3">
              <button type="submit" disabled={busy} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition">
                {editingId ? 'Update Pairing' : 'Create Pairing'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">School</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Shirt</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Pant</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-900">Total Bill</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(pair => (
              <tr key={pair.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">{pair.schoolName}</td>
                <td className="py-3 px-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    {pair.shirtImage && (
                      <img src={pair.shirtImage} alt={pair.shirtName} className="w-10 h-10 rounded object-cover border border-gray-200" />
                    )}
                    <div>
                      {pair.shirtName}
                      <div className="text-xs text-gray-500">₹{pair.shirtPrice}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900">
                  <div className="flex items-center gap-2">
                    {pair.pantImage && (
                      <img src={pair.pantImage} alt={pair.pantName} className="w-10 h-10 rounded object-cover border border-gray-200" />
                    )}
                    <div>
                      {pair.pantName}
                      <div className="text-xs text-gray-500">₹{pair.pantPrice}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="font-bold text-blue-600">₹{getPairTotal(pair)}</span>
                  {pair.comboPrice !== null && (
                    <div className="text-xs text-gray-500 line-through">₹{pair.shirtPrice + pair.pantPrice}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pair.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pair.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleEdit(pair)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(pair.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pairs.length === 0 && (
          <div className="text-center py-12 text-gray-500">No uniform pairings yet</div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
        <p className="text-blue-800 text-sm">
          These pairings appear on the customer-facing <strong>School Uniform Sets</strong> page.
          Customers pick a shirt size and a pant size independently, then see one combined total bill.
        </p>
      </div>
    </div>
  );
}
