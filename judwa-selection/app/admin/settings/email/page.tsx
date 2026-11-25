'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Settings, Save, Loader } from 'lucide-react';
import Link from 'next/link';

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [emailConfig, setEmailConfig] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@judwa.com',
    smtpPassword: '****',
    fromEmail: 'noreply@judwa.com',
    fromName: 'JUDWA - Kids Selection',
  });

  const [emailTemplates, setEmailTemplates] = useState([
    {
      id: 'order-confirmation',
      name: 'Order Confirmation',
      enabled: true,
      template_id: 'tpl_order_confirmation',
    },
    {
      id: 'order-shipped',
      name: 'Order Shipped',
      enabled: true,
      template_id: 'tpl_order_shipped',
    },
    {
      id: 'order-delivered',
      name: 'Order Delivered',
      enabled: true,
      template_id: 'tpl_order_delivered',
    },
    {
      id: 'welcome',
      name: 'Welcome Email',
      enabled: true,
      template_id: 'tpl_welcome',
    },
    {
      id: 'password-reset',
      name: 'Password Reset',
      enabled: true,
      template_id: 'tpl_password_reset',
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      enabled: false,
      template_id: 'tpl_newsletter',
    },
  ]);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTemplateToggle = (id: string) => {
    setEmailTemplates(prev =>
      prev.map(template =>
        template.id === id
          ? { ...template, enabled: !template.enabled }
          : template
      )
    );
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      // TODO: API call to save email configuration
      console.log('Email config:', emailConfig);
      toast.success('Email configuration saved!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplates = async () => {
    setSaving(true);
    try {
      // TODO: API call to save email templates
      console.log('Email templates:', emailTemplates);
      toast.success('Email templates saved!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save templates');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    setSaving(true);
    try {
      // TODO: API call to send test email
      toast.success('Test email sent! Check your inbox.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send test email');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/admin/settings">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Email Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure email notifications and templates</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* SMTP Configuration */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">SMTP Configuration</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      name="smtpHost"
                      value={emailConfig.smtpHost}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      name="smtpPort"
                      value={emailConfig.smtpPort}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMTP Username
                  </label>
                  <input
                    type="email"
                    name="smtpUser"
                    value={emailConfig.smtpUser}
                    onChange={handleConfigChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    name="smtpPassword"
                    value={emailConfig.smtpPassword}
                    onChange={handleConfigChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Email
                    </label>
                    <input
                      type="email"
                      name="fromEmail"
                      value={emailConfig.fromEmail}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      From Name
                    </label>
                    <input
                      type="text"
                      name="fromName"
                      value={emailConfig.fromName}
                      onChange={handleConfigChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
                  >
                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                    <Save className="w-4 h-4" /> Save Configuration
                  </button>
                  <button
                    onClick={handleTestEmail}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                  >
                    Send Test Email
                  </button>
                </div>
              </div>
            </div>

            {/* Email Templates */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Email Templates</h2>

              <div className="space-y-3">
                {emailTemplates.map(template => (
                  <div key={template.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">Template ID: {template.template_id}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="text-blue-600 hover:text-blue-900 font-semibold text-sm">
                        Edit
                      </button>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.enabled}
                          onChange={() => handleTemplateToggle(template.id)}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {template.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSaveTemplates}
                disabled={saving}
                className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
              >
                {saving && <Loader className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" /> Save Templates
              </button>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Help Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">SMTP Setup Help</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>
                  <strong>Gmail:</strong> smtp.gmail.com:587
                </p>
                <p>
                  <strong>Outlook:</strong> smtp-mail.outlook.com:587
                </p>
                <p>
                  <strong>SendGrid:</strong> smtp.sendgrid.net:587
                </p>
                <p className="mt-3 text-xs">
                  Enable "Less secure app access" for Gmail or generate an app password.
                </p>
              </div>
            </div>

            {/* Template Variables */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-3">Template Variables</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><code className="bg-gray-100 px-2 py-1 rounded">{'{{customer_name}}'}</code> - Customer name</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">{'{{order_number}}'}</code> - Order ID</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">{'{{total_amount}}'}</code> - Total amount</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">{'{{tracking_url}}'}</code> - Tracking link</p>
                <p><code className="bg-gray-100 px-2 py-1 rounded">{'{{reset_link}}'}</code> - Password reset link</p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-3">Connection Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm font-semibold text-gray-700">Connected</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">Last tested: 2 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
