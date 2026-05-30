// Controlador HTTP para Asientos del Libro Diario.
import {
  listarAsientos,
  obtenerAsiento,
  crearAsiento,
  actualizarAsiento,
  eliminarAsiento,
} from './asientos.service.js';

export const getAsientos = (req, res) => {
  const { desde, hasta } = req.query || {};
  res.json(listarAsientos({ desde, hasta }));
};

export const getAsiento = (req, res) => {
  const a = obtenerAsiento(req.params.id);
  if (!a) return res.status(404).json({ error: 'Asiento no encontrado' });
  res.json(a);
};

export const postAsiento = (req, res) => {
  try {
    res.status(201).json(crearAsiento(req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const putAsiento = (req, res) => {
  try {
    res.json(actualizarAsiento(req.params.id, req.body));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const deleteAsiento = (req, res) => {
  try {
    res.json(eliminarAsiento(req.params.id));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};
