// modules.js
// Datos de los módulos

import { IconoCompras, IconoTesoreria, IconoVentas, IconoRRHH, IconoContabilidad } from './Icons';

export const MODULOS = [
  {
    id: 'compras',
    label: 'Compras',
    icon: <IconoCompras />,
  },
  {
    id: 'tesoreria',
    label: 'Tesorería',
    icon: <IconoTesoreria />,
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: <IconoVentas />,
  },
  {
    id: 'rrhh',
    label: 'RR.HH',
    icon: <IconoRRHH />,
  },
  {
    id: 'contabilidad',
    label: 'Contabilidad',
    icon: <IconoContabilidad />,
  },
];
