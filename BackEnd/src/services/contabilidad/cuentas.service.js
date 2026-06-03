import supabase from '../../config/supabase.js'

const sortByCodigo = (a, b) => {
  const pa = String(a.codigo).split('.').map(Number);
  const pb = String(b.codigo).split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
};

const listarCuentas = async () => {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*');
  if (error) throw new Error(error.message);
  return data.map(mapCuenta).sort(sortByCodigo);
};

const obtenerCuenta = async (codigo) => {
  const { data, error } = await supabase
    .from('cuentas')
    .select('*')
    .eq('codigo', codigo)
    .single();
  if (error) throw new Error(error.message);
  return mapCuenta(data);
};

const crearCuenta = async (datos) => {
  const { codigo, cuenta, imputable, id_periodo_fiscal, id_cuenta_padre } = datos;

  if (!codigo || !cuenta) throw new Error('Código y cuenta son obligatorios');
  if (!id_periodo_fiscal) throw new Error('id_periodo_fiscal es obligatorio');

  // Verificar que no exista
  const { data: existe } = await supabase
    .from('cuentas')
    .select('id_cuentas')
    .eq('codigo', codigo)
    .maybeSingle();

  if (existe) throw new Error(`Ya existe una cuenta con código ${codigo}`);

  const nivel = String(codigo).split('.').length;

  const { data, error } = await supabase
    .from('cuentas')
    .insert({
      codigo,
      nombre: cuenta,
      es_asentable: !!imputable,
      id_periodo_fiscal,
      id_cuenta_padre: id_cuenta_padre ?? null,
      nivel: String(nivel),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCuenta(data);
};

const actualizarCuenta = async (codigo, cambios) => {
  const { data: existente, error: errFind } = await supabase
    .from('cuentas')
    .select('id_cuentas')
    .eq('codigo', codigo)
    .single();

  if (errFind) throw new Error(`Cuenta ${codigo} no encontrada`);

  const { codigo: _, ...datosLimpios } = cambios;

  const updates = {};
  if (datosLimpios.cuenta !== undefined) updates.nombre = datosLimpios.cuenta;
  if (datosLimpios.imputable !== undefined) updates.es_asentable = datosLimpios.imputable;
  if (datosLimpios.nombre !== undefined) updates.nombre = datosLimpios.nombre;

  const { data, error } = await supabase
    .from('cuentas')
    .update(updates)
    .eq('id_cuentas', existente.id_cuentas)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapCuenta(data);
};

const eliminarCuenta = async (codigo) => {
  // Verificar hijos
  const { data: hijos } = await supabase
    .from('cuentas')
    .select('id_cuentas')
    .like('codigo', `${codigo}.%`)
    .limit(1);

  if (hijos && hijos.length > 0) throw new Error('No se puede eliminar: la cuenta tiene subcuentas');

  const { data: existente, error: errFind } = await supabase
    .from('cuentas')
    .select('id_cuentas')
    .eq('codigo', codigo)
    .single();

  if (errFind) throw new Error(`Cuenta ${codigo} no encontrada`);

  const { error } = await supabase
    .from('cuentas')
    .delete()
    .eq('id_cuentas', existente.id_cuentas);

  if (error) throw new Error(error.message);
  return { codigo, message: 'Cuenta eliminada correctamente' };
};

// Mapea el formato supabase al formato que usa el frontend
const mapCuenta = (c) => ({
  id_cuentas: c.id_cuentas,
  codigo: String(c.codigo),
  cuenta: c.nombre,
  nombre: c.nombre,
  imputable: c.es_asentable ?? false,
  es_asentable: c.es_asentable ?? false,
  saldo: c.saldo ?? 0,
  nivel: c.nivel,
  id_cuenta_padre: c.id_cuenta_padre,
  id_periodo_fiscal: c.id_periodo_fiscal,
});

export default {
  listarCuentas,
  obtenerCuenta,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
};