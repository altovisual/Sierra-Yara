import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/admin/Login';
import ProtectedRoute from '../components/admin/ProtectedRoute';
import Dashboard from '../components/admin/Dashboard';
import GestionPedidos from '../components/admin/GestionPedidos';
import GestionProductos from '../components/admin/GestionProductos';
import GestionPromociones from '../components/admin/GestionPromociones';
import GestionInventario from '../components/admin/GestionInventario';
import GeneradorQR from '../components/admin/GeneradorQR';
import GestionTasaBCV from '../components/admin/GestionTasaBCV';
import Reportes from '../components/admin/Reportes';
import GestionClientes from '../components/admin/GestionClientes';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/pedidos" element={<ProtectedRoute><GestionPedidos /></ProtectedRoute>} />
      <Route path="/productos" element={<ProtectedRoute><GestionProductos /></ProtectedRoute>} />
      <Route path="/promociones" element={<ProtectedRoute><GestionPromociones /></ProtectedRoute>} />
      <Route path="/inventario" element={<ProtectedRoute><GestionInventario /></ProtectedRoute>} />
      <Route path="/generar-qr" element={<ProtectedRoute><GeneradorQR /></ProtectedRoute>} />
      <Route path="/tasa-bcv" element={<ProtectedRoute><GestionTasaBCV /></ProtectedRoute>} />
      <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><GestionClientes /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
