import React from 'react';
import { Settings as SettingsIcon, Database, Server, Users } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Database className="text-blue-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Database Configuration</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Host</span>
              <span className="font-medium">localhost</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Port</span>
              <span className="font-medium">3306</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Database</span>
              <span className="font-medium">pipeline_db</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Server Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Server className="text-purple-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Server Configuration</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Backend URL</span>
              <span className="font-medium">http://localhost:8080</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Frontend URL</span>
              <span className="font-medium">http://localhost:3000</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Max Workers</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Batch Size</span>
              <span className="font-medium">10,000 rows</span>
            </div>
          </div>
        </div>

        {/* Import Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <SettingsIcon className="text-green-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Import Settings</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Max File Size</span>
              <span className="font-medium">100 MB</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Parallel Workers</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Bulk Insert Size</span>
              <span className="font-medium">10,000 records</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Channel Buffer</span>
              <span className="font-medium">1,000</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="text-orange-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">System Information</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Backend Framework</span>
              <span className="font-medium">Go Fiber</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Frontend Framework</span>
              <span className="font-medium">React + Vite</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Database</span>
              <span className="font-medium">MySQL</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-3">About This System</h3>
        <p className="text-sm text-gray-700 mb-2">
          This Pipeline Dashboard is a high-performance full-stack application designed for managing and importing large-scale pipeline data.
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-4">
          <li>• Built with Go Fiber for blazing-fast backend performance</li>
          <li>• React + Vite for modern, responsive frontend</li>
          <li>• MySQL database with optimized indexing</li>
          <li>• Parallel CSV import using Goroutines (up to millions of records)</li>
          <li>• Bulk insert operations for maximum throughput</li>
          <li>• Real-time progress tracking and statistics</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
