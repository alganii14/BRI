import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RFMTs from './pages/RFMTs';
import Ukers from './pages/Ukers';
import ProductTypes from './pages/ProductTypes';
import DI319Data from './pages/DI319Data';
import ImportData from './pages/ImportData';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfmts"
          element={
            <ProtectedRoute>
              <Layout>
                <RFMTs />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ukers"
          element={
            <ProtectedRoute>
              <Layout>
                <Ukers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-types"
          element={
            <ProtectedRoute>
              <Layout>
                <ProductTypes />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/di319"
          element={
            <ProtectedRoute>
              <Layout>
                <DI319Data />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/import"
          element={
            <ProtectedRoute>
              <Layout>
                <ImportData />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Redirect any unknown routes to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
