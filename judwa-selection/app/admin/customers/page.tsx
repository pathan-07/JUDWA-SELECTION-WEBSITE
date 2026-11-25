'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Mail, Phone, Search, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/customers');
        // const data = await response.json();
        // setCustomers(data || []);
        // setFilteredCustomers(data || []);

        // Mock data for now
        setCustomers([]);
        setFilteredCustomers([]);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  useEffect(() => {
    let filtered = customers;

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery)
      );
    }

    setFilteredCustomers(filtered);
  }, [searchQuery, customers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Customers</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{customers.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">New This Month</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {Math.floor(customers.length * 0.2)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {Math.floor(customers.length * 0.85)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-600 text-sm font-medium">Avg. Orders</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">3.2</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            <Search className="h-4 w-4 inline mr-2" />
            Search Customers
          </label>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                  Customer Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">City</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Orders</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Spent</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Mail className="h-4 w-4" />
                      {customer.email}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4" />
                      {customer.phone}
                    </a>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {customer.city}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {customer.total_orders}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    ₹{customer.total_spent?.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No customers found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
