// Sidebar.jsx

import { useState } from 'react';
import { IconoSalir } from './Icons';
import { MODULOS } from './modules';
import LogoFukuchi from '../LogoFukuchi.png';
import { getColor } from './Colors';
import { IconoDropdown } from './Icons';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ onNavegar }) {

  const [abierto, setAbierto] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredModulo, setHoveredModulo] = useState(null);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleSalir() {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      navigate('/');
    }
  }

  function toggleModulo(id) {
    setAbierto((prev) => (prev === id ? null : id));
  }

  const resolveSubRuta = (modulo, subId) => {
    const rutas = {
      compras: {
        pedidos: '/compras/pedidos',
        cotizaciones: '/compras/cotizaciones',
        ordenesCompra: '/compras/ordenes-de-compra',
        ordenesPago: '/compras/ordenes-de-pago',
        facturas: '/compras/facturas',
        proveedores: '/compras/proveedores',
      },
      rrhh: {
        lista_personal: '/rrhh',
        nuevo_empleado: '/rrhh/nuevo-empleado',
      },
      ventas: {
        presupuestos: '/ventas/presupuestos',
        facturas_ventas: '/ventas/facturas',
        notas_credito: '/ventas/notas-credito',
        venta_directa: '/ventas/venta-directa',
      },
      contabilidad: {
        plan_de_cuentas: '/contabilidad/plan-de-cuentas',
        libro_diario: '/contabilidad/libro-diario',
        libro_mayor: '/contabilidad/libro-mayor',
        balance_general: '/contabilidad/balance-general',
        balance_sumas_saldos: '/contabilidad/balance-sumas-saldos',
        balance_resultados: '/contabilidad/balance-resultados',
      },
      tesoreria: {
        bancos_y_saldos: '/tesoreria/bancos-saldos',
        depositos: '/tesoreria/deposito',
        movimientos: '/tesoreria/movimientos',
        conciliacion: '/tesoreria/conciliacion',
      },
    };

    return rutas[modulo]?.[subId] || `/${modulo}`;
  };

  const handleNavegar = (ruta) => {
    const isExternal = /^https?:\/\//.test(ruta);
    if (isExternal) {
      window.location.href = ruta;
      return;
    }

    navigate(ruta);
    if (typeof onNavegar === 'function') {
      try {
        onNavegar(ruta);
      } catch (err) {
        console.error('Error en onNavegar:', err);
      }
    }
  };

  const SUBMENUS = {
    compras: [
      { id: 'pedidos', label: 'Pedidos' },
      { id: 'cotizaciones', label: 'Cotizaciones' },
      { id: 'ordenesCompra', label: 'Ordenes de Compra' },
      { id: 'ordenesPago', label: 'Ordenes de Pago' },
      { id: 'facturas', label: 'Facturas' },
      { id: 'proveedores', label: 'Proveedores' },
    ],
    rrhh: [
      { id: 'lista_personal', label: 'Lista de Personal' },
      { id: 'nuevo_empleado', label: 'Nuevo Empleado' },
    ],
    ventas: [
      { id: 'presupuestos', label: 'Presupuestos' },
      { id: 'facturas_ventas', label: 'Facturas' },
      { id: 'notas_credito', label: 'Notas de crédito' },
      { id: 'venta_directa', label: 'Venta directa' },
    ],
    contabilidad: [
      { id: 'plan_de_cuentas',      label: 'Plan de Cuentas' },
      { id: 'libro_diario',         label: 'Libro Diario' },
      { id: 'libro_mayor',          label: 'Libro Mayor' },
      { id: 'balance_general',      label: 'Balance General' },
      { id: 'balance_sumas_saldos', label: 'Sumas y Saldos' },
      { id: 'balance_resultados',   label: 'Balance de Resultados' },
    ],
    tesoreria: [
      { id: 'bancos_y_saldos', label: 'Bancos y Saldos' },
      { id: 'depositos', label: 'Depositos' },
      { id: 'movimientos', label: 'Movimientos' },
      { id: 'conciliacion', label: 'Conciliación' },
    ],
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <button
        onClick={() => handleNavegar('/home')}
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
          <div key={m.id} style={{ width: '100%', position: 'relative' }}>

            {/* Botón principal */}
            <button
              onClick={() => handleNavegar(`/${m.id}`)}
              style={styles.sidebarItem}
            >
              <span style={styles.sidebarItemIcono}>{m.icon}</span>

              <span style={styles.sidebarItemLabel}>
                {m.label}
              </span>

              <span
                style={styles.sidebarFlecha}
                onMouseEnter={() => setHoveredModulo(m.id)}
                onMouseLeave={() => setHoveredModulo(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModulo(m.id);
                }}
              >
                <IconoDropdown
                  hovered={hoveredModulo === m.id}
                  active={abierto === m.id}
                />
              </span>
            </button>

            {/* Dropdown */}
            {abierto === m.id && SUBMENUS[m.id] && (
              <div style={styles.dropdown}>
                {SUBMENUS[m.id].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => handleNavegar(resolveSubRuta(m.id, sub.id))}
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
          style={{ color: getColor("blanco") }}
        >
          <path
            fill="currentColor"
            d="M8 8.5c3.85 0 7 2.5 7 4.5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2c0-2 3.15-4.5 7-4.5M8 10c-1.61 0-3.064.526-4.092 1.234C2.798 12.001 2.798 12.001 2.5 13a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5c0-.267-.297-1-1.408-1.766C11.064 10.526 9.609 10 8 10m0-9a3.5 3.5 0 1 1 0 7a3.5 3.5 0 0 1 0-7m0 1.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4"
          />
        </svg>

        <span style={styles.sidebarUsuarioNombre}>
          {usuario?.nombre || usuario?.display_name || usuario?.email || usuario?.user || 'Usuario'}
        </span>

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
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    overflowY: 'auto',
    zIndex: 100,
    background: getColor("negro"),
    borderRight: '1px solid #1D1D1D',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 25,
    gap: 1,
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
    position: 'absolute',
    top: 60,
    left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: getColor("negro"),
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
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
