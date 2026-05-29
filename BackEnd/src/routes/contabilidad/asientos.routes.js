// Rutas Express para Asientos del Libro Diario.
import { Router } from 'express';
import {
  getAsientos,
  getAsiento,
  postAsiento,
  putAsiento,
  deleteAsiento,
} from '../../controllers/contabilidad/asientos.controller.js';

const router = Router();

router.get('/',     getAsientos);   // GET    /api/asientos?desde=&hasta=
router.get('/:id',  getAsiento);    // GET    /api/asientos/:id
router.post('/',    postAsiento);   // POST   /api/asientos
router.put('/:id',  putAsiento);    // PUT    /api/asientos/:id
router.delete('/:id', deleteAsiento); // DELETE /api/asientos/:id

export default router;
