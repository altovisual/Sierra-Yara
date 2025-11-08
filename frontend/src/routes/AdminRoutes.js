import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../components/admin/Dashboard';
import GestionPedidos from '../components/admin/GestionPedidos';
import GestionProductos from '../components/admin/GestionProductos';
import GestionPromociones from '../components/admin/GestionPromociones';
import GeneradorQR from '../components/admin/GeneradorQR';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/pedidos" element={<GestionPedidos />} />
      <Route path="/productos" element={<GestionProductos />} />
      <Route path="/promociones" element={<GestionPromociones />} />
      <Route path="/generar-qr" element={<GeneradorQR />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
