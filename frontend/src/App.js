import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MesaProvider } from './context/MesaContext';
import { CarritoProvider } from './context/CarritoContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { TasaBCVProvider } from './context/TasaBCVContext';

// Componentes del cliente
import EscanearQR from './components/cliente/EscanearQR';
import Menu from './components/cliente/Menu';
import Carrito from './components/cliente/Carrito';
import MisPedidos from './components/cliente/MisPedidos';
import Pago from './components/cliente/Pago';
import CuentaMesa from './components/cliente/CuentaMesa';
import Promociones from './components/cliente/Promociones';

// Componente de protección
import ProtectedRoute from './components/common/ProtectedRoute';
import HomeRedirect from './components/common/HomeRedirect';

// Rutas de administración
import AdminRoutes from './routes/AdminRoutes';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <TasaBCVProvider>
          <AdminDataProvider>
            <MesaProvider>
              <CarritoProvider>
                <FavoritosProvider>
                  <Routes>
            {/* Ruta raíz - maneja redirección con query params */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Rutas públicas (sin protección) */}
            <Route path="/escanear" element={<EscanearQR />} />
            <Route path="/mesa/:numeroMesa" element={<EscanearQR />} />
            
            {/* Rutas protegidas (requieren estar conectado a una mesa) */}
            <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
            <Route path="/promociones" element={<ProtectedRoute><Promociones /></ProtectedRoute>} />
            <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
            <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
            <Route path="/pago/:pedidoId" element={<ProtectedRoute><Pago /></ProtectedRoute>} />
            <Route path="/cuenta-mesa" element={<ProtectedRoute><CuentaMesa /></ProtectedRoute>} />

            {/* Rutas de administración */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/escanear" replace />} />
                  </Routes>
                </FavoritosProvider>
              </CarritoProvider>
            </MesaProvider>
          </AdminDataProvider>
        </TasaBCVProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
