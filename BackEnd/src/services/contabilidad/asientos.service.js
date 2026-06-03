<<<<<<< HEAD
// Servicio de Asientos del Libro Diario (in-memory).
import asientosIniciales from './Pantallas/Contabilidad/asientosMock.json' with { type: 'json' };
=======
import asientosIniciales from '../../data/contabilidad/asientosMock.json' with { type: 'json' };
>>>>>>> 1d247877beac191966728741ff995beabbcbcf39


let asientos = asientosIniciales.map(a => ({ ...a, lineas: a.lineas.map(l => ({ ...l })) }));
let proximoId = asientos.reduce((m, a) => Math.max(m, a.id || 0), 0) + 1;
let proximoNumero = asientos.reduce((m, a) => Math.max(m, a.numero || 0), 0) + 1;


const validarBalanceado = (lineas) => {
  const totD = lineas.reduce((s, l) => s + Number(l.debe || 0), 0);
  const totH = lineas.reduce((s, l) => s + Number(l.haber || 0), 0);
  return totD === totH && totD > 0;
};

const listarAsientos = async (filtros = {}) => {
  const { desde, hasta } = filtros;
  return [...asientos]
    .filter(a => (!desde || a.fecha >= desde) && (!hasta || a.fecha <= hasta))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.numero - b.numero);
};

const obtenerAsiento = async (id) => {
  const asiento = asientos.find(a => a.id === Number(id));
  return asiento ?? null;
};

const crearAsiento = async (datos) => {
  const { fecha, concepto, lineas } = datos;

  if (!fecha || !concepto) {
    throw new Error('Fecha y concepto son obligatorios');
  }
  if (!Array.isArray(lineas) || lineas.length < 2) {
    throw new Error('Se requieren al menos 2 líneas para el asiento');
  }
  if (!validarBalanceado(lineas)) {
    throw new Error('El asiento no está balanceado (Debe ≠ Haber)');
  }

  const nuevo = {
    id: proximoId++,
    numero: proximoNumero++,
    fecha,
    concepto,
    lineas: lineas.map(l => ({
      codigo: l.codigo,
      cuenta: l.cuenta || '',
      debe: Number(l.debe) || 0,
      haber: Number(l.haber) || 0,
    })),
  };

  asientos.push(nuevo);
  return nuevo;
};

const actualizarAsiento = async (id, cambios) => {
  const idx = asientos.findIndex(a => a.id === Number(id));
  if (idx === -1) throw new Error(`Asiento ${id} no encontrado`);

  const { id: _, numero: __, ...datosAActualizar } = cambios;

  const datosLimpios = Object.fromEntries(
    Object.entries(datosAActualizar).filter(([_, v]) => v !== undefined && v !== '')
  );

  const merged = { 
    ...asientos[idx], 
    ...datosLimpios, 
    id: asientos[idx].id, 
    numero: asientos[idx].numero 
  };

  if (merged.lineas && !validarBalanceado(merged.lineas)) {
    throw new Error('El asiento no está balanceado (Debe ≠ Haber)');
  }

  asientos[idx] = merged;
  return merged;
};

const eliminarAsiento = async (id) => {
  const longitudInicial = asientos.length;
  asientos = asientos.filter(a => a.id !== Number(id));

  if (asientos.length === longitudInicial) {
    throw new Error(`Asiento ${id} no encontrado`);
  }

  return { id: Number(id), message: 'Asiento eliminado correctamente' };
};


export default {
  listarAsientos,
  obtenerAsiento,
  crearAsiento,
  actualizarAsiento,
  eliminarAsiento
};