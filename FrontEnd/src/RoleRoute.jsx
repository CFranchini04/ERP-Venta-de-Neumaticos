import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const permisos = {
  admin: null,
  rrhh: ['/rrhh'],
  compras: ['/compras'],
  ventas: ['/ventas'],
  tesoreria: ['/tesoreria'],
  contabilidad: ['/contabilidad'],
};

const rutaInicio = {
  admin: '/home',
  rrhh: '/rrhh',
  compras: '/compras',
  ventas: '/ventas',
  tesoreria: '/tesoreria',
  contabilidad: '/contabilidad',
};

export default function RoleRoute() {
  const { usuario } = useAuth();
  const { pathname } = useLocation();

  if (!usuario) return <Navigate to="/" replace />;

  const rutasPermitidas = permisos[usuario.rol];

  if (rutasPermitidas === null) return <Outlet />;

  const tieneAcceso = rutasPermitidas.some(ruta => pathname.startsWith(ruta));

  if (!tieneAcceso) {
    return <Navigate to={rutaInicio[usuario.rol] ?? '/'} replace />;
  }

  return <Outlet />;
}