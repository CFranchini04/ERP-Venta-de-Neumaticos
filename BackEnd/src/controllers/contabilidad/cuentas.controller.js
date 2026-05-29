// Controlador HTTP para Plan de Cuentas.
import {
  listarCuentas,
  obtenerCuenta,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
} from './cuentas.service';

export const getCuentas = (_req, res) => {
  res.json(listarCuentas());
};

export const getCuenta = (req, res) => {
  const cuenta = obtenerCuenta(req.params.codigo);
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });
  res.json(cuenta);
};

export const postCuenta = (req, res) => {
  try {
    res.status(201).json(crearCuenta(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const putCuenta = (req, res) => {
  try {
    res.json(actualizarCuenta(req.params.codigo, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteCuenta = (req, res) => {
  try {
    res.json(eliminarCuenta(req.params.codigo));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
