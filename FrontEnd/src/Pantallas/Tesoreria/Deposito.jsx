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
  { id: 1, fecha: '10/05/2026', cuenta: 'Banco Nacional - Cuenta Corriente', concepto: 'Depósito inicial', total: 5000000 },
  { id: 2, fecha: '12/05/2026', cuenta: 'Banco Itaú - Ahorros', concepto: 'Cobro cliente ABC', total: 2300000 },
  { id: 3, fecha: '18/05/2026', cuenta: 'Banco Continental - Empresa', concepto: 'Transferencia interna', total: 800000 },
];

export default function Deposito({ usuario = 'Empleado', onLogout, onNavegar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cuentaInicial = location.state?.cuenta || null;

  const [cuentaId, setCuentaId] = useState(cuentaInicial?.id ?? '');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoDeposito, setTipoDeposito] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [bancoCheque, setBancoCheque] = useState('');
  const [titularCheque, setTitularCheque] = useState('');
  const [observacion, setObservacion] = useState('');

  function handleNavegar(moduloId) {
    if (moduloId === 'cuentas') {
      navigate('/tesoreria/cuentas');
      return;
    }

    if (onNavegar) onNavegar(moduloId);
  }

  function cerrarModal() {
    setMostrarModal(false);
    setTipoDeposito('');
    setMonto('');
    setConcepto('');
    setNumeroCheque('');
    setBancoCheque('');
    setTitularCheque('');
    setObservacion('');
  }

  function handleGuardarDeposito() {
    const cuenta = CUENTAS.find(c => c.id === Number(cuentaId));

    if (!cuenta) {
      alert('Seleccione una cuenta.');
      return;
    }

    if (!tipoDeposito) {
      alert('Seleccione el tipo de depósito.');
      return;
    }

    if (!monto) {
      alert('Ingrese el monto.');
      return;
    }

    const deposito = {
      cuenta,
      tipoDeposito,
      monto,
      concepto,
      numeroCheque,
      bancoCheque,
      titularCheque,
      observacion,
    };

    console.log('Depósito registrado:', deposito);

    cerrarModal();
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Depósitos</h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.cuerpo}>
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
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>

              <button
                style={styles.btnRegistrar}
                onClick={() => setMostrarModal(true)}
              >
                Registrar depósito
              </button>
            </div>
          </div>

          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Historial de depósitos</h2>

            <div style={{ width: "100%", maxWidth: 1300 }}>
              <List
                data={historialMock}
                columns={[
                  { key: 'fecha', label: 'Fecha' },
                  { key: 'cuenta', label: 'Cuenta' },
                  { key: 'concepto', label: 'Concepto' },
                  {
                    key: 'total',
                    label: 'Total',
                    render: (item) => formatearGs(item.total)
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
                <h2 style={styles.modalTitulo}>Registrar depósito</h2>

                <button style={styles.btnCerrar} onClick={cerrarModal}>
                  ×
                </button>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Datos de la cuenta</h3>

                <select
                  value={cuentaId}
                  onChange={e => setCuentaId(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Seleccionar cuenta...</option>
                  {CUENTAS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Tipo de depósito</h3>

                <div style={styles.tipoDepositoBox}>
                  {['Efectivo', 'Cheque propio', 'Cheque terceros'].map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoDeposito(tipo)}
                      style={{
                        ...styles.btnTipoDeposito,
                        ...(tipoDeposito === tipo ? styles.btnTipoDepositoActivo : {})
                      }}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Datos del depósito</h3>

                <input
                  placeholder="Concepto"
                  value={concepto}
                  onChange={e => setConcepto(e.target.value)}
                  style={styles.input}
                />

                <input
                  placeholder="Monto"
                  type="number"
                  value={monto}
                  onChange={e => setMonto(e.target.value)}
                  style={styles.input}
                />

                {monto && (
                  <span style={styles.montoFormateado}>
                    {formatearGs(monto)}
                  </span>
                )}
              </div>

              {(tipoDeposito === 'Cheque propio' || tipoDeposito === 'Cheque terceros') && (
                <div style={styles.modalSeccion}>
                  <h3 style={styles.modalSubtitulo}>Datos del cheque</h3>

                  <input
                    placeholder="Número de cheque"
                    value={numeroCheque}
                    onChange={e => setNumeroCheque(e.target.value)}
                    style={styles.input}
                  />

                  <input
                    placeholder="Banco del cheque"
                    value={bancoCheque}
                    onChange={e => setBancoCheque(e.target.value)}
                    style={styles.input}
                  />

                  {tipoDeposito === 'Cheque terceros' && (
                    <input
                      placeholder="Titular del cheque"
                      value={titularCheque}
                      onChange={e => setTitularCheque(e.target.value)}
                      style={styles.input}
                    />
                  )}
                </div>
              )}

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Observaciones</h3>

                <textarea
                  placeholder="Observaciones..."
                  value={observacion}
                  onChange={e => setObservacion(e.target.value)}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                <button style={styles.btnCancelar} onClick={cerrarModal}>
                  Cancelar
                </button>

                <button style={styles.btnRegistrar} onClick={handleGuardarDeposito}>
                  Guardar depósito
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
    fontFamily: 'Lato, sans-serif',
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
    textAlign: 'left',
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
    marginLeft: '100px'
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

  tipoDepositoBox: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },

  btnTipoDeposito: {
    height: 42,
    padding: '0 18px',
    borderRadius: 8,
    border: '1px solid #CCC',
    background: '#FFF',
    cursor: 'pointer',
    fontWeight: 700,
    fontFamily: 'Lato, sans-serif',
  },

  btnTipoDepositoActivo: {
    background: getColor('amarillo'),
    border: `1px solid ${getColor('amarillo')}`,
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
    fontFamily: 'Lato, sans-serif',
    height: 42,
    cursor: 'pointer',
  },
  montoFormateado: {
    fontSize: 14,
    fontWeight: 700,
    color: getColor('gris-claro'),
  }
};
