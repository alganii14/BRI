import { useState, useEffect } from 'react';
import { getRFMTs, createRFMT, updateRFMT, deleteRFMT, deleteAllRFMTs, importRFMTCSV } from '../api';

function RFMTs() {
  const [rfmts, setRfmts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRfmt, setCurrentRfmt] = useState(null);
  
  // Import states
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  // const [importProgress, setImportProgress] = useState(null); // Tidak diperlukan

  const [formData, setFormData] = useState({
    pn: '',
    nama_lengkap: '',
    jg: '',
    esgdesc: '',
    kanca: '',
    uker: '',
    uker_tujuan: '',
    keterangan: '',
    kelompok_jabatan_rmft_baru: ''
  });

  useEffect(() => {
    fetchRfmts();
  }, [page, search]);

  // Hapus polling progress - tidak diperlukan untuk RFMT
  // useEffect(() => {
  //   let interval;
  //   if (importing) {
  //     interval = setInterval(() => {
  //       checkImportProgress();
  //     }, 500);
  //   }
  //   return () => clearInterval(interval);
  // }, [importing]);

  const fetchRfmts = async () => {
    try {
      setLoading(true);
      const response = await getRFMTs({ page, limit, search });
      setRfmts(response.data.data || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching RFMTs:', error);
      alert('Failed to fetch RFMTs: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateRFMT(currentRfmt.id, formData);
        alert('RFMT updated successfully');
      } else {
        await createRFMT(formData);
        alert('RFMT created successfully');
      }
      setShowModal(false);
      fetchRfmts();
      resetForm();
    } catch (error) {
      console.error('Error saving RFMT:', error);
      alert('Failed to save RFMT: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (rfmt) => {
    setCurrentRfmt(rfmt);
    setFormData({
      pn: rfmt.pn,
      nama_lengkap: rfmt.nama_lengkap,
      jg: rfmt.jg,
      esgdesc: rfmt.esgdesc,
      kanca: rfmt.kanca,
      uker: rfmt.uker,
      uker_tujuan: rfmt.uker_tujuan,
      keterangan: rfmt.keterangan,
      kelompok_jabatan_rmft_baru: rfmt.kelompok_jabatan_rmft_baru
    });
    if (rfmt.pipeline) {
      setSelectedPipeline(rfmt.pipeline);
    }
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this RFMT?')) {
      try {
        await deleteRFMT(id);
        alert('RFMT deleted successfully');
        fetchRfmts();
      } catch (error) {
        console.error('Error deleting RFMT:', error);
        alert('Failed to delete RFMT: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('⚠️ WARNING: This will delete ALL RFMTs! Are you sure?')) {
      if (window.confirm('This action cannot be undone. Continue?')) {
        try {
          const response = await deleteAllRFMTs();
          alert(response.data.message);
          fetchRfmts();
        } catch (error) {
          console.error('Error deleting all RFMTs:', error);
          alert('Failed to delete all RFMTs: ' + (error.response?.data?.error || error.message));
        }
      }
    }
  };

  const resetForm = () => {
    setFormData({
      pn: '',
      nama_lengkap: '',
      jg: '',
      esgdesc: '',
      kanca: '',
      uker: '',
      uker_tujuan: '',
      keterangan: '',
      kelompok_jabatan_rmft_baru: ''
    });
    setEditMode(false);
    setCurrentRfmt(null);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setImporting(true);
      
      const response = await importRFMTCSV(importFile);
      
      alert('Import completed: ' + response.data.message);
      setImporting(false);
      setImportFile(null);
      fetchRfmts();
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Failed to import CSV: ' + (error.response?.data?.error || error.message));
      setImporting(false);
    }
  };

  // Hapus checkImportProgress - tidak diperlukan
  // const checkImportProgress = async () => {
  //   try {
  //     const response = await getRFMTImportProgress();
  //     setImportProgress(response.data);
  //     
  //     if (response.data.status === 'completed') {
  //       setImporting(false);
  //       setImportFile(null);
  //       fetchRfmts();
  //       alert(`Import completed! Processed: ${response.data.processed}, Failed: ${response.data.failed}`);
  //     }
  //   } catch (error) {
  //     console.error('Error checking progress:', error);
  //   }
  // };


  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">RFMT Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            ➕ Add RFMT
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            🗑️ Delete All
          </button>
        </div>
      </div>

      {/* Import CSV Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📥 Import CSV</h2>
        <div className="flex gap-4 items-center mb-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            disabled={importing}
          />
          <button
            onClick={handleImport}
            disabled={importing || !importFile}
            className={`px-6 py-2 rounded-lg text-white transition ${
              importing || !importFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {importing ? '⏳ Importing...' : '📤 Import'}
          </button>
        </div>

        {/* Import Progress - Dihapus karena tidak diperlukan */}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 Search by PN, Name, JG, Kanca..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Lengkap</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">JG</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kanca</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelompok Jabatan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rfmts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No RFMTs found
                  </td>
                </tr>
              ) : (
                rfmts.map((rfmt) => (
                  <tr key={rfmt.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{rfmt.pn}</td>
                    <td className="px-4 py-3 text-sm">{rfmt.nama_lengkap}</td>
                    <td className="px-4 py-3 text-sm">{rfmt.jg}</td>
                    <td className="px-4 py-3 text-sm">{rfmt.kanca}</td>
                    <td className="px-4 py-3 text-sm">{rfmt.kelompok_jabatan_rmft_baru}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleEdit(rfmt)}
                        className="text-blue-500 hover:text-blue-700 mr-3"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rfmt.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`px-4 py-2 rounded ${
                  page === 1
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-gray-100 rounded">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded ${
                  page === totalPages
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editMode ? '✏️ Edit RFMT' : '➕ Add New RFMT'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PN *
                  </label>
                  <input
                    type="text"
                    name="pn"
                    value={formData.pn}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    JG
                  </label>
                  <input
                    type="text"
                    name="jg"
                    value={formData.jg}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ESGDESC
                  </label>
                  <input
                    type="text"
                    name="esgdesc"
                    value={formData.esgdesc}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kanca
                  </label>
                  <input
                    type="text"
                    name="kanca"
                    value={formData.kanca}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uker
                  </label>
                  <input
                    type="text"
                    name="uker"
                    value={formData.uker}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uker Tujuan
                  </label>
                  <input
                    type="text"
                    name="uker_tujuan"
                    value={formData.uker_tujuan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kelompok Jabatan RMFT
                  </label>
                  <input
                    type="text"
                    name="kelompok_jabatan_rmft_baru"
                    value={formData.kelompok_jabatan_rmft_baru}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    name="keterangan"
                    value={formData.keterangan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RFMTs;