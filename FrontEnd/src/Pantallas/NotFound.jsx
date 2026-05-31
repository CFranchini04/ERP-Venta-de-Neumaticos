import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const rutaInicio = {
  admin: '/home',
  rrhh: '/rrhh',
  compras: '/compras',
  ventas: '/ventas',
  tesoreria: '/tesoreria',
  contabilidad: '/contabilidad',
};

export default function NotFound() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const destino = usuario ? (rutaInicio[usuario.rol] ?? '/') : '/';

  return (
    <div style={styles.pagina}>
      <div style={styles.card}>
        <span style={styles.codigo}>404</span>
        <h1 style={styles.titulo}>Página no encontrada</h1>
        <p style={styles.descripcion}>
          La ruta que buscas no existe.
        </p>
        <button style={styles.boton} onClick={() => navigate(destino)}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

const styles = {
  pagina: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#F9F9F9',
    fontFamily: 'Lato, sans-serif',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    background: '#fff',
    border: '3px solid #000',
    borderRadius: 12,
    padding: '48px 64px',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
    textAlign: 'center',
  },
  codigo: {
    fontSize: 96,
    fontWeight: 900,
    lineHeight: 1,
    color: '#FFCC00',
    textShadow: '3px 3px 0px #000',
  },
  titulo: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
    color: '#000',
  },
  descripcion: {
    fontSize: 16,
    color: '#555',
    margin: 0,
  },
  boton: {
    marginTop: 8,
    padding: '12px 32px',
    background: '#FFCC00',
    border: '2px solid #000',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Lato, sans-serif',
  },
};
