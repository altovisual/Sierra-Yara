import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Rutas de administración
import AdminRoutes from './routes/AdminRoutes';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TasaBCVProvider>
        <AdminDataProvider>
          <MesaProvider>
            <CarritoProvider>
              <FavoritosProvider>
                <Routes>
            {/* Rutas del cliente */}
            <Route path="/" element={<EscanearQR />} />
            <Route path="/mesa/:numeroMesa" element={<EscanearQR />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promociones" element={<Promociones />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/mis-pedidos" element={<MisPedidos />} />
            <Route path="/pago/:pedidoId" element={<Pago />} />
            <Route path="/cuenta-mesa" element={<CuentaMesa />} />

            {/* Rutas de administración */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* Ruta por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </FavoritosProvider>
            </CarritoProvider>
          </MesaProvider>
        </AdminDataProvider>
      </TasaBCVProvider>
    </Router>
  );
}

export default App;
