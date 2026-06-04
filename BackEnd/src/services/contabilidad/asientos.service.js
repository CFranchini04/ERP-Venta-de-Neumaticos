import supabase from '../../config/supabase.js'

const validarBalanceado = (lineas) => {
  const totD = lineas.reduce((s, l) => s + Number(l.debe || 0), 0);
  const totH = lineas.reduce((s, l) => s + Number(l.haber || 0), 0);
  return totD === totH && totD > 0;
};

const listarAsientos = async (filtros = {}) => {
  const { desde, hasta } = filtros;

  let query = supabase
    .from('asientos_cabecera')
    .select(`
      id_asiento,
      fecha,
      descripcion,
      asientos_detalle (
        id_asientos_detalle,
        debe,
        haber,
        item,
        cuentas ( id_cuentas, codigo, nombre )
      )
    `)
    .order('fecha', { ascending: true })
    .order('id_asiento', { ascending: true });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return data.map(mapAsiento);
};

const obtenerAsiento = async (id) => {
  const { data, error } = await supabase
    .from('asientos_cabecera')
    .select(`
      id_asiento,
      fecha,
      descripcion,
      asientos_detalle (
        id_asientos_detalle,
        debe,
        haber,
        item,
        cuentas ( id_cuentas, codigo, nombre )
      )
    `)
    .eq('id_asiento', id)
    .single();

  if (error) throw new Error(error.message);
  return mapAsiento(data);
};

const crearAsiento = async (datos) => {
  const { fecha, concepto, lineas, id_periodo_fiscal, id_estado } = datos;

  if (!fecha || !concepto) throw new Error('Fecha y concepto son obligatorios');
  if (!Array.isArray(lineas) || lineas.length < 2) throw new Error('Se requieren al menos 2 líneas para el asiento');
  if (!validarBalanceado(lineas)) throw new Error('El asiento no está balanceado (Debe ≠ Haber)');

  const { data: cabecera, error: errCab } = await supabase
    .from('asientos_cabecera')
    .insert({
      fecha,
      descripcion: concepto,
      id_estado: id_estado ?? null,
      id_periodo_fiscal: id_periodo_fiscal ?? null,
    })
    .select()
    .single();

  if (errCab) throw new Error(errCab.message);

  const detalles = lineas.map((l, i) => ({
    id_asiento: cabecera.id_asiento,
    id_cuenta: l.id_cuenta ?? null,
    debe: Number(l.debe) || 0,
    haber: Number(l.haber) || 0,
    item: i + 1,
    es_manual: true,
  }));

  const { error: errDet } = await supabase
    .from('asientos_detalle')
    .insert(detalles);

  if (errDet) throw new Error(errDet.message);

  return obtenerAsiento(cabecera.id_asiento);
};

const actualizarAsiento = async (id, cambios) => {
  const { fecha, concepto, lineas } = cambios;

  if (lineas && !validarBalanceado(lineas)) throw new Error('El asiento no está balanceado (Debe ≠ Haber)');

  const updates = {};
  if (fecha)   updates.fecha       = fecha;
  if (concepto) updates.descripcion = concepto;

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('asientos_cabecera')
      .update(updates)
      .eq('id_asiento', id);
    if (error) throw new Error(error.message);
  }

  if (lineas) {
    const { error: errDel } = await supabase
      .from('asientos_detalle')
      .delete()
      .eq('id_asiento', id);
    if (errDel) throw new Error(errDel.message);

    const detalles = lineas.map((l, i) => ({
      id_asiento: Number(id),
      id_cuenta: l.id_cuenta ?? null,
      debe: Number(l.debe) || 0,
      haber: Number(l.haber) || 0,
      item: i + 1,
      es_manual: true,
    }));

    const { error: errIns } = await supabase
      .from('asientos_detalle')
      .insert(detalles);
    if (errIns) throw new Error(errIns.message);
  }

  return obtenerAsiento(id);
};

const eliminarAsiento = async (id) => {
  const { error: errDet } = await supabase
    .from('asientos_detalle')
    .delete()
    .eq('id_asiento', id);
  if (errDet) throw new Error(errDet.message);

  const { error } = await supabase
    .from('asientos_cabecera')
    .delete()
    .eq('id_asiento', id);
  if (error) throw new Error(error.message);

  return { id: Number(id), message: 'Asiento eliminado correctamente' };
};

// Mapea el formato de supabase al formato que usa el frontend
const mapAsiento = (a) => ({
  id: a.id_asiento,
  numero: a.id_asiento,
  fecha: a.fecha,
  concepto: a.descripcion,
  lineas: (a.asientos_detalle ?? []).map(d => ({
    id_asientos_detalle: d.id_asientos_detalle,
    codigo: d.cuentas?.codigo ?? '',
    cuenta: d.cuentas?.nombre ?? '',
    id_cuenta: d.id_cuenta,
    debe: d.debe ?? 0,
    haber: d.haber ?? 0,
  })),
});

export default {
  listarAsientos,
  obtenerAsiento,
  crearAsiento,
  actualizarAsiento,
  eliminarAsiento,
};