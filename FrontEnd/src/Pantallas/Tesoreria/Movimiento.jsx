import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { getColor } from '../../components/Colors';
import List from '../../components/Lista';
import { IconoMas } from '../../components/Icons';
import { formatearGs } from '../../components/formato';

const CUENTAS = [
  { id: 1, nombre: 'Banco Nacional - Cuenta Corriente' },
  { id: 2, nombre: 'Banco Itaú - Ahorros' },
  { id: 3, nombre: 'Banco Continental - Empresa' },
];

const historialMock = [
  {
    id: 1,
    fecha: '10/05/2026',
    cuentaOrigen: 'Banco Nacional - Cuenta Corriente',
    cuentaDestino: 'Banco Itaú - Ahorros',
    tipo: 'Crédito',
    concepto: 'Transferencia interna',
    monto: 1500000,
  },
];

function SearchbarLocal({ data, value, onSelect, placeholder }) {
  const [texto, setTexto] = useState('');
  const [mostrar, setMostrar] = useState(false);

  const filtrados = data.filter(item =>
    item.nombre.toLowerCase().includes(texto.toLowerCase())
  );

  return (
    <div style={styles.searchRoot}>
      <input
        value={value?.nombre || texto}
        placeholder={placeholder}
        onChange={(e) => {
          setTexto(e.target.value);
          setMostrar(true);
          onSelect(null);
        }}
        onFocus={() => setMostrar(true)}
        style={styles.input}
      />

      {mostrar && filtrados.length > 0 && (
        <div style={styles.dropdown}>
          {filtrados.map(item => (
            <div
              key={item.id}
              style={styles.dropdownItem}
              onMouseDown={() => {
                onSelect(item);
                setTexto(item.nombre);
                setMostrar(false);
              }}
            >
              {item.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Movimiento({ usuario = 'Empleado', onLogout, onNavegar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cuentaInicial = location.state?.cuenta || CUENTAS[0];

  const [mostrarModal, setMostrarModal] = useState(false);
  const [cuentaOrigen, setCuentaOrigen] = useState(cuentaInicial);
  const [cuentaDestino, setCuentaDestino] = useState(null);
  const [fecha, setFecha] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');

  function handleNavegar(moduloId) {
    if (moduloId === 'cuentas') {
      navigate('/tesoreria/cuentas');
      return;
    }

    if (onNavegar) onNavegar(moduloId);
  }

  function cerrarModal() {
    setMostrarModal(false);
    setCuentaOrigen(cuentaInicial);
    setCuentaDestino(null);
    setFecha('');
    setTipoMovimiento('');
    setMonto('');
    setConcepto('');
  }

  function handleGuardarMovimiento() {
    if (!cuentaOrigen) {
      alert('Seleccione la cuenta origen.');
      return;
    }

    if (!cuentaDestino) {
      alert('Seleccione la cuenta destino.');
      return;
    }

    if (!fecha) {
      alert('Seleccione la fecha.');
      return;
    }

    if (!tipoMovimiento) {
      alert('Seleccione el tipo de movimiento.');
      return;
    }

    if (!monto) {
      alert('Ingrese el monto.');
      return;
    }

    const movimiento = {
      cuentaOrigen,
      cuentaDestino,
      fecha,
      tipoMovimiento,
      monto: Number(monto),
      concepto,
    };

    console.log('Movimiento registrado:', movimiento);
    cerrarModal();
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Movimientos</h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.cuerpo}>
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Cuenta</h2>

            <div style={styles.filaAccion}>
              <select
                value={cuentaOrigen?.id || ''}
                onChange={e => {
                  const cuenta = CUENTAS.find(c => c.id === Number(e.target.value));
                  setCuentaOrigen(cuenta);
                }}
                style={styles.select}
              >
                {CUENTAS.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <button
                style={styles.btnRegistrar}
                onClick={() => setMostrarModal(true)}
              >
                Registrar movimiento
              </button>
            </div>
          </div>

          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Historial de movimientos</h2>

            <div style={{ width: '100%', maxWidth: 1300 }}>
              <List
                data={historialMock}
                columns={[
                  { key: 'fecha', label: 'Fecha' },
                  { key: 'cuentaOrigen', label: 'Cuenta origen' },
                  { key: 'cuentaDestino', label: 'Cuenta destino'},
                  { key: 'estado', label: 'Estado' },
                  { key: 'tipo', label: 'Tipo' },
                  {
                    key: 'monto',
                    label: 'Monto',
                    render: item => formatearGs(item.monto),
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {mostrarModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitulo}>Registrar movimiento</h2>

                <button style={styles.btnCerrar} onClick={cerrarModal}>
                  ×
                </button>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Cuenta origen</h3>

                <SearchbarLocal
                  data={CUENTAS}
                  value={cuentaOrigen}
                  onSelect={setCuentaOrigen}
                  placeholder="Buscar cuenta origen..."
                />
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Cuenta destino</h3>

                <SearchbarLocal
                  data={CUENTAS}
                  value={cuentaDestino}
                  onSelect={setCuentaDestino}
                  placeholder="Buscar cuenta destino..."
                />
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Datos del movimiento</h3>

                <input
                  type="date"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  style={styles.input}
                />

                <div style={styles.tipoMovimientoBox}>
                  {['Crédito', 'Débito'].map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoMovimiento(tipo)}
                      style={{
                        ...styles.btnTipoMovimiento,
                        ...(tipoMovimiento === tipo ? styles.btnTipoMovimientoActivo : {}),
                      }}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>

                <input
                  placeholder="Monto"
                  type="number"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  style={styles.input}
                />

                {monto && (
                  <span style={styles.montoPreview}>
                    {formatearGs(monto)}
                  </span>
                )}

                <textarea
                  placeholder="Concepto"
                  value={concepto}
                  onChange={e => setConcepto(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.btnCancelar} onClick={cerrarModal}>
                  Cancelar
                </button>

                <button style={styles.btnRegistrar} onClick={handleGuardarMovimiento}>
                  Guardar movimiento
                </button>
              </div>
            </div>
          </div>
        )}
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

  separador: {
    width: '90%',
    height: 1,
    background: '#E0E0E0',
  },

  titulo: {
    color: '#000',
    fontSize: 30,
    fontWeight: 700,
    margin: 0,
    textAlign: 'center',
    marginTop: 15,
  },

  cuerpo: {
    width: '100%',
    maxWidth: 1200,
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
    padding: '0 20px 40px',
    boxSizing: 'border-box',
  },

  seccion: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  subtitulo: {
    fontSize: 18,
    fontWeight: 700,
    margin: 0,
  },

  filaAccion: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    
  },

  select: {
    height: 42,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #000',
    fontSize: 14,
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
    height: 42,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
  },

  btnMas: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: 'none',
    background: getColor('amarillo'),
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '75px'
  },

  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  modal: {
    width: '90%',
    maxWidth: 720,
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#FFF',
    borderRadius: 14,
    padding: 24,
    boxShadow: '0 12px 30px rgba(0,0,0,0.20)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  modalTitulo: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
  },

  btnCerrar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    border: 'none',
    background: '#F0F0F0',
    fontSize: 24,
    cursor: 'pointer',
    lineHeight: 1,
  },

  modalSeccion: {
    border: '1px solid #E0E0E0',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  modalSubtitulo: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
  },

  input: {
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #CCC',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
  },

  textarea: {
    minHeight: 80,
    padding: 12,
    borderRadius: 8,
    border: '1px solid #CCC',
    fontSize: 14,
    fontFamily: 'Lato, sans-serif',
    resize: 'vertical',
  },

  tipoMovimientoBox: {
    display: 'flex',
    gap: 12,
  },

  btnTipoMovimiento: {
    height: 42,
    padding: '0 22px',
    borderRadius: 8,
    border: '1px solid #CCC',
    background: '#FFF',
    cursor: 'pointer',
    fontWeight: 700,
  },

  btnTipoMovimientoActivo: {
    background: getColor('amarillo'),
    border: `1px solid ${getColor('amarillo')}`,
  },

  montoPreview: {
    fontSize: 14,
    fontWeight: 700,
    color: '#555',
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },

  btnCancelar: {
    background: '#EEE',
    border: 'none',
    padding: '0 20px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
    height: 42,
    cursor: 'pointer',
  },

  searchRoot: {
    position: 'relative',
    width: '100%',
  },

  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: 0,
    right: 0,
    background: '#FFF',
    border: '1px solid #DDD',
    borderRadius: '0 0 8px 8px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
    zIndex: 1000,
    maxHeight: 220,
    overflowY: 'auto',
  },

  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 14,
    borderBottom: '1px solid #F0F0F0',
  },
};
