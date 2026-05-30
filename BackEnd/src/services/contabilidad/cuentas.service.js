// Servicio de Plan de Cuentas (in-memory).
// Reemplazar el array `cuentas` por la persistencia real (DB) cuando esté lista.
import planInicial from './Pantallas/Contabilidad/planDeCuentas.json';

let cuentas = (planInicial).map(c => ({ ...c }));

const sortByCodigo = (a, b) => {
  const pa = a.codigo.split('.').map(Number);
  const pb = b.codigo.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
};

export const listarCuentas = () =>
  [...cuentas].sort(sortByCodigo);

export const obtenerCuenta = (codigo) =>
  cuentas.find(c => c.codigo === codigo) ?? null;

export const crearCuenta = ({ codigo, cuenta, imputable }) => {
  if (!codigo || !cuenta) {
    throw new Error('codigo y cuenta son obligatorios');
  }
  if (cuentas.some(c => c.codigo === codigo)) {
    throw new Error(`Ya existe una cuenta con código ${codigo}`);
  }
  const nueva = {
    codigo,
    cuenta,
    imputable: !!imputable,
    ...(imputable ? { saldo: 0 } : {}),
  };
  cuentas.push(nueva);
  return nueva;
};

export const actualizarCuenta = (codigo, cambios) => {
  const idx = cuentas.findIndex(c => c.codigo === codigo);
  if (idx === -1) throw new Error(`Cuenta ${codigo} no encontrada`);
  cuentas[idx] = { ...cuentas[idx], ...cambios, codigo };
  return cuentas[idx];
};

export const eliminarCuenta = (codigo) => {
  const prefijo = codigo + '.';
  const tieneHijos = cuentas.some(c => c.codigo.startsWith(prefijo));
  if (tieneHijos) {
    throw new Error('No se puede eliminar: la cuenta tiene subcuentas');
  }
  const len = cuentas.length;
  cuentas = cuentas.filter(c => c.codigo !== codigo);
  if (cuentas.length === len) throw new Error(`Cuenta ${codigo} no encontrada`);
  return { codigo };
};
