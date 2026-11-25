'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Search, Image as ImageIcon, Copy } from 'lucide-react';

interface MediaItem {
  id: string;
  url: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([
    { id: '1', url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=300&h=300&fit=crop', name: 'boys-banner.jpg', size: '245 KB', uploadedAt: '2024-01-01' },
    { id: '2', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop', name: 'girls-dress.jpg', size: '198 KB', uploadedAt: '2024-01-02' },
    { id: '3', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop', name: 'tshirt-blue.jpg', size: '167 KB', uploadedAt: '2024-01-03' },
    { id: '4', url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop', name: 'denim-jeans.jpg', size: '211 KB', uploadedAt: '2024-01-04' },
  ]);
  const [search, setSearch] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      const reader = new FileReader();
      reader.onload = event => {
        setItems(prev => [
          {
            id: Date.now().toString() + Math.random(),
            url: event.target?.result as string,
            name: file.name,
            size: `${Math.round(file.size / 1024)} KB`,
            uploadedAt: new Date().toISOString().split('T')[0],
          },
          ...prev,
        ]);
      };
      reader.readAsDataURL(file);
    });
    toast.success('Images uploaded to gallery');
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Delete this image from the gallery?')) return;
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('Image deleted');
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied');
  };

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Media Gallery</h2>
            <p className="text-sm text-gray-600 mt-1">Central image library reused across products, banners &amp; reels</p>
          </div>
        </div>
        <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition cursor-pointer">
          <Upload className="w-5 h-5" /> Upload from Gallery
          <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
        </label>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search media by filename..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group relative">
            <div className="h-32 bg-gray-200">
              <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-2">
              <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-500">{item.size}</p>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button onClick={() => copyUrl(item.url)} className="bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-blue-600">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(item.id)} className="bg-white/90 p-1.5 rounded-full text-gray-700 hover:text-red-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No media found</p>
        </div>
      )}
    </div>
  );
}
