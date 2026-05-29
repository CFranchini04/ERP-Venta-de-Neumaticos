// Rutas Express para Plan de Cuentas.
// import { Router } from 'express';
import {
  getCuentas,
  getCuenta,
  postCuenta,
  putCuenta,
  deleteCuenta,
} from './cuentas.controller';

// const router = Router();
// router.get('/cuentas', getCuentas);
// router.get('/cuentas/:codigo', getCuenta);
// router.post('/cuentas', postCuenta);
// router.put('/cuentas/:codigo', putCuenta);
// router.delete('/cuentas/:codigo', deleteCuenta);
// export default router;

// Versión agnóstica del framework (registralo donde corresponda):
export const cuentasRoutes = [
  { method: 'GET',    path: '/cuentas',          handler: getCuentas },
  { method: 'GET',    path: '/cuentas/:codigo',  handler: getCuenta },
  { method: 'POST',   path: '/cuentas',          handler: postCuenta },
  { method: 'PUT',    path: '/cuentas/:codigo',  handler: putCuenta },
  { method: 'DELETE', path: '/cuentas/:codigo',  handler: deleteCuenta },
];

export default cuentasRoutes;
