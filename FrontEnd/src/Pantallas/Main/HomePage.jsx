// HomePage.jsx
// Pantalla principal

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import Sidebar from '../../components/Sidebar';
import ModuloCard from '../../components/ModuloCard';
import { MODULOS } from '../../components/modules';
import { getColor } from '../../components/Colors';

export default function HomePage() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.pagina}>
      <Sidebar
        usuario={usuario?.nombre}
        onNavegar={(path) => navigate(path)}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        <header style={styles.encabezado}>
          <h1 style={styles.tituloBienvenida}>
            Bienvenido, {usuario?.nombre || usuario?.display_name || usuario?.email || 'Usuario'}
          </h1>
          <div style={styles.lineaEncabezado} />
        </header>

        <section style={styles.contenedor}>
          <div style={styles.tituloContenedor}>
            <h2 style={styles.tituloContenedorTexto}>¿A qué módulo desea acceder?</h2>
            <div style={styles.lineaContenedor} />
          </div>

          <div style={styles.modulosGrid}>
            {MODULOS.map((m) => (
              <ModuloCard
                key={m.id}
                label={m.label}
                icon={m.icon}
                onClick={() => navigate(`/${m.id}`)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = {
  // Layout raíz

  pagina: {
    display: 'flex',
    width: '100vw',
    height: '100vh',  
    background: getColor("blanco"),
    fontFamily: 'Lato, sans-serif',
    overflow: 'hidden',
  },

  // ── Main ──
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '21px 50px',
    gap: 40,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },

  // ── Encabezado ──
  encabezado: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: '21px 0',
  },
  tituloBienvenida: {
    color: getColor("negro"),
    fontSize: '42px',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: 'center',
  },
  lineaEncabezado: {
    width: 'min(1100px, 80%)',
    height: 4,
    background: getColor("negro"),
  },

  // ── Contenedor ──
  contenedor: {
    width: '100%',
    maxWidth: 1550,
    padding: 25,
    background: getColor("blanco"),
    boxShadow: '0px 8px 8px 2px rgba(0,0,0,0.25)',
    borderRadius: 32,
    border: '5px solid #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 30,
    boxSizing: 'border-box',
  },

  // ── Título contenedor ──
  tituloContenedor: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    padding: '20px 77px',
  },
  tituloContenedorTexto: {
    color: getColor("gris"),
    fontSize: '32px',
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
    lineHeight: 1.2,
    textAlign: 'center',
    textShadow: '0px 1px 1px rgba(0,0,0,0.10)',
    margin: 0,
  },
  lineaContenedor: {
    width: 'min(1080px, 90%)',
    height: 3,
    background: getColor("geis"),
    boxShadow: '0px 6px 2px rgba(0,0,0,0.10)',
  },

  // ── Grid módulos ──
  modulosGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 25,
    padding: '30px 0',
  },

  // ── Tarjeta módulo ──
  moduloCard: {
    width: 180,
    height: 180,
    paddingTop: 10,
    paddingBottom: 10,
    background: getColor("amarillo"),
    boxShadow: '0px 6px 4px rgba(0,0,0,0.25)',
    borderRadius: 16,
    border: '2px solid #444444',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  moduloIcono: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduloLabel: {
    color: getColor("negro"),
    fontSize: 18,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: '31.2px',
    textAlign: 'center',
    width: '100%',
  },
};
