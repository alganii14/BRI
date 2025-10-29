import React, { useState, useEffect } from 'react';
import { getDI319Data, deleteDI319All } from '../api';
import { Database, Search, RefreshCw, Trash2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const DI319Data = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async (page = 1, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDI319Data({
        page,
        page_size: pageSize,
        search: search.trim()
      });
      
      console.log('DI319 API Response:', response.data);
      
      if (response.data) {
        setData(response.data.data || []);
        setTotalPages(response.data.pagination?.total_pages || 1);
        setTotalRecords(response.data.pagination?.total_records || 0);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error fetching DI319 data:', err);
      setError(err.response?.data?.error || 'Failed to load data');
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(1, searchTerm);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setCurrentPage(1);
    fetchData(1, '');
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteDI319All();
      setShowDeleteModal(false);
      setData([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1);
      setSearchTerm('');
      alert('All DI319 data deleted successfully');
      // Refresh data after deletion
      await fetchData(1, '');
    } catch (err) {
      console.error('Error deleting data:', err);
      alert(err.response?.data?.error || 'Failed to delete data');
    } finally {
      setDeleting(false);
    }
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calculateDropPercentage = (balance, avgBalance) => {
    if (!avgBalance || avgBalance === '0' || avgBalance === 0) return null;
    
    const balanceNum = typeof balance === 'string' ? parseInt(balance.replace(/,/g, ''), 10) : balance;
    const avgBalanceNum = typeof avgBalance === 'string' ? parseInt(avgBalance.replace(/,/g, ''), 10) : avgBalance;
    
    if (avgBalanceNum === 0) return null;
    
    const dropPercentage = ((avgBalanceNum - balanceNum) / avgBalanceNum) * 100;
    return dropPercentage;
  };

  const renderPipelineStatus = (dropPercentage) => {
    if (dropPercentage === null) {
      return <span className="text-xs text-gray-400">-</span>;
    }
    
    if (dropPercentage >= 50) {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-xs font-semibold text-green-700">{dropPercentage.toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <XCircle size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">{dropPercentage.toFixed(1)}%</span>
        </div>
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Database className="text-blue-600" size={32} />
            DI319 Data
          </h1>
          <p className="text-gray-600">
            View imported DI319 financial data • Total: {formatNumber(totalRecords)} records
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading || totalRecords === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Delete All
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by CIF, NoRek, Nama, or Branch..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CIF</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NoRek</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PN Pengelola</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Balance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Drop %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pipeline</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Database className="text-gray-300" size={48} />
                      <p className="text-gray-500 font-medium">No data available</p>
                      <p className="text-sm text-gray-400">Import CSV file to populate DI319 data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const dropPercentage = calculateDropPercentage(item.balance, item.avg_balance);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(item.periode)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono text-xs">
                          {item.branch}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.cif}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.norek}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nama}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.pn_pengelola}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                        {formatNumber(item.balance)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">
                        {item.avg_balance ? formatNumber(item.avg_balance) : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {renderPipelineStatus(dropPercentage)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {dropPercentage !== null && dropPercentage >= 50 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                            ✓ Created
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                            Skipped
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
              {' '}({formatNumber(totalRecords)} total records)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchData(currentPage - 1, searchTerm)}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchData(currentPage + 1, searchTerm)}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete All Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Delete All DI319 Data?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              This will permanently delete all <strong>{formatNumber(totalRecords)} records</strong> from the DI319 table. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Delete All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DI319Data;
