import { useState, useEffect } from 'react';
import { getProductTypes, createProductType, updateProductType, deleteProductType } from '../api';
import { Package, Plus, Edit, Trash2, X, Search } from 'lucide-react';

const ProductTypes = () => {
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProductType, setEditingProductType] = useState(null);
  const [deletingProductType, setDeletingProductType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const [formData, setFormData] = useState({
    kode_product: '',
    nama_product: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProductTypes();
  }, [currentPage, searchTerm]);

  const fetchProductTypes = async () => {
    setLoading(true);
    try {
      const response = await getProductTypes({
        page: currentPage,
        page_size: pageSize,
        search: searchTerm
      });
      setProductTypes(response.data.data || []);
      setTotalItems(response.data.meta?.total || 0);
      setTotalPages(Math.ceil((response.data.meta?.total || 0) / pageSize));
    } catch (error) {
      console.error('Error fetching product types:', error);
      alert('Gagal memuat data product types: ' + (error.response?.data?.error || error.message));
      setProductTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (productType = null) => {
    if (productType) {
      setEditingProductType(productType);
      setFormData({
        kode_product: productType.kode_product,
        nama_product: productType.nama_product
      });
    } else {
      setEditingProductType(null);
      setFormData({
        kode_product: '',
        nama_product: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProductType(null);
    setFormData({
      kode_product: '',
      nama_product: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.kode_product.trim()) {
      newErrors.kode_product = 'Kode Product harus diisi';
    } else if (formData.kode_product.length > 20) {
      newErrors.kode_product = 'Kode Product maksimal 20 karakter';
    }

    if (!formData.nama_product.trim()) {
      newErrors.nama_product = 'Nama Product harus diisi';
    } else if (formData.nama_product.length > 100) {
      newErrors.nama_product = 'Nama Product maksimal 100 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editingProductType) {
        await updateProductType(editingProductType.id, formData);
        alert('Product Type berhasil diupdate!');
      } else {
        await createProductType(formData);
        alert('Product Type berhasil ditambahkan!');
      }
      handleCloseModal();
      fetchProductTypes();
    } catch (error) {
      console.error('Error saving product type:', error);
      if (error.response?.data?.error) {
        alert('Error: ' + error.response.data.error);
      } else {
        alert('Gagal menyimpan product type');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProductType) return;

    setLoading(true);
    try {
      await deleteProductType(deletingProductType.id);
      alert('Product Type berhasil dihapus!');
      setShowDeleteModal(false);
      setDeletingProductType(null);
      fetchProductTypes();
    } catch (error) {
      console.error('Error deleting product type:', error);
      alert('Gagal menghapus product type: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteModal = (productType) => {
    setDeletingProductType(productType);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingProductType(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Product Type</h1>
        </div>
        <p className="text-gray-600">Kelola data jenis produk</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari kode atau nama product..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Tambah Product Type
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : productTypes.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data product type</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kode Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productTypes.map((productType, index) => (
                    <tr key={productType.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                          {productType.kode_product}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {productType.nama_product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(productType)}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5 inline" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(productType)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <Trash2 className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-700">
                Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} dari {totalItems} data
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-100 rounded-lg">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingProductType ? 'Edit Product Type' : 'Tambah Product Type'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kode Product <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.kode_product}
                    onChange={(e) =>
                      setFormData({ ...formData, kode_product: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.kode_product ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan kode product"
                    maxLength={20}
                  />
                  {errors.kode_product && (
                    <p className="mt-1 text-sm text-red-500">{errors.kode_product}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Product <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama_product}
                    onChange={(e) =>
                      setFormData({ ...formData, nama_product: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.nama_product ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama product"
                    maxLength={100}
                  />
                  {errors.nama_product && (
                    <p className="mt-1 text-sm text-red-500">{errors.nama_product}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Menyimpan...' : editingProductType ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Hapus Product Type</h2>
                  <p className="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">Anda akan menghapus:</p>
                <p className="font-semibold text-gray-800">
                  {deletingProductType?.kode_product} - {deletingProductType?.nama_product}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {loading ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTypes;
