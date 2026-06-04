// Servicio compartido: cualquier módulo (ventas, compras, tesorería, rrhh)
// puede pedir contabilizar un evento. Carga el modelo, arma las líneas y
// crea el asiento (que internamente valida partida doble + período abierto).
import modelosService from './modelosAsiento.service.js'
import asientosService from './asientos.service.js'

export const contabilizarEvento = async (modulo, evento, datos) => {
  const modelo = await modelosService.obtenerModelo(modulo, evento)

  const lineas = modelo.lineas.map(l => {
    const monto = Number(datos[l.formula] ?? 0)
    return {
      codigo: l.codigo,
      cuenta: l.cuenta,
      debe:  l.lado === 'debe'  ? monto : 0,
      haber: l.lado === 'haber' ? monto : 0,
    }
  })

  return asientosService.crearAsiento({
    fecha: datos.fecha,
    concepto: datos.concepto || `${modulo}/${evento} ${datos.ref ? `#${datos.ref}` : ''}`.trim(),
    lineas,
    origen: { modulo, evento, ref: datos.ref ?? null },
  })
}

export default { contabilizarEvento }
