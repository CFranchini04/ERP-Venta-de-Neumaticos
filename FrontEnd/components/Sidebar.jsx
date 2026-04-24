// Sidebar.jsx
// Sidebar con dropdown único abierto

import { useState } from 'react';
import { IconoSalir } from './Icons';
import { MODULOS } from './modules';
import LogoFukuchi from '../LogoFukuchi.png';
import { getColor } from './Colors';

export default function Sidebar({ usuario, onNavegar, onLogout }) {

  const [abierto, setAbierto] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  function handleSalir() {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onLogout();
    }
  }

  function toggleModulo(id) {
    setAbierto((prev) => (prev === id ? null : id));
  }

  const SUBMENUS = {
    compras: [
      { id: 'nuevo_pedido', label: 'Nuevo pedido' },
      { id: 'proveedores', label: 'Proveedores' },
      { id: 'cotizaciones', label: 'Cotizaciones' },
      { id: 'facturas_compras', label: 'Facturas' },
    ],
    rrhh: [
      { id: 'gestion_personal', label: 'Gestión de Personal' },
      { id: 'gestion_salarios', label: 'Gestión de Salarios' },
    ],
    ventas: [
      { id: 'presupuestos', label: 'Presupuestos' },
      { id: 'facturas_ventas', label: 'Facturas' },
      { id: 'notas_credito', label: 'Notas de crédito' },
      { id: 'venta_directa', label: 'Venta directa' },
    ],
    contabilidad: [
      { id: 'conta_1', label: 'Placeholder 1' },
      { id: 'conta_2', label: 'Placeholder 2' },
    ],
    tesoreria: [
      { id: 'teso_1', label: 'Placeholder 1' },
      { id: 'teso_2', label: 'Placeholder 2' },
    ],
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <button
        onClick={() => onNavegar('home')}
        style={styles.sidebarTituloContainer}
        title="Ir a inicio"
      >
        <img
          src={LogoFukuchi}
          alt="Logo Neumáticos FUKUCHI"
          style={styles.sidebarLogo}
        />
      </button>

      {/* Navegación */}
      <nav style={styles.sidebarNav}>
        {MODULOS.map((m) => (
          <div key={m.id} style={{ width: '100%' }}>

            {/* Botón principal */}
            <button
              onClick={() => toggleModulo(m.id)}
              style={styles.sidebarItem}
            >
              <span style={styles.sidebarItemIcono}>{m.icon}</span>
              <span style={styles.sidebarItemLabel}>{m.label}</span>
              <span style={styles.sidebarFlecha}>
                {abierto === m.id ? '⌄' : '›'}
              </span>
            </button>

            {/* Dropdown */}
            {abierto === m.id && SUBMENUS[m.id] && (
              <div style={styles.dropdown}>
                {SUBMENUS[m.id].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onNavegar(sub.id)}
                    onMouseEnter={() => setHoveredItem(sub.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      ...styles.dropdownItem,
                      background:
                        hoveredItem === sub.id
                          ? getColor('amarillo-claro')
                          : getColor('blanco'),
                      color: getColor('negro'),
                    }}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Usuario */}
      <div style={styles.sidebarUsuario}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="50"
          height="50"
          viewBox="0 0 16 16"
          style={{ color: '#F9F9F9' }}
        >
          <path
            fill="currentColor"
            d="M8 8.5c3.85 0 7 2.5 7 4.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2c0-2 3.15-4.5 7-4.5M8 10c-1.61 0-3.064.526-4.092 1.234C2.798 12.001 2.798 12.001 2.5 13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5c0-.267-.297-1-1.408-1.766C11.064 10.526 9.609 10 8 10m0-9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m0 1.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
          />
        </svg>

        <span style={styles.sidebarUsuarioNombre}>{usuario}</span>

        <button
          onClick={handleSalir}
          style={styles.sidebarBotonSalir}
          title="Log Out"
        >
          <IconoSalir />
        </button>
      </div>
    </aside>
  );
}

// Estilos para el sidebar
const styles = {
  sidebar: {
    width: 250,
    minWidth: 250,
    height: '100vh',
    background: getColor("negro"),
    borderRight: '1px solid #1D1D1D',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 45,
    gap: 30,
  },

  sidebarNav: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  sidebarItem: {
    width: '100%',
    height: 60,
    padding: 10,
    background: getColor("amarillo"),
    border: 'none',
    borderBottom: '2px solid #1D1D1D',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
  },

  sidebarItemIcono: {
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sidebarItemLabel: {
    color: getColor("negro"),
    fontSize: 22,
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700,
    flex: 1,
    textAlign: 'left',
  },

  sidebarFlecha: {
    fontSize: 22,
    fontWeight: 700,
  },

  dropdown: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: getColor("negro"),
  },

  dropdownItem: {
    width: '100%',
    padding: '10px 20px',
    background: getColor("blanco"),
    color: getColor("negro"),
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid #333',
  },

  sidebarUsuario: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },

  sidebarUsuarioNombre: {
    color: getColor("blanco"),
    fontSize: 20,
  },

  sidebarBotonSalir: {
    width: 100,
    height: 50,
    background: getColor("blanco"),
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },

  sidebarTituloContainer: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },

  sidebarLogo: {
    width: 210,
  },
};
