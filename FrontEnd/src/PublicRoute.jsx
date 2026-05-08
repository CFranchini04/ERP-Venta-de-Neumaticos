import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const rutas = {
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

  return <Navigate to={rutas[usuario.rol] ?? '/home'} replace />;
}