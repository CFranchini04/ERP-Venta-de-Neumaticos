import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { getColor } from '../../components/Colors';
import List from '../../components/Lista';
import { IconoMas } from '../../components/Icons';

// Mismas cuentas que en Cuenta.jsx — reemplazar por fetch cuando haya BD
const CUENTAS = [
  { id: 1, nombre: 'Banco Nacional - Cuenta Corriente' },
  { id: 2, nombre: 'Banco Itaú - Ahorros' },
  { id: 3, nombre: 'Banco Continental - Empresa' },
];

const historialMock = [
  { id: 1, fecha: '10/05/2026', cuenta: 'Banco Nacional - Cuenta Corriente', concepto: 'Depósito inicial', total: 5000000 },
  { id: 2, fecha: '12/05/2026', cuenta: 'Banco Itaú - Ahorros', concepto: 'Cobro cliente ABC', total: 2300000 },
  { id: 3, fecha: '18/05/2026', cuenta: 'Banco Continental - Empresa', concepto: 'Transferencia interna', total: 800000 },
];

export default function Deposito({ usuario = 'Empleado', onLogout, onNavegar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cuentaInicial = location.state?.cuenta || null;
  const [cuentaId, setCuentaId] = useState(cuentaInicial?.id ?? '');

  function handleNavegar(moduloId) {
    if (moduloId === 'cuentas') { navigate('/tesoreria/cuentas'); return; }
    if (onNavegar) onNavegar(moduloId);
  }

  function handleRegistrar() {
    const cuenta = CUENTAS.find(c => c.id === Number(cuentaId));
    console.log('Registrar depósito para cuenta:', cuenta);
  }

  const sinCuenta = !cuentaId;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>

        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Depósitos</h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.cuerpo}>

          {/* ── Cuenta ── */}
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Cuenta</h2>

            <div style={styles.filaAccion}>
              <select
                value={cuentaId}
                onChange={e => setCuentaId(e.target.value)}
                style={styles.select}
              >
                <option value="">Seleccionar cuenta...</option>
                {CUENTAS.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              <button
                style={{ ...styles.btnRegistrar, opacity: sinCuenta ? 0.5 : 1, cursor: sinCuenta ? 'not-allowed' : 'pointer' }}
                disabled={sinCuenta}
                onClick={handleRegistrar}
              >
                Registrar depósito
              </button>
            </div>
          </div>

          {/* ── Historial ── */}
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Historial de depósitos</h2>

            <List
              data={historialMock}
              columns={[
                { key: 'fecha', label: 'Fecha' },
                { key: 'cuenta', label: 'Cuenta' },
                { key: 'concepto', label: 'Concepto' },
                {
                  key: 'total', label: 'Total',
                  render: (item) => `Gs. ${item.total.toLocaleString('es-PY')}`
                },
                {
                  label: 'Acciones',
                  render: (item) => (
                    <button style={styles.btnMas} onClick={() => console.log('Ver depósito', item.id)}>
                      <IconoMas />
                    </button>
                  )
                },
              ]}
            />
          </div>

        </section>
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex', 
    width: '100vw', 
    height: '100vh',
    background: '#F9F9F9', 
    fontFamily: 'Lato, sans-serif', 
    overflow: 'hidden',
  },
  contenido: {
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    padding: 0, 
    boxSizing: 'border-box',
    gap: 20, 
    overflowY: 'auto',
  },
  encabezado: {
    width: '100%', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    gap: 10, 
    padding: '21px 0',
  },
  separador: { width: '90%', height: 1, background: '#E0E0E0' },
  titulo: {
    color: '#000', 
    fontSize: 30, 
    fontFamily: 'Lato, sans-serif',
    fontWeight: 700, 
    margin: 0, 
    textAlign: 'center', 
    marginTop: 15,
  },
  cuerpo: {
    width: '100%', 
    maxWidth: 860, 
    display: 'flex',
    flexDirection: 'column', 
    gap: 28, 
    padding: '0 20px 40px', 
    boxSizing: 'border-box',
  },
  seccion: { 
    display: 'flex', 
    flexDirection: 'column',
     gap: 12 
    },
  subtitulo: { 
    fontSize: 18, 
    fontWeight: 700, 
    margin: 0, 
    textAlign: 'left' 
},
  filaAccion: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 16, 
    flexWrap: 'wrap' 
},
  select: {
    height: 42, 
    padding: '0 12px', 
    borderRadius: 8,
    border: '1px solid #000', 
    fontSize: 14, 
    fontFamily: 'Lato, sans-serif',
    background: '#FAFAFA',
     color: '#444', 
     minWidth: 280, 
     cursor: 'pointer',
  },
  btnRegistrar: {
    background: getColor('amarillo'), 
    border: 'none', 
    padding: '0 20px',
    borderRadius: 8, 
    fontWeight: 700, 
    fontSize: 14,
    fontFamily: 'Lato, sans-serif', 
    height: 42,
     whiteSpace: 'nowrap',
  },
  btnMas: {
    width: 30, 
    height: 30, 
    borderRadius: '20%', 
    border: 'none',
    background: getColor('amarillo'),
     cursor: 'pointer',
    display: 'flex',
     alignItems: 'center', 
     justifyContent: 'center',
  },
};