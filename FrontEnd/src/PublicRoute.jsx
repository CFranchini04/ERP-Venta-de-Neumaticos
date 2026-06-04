import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const rutasFijas = {
  admin: '/home',
  rrhh: '/rrhh',
  compras: '/compras',
  contabilidad: '/contabilidad',
  ventas: '/ventas',
  tesoreria: '/tesoreria',
};

export default function PublicRoute() {
  const { usuario } = useAuth();

  if (!usuario) return <Outlet />;

  const rol = usuario.rol || usuario.user_metadata?.rol;
  const destino = rutasFijas[rol] ?? usuario.user_metadata?.rutas?.[0];

  if (!destino) return <Outlet />;

  return <Navigate to={destino} replace />;
}
