import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/admin/Dashboard';
import GestionPedidos from '../components/admin/GestionPedidos';
import GestionProductos from '../components/admin/GestionProductos';
import GestionPromociones from '../components/admin/GestionPromociones';
import GestionInventario from '../components/admin/GestionInventario';
import GeneradorQR from '../components/admin/GeneradorQR';
import GestionTasaBCV from '../components/admin/GestionTasaBCV';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/pedidos" element={<GestionPedidos />} />
      <Route path="/productos" element={<GestionProductos />} />
      <Route path="/promociones" element={<GestionPromociones />} />
      <Route path="/inventario" element={<GestionInventario />} />
      <Route path="/generar-qr" element={<GeneradorQR />} />
      <Route path="/tasa-bcv" element={<GestionTasaBCV />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
