import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Building2, MapPin, Hash, Filter } from 'lucide-react';
import { getUkers, createUker, updateUker, deleteUker } from '../api';
import api from '../api';

const Ukers = () => {
  const [ukers, setUkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUker, setEditingUker] = useState(null);
  const [deletingUker, setDeletingUker] = useState(null);
  
  // Pagination & Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [regions, setRegions] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    id: '',
    kode_uker: '',
    nama_uker: '',
    main_branch: '',
    id_mbm: '',
    region: '',
    uker_type: '',
    active: 'Y',
    new_uker: '',
    cluster: '',
    id_area: '',
    pn_rmbh: ''
  });

  const itemsPerPage = 10;

  useEffect(() => {
    fetchUkers();
    fetchRegions();
  }, [currentPage, searchTerm, filterRegion, filterActive]);

  const fetchRegions = async () => {
    try {
      const response = await api.get('/ukers/regions');
      setRegions(response.data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchUkers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (filterRegion) params.region = filterRegion;
      if (filterActive) params.active = filterActive;

      const response = await getUkers(params);
      setUkers(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching ukers:', error);
      alert('Gagal memuat data uker: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        id: parseInt(formData.id) || 0,
        id_mbm: formData.id_mbm ? parseInt(formData.id_mbm) : null,
      };

      if (editingUker) {
        await updateUker(editingUker.id, submitData);
        alert('Uker berhasil diupdate!');
      } else {
        await createUker(submitData);
        alert('Uker berhasil ditambahkan!');
      }
      
      setShowModal(false);
      resetForm();
      fetchUkers();
    } catch (error) {
      console.error('Error saving uker:', error);
      alert(error.response?.data?.error || 'Gagal menyimpan uker');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (uker) => {
    setEditingUker(uker);
    setFormData({
      id: uker.id || '',
      kode_uker: uker.kode_uker || '',
      nama_uker: uker.nama_uker || '',
      main_branch: uker.main_branch || '',
      id_mbm: uker.id_mbm || '',
      region: uker.region || '',
      uker_type: uker.uker_type || '',
      active: uker.active || 'Y',
      new_uker: uker.new_uker || '',
      cluster: uker.cluster || '',
      id_area: uker.id_area || '',
      pn_rmbh: uker.pn_rmbh || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingUker) return;
    
    setLoading(true);
    try {
      await deleteUker(deletingUker.id);
      alert('Uker berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingUker(null);
      fetchUkers();
    } catch (error) {
      console.error('Error deleting uker:', error);
      alert('Gagal menghapus uker: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id: '',
      kode_uker: '',
      nama_uker: '',
      main_branch: '',
      id_mbm: '',
      region: '',
      uker_type: '',
      active: 'Y',
      new_uker: '',
      cluster: '',
      id_area: '',
      pn_rmbh: ''
    });
    setEditingUker(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  const confirmDelete = (uker) => {
    setDeletingUker(uker);
    setShowDeleteModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Building2 className="text-blue-600" />
          Data Uker
        </h1>
        <p className="text-gray-600 mt-1">Kelola data unit kerja (uker)</p>
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Cari kode/nama uker..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Region */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterRegion}
              onChange={(e) => {
                setFilterRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Semua Region</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {/* Filter Active */}
          <div className="relative">
            <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
            <select
              value={filterActive}
              onChange={(e) => {
                setFilterActive(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="">Semua Status</option>
              <option value="Y">Aktif</option>
              <option value="N">Tidak Aktif</option>
            </select>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition font-medium"
          >
            <Plus size={20} />
            Tambah Uker
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Kode Uker</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Nama Uker</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Main Branch</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Region</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Cluster</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : ukers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data uker
                  </td>
                </tr>
              ) : (
                ukers.map((uker, index) => (
                  <tr key={uker.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{uker.kode_uker}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{uker.nama_uker}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{uker.main_branch}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <MapPin size={12} />
                        {uker.region}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{uker.uker_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{uker.cluster}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                        uker.active === 'Y' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {uker.active === 'Y' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(uker)}
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => confirmDelete(uker)}
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && ukers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> - 
              <span className="font-medium"> {Math.min(currentPage * itemsPerPage, total)}</span> dari 
              <span className="font-medium"> {total}</span> uker
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-lg transition ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Building2 className="text-white" size={24} />
                <h3 className="text-white font-bold text-lg">
                  {editingUker ? 'Edit Uker' : 'Tambah Uker Baru'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:text-blue-100 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={editingUker}
                  />
                </div>

                {/* Kode Uker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Uker <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode_uker}
                    onChange={(e) => setFormData({ ...formData, kode_uker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="5"
                    required
                  />
                </div>

                {/* Nama Uker */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Uker <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_uker}
                    onChange={(e) => setFormData({ ...formData, nama_uker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="50"
                    required
                  />
                </div>

                {/* Main Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Main Branch</label>
                  <input
                    type="text"
                    value={formData.main_branch}
                    onChange={(e) => setFormData({ ...formData, main_branch: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="5"
                  />
                </div>

                {/* ID MBM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID MBM</label>
                  <input
                    type="number"
                    value={formData.id_mbm}
                    onChange={(e) => setFormData({ ...formData, id_mbm: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Region</label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="5"
                  />
                </div>

                {/* Uker Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Uker Type</label>
                  <input
                    type="text"
                    value={formData.uker_type}
                    onChange={(e) => setFormData({ ...formData, uker_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="50"
                  />
                </div>

                {/* Active */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Y">Aktif</option>
                    <option value="N">Tidak Aktif</option>
                  </select>
                </div>

                {/* New Uker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Uker</label>
                  <input
                    type="text"
                    value={formData.new_uker}
                    onChange={(e) => setFormData({ ...formData, new_uker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="10"
                  />
                </div>

                {/* Cluster */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cluster <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cluster}
                    onChange={(e) => setFormData({ ...formData, cluster: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="100"
                    required
                  />
                </div>

                {/* ID Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID Area</label>
                  <input
                    type="text"
                    value={formData.id_area}
                    onChange={(e) => setFormData({ ...formData, id_area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="100"
                  />
                </div>

                {/* PN RMBH */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PN RMBH</label>
                  <input
                    type="text"
                    value={formData.pn_rmbh}
                    onChange={(e) => setFormData({ ...formData, pn_rmbh: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="10"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex gap-3 justify-end border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      {editingUker ? 'Update' : 'Simpan'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingUker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="text-white" size={24} />
                <h3 className="text-white font-bold text-lg">Konfirmasi Hapus</h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingUker(null);
                }}
                className="text-white hover:text-red-100 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-2">
                Apakah Anda yakin ingin menghapus uker ini?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Kode: <span className="font-semibold">{deletingUker.kode_uker}</span></p>
                <p className="text-sm text-gray-600">Nama: <span className="font-semibold">{deletingUker.nama_uker}</span></p>
              </div>
              <p className="text-red-600 text-sm mt-3">
                ⚠️ Data yang dihapus tidak dapat dikembalikan!
              </p>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingUker(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Ya, Hapus
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

export default Ukers;
