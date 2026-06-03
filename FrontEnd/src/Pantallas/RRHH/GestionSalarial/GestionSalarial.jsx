import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import fetchConToken from '../../../token';
import { getColor } from '../../../components/Colors';
import { IconoDropdown, IconoMas, IconoCerrar } from '../../../components/Icons';
import { formatearGs } from '../../../components/formato';

function ColumnaItems({ titulo, tipo, items, onChange }) {
  const color = tipo === 'bonificacion' ? getColor('verde') : getColor('rojo');
  const bgColor = tipo === 'bonificacion' ? '#f0fdf4' : '#fef2f2';
  const borderColor = tipo === 'bonificacion' ? '#bbf7d0' : '#fecaca';

  const agregar = () => onChange([...items, { id: Date.now(), nombre: '', monto: '' }]);

  const actualizar = (id, campo, valor) =>
    onChange(items.map(i => i.id === id ? { ...i, [campo]: valor } : i));

  const eliminar = (id) => onChange(items.filter(i => i.id !== id));

  const total = items.reduce((acc, i) => acc + (Number(i.monto) || 0), 0);

  return (
    <div style={{ ...styles.columna, background: bgColor, border: `1.5px solid ${borderColor}` }}>
      <div style={styles.columnaHeader}>
        <span style={{ ...styles.columnaTitulo, color }}>
          {tipo === 'bonificacion' ? '▲' : '▼'} {titulo}
        </span>
        <span style={{ ...styles.columnaTotal, color }}>{formatearGs(total)}</span>
      </div>

      <div style={styles.itemsLista}>
        {items.length === 0 && <p style={styles.sinItems}>Sin {titulo.toLowerCase()} aun</p>}
        {items.map(item => (
          <div key={item.id} style={styles.itemRow}>
            <input
              type="text"
              placeholder="Descripcion"
              value={item.nombre}
              onChange={e => actualizar(item.id, 'nombre', e.target.value)}
              style={{ ...styles.inputItem, flex: 2 }}
            />
            <input
              type="number"
              placeholder="Monto Gs."
              min="0"
              value={item.monto}
              onChange={e => {
                const val = e.target.value;
                if (Number(val) < 0) return;
                actualizar(item.id, 'monto', val);
              }}
              style={{ ...styles.inputItem, flex: 1 }}
            />
            <button style={{ ...styles.btnEliminar, color }} onClick={() => eliminar(item.id)} title="Eliminar">
              <IconoCerrar />
            </button>
          </div>
        ))}
      </div>

      <button style={{ ...styles.btnAgregar, color, borderColor }} onClick={agregar}>
        <IconoMas /> Agregar {titulo.toLowerCase().replace(/s$/, '')}
      </button>
    </div>
  );
}

export default function GestionSalarial({ usuario, onLogout, onNavegar }) {
  const { id } = useParams();

  const [empleado, setEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [periodoExpanded, setPeriodoExpanded] = useState(true);
  const [nominaExpanded, setNominaExpanded] = useState(false);
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState('');

  const [pdpActual, setPdpActual] = useState(null);
  const [pdpModificado, setPdpModificado] = useState(false);

  const [periodo, setPeriodo] = useState({ fechaInicio: '', fechaFin: '' });
  const [horasExtras, setHorasExtras] = useState('');
  const [ausencias, setAusencias] = useState('');
  const [bonificaciones, setBonificaciones] = useState([]);
  const [deducciones, setDeducciones] = useState([]);

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:9128/api';

  useEffect(() => {
    if (!id) { setCargando(false); return; }

    const cargar = async () => {
      try {
        const [resEmp, resSal, resPdp] = await Promise.all([
          fetchConToken(`${API_BASE}/rrhh/empleados/${id}`),
          fetchConToken(`${API_BASE}/rrhh/salarios/salario/empleado/${id}`),
          fetchConToken(`${API_BASE}/rrhh/salarios/procesos/ultimo`),
        ]);

        const dataEmp = await resEmp.json();
        const salario = await resSal.json();
        const pdp = await resPdp.json();


        setEmpleado({
          nombre: dataEmp?.personas?.nombre ?? '',
          apellido: dataEmp?.personas?.apellido ?? '',
          cargo: dataEmp?.personas_horario_cargo?.[0]?.cargo?.nombre ?? '',
          salarioBase: salario?.cargo?.salario ?? 0,
        });

        if (pdp?.id_pdp) {
          setPdpActual(pdp);
          setPeriodo({
            fechaInicio: pdp.fecha_inicio ?? '',
            fechaFin: pdp.fecha_fin ?? '',
          });
          if (pdp.fecha_inicio && pdp.fecha_fin) setNominaExpanded(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };

    cargar();
  }, [id]);

  const handlePeriodoChange = (nuevo) => {
    // No permitir fin anterior a inicio
    if (nuevo.fechaInicio && nuevo.fechaFin && nuevo.fechaFin < nuevo.fechaInicio) return;

    setPeriodo(nuevo);
    setPdpModificado(true);
    if (nuevo.fechaInicio && nuevo.fechaFin) setNominaExpanded(true);
  };

  if (cargando) return <div>Cargando...</div>;
  if (!empleado) return <div>No hay empleado seleccionado</div>;

  const salarioBase = Number(empleado.salarioBase || 0);
  const horaNormal = salarioBase / (30 * 8);
  const valorHoraExtra = horaNormal * 1.5;
  const pagoHorasExtras = (Number(horasExtras) || 0) * valorHoraExtra;
  const valorDia = salarioBase / 30;
  const descuentoAusencias = (Number(ausencias) || 0) * valorDia;
  const totalBonificaciones = bonificaciones.reduce((a, i) => a + (Number(i.monto) || 0), 0);
  const totalIngresosSinIps = salarioBase + pagoHorasExtras + totalBonificaciones;
  const ips = totalIngresosSinIps * 0.09;
  const totalDeducciones = deducciones.reduce((a, i) => a + (Number(i.monto) || 0), 0);
  const totalIngresos = salarioBase + pagoHorasExtras + totalBonificaciones;
  const totalDescuentos = ips + descuentoAusencias + totalDeducciones;
  const salarioFinal = totalIngresos - totalDescuentos;

  const guardarPago = async () => {
    setGuardando(true);
    setErrorGuardar('');
    try {
      let id_pdp = pdpActual?.id_pdp;

      if (pdpModificado || !id_pdp) {
        const resPdp = await fetchConToken(`${API_BASE}/rrhh/salarios/procesos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo_proceso: 'Nomina',
            fecha_inicio: periodo.fechaInicio,
            fecha_fin: periodo.fechaFin,
            id_estado: 1,
          }),
        });
        const nuevoPdp = await resPdp.json();
        if (!resPdp.ok) throw new Error(nuevoPdp.message || 'Error al crear proceso');
        id_pdp = nuevoPdp.id_pdp;
      }

      const detalles = [
        ...bonificaciones.map(b => ({
          id_novedad: b.id_novedad ?? null,
          monto: Number(b.monto) || 0,
          observacion: b.nombre || '',
          tipo_novedad: 'Ingreso',
        })),
        ...deducciones.map(d => ({
          id_novedad: d.id_novedad ?? null,
          monto: Number(d.monto) || 0,
          observacion: d.nombre || '',
          tipo_novedad: 'Egreso',
        })),
        { id_novedad: null, monto: ips, observacion: 'IPS (9%)', tipo_novedad: 'Egreso' },
        ...(descuentoAusencias > 0 ? [{ id_novedad: null, monto: descuentoAusencias, observacion: `Ausencias (${ausencias} dias)`, tipo_novedad: 'Egreso' }] : []),
        ...(pagoHorasExtras > 0 ? [{ id_novedad: null, monto: pagoHorasExtras, observacion: `Horas extras (${horasExtras}h)`, tipo_novedad: 'Ingreso' }] : []),
      ];

      const resPago = await fetchConToken(`${API_BASE}/rrhh/salarios/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pdp,
          id_empleado: Number(id),
          total_ingresos: totalIngresos,
          total_deducciones: totalDescuentos,
          neto_pagado: salarioFinal,
          fecha_pago: periodo.fechaFin,
          id_estado: 1,
          detalles,
        }),
      });

      const dataPago = await resPago.json();
      if (!resPago.ok) throw new Error(dataPago.message || 'Error al guardar pago');

      imprimirRecibo();
      setMostrarResumen(false);
    } catch (err) {
      setErrorGuardar(err.message || 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const imprimirRecibo = () => {
    const ventana = window.open('', '_blank');

    const bonifiHtml = [
      `<div class="fila"><span>Horas Extras (${horasExtras || 0}h):</span><strong>${formatearGs(pagoHorasExtras)}</strong></div>`,
      ...bonificaciones.map(b => `<div class="fila"><span>${b.nombre || 'Bonificacion'}:</span><strong>${formatearGs(b.monto)}</strong></div>`)
    ].join('');

    const deducHtml = [
      `<div class="fila"><span>IPS (9%):</span><strong>- ${formatearGs(ips)}</strong></div>`,
      `<div class="fila"><span>Ausencias (${ausencias || 0} dias):</span><strong>- ${formatearGs(descuentoAusencias)}</strong></div>`,
      ...deducciones.map(d => `<div class="fila"><span>${d.nombre || 'Deduccion'}:</span><strong>- ${formatearGs(d.monto)}</strong></div>`)
    ].join('');

    ventana.document.write(`
<html><head><title>Recibo de Pago</title><style>
body{font-family:Arial,sans-serif;padding:40px;color:#222}
h1{text-align:center;margin-bottom:30px}
.cols{display:flex;gap:30px;margin:20px 0}
.col{flex:1;padding:16px;border-radius:8px}
.col-b{background:#f0fdf4;border:1px solid #bbf7d0}
.col-d{background:#fef2f2;border:1px solid #fecaca}
.col h3{margin:0 0 12px;font-size:15px}
.fila{display:flex;justify-content:space-between;margin-bottom:10px;font-size:14px}
.linea{border-top:1px solid #ccc;margin:16px 0}
.total{font-size:22px;font-weight:bold}
.footer{margin-top:40px;text-align:center;color:#666;font-size:13px}
</style></head><body>
<h1>Recibo de Pago</h1>
<div class="fila"><span>Empleado:</span><strong>${empleado.nombre} ${empleado.apellido}</strong></div>
<div class="fila"><span>Cargo:</span><strong>${empleado.cargo}</strong></div>
<div class="fila"><span>Periodo:</span><strong>${periodo.fechaInicio} - ${periodo.fechaFin}</strong></div>
<div class="fila"><span>Salario Base:</span><strong>${formatearGs(salarioBase)}</strong></div>
<div class="linea"></div>
<div class="cols">
  <div class="col col-b"><h3>Bonificaciones</h3>${bonifiHtml}</div>
  <div class="col col-d"><h3>Deducciones</h3>${deducHtml}</div>
</div>
<div class="linea"></div>
<div class="fila total"><span>Total Neto:</span><strong>${formatearGs(salarioFinal)}</strong></div>
<div class="footer">Recibo generado automaticamente.</div>
</body></html>`);
    ventana.document.close();
    ventana.print();
  };

  const periodoIncompleto = !periodo.fechaInicio || !periodo.fechaFin;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

      <main style={styles.contenido}>
        <div style={styles.headerTitulo}>
          <h1 style={styles.titulo}>Gestion Salarial</h1>
        </div>

        {/* Empleado */}
        <div style={styles.seccion}>
          <h2 style={styles.subtitulo}>Empleado</h2>
          <div style={styles.infoEmpleadoContainer}>
            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Nombre:</span>
              <span style={styles.valorInfo}>{empleado.nombre} {empleado.apellido}</span>
            </div>
            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Cargo:</span>
              <span style={styles.valorInfo}>{empleado.cargo}</span>
            </div>
          </div>
        </div>

        {/* Periodo */}
        <div style={styles.seccion}>
          <div style={styles.seccionHeader} onClick={() => setPeriodoExpanded(v => !v)}>
            <h2 style={styles.subtitulo}>
              Seleccionar periodo
              {(periodo.fechaInicio || periodo.fechaFin) && (
                <span style={styles.badge}>{periodo.fechaInicio} - {periodo.fechaFin}</span>
              )}
            </h2>
            <IconoDropdown active={periodoExpanded} />
          </div>

          {periodoExpanded && (
            <div style={styles.periodoGeneral}>
              {pdpActual && !pdpModificado && (
                <p style={{ fontSize: 12, color: '#888', textAlign: 'center', margin: '0 0 12px' }}>
                  Usando proceso mas reciente (ID: {pdpActual.id_pdp}). Cambia las fechas para crear uno nuevo.
                </p>
              )}
              {pdpModificado && (
                <p style={{ fontSize: 12, color: '#16a34a', textAlign: 'center', margin: '0 0 12px' }}>
                  Se creara un nuevo proceso de pago al guardar.
                </p>
              )}
              <div style={styles.periodoContainer}>
                <div style={styles.periodoCard}>
                  <span style={styles.dataLabel}>Fecha de Inicio</span>
                  <input
                    type="date"
                    value={periodo.fechaInicio}
                    max={periodo.fechaFin || undefined}
                    onChange={e => handlePeriodoChange({ ...periodo, fechaInicio: e.target.value })}
                    style={styles.inputFecha}
                  />
                </div>
                <div style={styles.periodoCard}>
                  <span style={styles.dataLabel}>Fecha de Fin</span>
                  <input
                    type="date"
                    value={periodo.fechaFin}
                    min={periodo.fechaInicio || undefined}
                    onChange={e => handlePeriodoChange({ ...periodo, fechaFin: e.target.value })}
                    style={styles.inputFecha}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nomina */}
        {nominaExpanded && (
          <div style={styles.seccion}>
            <h2 style={styles.subtitulo}>Calculo de nomina</h2>

            <div style={styles.filaBase}>
              <div style={styles.baseCard}>
                <span style={styles.dataLabel}>Salario Base</span>
                <span style={styles.montoBase}>{formatearGs(salarioBase)}</span>
              </div>
              <div style={styles.baseCard}>
                <span style={styles.dataLabel}>Horas extras trabajadas</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={horasExtras}
                  onChange={e => { if (Number(e.target.value) >= 0) setHorasExtras(e.target.value); }}
                  style={styles.inputNumero}
                />
                {horasExtras > 0 && <span style={styles.calculado}>= {formatearGs(pagoHorasExtras)} (x1.5)</span>}
              </div>
              <div style={styles.baseCard}>
                <span style={styles.dataLabel}>Dias de ausencia</span>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={ausencias}
                  onChange={e => { if (Number(e.target.value) >= 0) setAusencias(e.target.value); }}
                  style={styles.inputNumero}
                />
                {ausencias > 0 && <span style={{ ...styles.calculado, color: '#dc2626' }}>- {formatearGs(descuentoAusencias)}</span>}
              </div>
            </div>

            <div style={styles.ipsInfo}>
              <span>IPS (9%) calculado automaticamente:</span>
              <strong>- {formatearGs(ips)}</strong>
            </div>

            <div style={styles.dosColumnas}>
              <ColumnaItems titulo="Bonificaciones" tipo="bonificacion" items={bonificaciones} onChange={setBonificaciones} />
              <ColumnaItems titulo="Deducciones" tipo="deduccion" items={deducciones} onChange={setDeducciones} />
            </div>

            <div style={styles.resumenRapido}>
              <div style={styles.resumenItem}>
                <span style={styles.resumenLabel}>Total ingresos</span>
                <span style={{ ...styles.resumenMonto, color: '#16a34a' }}>+ {formatearGs(totalIngresos)}</span>
              </div>
              <div style={styles.resumenSep} />
              <div style={styles.resumenItem}>
                <span style={styles.resumenLabel}>Total descuentos</span>
                <span style={{ ...styles.resumenMonto, color: '#dc2626' }}>- {formatearGs(totalDescuentos)}</span>
              </div>
              <div style={styles.resumenSep} />
              <div style={styles.resumenItem}>
                <span style={{ ...styles.resumenLabel, fontWeight: 700, fontSize: 16 }}>Salario Neto</span>
                <span style={{ ...styles.resumenMonto, fontSize: 20, fontWeight: 700 }}>{formatearGs(salarioFinal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Boton continuar */}
        <div style={styles.botonContainer}>
          {periodoIncompleto && <p style={{ color: 'red', margin: 0 }}>Debes seleccionar un periodo antes de continuar</p>}
          <div style={{ flex: 1 }} />
          <button
            style={{ ...styles.btnContinuar, opacity: periodoIncompleto ? 0.5 : 1, cursor: periodoIncompleto ? 'not-allowed' : 'pointer' }}
            disabled={periodoIncompleto}
            onClick={() => setMostrarResumen(true)}
          >
            Continuar
          </button>
        </div>

        {/* Modal resumen */}
        {mostrarResumen && (
          <div style={styles.overlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitulo}>Resumen de Nomina</h2>

              <div style={styles.modalContenido}>
                <div style={styles.modalFila}><span>Empleado</span><strong>{empleado.nombre} {empleado.apellido}</strong></div>
                <div style={styles.modalFila}><span>Cargo</span><strong>{empleado.cargo}</strong></div>
                <div style={styles.modalFila}><span>Periodo</span><strong>{periodo.fechaInicio} - {periodo.fechaFin}</strong></div>
                <div style={styles.linea} />
                <div style={styles.modalFila}><span>Salario Base</span><strong>{formatearGs(salarioBase)}</strong></div>

                <div style={styles.modalSubtitulo}>Bonificaciones</div>
                <div style={styles.modalFila}>
                  <span>Horas extras ({horasExtras || 0}h)</span>
                  <strong style={{ color: '#16a34a' }}>+ {formatearGs(pagoHorasExtras)}</strong>
                </div>
                {bonificaciones.map(b => (
                  <div key={b.id} style={styles.modalFila}>
                    <span>{b.nombre || 'Bonificacion'}</span>
                    <strong style={{ color: '#16a34a' }}>+ {formatearGs(b.monto)}</strong>
                  </div>
                ))}

                <div style={styles.modalSubtitulo}>Deducciones</div>
                <div style={styles.modalFila}><span>IPS (9%)</span><strong style={{ color: '#dc2626' }}>- {formatearGs(ips)}</strong></div>
                <div style={styles.modalFila}>
                  <span>Ausencias ({ausencias || 0} dias)</span>
                  <strong style={{ color: '#dc2626' }}>- {formatearGs(descuentoAusencias)}</strong>
                </div>
                {deducciones.map(d => (
                  <div key={d.id} style={styles.modalFila}>
                    <span>{d.nombre || 'Deduccion'}</span>
                    <strong style={{ color: '#dc2626' }}>- {formatearGs(d.monto)}</strong>
                  </div>
                ))}

                <div style={styles.linea} />
                <div style={styles.modalFilaTotal}><span>Total Neto</span><strong>{formatearGs(salarioFinal)}</strong></div>
              </div>

              {errorGuardar && (
                <p style={{ color: 'red', fontSize: 13, textAlign: 'center', margin: 0 }}>{errorGuardar}</p>
              )}

              <p style={styles.mensajeRevision}>Revise cuidadosamente los datos antes de continuar</p>

              <div style={styles.modalBotones}>
                <button style={styles.btnEditar} onClick={() => setMostrarResumen(false)} disabled={guardando}>
                  Seguir editando
                </button>
                <button
                  style={{ ...styles.btnPagar, opacity: guardando ? 0.6 : 1 }}
                  onClick={guardarPago}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar y emitir recibo'}
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
  pagina: { display: 'flex', width: '100vw', height: '100vh', background: '#F9F9F9', fontFamily: 'Lato, sans-serif' },
  contenido: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px 40px', gap: 25, overflowY: 'auto' },
  titulo: { fontSize: 30, fontWeight: 700, marginTop: 5 },
  headerTitulo: { width: '100%', display: 'flex', justifyContent: 'center' },
  seccion: { width: '100%', display: 'flex', flexDirection: 'column', gap: 12 },
  seccionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' },
  subtitulo: { fontSize: 18, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 },
  badge: { fontSize: 14, background: getColor('amarillo-claro'), padding: '2px 10px', borderRadius: 6 },
  infoEmpleadoContainer: { display: 'flex', flexDirection: 'column', gap: 5, paddingLeft: 10 },
  infoEmpleado: { display: 'flex', gap: 8, fontSize: 18 },
  labelInfo: { fontWeight: 700, color: getColor('gris') },
  valorInfo: { color: getColor('gris') },
  periodoGeneral: { width: '100%', maxWidth: 750, alignSelf: 'center', background: '#F5F5F5', border: '1px solid #E5E5E5', borderRadius: 12, padding: 24 },
  periodoContainer: { display: 'flex', gap: 20, justifyContent: 'center' },
  periodoCard: { flex: 1, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  dataLabel: { fontSize: 13, fontWeight: 700, color: getColor('gris') },
  inputFecha: { padding: 10, borderRadius: 8, border: '1px solid #ccc' },
  filaBase: { display: 'flex', gap: 16, width: '100%' },
  baseCard: { flex: 1, background: getColor('blanco'), border: '1px solid #E5E5E5', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 },
  montoBase: { fontSize: 18, fontWeight: 700, color: '#1D1D1D' },
  inputNumero: { padding: 9, borderRadius: 8, border: '1px solid #ccc', fontSize: 14 },
  calculado: { fontSize: 12, color: getColor('verde'), fontWeight: 600 },
  ipsInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 16px', fontSize: 14, color: '#92400e' },
  dosColumnas: { display: 'flex', gap: 20, width: '100%' },
  columna: { flex: 1, borderRadius: 14, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 },
  columnaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  columnaTitulo: { fontWeight: 700, fontSize: 15 },
  columnaTotal: { fontWeight: 700, fontSize: 15 },
  itemsLista: { display: 'flex', flexDirection: 'column', gap: 8 },
  sinItems: { fontSize: 13, color: '#999', textAlign: 'center', margin: '6px 0' },
  itemRow: { display: 'flex', gap: 8, alignItems: 'center' },
  inputItem: { padding: '8px 10px', borderRadius: 7, border: '1px solid #ddd', fontSize: 13, background: '#fff', minWidth: 0 },
  btnEliminar: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, opacity: 0.7, flexShrink: 0 },
  btnAgregar: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  resumenRapido: { background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 0 },
  resumenItem: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' },
  resumenSep: { width: 1, height: 40, background: '#E5E5E5', margin: '0 8px' },
  resumenLabel: { fontSize: 12, color: '#777', fontWeight: 600 },
  resumenMonto: { fontSize: 16, fontWeight: 700, color: '#1D1D1D' },
  botonContainer: { width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 },
  btnContinuar: { background: getColor('amarillo'), border: 'none', padding: '12px 24px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  modal: { width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18, padding: 28, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 10px 35px rgba(0,0,0,0.15)', maxHeight: '85vh', overflowY: 'auto' },
  modalTitulo: { margin: 0, fontSize: 24, fontWeight: 700, textAlign: 'center' },
  modalContenido: { display: 'flex', flexDirection: 'column', gap: 10 },
  modalFila: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  modalFilaTotal: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 },
  modalSubtitulo: { fontSize: 12, fontWeight: 700, color: '#888', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  linea: { width: '100%', height: 1, background: '#E5E5E5' },
  mensajeRevision: { margin: 0, textAlign: 'center', color: '#777', fontSize: 13 },
  modalBotones: { display: 'flex', justifyContent: 'flex-end', gap: 12 },
  btnEditar: { background: '#E0E0E0', border: 'none', padding: '12px 18px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
  btnPagar: { background: getColor('amarillo'), border: 'none', padding: '12px 22px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' },
};