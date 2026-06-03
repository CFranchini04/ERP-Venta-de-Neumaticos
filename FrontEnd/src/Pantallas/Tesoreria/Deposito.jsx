import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { getColor } from '../../components/Colors';
import List from '../../components/Lista';
import { formatearGs } from '../../components/formato';
import fetchConToken from '../../token';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9128/api';
const IDS_DEPOSITO = [1, 6];

export default function Deposito({ usuario = 'Empleado', onLogout, onNavegar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cuentaInicial = location.state?.cuenta || null;

  const [cuentas, setCuentas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [cuentaId, setCuentaId] = useState(cuentaInicial?.id ?? '');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tipoDeposito, setTipoDeposito] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [numeroCheque, setNumeroCheque] = useState('');
  const [bancoCheque, setBancoCheque] = useState('');
  const [titularCheque, setTitularCheque] = useState('');
  const [observacion, setObservacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resCuentas, resMov] = await Promise.all([
          fetchConToken(`${API_BASE}/tesoreria/movimientos/cuentas`),
          fetchConToken(`${API_BASE}/tesoreria/movimientos/tabla`),
        ]);

        const dataCuentas = await resCuentas.json();
        const dataMov = await resMov.json();

        setCuentas(
          dataCuentas
            .filter(c => c.tipo_cuenta?.toLowerCase() !== 'ajena')
            .map(c => ({
              id: c.id_cuenta_bancaria,
              nombre: `${c.bancos?.nombre ?? '—'} - ${c.tipo_cuenta ?? '—'}`,
            }))
        );

        const depositos = dataMov
          .filter(m => {
            const esDeposito = IDS_DEPOSITO.includes(Number(m.id_tipo_movimiento)); 
            const noEsAjena = m.cuenta_origen?.tipo_cuenta?.toLowerCase() !== 'ajena';
            const esDeLaCuenta = cuentaInicial?.id
              ? m.cuenta_origen?.id_cuenta_bancaria === Number(cuentaInicial.id)
              : true;
            return esDeposito && noEsAjena && esDeLaCuenta;
          })
          .map(m => ({
            id: m.id_movimiento,
            idCuenta: m.cuenta_origen?.id_cuenta_bancaria,
            fecha: m.fecha ? new Date(m.fecha).toLocaleDateString('es-ES') : '—',
            cuenta: m.cuenta_origen?.bancos?.nombre
              ? `${m.cuenta_origen.bancos.nombre} - ${m.cuenta_origen.tipo_cuenta ?? '—'}`
              : '—',
            concepto: m.tipos_movimiento_bancario?.nombre ?? '—',
            total: m.monto ?? 0,
          }));

        setHistorial(depositos);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const historialFiltrado = cuentaId
    ? historial.filter(m => m.idCuenta === Number(cuentaId))
    : historial;

  function handleNavegar(moduloId) {
    if (moduloId === 'cuentas') { navigate('/tesoreria/cuentas'); return; }
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
    setError('');
  }

  async function handleGuardarDeposito() {
    if (!cuentaId) { setError('Seleccione una cuenta.'); return; }
    if (!tipoDeposito) { setError('Seleccione el tipo de depósito.'); return; }
    if (!monto) { setError('Ingrese el monto.'); return; }

    const esCheque = tipoDeposito === 'Cheque Propio' || tipoDeposito === 'Cheque Terceros';
    const id_tipo_movimiento = esCheque ? 6 : 1;

    const observacionFinal = [
      concepto,
      esCheque && numeroCheque ? `Cheque N°: ${numeroCheque}` : '',
      esCheque && bancoCheque ? `Banco: ${bancoCheque}` : '',
        tipoDeposito === 'Cheque Terceros' && titularCheque ? `Titular: ${titularCheque}` : '',
      observacion,
    ].filter(Boolean).join(' | ');

    setGuardando(true);
    setError('');
    try {
      const res = await fetchConToken(`${API_BASE}/tesoreria/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cuenta_bancaria: Number(cuentaId),
          fecha: new Date().toISOString().split('T')[0],
          tipo: 'Ingreso',
          monto: Number(monto),
          id_tipo_movimiento,
          observacion: observacionFinal,
          tipoDeposito,
          nroCheque: (tipoDeposito === 'Cheque Propio' || tipoDeposito === 'Cheque Terceros') ? numeroCheque : null,
          bancoCheque: (tipoDeposito === 'Cheque Propio' || tipoDeposito === 'Cheque Terceros') ? bancoCheque : null,
          titularCheque: tipoDeposito === 'Cheque Terceros' ? titularCheque : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar');
      }

      const nuevo = await res.json();
      const cuenta = cuentas.find(c => c.id === Number(cuentaId));
      setHistorial(prev => [{
        id: nuevo.id_movimiento,
        idCuenta: Number(cuentaId),
        fecha: new Date().toLocaleDateString('es-ES'),
        cuenta: cuenta?.nombre ?? '—',
        concepto: tipoDeposito,
        total: Number(monto),
      }, ...prev]);

      cerrarModal();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>
            {cuentaId && cuentas.find(c => c.id === Number(cuentaId))
              ? `${cuentas.find(c => c.id === Number(cuentaId)).nombre} - Depósitos`
              : 'Depósitos'}
          </h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.cuerpo}>
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Cuenta</h2>
            <div style={styles.filaAccion}>
              <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} style={styles.select}>
                <option value="">Todas las cuentas</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              <button style={styles.btnRegistrar} onClick={() => setMostrarModal(true)}>
                Registrar depósito
              </button>
            </div>
          </div>

          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Historial de depósitos</h2>
            <div style={{ width: '100%', maxWidth: 1300 }}>
              <List
                data={historialFiltrado}
                columns={[
                  { key: 'fecha', label: 'Fecha' },
                  { key: 'cuenta', label: 'Cuenta' },
                  { key: 'concepto', label: 'Concepto' },
                  { key: 'total', label: 'Total', render: (item) => formatearGs(item.total) },
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
                <button style={styles.btnCerrar} onClick={cerrarModal}>×</button>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Datos de la cuenta</h3>
                <select value={cuentaId} onChange={e => setCuentaId(e.target.value)} style={styles.select}>
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Tipo de depósito</h3>
                <div style={styles.tipoDepositoBox}>
                  {['Efectivo', 'Cheque Propio', 'Cheque Terceros'].map(tipo => (
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
                <input placeholder="Concepto" value={concepto} onChange={e => setConcepto(e.target.value)} style={styles.input} />
                <input placeholder="Monto" type="number" value={monto} onChange={e => setMonto(e.target.value)} style={styles.input} />
                {monto && <span style={styles.montoFormateado}>{formatearGs(monto)}</span>}
              </div>

              {(tipoDeposito === 'Cheque Propio' || tipoDeposito === 'Cheque Terceros') && (
                <div style={styles.modalSeccion}>
                  <h3 style={styles.modalSubtitulo}>Datos del cheque</h3>
                  <input placeholder="Número de cheque" value={numeroCheque} onChange={e => setNumeroCheque(e.target.value)} style={styles.input} />
                  <input placeholder="Banco del cheque" value={bancoCheque} onChange={e => setBancoCheque(e.target.value)} style={styles.input} />
                  {tipoDeposito === 'Cheque Terceros' && (
                    <input placeholder="Titular del cheque" value={titularCheque} onChange={e => setTitularCheque(e.target.value)} style={styles.input} />
                  )}
                </div>
              )}

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Observaciones</h3>
                <textarea placeholder="Observaciones..." value={observacion} onChange={e => setObservacion(e.target.value)} style={styles.textarea} />
              </div>

              {error && <p style={{ color: 'red', margin: 0, fontSize: 13 }}>{error}</p>}

              <div style={styles.modalFooter}>
                <button style={styles.btnCancelar} onClick={cerrarModal} disabled={guardando}>Cancelar</button>
                <button style={{ ...styles.btnRegistrar, opacity: guardando ? 0.6 : 1 }} onClick={handleGuardarDeposito} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar depósito'}
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
  pagina: { display: 'flex', width: '100vw', height: '100vh', background: '#F9F9F9', fontFamily: 'Lato, sans-serif', overflow: 'hidden' },
  contenido: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0, boxSizing: 'border-box', gap: 20, overflowY: 'auto' },
  encabezado: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '21px 0' },
  separador: { width: '90%', height: 1, background: '#E0E0E0' },
  titulo: { color: '#000', fontSize: 30, fontFamily: 'Lato, sans-serif', fontWeight: 700, margin: 0, textAlign: 'center', marginTop: 15 },
  cuerpo: { width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 28, padding: '0 20px 40px', boxSizing: 'border-box' },
  seccion: { display: 'flex', flexDirection: 'column', gap: 12 },
  subtitulo: { fontSize: 18, fontWeight: 700, margin: 0, textAlign: 'left' },
  filaAccion: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  select: { height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #000', fontSize: 14, fontFamily: 'Lato, sans-serif', background: '#FAFAFA', color: '#444', minWidth: 280, cursor: 'pointer' },
  btnRegistrar: { background: getColor('amarillo'), border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: 'Lato, sans-serif', height: 42, whiteSpace: 'nowrap', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { width: '90%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', background: '#FFF', borderRadius: 14, padding: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.20)', display: 'flex', flexDirection: 'column', gap: 18 },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitulo: { margin: 0, fontSize: 22, fontWeight: 700 },
  btnCerrar: { width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#F0F0F0', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  modalSeccion: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  modalSubtitulo: { margin: 0, fontSize: 16, fontWeight: 700 },
  tipoDepositoBox: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  btnTipoDeposito: { height: 42, padding: '0 18px', borderRadius: 8, border: '1px solid #CCC', background: '#FFF', cursor: 'pointer', fontWeight: 700, fontFamily: 'Lato, sans-serif' },
  btnTipoDepositoActivo: { background: getColor('amarillo'), border: `1px solid ${getColor('amarillo')}` },
  input: { height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #CCC', fontSize: 14, fontFamily: 'Lato, sans-serif' },
  textarea: { minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #CCC', fontSize: 14, fontFamily: 'Lato, sans-serif', resize: 'vertical' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  btnCancelar: { background: '#EEE', border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, fontFamily: 'Lato, sans-serif', height: 42, cursor: 'pointer' },
  montoFormateado: { fontSize: 14, fontWeight: 700, color: getColor('gris-claro') },
};