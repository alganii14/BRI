import React, { useState, useEffect } from 'react';
import { getStats } from '../api';
import { TrendingUp, Database, DollarSign, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total DI319</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {formatNumber(stats?.total_pipelines || 0)}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Database className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Balance</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(stats?.total_proyeksi || 0)}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Top Branches</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">
                {stats?.strategy_stats?.length || 0}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Activity className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Balance per Branch (Top 10)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.strategy_stats || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="strategy" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="total_proyeksi" fill="#3b82f6" name="Total Balance" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Type Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribusi per Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats?.segment_stats || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ segment, percent }) => `${segment} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="segment"
              >
                {(stats?.segment_stats || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Table */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branch Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Branch Breakdown (Top 10)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.strategy_stats?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.strategy}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.count)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.total_proyeksi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Type Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Type Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.segment_stats?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.segment}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.count)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.total_proyeksi)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
