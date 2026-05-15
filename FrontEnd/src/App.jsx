import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import PublicRoute from './PublicRoute';
import Login from './Pantallas/Login/Login';
import HomePage from './Pantallas/Main/HomePage';
import { RRHH, GestionPersonal, GestionSalarial } from './Pantallas/RRHH';
import { Compras, Pedidos, Cotizaciones, OrdenesCompra, OrdenesPago, NuevoPedido } from './Pantallas/Compras';
import Ventas from './Pantallas/Ventas/Ventas';
import Tesoreria from './Pantallas/Tesoreria/Tesoreria';
import Contabilidad from './Pantallas/Contabilidad/Contabilidad';
import RoleRoute from './RoleRoute';

function Redirect404() {
  useEffect(() => {
    window.location.href = 'https://http.cat/404';
  }, []);

  return null;
}

function Redirect501() {
  useEffect(() => {
    window.location.href = 'https://http.cat/images/501.jpg';
  }, []);

  return null;
}

export default function App() {


  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Login />} />
          </Route>

          {/* Rutas privadas */}
          <Route element={<RoleRoute />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/rrhh" element={<RRHH />} />
            <Route path="/rrhh/nuevo-empleado" element={<GestionPersonal />} />
            <Route path="/rrhh/gestion-salarial" element={<GestionSalarial />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/compras/pedidos" element={<Pedidos />} />
            <Route path="/compras/pedidos/nuevo-pedido" element={<NuevoPedido />} />
            <Route path="/compras/cotizaciones" element={<Cotizaciones />} />
            <Route path="/compras/ordenes-de-compra" element={<OrdenesCompra />} />
            <Route path="/compras/ordenes-de-pago" element={<OrdenesPago />} />
            <Route path="/compras/facturas" element={<Redirect501 />} />
            <Route path="/compras/proveedores" element={<Redirect501 />} />
            <Route path="/tesoreria" element={<Tesoreria />} />
            <Route path="/contabilidad" element={<Contabilidad />} />
          </Route>

          <Route path="*" element={<Redirect404 />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
