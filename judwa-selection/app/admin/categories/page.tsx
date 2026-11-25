'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, FolderTree } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  productCount: number;
  isActive: boolean;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Boys', slug: 'boys', parent: null, productCount: 42, isActive: true },
    { id: '2', name: 'Girls', slug: 'girls', parent: null, productCount: 38, isActive: true },
    { id: '3', name: 'Baby Boys', slug: 'baby-boys', parent: null, productCount: 15, isActive: true },
    { id: '4', name: 'Baby Girls', slug: 'baby-girls', parent: null, productCount: 12, isActive: true },
    { id: '5', name: 'School Uniforms', slug: 'school-uniforms', parent: null, productCount: 20, isActive: true },
    { id: '6', name: 'T-Shirts', slug: 't-shirts', parent: '1', productCount: 18, isActive: true },
    { id: '7', name: 'Frocks', slug: 'frocks', parent: '2', productCount: 22, isActive: true },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', parent: '', isActive: true });

  const parentOptions = categories.filter(c => !c.parent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const slug = formData.name.toLowerCase().trim().replace(/\s+/g, '-');

    if (editingId) {
      setCategories(prev =>
        prev.map(c =>
          c.id === editingId
            ? { ...c, name: formData.name, slug, parent: formData.parent || null, isActive: formData.isActive }
            : c
        )
      );
      toast.success('Category updated');
      setEditingId(null);
    } else {
      setCategories(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          name: formData.name,
          slug,
          parent: formData.parent || null,
          productCount: 0,
          isActive: formData.isActive,
        },
      ]);
      toast.success('Category created');
    }

    setFormData({ name: '', parent: '', isActive: true });
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({ name: category.name, parent: category.parent || '', isActive: category.isActive });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Category deleted');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', parent: '', isActive: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FolderTree className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <p className="text-sm text-gray-600 mt-1">Manage product categories &amp; sub-categories</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Add Category
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingId ? 'Edit Category' : 'New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Ethnic Wear"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
              <select
                value={formData.parent}
                onChange={e => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">None (Top Level)</option>
                {parentOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                {editingId ? 'Update' : 'Create'}
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Parent</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Products</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">
                  {category.parent && <span className="text-gray-400 mr-2">↳</span>}
                  {category.name}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {category.parent ? categories.find(c => c.id === category.parent)?.name : '—'}
                </td>
                <td className="py-3 px-4 text-center text-gray-900">{category.productCount}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
