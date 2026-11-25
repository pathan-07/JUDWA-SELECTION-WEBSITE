'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  maxDiscount: number;
  usageLimit: number;
  used: number;
  expiryDate: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 999, maxDiscount: 300, usageLimit: 500, used: 128, expiryDate: '2024-12-31', isActive: true },
    { id: '2', code: 'FLAT50', type: 'flat', value: 50, minOrder: 499, maxDiscount: 50, usageLimit: 1000, used: 340, expiryDate: '2024-12-31', isActive: true },
    { id: '3', code: 'KIDS20', type: 'percentage', value: 20, minOrder: 1499, maxDiscount: 500, usageLimit: 200, used: 200, expiryDate: '2024-06-30', isActive: false },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '', type: 'percentage' as Coupon['type'], value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true,
  });

  const resetForm = () => {
    setFormData({ code: '', type: 'percentage', value: '', minOrder: '', maxDiscount: '', usageLimit: '', expiryDate: '', isActive: true });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: parseFloat(formData.value),
      minOrder: parseFloat(formData.minOrder) || 0,
      maxDiscount: parseFloat(formData.maxDiscount) || 0,
      usageLimit: parseInt(formData.usageLimit) || 0,
      expiryDate: formData.expiryDate,
      isActive: formData.isActive,
    };

    if (editingId) {
      setCoupons(prev => prev.map(c => (c.id === editingId ? { ...c, ...payload } : c)));
      toast.success('Coupon updated');
    } else {
      setCoupons(prev => [...prev, { id: Date.now().toString(), used: 0, ...payload }]);
      toast.success('Coupon created');
    }
    resetForm();
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrder: coupon.minOrder.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      usageLimit: coupon.usageLimit.toString(),
      expiryDate: coupon.expiryDate,
      isActive: coupon.isActive,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this coupon?')) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast.success('Coupon deleted');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
            <p className="text-sm text-gray-600 mt-1">Discount codes validated server-side at checkout</p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" /> Add Coupon
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Coupon Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="e.g., WELCOME10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as Coupon['type'] }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Value *</label>
              <input
                type="number"
                value={formData.value}
                onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Order (₹)</label>
              <input
                type="number"
                value={formData.minOrder}
                onChange={e => setFormData(prev => ({ ...prev, minOrder: e.target.value }))}
                placeholder="999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Discount (₹)</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={e => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                placeholder="300"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Usage Limit</label>
              <input
                type="number"
                value={formData.usageLimit}
                onChange={e => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                placeholder="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
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
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                {editingId ? 'Update Coupon' : 'Create Coupon'}
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
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Discount</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Min Order</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Usage</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Expiry</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-blue-600">{coupon.code}</td>
                <td className="py-3 px-4 text-gray-900">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                  {coupon.maxDiscount > 0 && <span className="text-xs text-gray-500"> (max ₹{coupon.maxDiscount})</span>}
                </td>
                <td className="py-3 px-4 text-gray-900">₹{coupon.minOrder}</td>
                <td className="py-3 px-4 text-center text-gray-900">{coupon.used}/{coupon.usageLimit || '∞'}</td>
                <td className="py-3 px-4 text-gray-900">{coupon.expiryDate || '—'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-900">
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
