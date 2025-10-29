import React, { useState, useEffect } from 'react';
import { importDI319CSV, getDI319ImportProgress } from '../api';
import { Upload, FileText, CheckCircle, XCircle, Clock, Database } from 'lucide-react';

const ImportData = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [importProgress, setImportProgress] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Poll import progress setiap 500ms
  useEffect(() => {
    let interval;
    if (isImporting) {
      interval = setInterval(async () => {
        try {
          const response = await getDI319ImportProgress();
          setImportProgress(response.data);
          
          // Stop polling jika import selesai
          if (response.data.status === 'completed' || response.data.status === 'error') {
            setIsImporting(false);
          }
        } catch (err) {
          console.error('Error fetching progress:', err);
        }
      }, 500); // Update setiap 0.5 detik
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isImporting]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setResult(null);
      } else {
        setError('Please select a valid CSV file');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadedBytes(0);
    setTotalBytes(0);
    setError(null);
    setResult(null);
    setStartTime(new Date());
    setImportProgress(null);

    try {
      const response = await importDI319CSV(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
        setUploadedBytes(progressEvent.loaded);
        setTotalBytes(progressEvent.total);
        
        // Mulai polling progress saat upload selesai
        if (progress === 100) {
          setIsImporting(true);
        }
      });

      setResult(response.data);
      setUploading(false);
      setIsImporting(false);
      setFile(null);
      // Reset file input
      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload file');
      setUploading(false);
      setIsImporting(false);
    }
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getElapsedTime = () => {
    if (!startTime) return '0s';
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    if (elapsed < 60) return `${elapsed}s`;
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Import DI319 Data</h1>

      <div className="max-w-2xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload DI319 CSV File</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="text-gray-400 mb-3" size={48} />
                <span className="text-sm text-gray-600">
                  Click to select or drag and drop
                </span>
                <span className="text-xs text-gray-500 mt-1">CSV files only</span>
              </label>
            </div>
          </div>

          {file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  document.getElementById('file-input').value = '';
                }}
                className="text-red-600 hover:text-red-800"
              >
                <XCircle size={20} />
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading || isImporting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Uploading... {uploadProgress}%
              </>
            ) : isImporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing Data...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload and Import
              </>
            )}
          </button>

          {uploading && (
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              
              {/* Upload Progress Details */}
              {totalBytes > 0 && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600 text-xs mb-1">Uploaded</p>
                      <p className="font-semibold text-blue-700">
                        {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
                      </p>
                    </div>
                    <div className="text-center border-l border-r border-blue-300">
                      <p className="text-gray-600 text-xs mb-1">Speed</p>
                      <p className="font-semibold text-blue-700">
                        {startTime && uploadedBytes > 0
                          ? `${formatBytes(uploadedBytes / ((new Date() - startTime) / 1000))}/s`
                          : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600 text-xs mb-1">Elapsed Time</p>
                      <p className="font-semibold text-blue-700">{getElapsedTime()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Import Progress (Processing) */}
          {isImporting && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Database className="text-purple-600 animate-pulse" size={20} />
                <p className="text-sm font-medium text-purple-800">
                  {importProgress ? 'Processing Data...' : 'Starting import...'}
                </p>
              </div>
              
              {importProgress ? (
                <>
                  {/* Progress Bar */}
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
                    <div
                      className="bg-purple-600 h-full transition-all duration-300"
                      style={{ 
                        width: `${importProgress.total_rows > 0 
                          ? (importProgress.imported_rows / importProgress.total_rows * 100) 
                          : 0}%` 
                      }}
                    ></div>
                  </div>

                  {/* Import Statistics */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600 text-xs">DI319 Saved</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatNumber(importProgress.imported_rows || 0)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600 text-xs">Total Processed</p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatNumber(importProgress.total_rows || 0)}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600 text-xs">Status</p>
                      <p className="text-lg font-bold text-blue-600">
                        {importProgress.status || 'Processing'}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600 text-xs">Progress</p>
                      <p className="text-lg font-bold text-indigo-600">
                        {importProgress.total_rows > 0 
                          ? `${((importProgress.imported_rows / importProgress.total_rows) * 100).toFixed(1)}%`
                          : '0%'}
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-xs text-purple-600">
                    {importProgress.message || 'Processing...'}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-sm text-purple-600">Mempersiapkan data untuk import...</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div className="w-full">
                  <p className="text-sm font-medium text-green-800">Import Successful!</p>
                  <p className="text-sm text-green-600">{result.message}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600">DI319 Saved</p>
                  <p className="text-lg font-bold text-green-600">{formatNumber(result.success || result.imported_rows || result.filtered_records)}</p>
                </div>
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600">Total Processed</p>
                  <p className="text-lg font-bold text-purple-600">{formatNumber(result.total || result.total_rows)}</p>
                </div>
                {result.failed > 0 && (
                  <div className="bg-white rounded p-2">
                    <p className="text-gray-600">Failed</p>
                    <p className="text-lg font-bold text-red-600">{formatNumber(result.failed)}</p>
                  </div>
                )}
                <div className="bg-white rounded p-2">
                  <p className="text-gray-600">Filter Rate</p>
                  <p className="text-lg font-bold text-orange-600">
                    {result.filter_percentage ? `${result.filter_percentage.toFixed(1)}%` : '-'}
                  </p>
                </div>
              </div>
              {result.speed && (
                <div className="bg-white rounded p-3 border-t border-green-200">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-600">Speed</p>
                      <p className="font-semibold text-blue-600">{Math.round(result.speed).toLocaleString()} rows/sec</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration (ms)</p>
                      <p className="font-semibold text-purple-600">{result.duration_ms?.toLocaleString()} ms</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start Time</p>
                      <p className="font-semibold text-gray-700">{result.start_time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Time</p>
                      <p className="font-semibold text-gray-700">{result.end_time}</p>
                    </div>
                  </div>
                </div>
              )}
              {result.filter_percentage !== undefined && (
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs text-blue-800">
                    <strong>{result.filter_percentage.toFixed(1)}%</strong> of processed records met the ≥50% balance drop threshold and were saved to DI319 table.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions Section - REMOVED */}
      </div>
    </div>
  );
};

export default ImportData;
