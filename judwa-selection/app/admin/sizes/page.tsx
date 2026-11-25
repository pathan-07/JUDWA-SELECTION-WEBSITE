'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Ruler, X } from 'lucide-react';
import { SizeGroup, loadSizeGroups, saveSizeGroups } from '@/lib/sizes';

export default function AdminSizesPage() {
  const [groups, setGroups] = useState<SizeGroup[]>([]);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupType, setGroupType] = useState<SizeGroup['type']>('alpha');
  const [newSizeInput, setNewSizeInput] = useState<Record<string, string>>({});

  useEffect(() => {
    setGroups(loadSizeGroups());
  }, []);

  const persist = (next: SizeGroup[]) => {
    setGroups(next);
    saveSizeGroups(next);
  };

  const addGroup = () => {
    if (!groupName.trim()) {
      toast.error('Enter a group name');
      return;
    }
    const group: SizeGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      type: groupType,
      sizes: [],
    };
    persist([...groups, group]);
    setGroupName('');
    setGroupType('alpha');
    setShowGroupForm(false);
    toast.success('Size group created');
  };

  const deleteGroup = (id: string) => {
    if (!window.confirm('Delete this size group? This cannot be undone.')) return;
    persist(groups.filter(g => g.id !== id));
    toast.success('Size group deleted');
  };

  const addSizeToGroup = (groupId: string) => {
    const value = (newSizeInput[groupId] || '').trim();
    if (!value) {
      toast.error('Enter a size value');
      return;
    }
    persist(
      groups.map(g =>
        g.id === groupId
          ? { ...g, sizes: g.sizes.includes(value) ? g.sizes : [...g.sizes, value] }
          : g
      )
    );
    setNewSizeInput(prev => ({ ...prev, [groupId]: '' }));
    toast.success('Size added');
  };

  const removeSizeFromGroup = (groupId: string, size: string) => {
    persist(
      groups.map(g =>
        g.id === groupId ? { ...g, sizes: g.sizes.filter(s => s !== size) } : g
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Ruler className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Size Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define the size groups customers can choose from on product pages
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowGroupForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" /> Add Size Group
        </button>
      </div>

      {/* Add Group Form */}
      {showGroupForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">New Size Group</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                placeholder="e.g., Girls Ethnic Wear"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Size Type</label>
              <select
                value={groupType}
                onChange={e => setGroupType(e.target.value as SizeGroup['type'])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="age">Age (e.g., 3-4Y)</option>
                <option value="numeric">Numeric (e.g., 28, 30, 32)</option>
                <option value="alpha">Alpha (e.g., S, M, L)</option>
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button
                onClick={addGroup}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowGroupForm(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Size Groups */}
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                <span className="text-xs font-semibold text-blue-600 uppercase">{group.type} sizes</span>
              </div>
              <button
                onClick={() => deleteGroup(group.id)}
                className="text-red-600 hover:text-red-900 flex items-center gap-1 text-sm font-semibold"
              >
                <Trash2 className="w-4 h-4" /> Delete Group
              </button>
            </div>

            {/* Size Chips */}
            <div className="flex flex-wrap gap-2 mb-4">
              {group.sizes.map(size => (
                <span
                  key={size}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold"
                >
                  {size}
                  <button onClick={() => removeSizeFromGroup(group.id, size)}>
                    <X className="w-3.5 h-3.5 hover:text-red-600" />
                  </button>
                </span>
              ))}
              {group.sizes.length === 0 && (
                <span className="text-sm text-gray-500">No sizes added yet</span>
              )}
            </div>

            {/* Add Size Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSizeInput[group.id] || ''}
                onChange={e => setNewSizeInput(prev => ({ ...prev, [group.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addSizeToGroup(group.id)}
                placeholder="e.g., 4-5Y or 32 or L"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => addSizeToGroup(group.id)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg text-sm flex items-center gap-1 transition"
              >
                <Plus className="w-4 h-4" /> Add Size
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">How this works</h3>
        <p className="text-blue-800 text-sm">
          These size groups populate the <strong>Size</strong> dropdown when adding product
          variants under Products → Add Product. Each variant (size + color) has its own stock
          and price, so pricing can differ per size automatically.
        </p>
      </div>
    </div>
  );
}
