import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { useNavigate, useLocation } from 'react-router-dom';
import { getColor } from '../../components/Colors';
import List from '../../components/Lista';
import { formatearGs } from '../../components/formato';
import fetchConToken from '../../token';
import ModalConciliacion from './ModalConciliacion';
import { crearAsientoAPI, fetchCuentas } from '../../Pantallas/Contabilidad/contabilidadHelpers';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9128/api';
const ID_TRANSFERENCIA = 2;

const CUENTA_VACIA = {
  nro_cuenta: '',
  titular: '',
  entidad: '',
  numeroDocumento: '',
};

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
        onChange={(e) => { setTexto(e.target.value); setMostrar(true); onSelect(null); }}
        onFocus={() => setMostrar(true)}
        onBlur={() => setTimeout(() => setMostrar(false), 150)}
        style={styles.input}
      />
      {mostrar && filtrados.length > 0 && (
        <div style={styles.dropdown}>
          {filtrados.map(item => (
            <div key={item.id} style={styles.dropdownItem}
              onMouseDown={() => { onSelect(item); setTexto(item.nombre); setMostrar(false); }}>
              {item.nombre}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Campo({ label, name, value, onChange, error, placeholder, style = {} }) {
  return (
    <div style={{ ...styles.campoWrapper, ...style }}>
      <label style={{ ...styles.campoLabel, color: error ? '#dc2626' : undefined }}>
        {label}{error ? ' *' : ''}
      </label>
      <input name={name} value={value} onChange={onChange} placeholder={placeholder}
        style={{ ...styles.input, border: `1px solid ${error ? '#dc2626' : '#CCC'}`, background: error ? '#fff5f5' : undefined }} />
      {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
    </div>
  );
}

const gridDos = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' };

function ModalCuentaNueva({ bancosDisponibles, onCerrar, onGuardar }) {
  const [form, setForm] = useState(CUENTA_VACIA);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevos = {};
    if (!form.nro_cuenta.trim()) nuevos.nro_cuenta = 'Obligatorio';
    if (!form.titular.trim()) nuevos.titular = 'Obligatorio';
    if (!form.id_banco) nuevos.id_banco = 'Obligatorio';
    if (!form.numeroDocumento.trim()) nuevos.numeroDocumento = 'Obligatorio';
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    setError('');
    try {
      const res = await fetchConToken(`${API_BASE}/tesoreria/movimientos/cuentas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nro_cuenta: form.nro_cuenta,
          titular: form.titular,
          tipo_cuenta: 'Ajena',
          saldo_contable: 0,
          saldo_disponible: 0,
          id_banco: Number(form.id_banco),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar');
      }
      const nueva = await res.json();
      onGuardar({
        id: nueva.id_cuenta_bancaria,
        nombre: `${nueva.bancos?.nombre ?? form.entidad} - ${nueva.tipo_cuenta ?? '—'}`,
        ...nueva,
      });
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{ ...styles.modalOverlay, zIndex: 1100 }}>
      <div style={{ ...styles.modal, maxWidth: 480 }}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitulo}>Nueva cuenta</h2>
          <button style={styles.btnCerrar} onClick={onCerrar}>×</button>
        </div>

        <div style={styles.modalSeccion}>
          <div style={gridDos}>
            <Campo label="Número de cuenta" name="nro_cuenta" value={form.nro_cuenta}
              onChange={handleChange} error={errores.nro_cuenta} placeholder="Ej: 0001-123456-7" />
            <Campo label="Titular" name="titular" value={form.titular}
              onChange={handleChange} error={errores.titular} placeholder="Nombre completo" />
            <div style={styles.campoWrapper}>
              <label style={{ ...styles.campoLabel, color: errores.id_banco ? '#dc2626' : undefined }}>
                Entidad bancaria{errores.id_banco ? ' *' : ''}
              </label>
              <select name="id_banco" value={form.id_banco || ''} onChange={handleChange}
                style={{ ...styles.input, background: errores.id_banco ? '#fff5f5' : undefined, border: `1px solid ${errores.id_banco ? '#dc2626' : '#CCC'}` }}>
                <option value="">Seleccionar...</option>
                {bancosDisponibles.map(b => (
                  <option key={b.id_banco} value={b.id_banco}>{b.nombre}</option>
                ))}
              </select>
              {errores.id_banco && <span style={{ fontSize: 11, color: '#dc2626' }}>{errores.id_banco}</span>}
            </div>
            <div style={styles.campoWrapper}>
              <label style={styles.campoLabel}>Tipo de documento</label>
              <input value="CI" disabled
                style={{ ...styles.input, background: '#F0F0F0', cursor: 'not-allowed', color: '#888' }} />
            </div>
            <Campo label="Número de documento" name="numeroDocumento" value={form.numeroDocumento}
              onChange={handleChange} error={errores.numeroDocumento} placeholder="Ej: 4567890"
              style={{ gridColumn: '1 / -1' }} />
          </div>
        </div>

        {error && <p style={{ color: 'red', fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={styles.modalFooter}>
          <button style={styles.btnCancelar} onClick={onCerrar} disabled={guardando}>Cancelar</button>
          <button style={{ ...styles.btnRegistrar, opacity: guardando ? 0.6 : 1 }} onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cuenta'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Movimiento({ usuario = 'Empleado', onLogout, onNavegar }) {
  const navigate = useNavigate();
  const location = useLocation();

  const cuentaInicial = location.state?.cuenta || null;

  const [cuentas, setCuentas] = useState([]);
  const [cuentasDestino, setCuentasDestino] = useState([]);
  const [bancosDisponibles, setBancosDisponibles] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalCuenta, setMostrarModalCuenta] = useState(false);
  const [mostrarModalConciliacion, setMostrarModalConciliacion] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('');

  const [cuentaOrigenId, setCuentaOrigenId] = useState(cuentaInicial?.id ?? '');
  const [cuentaDestino, setCuentaDestino] = useState(null);
  const [fecha, setFecha] = useState('');
  const [tipoMovimiento, setTipoMovimiento] = useState('');
  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resCuentas, resMov, resBancos] = await Promise.all([
          fetchConToken(`${API_BASE}/tesoreria/movimientos/cuentas`),
          fetchConToken(`${API_BASE}/tesoreria/movimientos/tabla`),
          fetchConToken(`${API_BASE}/tesoreria/movimientos/bancos`),
        ]);

        const dataCuentas = await resCuentas.json();
        const dataMov = await resMov.json();
        const dataBancos = await resBancos.json();

        setCuentas(
          dataCuentas
            .filter(c => c.tipo_cuenta?.toLowerCase() !== 'ajena')
            .map(c => ({
              id: c.id_cuenta_bancaria,
              nombre: `${c.bancos?.nombre ?? '—'} - ${c.tipo_cuenta ?? '—'}`,
            }))
        );

        setCuentasDestino(
          dataCuentas.map(c => ({
            id: c.id_cuenta_bancaria,
            nombre: `${c.titular ?? '—'} - ${c.bancos?.nombre ?? '—'} - ${c.tipo_cuenta ?? '—'}`,
          }))
        );

        setBancosDisponibles(dataBancos);

        const movs = dataMov.map(m => ({
          id: m.id_movimiento,
          idCuenta: m.cuenta_origen?.id_cuenta_bancaria,
          fecha: m.fecha ? new Date(m.fecha).toLocaleDateString('es-ES') : '—',
          cuentaOrigen: m.cuenta_origen?.bancos?.nombre
            ? `${m.cuenta_origen.bancos.nombre} - ${m.cuenta_origen.tipo_cuenta ?? '—'}`
            : '—',
          cuentaDestino: m.cuenta_destino?.bancos?.nombre
            ? `${m.cuenta_destino.bancos.nombre} - ${m.cuenta_destino.tipo_cuenta ?? '—'}`
            : '—',
          tipo: m.tipo ?? '—',
          monto: m.monto ?? 0,
          estado: m.estados?.nombre ?? '—',
          idEstado: m.id_estado,
          ...m,
        }));

        setHistorial(movs);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const historialFiltrado = cuentaOrigenId
    ? historial.filter(m => {
      const coincideCuenta = m.idCuenta === Number(cuentaOrigenId);
      const coincideEstado = filtroEstado === '' || m.estado === filtroEstado;
      return coincideCuenta && coincideEstado;
    })
    : historial.filter(m => filtroEstado === '' || m.estado === filtroEstado);

  function handleNavegar(moduloId) {
    if (moduloId === 'cuentas') { navigate('/tesoreria/cuentas'); return; }
    if (onNavegar) onNavegar(moduloId);
  }

  function cerrarModal() {
    setMostrarModal(false);
    setCuentaDestino(null);
    setFecha(''); setTipoMovimiento(''); setMonto(''); setConcepto('');
    setError('');
  }

  const generarAsientoMovimiento = async (montoNum, fechaMov, conceptoMov, tipoOrigen, tipoDestino) => {
    try {
      const todasCuentas = await fetchCuentas()
      const buscarPorCodigo = (codigo) => todasCuentas.find(c => c.codigo == codigo)

      const COD_BANCO_PROPIO = '1.1.1.2.01'
      const COD_BANCO_PROPIO2 = '1.1.1.2.02'
      const COD_RECIBIR_AJENA = '1.1.4.1.01' // recibir de cuenta ajena
      const COD_ENVIAR_AJENA = '2.1.1.1.01' // enviar a cuenta ajena
      const esAjena = (nombre) => nombre?.toLowerCase()?.includes('ajena')

      let cuentaOrig = null
      let cuentaDest = null

      if (esAjena(tipoOrigen) && !esAjena(tipoDestino)) {
        // Recibir de cuenta ajena
        cuentaOrig = buscarPorCodigo(COD_RECIBIR_AJENA)
        cuentaDest = buscarPorCodigo(COD_BANCO_PROPIO)
      } else if (!esAjena(tipoOrigen) && esAjena(tipoDestino)) {
        // Enviar a cuenta ajena
        cuentaOrig = buscarPorCodigo(COD_BANCO_PROPIO)
        cuentaDest = buscarPorCodigo(COD_ENVIAR_AJENA)
      } else {
        // Entre cuentas propias
        cuentaOrig = buscarPorCodigo(COD_BANCO_PROPIO)
        cuentaDest = buscarPorCodigo(COD_BANCO_PROPIO2)
      }

      if (!cuentaOrig) throw new Error('No se encontró cuenta contable origen')
      if (!cuentaDest) throw new Error('No se encontró cuenta contable destino')

      await crearAsientoAPI({
        fecha: fechaMov,
        concepto: conceptoMov || 'Transferencia entre cuentas',
        lineas: [
          { codigo: cuentaDest.codigo, cuenta: cuentaDest.cuenta, debe: montoNum, haber: 0 },
          { codigo: cuentaOrig.codigo, cuenta: cuentaOrig.cuenta, debe: 0, haber: montoNum },
        ],
        id_periodo_fiscal: null,
        id_estado: 1,
      })
    } catch (err) {
      throw new Error(`Error generando asiento: ${err.message}`)
    }
  }

  async function handleGuardarMovimiento() {
    if (!cuentaOrigenId) { setError('Seleccione la cuenta origen.'); return; }
    if (!cuentaDestino) { setError('Seleccione la cuenta destino.'); return; }
    if (!fecha) { setError('Seleccione la fecha.'); return; }
    if (!tipoMovimiento) { setError('Seleccione el tipo de movimiento.'); return; }
    if (!monto) { setError('Ingrese el monto.'); return; }

    const observacionFinal = [
      `${tipoMovimiento}`,
      concepto,
    ].filter(Boolean).join(' | ');

    setGuardando(true);
    setError('');
    try {
      const res = await fetchConToken(`${API_BASE}/tesoreria/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cuenta_bancaria: Number(cuentaOrigenId),
          id_cuenta_destino: cuentaDestino.id,
          fecha,
          tipo: 'Egreso',
          monto: Number(monto),
          id_tipo_movimiento: ID_TRANSFERENCIA,
          observacion: observacionFinal,
          id_estado: 1,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al guardar');
      }

      const nuevo = await res.json();

      const cuentaOrigen = cuentas.find(c => c.id === Number(cuentaOrigenId));
      setHistorial(prev => [{
        id: nuevo.id_movimiento,
        idCuenta: Number(cuentaOrigenId),
        fecha: new Date(fecha).toLocaleDateString('es-ES'),
        cuentaOrigen: cuentaOrigen?.nombre ?? '—',
        cuentaDestino: cuentaDestino.nombre,
        tipo: tipoMovimiento,
        monto: Number(monto),
      }, ...prev]);

      const cuentaOrigenData = cuentas.find(c => c.id === Number(cuentaOrigenId))
      const nombreOrigen = cuentaOrigenData?.nombre ?? ''
      const nombreDestino = cuentaDestino?.nombre ?? ''

      await generarAsientoMovimiento(
        Number(monto),
        fecha,
        observacionFinal,
        nombreOrigen,
        nombreDestino
      )

      cerrarModal();
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  }

  function handleGuardarCuentaNueva(nuevaCuenta) {
    setCuentasDestino(prev => [...prev, nuevaCuenta]);
    setCuentaDestino(nuevaCuenta);
    setMostrarModalCuenta(false);
  }

  function abrirModalConciliacion(movimiento) {
    setMovimientoSeleccionado(movimiento);
    setMostrarModalConciliacion(true);
  }

  function cerrarModalConciliacion() {
    setMostrarModalConciliacion(false);
    setMovimientoSeleccionado(null);
  }

  function handleConciliarMovimiento(movimientoActualizado) {
    setHistorial(prev => prev.map(m =>
      m.id === movimientoActualizado.id_movimiento
        ? { ...m, estado: movimientoActualizado.estados?.nombre, idEstado: movimientoActualizado.id_estado }
        : m
    ));
    cerrarModalConciliacion();
  }

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>
            {cuentaOrigenId && cuentas.find(c => c.id === Number(cuentaOrigenId))
              ? `${cuentas.find(c => c.id === Number(cuentaOrigenId)).nombre} - Movimientos`
              : 'Movimientos'}
          </h1>
          <div style={styles.separador} />
        </header>

        <section style={styles.cuerpo}>
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Cuenta</h2>
            <div style={styles.filaAccion}>
              <select value={cuentaOrigenId} onChange={e => setCuentaOrigenId(e.target.value)} style={styles.select}>
                <option value="">Todas las cuentas</option>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <button style={styles.btnRegistrar} onClick={() => setMostrarModal(true)}>
                Registrar movimiento
              </button>
            </div>
          </div>

          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Historial de movimientos</h2>
            <div style={{ width: '100%', maxWidth: 1300 }}>
              <List
                data={historialFiltrado}
                columns={[
                  { key: 'fecha', label: 'Fecha' },
                  { key: 'cuentaOrigen', label: 'Cuenta origen' },
                  { key: 'cuentaDestino', label: 'Cuenta destino' },
                  { key: 'tipo', label: 'Tipo' },
                  { key: 'monto', label: 'Monto', render: item => formatearGs(item.monto) },
                  {
                    key: 'estado',
                    label: 'Estado',
                    render: item => {
                      const colores = { 'Pendiente': '#FF0000', 'Conciliado': '#22C55E', 'Completado': '#22C55E' };
                      return <span style={{ color: colores[item.estado] || '#000', fontWeight: 700 }}>{item.estado}</span>;
                    }
                  },
                  {
                    label: 'Acciones',
                    render: item => {
                      const esChequeConEstado = (item.estado === 'Pendiente' || item.estado === 'Conciliado') && item.depositos_bancarios?.some(d => d.tipo_deposito === 'Cheque Terceros');
                      return esChequeConEstado ? (
                        <button style={styles.btnAccion} onClick={() => abrirModalConciliacion(item)}>
                          {item.estado === 'Pendiente' ? 'Conciliar' : 'Ver'}
                        </button>
                      ) : null;
                    }
                  }
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
                <button style={styles.btnCerrar} onClick={cerrarModal}>×</button>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Cuenta origen</h3>
                <select value={cuentaOrigenId} onChange={e => setCuentaOrigenId(e.target.value)} style={styles.input}>
                  <option value="">Seleccionar cuenta...</option>
                  {cuentas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Cuenta destino</h3>
                <SearchbarLocal data={cuentasDestino} value={cuentaDestino} onSelect={setCuentaDestino} placeholder="Buscar cuenta destino..." />
                <button style={styles.btnAgregarCuenta} onClick={() => setMostrarModalCuenta(true)}>
                  + Agregar cuenta nueva
                </button>
              </div>

              <div style={styles.modalSeccion}>
                <h3 style={styles.modalSubtitulo}>Datos del movimiento</h3>
                <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={styles.input} />
                <div style={styles.tipoMovimientoBox}>
                  {['Crédito', 'Débito'].map(tipo => (
                    <button key={tipo} type="button" onClick={() => setTipoMovimiento(tipo)}
                      style={{ ...styles.btnTipoMovimiento, ...(tipoMovimiento === tipo ? styles.btnTipoMovimientoActivo : {}) }}>
                      {tipo}
                    </button>
                  ))}
                </div>
                <input placeholder="Monto" type="number" value={monto} onChange={e => setMonto(e.target.value)} style={styles.input} />
                {monto && <span style={styles.montoPreview}>{formatearGs(monto)}</span>}
                <textarea placeholder="Concepto" value={concepto} onChange={e => setConcepto(e.target.value)} style={styles.textarea} />
              </div>

              {error && <p style={{ color: 'red', margin: 0, fontSize: 13 }}>{error}</p>}

              <div style={styles.modalFooter}>
                <button style={styles.btnCancelar} onClick={cerrarModal} disabled={guardando}>Cancelar</button>
                <button style={{ ...styles.btnRegistrar, opacity: guardando ? 0.6 : 1 }} onClick={handleGuardarMovimiento} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar movimiento'}
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarModalCuenta && (
          <ModalCuentaNueva
            bancosDisponibles={bancosDisponibles}
            onCerrar={() => setMostrarModalCuenta(false)}
            onGuardar={handleGuardarCuentaNueva}
          />
        )}

        {mostrarModalConciliacion && movimientoSeleccionado && (
          <ModalConciliacion
            movimiento={movimientoSeleccionado}
            onCerrar={cerrarModalConciliacion}
            onConciliar={handleConciliarMovimiento}
            modo={movimientoSeleccionado.estado === 'Pendiente' ? 'conciliar' : 'ver_detalles'}
          />
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
  titulo: { color: '#000', fontSize: 30, fontWeight: 700, margin: 0, textAlign: 'center', marginTop: 15 },
  cuerpo: { width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 28, padding: '0 20px 40px', boxSizing: 'border-box' },
  seccion: { display: 'flex', flexDirection: 'column', gap: 12 },
  subtitulo: { fontSize: 18, fontWeight: 700, margin: 0 },
  filaAccion: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  select: { height: 42, padding: '0 12px', borderRadius: 8, border: '1px solid #000', fontSize: 14, background: '#FAFAFA', color: '#444', minWidth: 280, cursor: 'pointer' },
  btnRegistrar: { background: getColor('amarillo'), border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, height: 42, whiteSpace: 'nowrap', cursor: 'pointer' },
  btnAgregarCuenta: { alignSelf: 'flex-start', background: 'none', border: '1.5px dashed #999', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555', fontFamily: 'Lato, sans-serif' },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  modal: { width: '90%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', background: '#FFF', borderRadius: 14, padding: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.20)', display: 'flex', flexDirection: 'column', gap: 18 },
  modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  modalTitulo: { margin: 0, fontSize: 22, fontWeight: 700 },
  btnCerrar: { width: 34, height: 34, borderRadius: '50%', border: 'none', background: '#F0F0F0', fontSize: 24, cursor: 'pointer', lineHeight: 1 },
  modalSeccion: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  modalSubtitulo: { margin: 0, fontSize: 16, fontWeight: 700 },
  input: { height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #CCC', fontSize: 14, fontFamily: 'Lato, sans-serif' },
  textarea: { minHeight: 80, padding: 12, borderRadius: 8, border: '1px solid #CCC', fontSize: 14, fontFamily: 'Lato, sans-serif', resize: 'vertical' },
  tipoMovimientoBox: { display: 'flex', gap: 12 },
  btnTipoMovimiento: { height: 42, padding: '0 22px', borderRadius: 8, border: '1px solid #CCC', background: '#FFF', cursor: 'pointer', fontWeight: 700 },
  btnTipoMovimientoActivo: { background: getColor('amarillo'), border: `1px solid ${getColor('amarillo')}` },
  montoPreview: { fontSize: 14, fontWeight: 700, color: '#555' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  btnCancelar: { background: '#EEE', border: 'none', padding: '0 20px', borderRadius: 8, fontWeight: 700, fontSize: 14, height: 42, cursor: 'pointer' },
  campoWrapper: { display: 'flex', flexDirection: 'column', gap: 4 },
  campoLabel: { fontSize: 13, fontWeight: 700, color: '#555' },
  searchRoot: { position: 'relative', width: '100%' },
  dropdown: { position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0, background: '#FFF', border: '1px solid #DDD', borderRadius: '0 0 8px 8px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', zIndex: 1000, maxHeight: 220, overflowY: 'auto' },
  dropdownItem: { padding: '10px 14px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #F0F0F0' },
  btnAccion: { background: getColor('amarillo'), color: '#000', border: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer' },
};