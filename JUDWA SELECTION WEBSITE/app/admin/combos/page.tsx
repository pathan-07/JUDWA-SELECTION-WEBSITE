'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Package2, Upload, Loader, X } from 'lucide-react';
import { ComboPiece, ComboSet, getComboMrp, getComboPrice, loadCombos, saveCombos } from '@/lib/combosData';
import { SizeGroup, DEFAULT_SIZE_GROUPS, loadSizeGroups } from '@/lib/sizes';
import { uploadMedia } from '@/lib/mediaUpload';

interface PieceForm {
  id: string;
  name: string;
  image: string;
  price: string;
  sizes: string[];
  colors: string;
}

interface ComboForm {
  name: string;
  description: string;
  image: string;
  comboPrice: string;
  isActive: boolean;
  pieces: PieceForm[];
}

const newPiece = (index: number): PieceForm => ({
  id: `${Date.now()}-${index}`,
  name: `Item ${index + 1}`,
  image: '',
  price: '',
  sizes: [],
  colors: '',
});

const emptyForm = (): ComboForm => ({
  name: '',
  description: '',
  image: '',
  comboPrice: '',
  isActive: true,
  pieces: [newPiece(0), newPiece(1)],
});

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function PhotoUpload({ value, onUpload, onClear, busy }: { value: string; onUpload: (f: File) => void; onClear: () => void; busy: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {value ? (
        <div className="relative w-16 h-16 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove photo"
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}
      <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 text-sm text-gray-600">
        {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {value ? 'Change photo' : 'Upload photo'}
        <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])} />
      </label>
    </div>
  );
}

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<ComboSet[]>([]);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>(DEFAULT_SIZE_GROUPS);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ComboForm>(emptyForm);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCombos({ admin: true }).then(setCombos);
    setSizeGroups(loadSizeGroups());
  }, []);

  const persist = async (next: ComboSet[], successMessage: string) => {
    try {
      const target = await saveCombos(next);
      setCombos(next);
      toast.success(target === 'local' ? `${successMessage} (saved on this device only — database not connected)` : successMessage);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
      return false;
    }
  };

  const resetForm = () => {
    setForm(emptyForm());
    setShowForm(false);
    setEditingId(null);
  };

  const updatePiece = (index: number, patch: Partial<PieceForm>) =>
    setForm(prev => ({ ...prev, pieces: prev.pieces.map((p, i) => (i === index ? { ...p, ...patch } : p)) }));

  const upload = async (key: string, file: File, apply: (url: string) => void) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    setUploading(key);
    try {
      apply(await uploadMedia(file, 'combos'));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const toggleSize = (index: number, size: string) => {
    const piece = form.pieces[index];
    updatePiece(index, {
      sizes: piece.sizes.includes(size) ? piece.sizes.filter(s => s !== size) : [...piece.sizes, size],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Please enter a combo name');
      return;
    }
    if (form.pieces.length < 2) {
      toast.error('A combo needs at least 2 items');
      return;
    }

    const pieces: ComboPiece[] = [];
    for (const piece of form.pieces) {
      const price = parseFloat(piece.price);
      if (!piece.name.trim() || !(price > 0)) {
        toast.error('Every item needs a name and a price');
        return;
      }
      if (piece.sizes.length === 0) {
        toast.error(`Select at least one size for ${piece.name}`);
        return;
      }
      pieces.push({
        id: piece.id,
        name: piece.name.trim(),
        image: piece.image || undefined,
        price,
        sizes: piece.sizes,
        colors: Array.from(new Set(piece.colors.split(',').map(c => c.trim()).filter(Boolean))),
      });
    }

    const comboPrice = form.comboPrice ? parseFloat(form.comboPrice) : null;
    if (comboPrice !== null && !(comboPrice > 0)) {
      toast.error('Combo price must be more than 0');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      image: form.image || undefined,
      pieces,
      comboPrice,
      isActive: form.isActive,
    };

    setSaving(true);
    const next = editingId
      ? combos.map(c => (c.id === editingId ? { ...c, ...payload } : c))
      : [...combos, { id: Date.now().toString(), ...payload }];
    const saved = await persist(next, editingId ? 'Combo updated' : 'Combo created');
    setSaving(false);
    if (saved) resetForm();
  };

  const handleEdit = (combo: ComboSet) => {
    setForm({
      name: combo.name,
      description: combo.description ?? '',
      image: combo.image ?? '',
      comboPrice: combo.comboPrice?.toString() ?? '',
      isActive: combo.isActive,
      pieces: combo.pieces.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image ?? '',
        price: p.price.toString(),
        sizes: p.sizes,
        colors: p.colors.join(', '),
      })),
    });
    setEditingId(combo.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this combo?')) return;
    persist(combos.filter(c => c.id !== id), 'Combo deleted');
  };

  const toggleActive = (combo: ComboSet) =>
    persist(
      combos.map(c => (c.id === combo.id ? { ...c, isActive: !c.isActive } : c)),
      combo.isActive ? 'Combo hidden from website' : 'Combo is live on website'
    );

  const formMrp = form.pieces.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package2 className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Combos &amp; Offers</h2>
            <p className="text-sm text-gray-600 mt-1">Bundle products together at a combo price</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Add Combo
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Combo' : 'New Combo'}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Combo Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Pick Any 2 T-Shirts"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Short description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Choose size and colour for each T-shirt"
                  className={inputClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Main combo photo</label>
                <PhotoUpload
                  value={form.image}
                  busy={uploading === 'main'}
                  onUpload={file => upload('main', file, url => setForm(prev => ({ ...prev, image: url })))}
                  onClear={() => setForm(prev => ({ ...prev, image: '' }))}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">Items in this combo</p>
              <p className="text-xs text-gray-500 mb-3">
                Each item gets its own photo, sizes and colours. Customers choose size/colour separately for every item.
              </p>
              <div className="space-y-4">
                {form.pieces.map((piece, index) => (
                  <div key={piece.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Item {index + 1}</p>
                      {form.pieces.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, pieces: prev.pieces.filter((_, i) => i !== index) }))}
                          className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Item name *</label>
                        <input
                          value={piece.name}
                          onChange={e => updatePiece(index, { name: e.target.value })}
                          placeholder="e.g., T-Shirt 1"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Single price (₹) *</label>
                        <input
                          type="number"
                          min={0}
                          value={piece.price}
                          onChange={e => updatePiece(index, { price: e.target.value })}
                          placeholder="499"
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Item photo</label>
                      <PhotoUpload
                        value={piece.image}
                        busy={uploading === piece.id}
                        onUpload={file => upload(piece.id, file, url => updatePiece(index, { image: url }))}
                        onClear={() => updatePiece(index, { image: '' })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Sizes * ({piece.sizes.length} selected)</label>
                      <div className="space-y-2">
                        {sizeGroups.map(group => (
                          <div key={group.id}>
                            <p className="text-[11px] text-gray-500 mb-1">{group.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.sizes.map(size => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => toggleSize(index, size)}
                                  className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                                    piece.sizes.includes(size)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Colours (comma separated, optional)</label>
                      <input
                        value={piece.colors}
                        onChange={e => updatePiece(index, { colors: e.target.value })}
                        placeholder="White, Navy, Red"
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, pieces: [...prev.pieces, newPiece(prev.pieces.length)] }))}
                className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Combo price (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={form.comboPrice}
                  onChange={e => setForm(prev => ({ ...prev, comboPrice: e.target.value }))}
                  placeholder={formMrp ? String(formMrp) : '699'}
                  className={inputClass}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Items bought separately: ₹{formMrp}. Leave empty to charge ₹{formMrp}.
                </p>
              </div>
              <label className="flex items-center gap-2 md:mt-8">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-semibold text-gray-700">Show on website</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving || uploading !== null}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Combo' : 'Create Combo'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {combos.map(combo => {
          const photo = combo.image || combo.pieces.find(p => p.image)?.image;
          const price = getComboPrice(combo);
          const mrp = getComboMrp(combo);
          return (
            <div key={combo.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
              <div className="h-40 bg-gray-100">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={combo.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package2 className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{combo.name}</h3>
                  <button
                    onClick={() => toggleActive(combo)}
                    className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${combo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {combo.isActive ? 'Active' : 'Hidden'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3">{combo.pieces.map(p => p.name).join(' + ')}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">₹{price}</span>
                  {mrp > price && <span className="text-sm text-gray-500 line-through">₹{mrp}</span>}
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-200 mt-auto">
                  <button onClick={() => handleEdit(combo)} className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 font-semibold text-sm rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1 transition">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(combo.id)} className="flex-1 px-3 py-2 border border-red-300 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 flex items-center justify-center gap-1 transition">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
