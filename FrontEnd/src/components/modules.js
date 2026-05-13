// modules.js
// Datos de los módulos

import { IconoCompras, IconoTesoreria, IconoVentas, IconoRRHH, IconoContabilidad } from './Icons';

export const MODULOS = [
  { id: '/rrhh',        label: 'RRHH',          icon: <IconoRRHH /> },
  { id: '/compras',     label: 'Compras',       icon: <IconoCompras /> },
  { id: '/ventas',      label: 'Ventas',        icon: <IconoVentas /> },
  { id: '/tesoreria',   label: 'Tesorería',     icon: <IconoTesoreria /> },
  { id: '/contabilidad',label: 'Contabilidad',  icon: <IconoContabilidad /> },
];
