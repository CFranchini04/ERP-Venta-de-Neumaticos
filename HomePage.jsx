// HomePage.jsx
// Pantalla principal

import { useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ModuloCard from './components/ModuloCard';
import { MODULOS } from './components/modules';

// ─── Página principal ─────────────────────────────────────────────────────────

export default function HomePage() {
  const usuario = 'El Ingeniero 13';

  function handleNavegar(moduloId) {
    console.log('Navegar a:', moduloId);
  }

  function handleSalir() {
    console.log('Cerrar sesión');
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onSalir={handleSalir} />

      <main style={styles.main}>
        {/* Encabezado */}
        <header style={styles.encabezado}>
          <h1 style={styles.tituloBienvenida}>Bienvenido, {usuario}</h1>
          <div style={styles.lineaEncabezado} />
        </header>

        {/* Contenedor central */}
        <section style={styles.contenedor}>
          {/* Título contenedor */}
          <div style={styles.tituloContenedor}>
            <h2 style={styles.tituloContenedorTexto}>¿A qué módulo desea acceder?</h2>
            <div style={styles.lineaContenedor} />
          </div>

          {/* Grid de módulos */}
          <div style={styles.modulosGrid}>
            {MODULOS.map((m) => (
              <ModuloCard
                key={m.id}
                label={m.label}
                icon={m.icon}
                onClick={() => handleNavegar(m.id)}
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
    background: '#F9F9F9',
    fontFamily: 'Lato, sans-serif',
    overflow: 'hidden',
  },

  // ── Sidebar ──
  sidebar: {
    width: 200,
    minWidth: 200,
    minWidth: 250,
    height: '100vh',
    background: '#444444',
    borderRight: '1px solid #1D1D1D',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 45,
    gap: 30,
    boxSizing: 'border-box',
  },
  sidebarTitulo: {
    color: '#F9F9F9',
    fontSize: 26,
    fontFamily: "'Racing Sans One', cursive",
    fontWeight: 400,
    lineHeight: '31.2px',
  },
  sidebarNav: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    flex: 1,
  },
  sidebarItem: {
    width: '100%',
    height: 60,
    padding: 10,
    background: '#FFCC00',
    borderBottom: '2px solid #1D1D1D',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#1D1D1D',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  sidebarItemIcono: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sidebarItemLabel: {
    color: '#1D1D1D',
    fontSize: 22,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: '31.2px',
    flex: 1,
    textAlign: 'left',
  },
  sidebarFlecha: {
    color: '#1D1D1D',
    fontSize: 22,
    fontWeight: 700,
  },
  sidebarUsuario: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  sidebarUsuarioNombre: {
    color: '#F9F9F9',
    fontSize: 20,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 400,
    lineHeight: '31.2px',
    textAlign: 'center',
  },
  sidebarBotonSalir: {
    width: 100,
    height: 50,
    background: '#F9F9F9',
    border: 'none',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
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
    color: '#444444',
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
    background: '#444444',
  },

  // ── Contenedor ──
  contenedor: {
    width: '100%',
    maxWidth: 1550,
    padding: 25,
    background: '#F9F9F9',
    boxShadow: '0px 8px 8px 2px rgba(0,0,0,0.25)',
    borderRadius: 32,
    border: '5px solid #CECECE',
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
    color: '#444444',
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
    background: '#444444',
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
    background: '#FFCC00',
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
    color: '#1D1D1D',
    fontSize: 18,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    lineHeight: '31.2px',
    textAlign: 'center',
    width: '100%',
  },
};
