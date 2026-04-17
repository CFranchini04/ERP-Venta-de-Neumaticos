// Sidebar.jsx
// Componente del sidebar lateral

import { IconoSalir } from './Icons';
import { MODULOS } from './modules';

export default function Sidebar({ usuario, onNavegar, onLogout }) {
  function handleSalir() {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  }

  return (
    <aside style={styles.sidebar}>
      {/* Logo / nombre app */}
      <div style={styles.sidebarTituloContainer}>
        <span style={styles.sidebarTituloNeumaticos}>Neumáticos</span>
        <span style={styles.sidebarTituloFukuchi}>FUKUCHI</span>
      </div>

      {/* Navegación */}
      <nav style={styles.sidebarNav}>
        {MODULOS.map((m) => (
          <button
            key={m.id}
            onClick={() => onNavegar(m.id)}
            style={styles.sidebarItem}
          >
            <span style={styles.sidebarItemIcono}>{m.icon}</span>
            <span style={styles.sidebarItemLabel}>{m.label}</span>
            <span style={styles.sidebarFlecha}>›</span>
          </button>
        ))}
      </nav>

      {/* Usuario */}
      <div style={styles.sidebarUsuario}>
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 16 16" style={{ color: '#F9F9F9' }}>
          <path fill="currentColor" d="M8 8.5c3.85 0 7 2.5 7 4.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2c0-2 3.15-4.5 7-4.5M8 10c-1.61 0-3.064.526-4.092 1.234C2.798 12.001 2.798 12.001 2.5 13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5c0-.267-.297-1-1.408-1.766C11.064 10.526 9.609 10 8 10m0-9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m0 1.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4"/>
        </svg>
        <span style={styles.sidebarUsuarioNombre}>{usuario}</span>
        <button onClick={handleSalir} style={styles.sidebarBotonSalir} title="Log Out">
          <IconoSalir />
        </button>
      </div>
    </aside>
  );
}

// Estilos para Sidebar
const styles = {
  sidebar: {
    width: 200,
    minWidth: 200,
    minWidth: 250,
    height: '100vh',
    background: '#000000',
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
  sidebarTituloContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: -5,
  },
  sidebarTituloNeumaticos: {
    color: '#F9F9F9',
    fontSize: 22,
    fontFamily: "'Racing Sans One', cursive",
    fontWeight: 400,
    lineHeight: '22px',
  },
  sidebarTituloFukuchi: {
    color: '#F9F9F9',
    fontSize: 32,
    fontFamily: "'Racing Sans One', cursive",
    fontWeight: 400,
    lineHeight: '32px',
  },
};
