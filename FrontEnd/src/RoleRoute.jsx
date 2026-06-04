import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RoleRoute() {
  const { usuario, logout } = useAuth();
  const { pathname } = useLocation();

  if (!usuario) return <Navigate to="/" replace />;

  const rol = usuario.rol || usuario.user_metadata?.rol;

  if (rol === 'admin') return <Outlet />;

  const rutas = usuario.user_metadata?.rutas ?? [];

  if (rutas.length === 0) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Lato, sans-serif', gap: 16 }}>
        <h2 style={{ margin: 0 }}>Sin acceso</h2>
        <p style={{ color: '#666', margin: 0 }}>Tu usuario no tiene módulos asignados. Contactá al administrador.</p>
        <button onClick={logout} style={{ padding: '10px 24px', background: '#222', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15 }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  const tieneAcceso = rutas.some(ruta => pathname.startsWith(ruta));

  if (!tieneAcceso) return <Navigate to={rutas[0]} replace />;

  return <Outlet />;
}
