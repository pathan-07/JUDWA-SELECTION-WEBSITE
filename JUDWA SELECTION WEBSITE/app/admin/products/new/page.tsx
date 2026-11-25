'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Loader, Upload, X, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { SizeGroup, loadSizeGroups } from '@/lib/sizes';
import { SiteProduct, loadProducts, saveProducts } from '@/lib/productsData';
import { uploadMedia } from '@/lib/mediaUpload';

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  selling_price: number;
  images?: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sizeGroups, setSizeGroups] = useState<SizeGroup[]>([]);
  const [categories] = useState([
    { id: '1', name: 'Boys' },
    { id: '2', name: 'Girls' },
    { id: '3', name: 'Unisex' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    short_description: '',
    mrp: '',
    selling_price: '',
    purchase_price: '',
    sold_last_month: '',
    category_id: '',
    is_active: true,
    fabric: '',
    fit: '',
    care_instructions: '',
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    stock: '',
    selling_price: '',
  });

  // Bulk variant creation: pick multiple sizes and apply the same color/stock/price to all at once
  const [bulkSizes, setBulkSizes] = useState<string[]>([]);
  const [bulkForm, setBulkForm] = useState({
    color: '',
    stock: '',
    selling_price: '',
  });

  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  // Color-specific photos for the variant currently being added (separate from the main product gallery)
  const [variantColorImages, setVariantColorImages] = useState<string[]>([]);

  useEffect(() => {
    setSizeGroups(loadSizeGroups());
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase().replace(/\s+/g, '-'),
      }));
    }
  };

  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setVariantForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addVariant = () => {
    if (!variantForm.size || !variantForm.color || !variantForm.stock || !variantForm.selling_price) {
      toast.error('Please fill all variant fields');
      return;
    }

    setVariants(prev => [
      ...prev,
      {
        size: variantForm.size,
        color: variantForm.color,
        stock: parseInt(variantForm.stock),
        selling_price: parseFloat(variantForm.selling_price),
        images: variantColorImages.length > 0 ? variantColorImages : undefined,
      },
    ]);

    setVariantForm({ size: '', color: '', stock: '', selling_price: '' });
    setVariantColorImages([]);
    toast.success('Variant added');
  };

  const handleVariantColorImageSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        const url = await uploadMedia(file, 'products');
        setVariantColorImages(prev => [...prev, url]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeVariantColorImage = (index: number) => {
    setVariantColorImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
    toast.success('Variant removed');
  };

  const toggleBulkSize = (size: string) => {
    setBulkSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleBulkFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBulkForm(prev => ({ ...prev, [name]: value }));
  };

  const addBulkVariants = () => {
    if (bulkSizes.length === 0) {
      toast.error('Select at least one size');
      return;
    }
    if (!bulkForm.color || !bulkForm.stock || !bulkForm.selling_price) {
      toast.error('Fill color, stock and price for the bulk sizes');
      return;
    }

    setVariants(prev => [
      ...prev,
      ...bulkSizes.map(size => ({
        size,
        color: bulkForm.color,
        stock: parseInt(bulkForm.stock),
        selling_price: parseFloat(bulkForm.selling_price),
      })),
    ]);

    toast.success(`${bulkSizes.length} size variant(s) added`);
    setBulkSizes([]);
    setBulkForm({ color: '', stock: '', selling_price: '' });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + uploadedImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setUploading(true);
    try {
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }
        const url = await uploadMedia(file, 'products');
        setUploadedImages(prev => [...prev, { file, preview: url }]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.name || !formData.category_id || !formData.mrp || !formData.selling_price) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      if (variants.length === 0) {
        toast.error('Add at least one variant');
        setLoading(false);
        return;
      }

      if (uploadedImages.length === 0) {
        toast.error('Upload at least one product image');
        setLoading(false);
        return;
      }

      // Persist to the seller's product catalog so it shows up live on the site immediately
      const categoryName = categories.find(cat => cat.id === formData.category_id)?.name;
      const now = new Date().toISOString();
      const newProduct: SiteProduct = {
        id: Date.now().toString(),
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        sku: formData.sku,
        description: formData.description,
        short_description: formData.short_description,
        category_id: formData.category_id,
        categoryName,
        mrp: parseFloat(formData.mrp),
        selling_price: parseFloat(formData.selling_price),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : undefined,
        sold_last_month: formData.sold_last_month ? Math.max(0, parseInt(formData.sold_last_month, 10)) : undefined,
        fabric: formData.fabric,
        fit: formData.fit,
        care_instructions: formData.care_instructions,
        is_active: formData.is_active,
        images: uploadedImages.map(img => img.preview),
        variants: variants.map((v, i) => ({ id: `${Date.now()}-${i}`, ...v })),
        created_at: now,
        updated_at: now,
      };

      const target = await saveProducts([...(await loadProducts({ admin: true })), newProduct]);

      toast.success(
        target === 'local'
          ? 'Product created (saved on this device only — database not connected)'
          : 'Product created successfully! It is now live on the site.'
      );
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Basic Information Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Blue Cotton T-Shirt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., TSHIRT-BLUE-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MRP */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  MRP (List Price) *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">₹</span>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleInputChange}
                    placeholder="999"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Selling Price *
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">₹</span>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleInputChange}
                    placeholder="599"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Purchase Price (seller's own cost, not shown to customers) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Purchase Price (Your Cost)
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">₹</span>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleInputChange}
                    placeholder="e.g., 350"
                    step="0.01"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Only visible to you, used to track profit margin</p>
              </div>

              {/* Sold last month (social proof on the product page) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sold in Last Month
                </label>
                <input
                  type="number"
                  name="sold_last_month"
                  value={formData.sold_last_month}
                  onChange={handleInputChange}
                  placeholder="e.g., 120"
                  min={0}
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Shown to customers as &ldquo;120+ sold in last month&rdquo;. Leave empty to hide.</p>
              </div>

              {/* Status */}              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Active Product</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                name="short_description"
                value={formData.short_description}
                onChange={handleInputChange}
                placeholder="Brief product description"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Full Description */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Detailed product description"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Product Details Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fabric */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fabric
                </label>
                <input
                  type="text"
                  name="fabric"
                  value={formData.fabric}
                  onChange={handleInputChange}
                  placeholder="e.g., 100% Cotton"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Fit */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fit
                </label>
                <select
                  name="fit"
                  value={formData.fit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Fit</option>
                  <option value="Slim Fit">Slim Fit</option>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Loose Fit">Loose Fit</option>
                  <option value="Oversized">Oversized</option>
                </select>
              </div>

              {/* Care Instructions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Care Instructions
                </label>
                <input
                  type="text"
                  name="care_instructions"
                  value={formData.care_instructions}
                  onChange={handleInputChange}
                  placeholder="e.g., Machine wash cold"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Variants</h2>

            {/* Bulk Add by Size */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Bulk Add by Size</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select multiple sizes and apply the same color, stock &amp; price to all of them at once.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {sizeGroups.flatMap(group => group.sizes).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleBulkSize(size)}
                      className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${
                        bulkSizes.includes(size)
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={bulkForm.color}
                    onChange={handleBulkFormChange}
                    placeholder="e.g., Blue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stock (each size)</label>
                  <input
                    type="number"
                    name="stock"
                    value={bulkForm.stock}
                    onChange={handleBulkFormChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price (each size)</label>
                  <input
                    type="number"
                    name="selling_price"
                    value={bulkForm.selling_price}
                    onChange={handleBulkFormChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addBulkVariants}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" /> Add {bulkSizes.length || ''} Size{bulkSizes.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            </div>

            {/* Add Variant Form */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    name="size"
                    value={variantForm.size}
                    onChange={handleVariantChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Size</option>
                    {sizeGroups.map(group => (
                      <optgroup key={group.id} label={group.name}>
                        {group.sizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage size groups under Products → Sizes
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={variantForm.color}
                    onChange={handleVariantChange}
                    placeholder="e.g., Blue"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={variantForm.stock}
                    onChange={handleVariantChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    name="selling_price"
                    value={variantForm.selling_price}
                    onChange={handleVariantChange}
                    placeholder="0"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addVariant}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>
              </div>

              {/* Color-specific photos (separate from the main product gallery below) */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photos for this Color (optional)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  {variantColorImages.map((img, i) => (
                    <div key={i} className="relative w-16 h-16">
                      <img src={img} alt={`Color photo ${i + 1}`} className="w-full h-full object-contain bg-white rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeVariantColorImage(i)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleVariantColorImageSelect(e.target.files)}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload photos specific to this color; they&apos;ll be attached to the variant when added.
                </p>
              </div>
            </div>

            {/* Variants List */}
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Size
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Color
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Photos
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.color}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {variant.images?.length ? (
                            <div className="flex -space-x-2">
                              {variant.images.slice(0, 3).map((img, i) => (
                                <img key={i} src={img} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                              ))}
                              {variant.images.length > 3 && (
                                <span className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center border-2 border-white">
                                  +{variant.images.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{variant.stock}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{variant.selling_price}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No variants added yet. Add at least one variant above.
              </div>
            )}
          </div>

          {/* Image Gallery Section */}
          <div className="p-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Gallery</h2>
            
            {/* Upload Area */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Upload Product Images (Max 10 images, 5MB each) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer bg-gray-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-semibold">Click to upload images</p>
                  <p className="text-gray-500 text-sm mt-1">PNG, JPG, GIF up to 5MB each</p>
                  <p className="text-blue-600 text-xs font-semibold mt-2">Max 10 images</p>
                </label>
              </div>
            </div>

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">
                  Uploaded Images ({uploadedImages.length}/10)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-contain bg-white rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedImages.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="p-8 bg-gray-50 flex gap-4 justify-end">
            <Link href="/admin/products">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
