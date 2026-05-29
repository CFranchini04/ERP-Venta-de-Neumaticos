import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getColor } from "../../components/Colors";
import { calcularSumasSaldos, fetchAsientos, fmt } from "./contabilidadHelpers";

// Clasificación interna: para cada cuenta de resultados, decidimos si es Ingreso (+) o Gasto (-)
const esIngreso = (codigo) =>
  codigo === "4.1.1.1.01" ||                    // Ventas
  codigo.startsWith("4.1.1.2.01") ||            // Comisiones ganadas
  codigo.startsWith("4.1.2.1") ||               // Intereses ganados
  codigo === "4.1.2.3.01" ||                    // Descuentos obtenidos
  codigo.startsWith("4.1.3.1.01") ||            // Venta títulos
  codigo.startsWith("4.1.3.1.03") ||            // Venta acciones
  codigo.startsWith("4.1.3.1.05") ||
  codigo.startsWith("4.1.3.2.03") ||
  codigo.startsWith("4.1.3.2.04") ||
  codigo.startsWith("4.1.3.2.06") ||
  codigo.startsWith("4.1.3.3.1") ||
  codigo.startsWith("4.1.3.4.01");

export default function BalanceResultados({ usuario = "Empleado", onNavegar, onLogout }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [asientos, setAsientos] = useState([]);
  useEffect(() => { fetchAsientos().then(setAsientos).catch(() => setAsientos([])); }, []);

  const datos = useMemo(() => {
    const filas = calcularSumasSaldos(asientos, desde || undefined, hasta || undefined).filter((f) => f.codigo.startsWith("4"));

    const ingresos = [];
    const gastos = [];
    let totalIngresos = 0;
    let totalGastos = 0;

    for (const f of filas) {
      const monto = f.saldoAcreedor - f.saldoDeudor; // acreedor positivo
      if (monto === 0) continue;
      if (esIngreso(f.codigo)) {
        ingresos.push({ codigo: f.codigo, cuenta: f.cuenta, monto: Math.abs(monto) });
        totalIngresos += Math.abs(monto);
      } else {
        const m = f.saldoDeudor - f.saldoAcreedor;
        gastos.push({ codigo: f.codigo, cuenta: f.cuenta, monto: Math.abs(m) });
        totalGastos += Math.abs(m);
      }
    }

    return { ingresos, gastos, totalIngresos, totalGastos, resultado: totalIngresos - totalGastos };
  }, [desde, hasta, asientos]);

  const Seccion = ({ titulo, filas, total, color }) => (
    <div style={{ ...seccion, borderColor: color }}>
      <h2 style={{ ...tituloSec, background: color }}>{titulo}</h2>
      {filas.map((l) => (
        <div key={l.codigo} style={lineaRow}>
          <span style={{ paddingLeft: 16 }}>{l.codigo} — {l.cuenta}</span>
          <span style={{ textAlign: "right" }}>{fmt(l.monto)}</span>
        </div>
      ))}
      {filas.length === 0 && <div style={{ padding: 14, color: "#777", textAlign: "center" }}>Sin movimientos.</div>}
      <div style={totalRow}>
        <span>TOTAL {titulo}</span>
        <span style={{ textAlign: "right" }}>{fmt(total)}</span>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "4px solid #000" }}>
          Balance de Resultados
        </h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label style={controlLabel}>Desde: <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <label style={controlLabel}>Hasta: <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
        </div>

        <Seccion titulo="INGRESOS"  filas={datos.ingresos} total={datos.totalIngresos} color={getColor("gris-claro")} />
        <div style={{ height: 20 }} />
        <Seccion titulo="GASTOS"    filas={datos.gastos}   total={datos.totalGastos}   color="#CECECE" />

        <div style={{ marginTop: 20, padding: 18, background: datos.resultado >= 0 ? "#FFCC00" : "#E30613", border: `3px solid ${datos.resultado >= 0 ? "#000000" : "#000000"}`, borderRadius: 12, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 18 }}>
          <span>{datos.resultado >= 0 ? "GANANCIA DEL EJERCICIO" : "PÉRDIDA DEL EJERCICIO"}</span>
          <span>{fmt(datos.resultado)}</span>
        </div>
      </div>
    </div>
  );
}

const controlInput = { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none", background: "#F9F9F9" };
const controlLabel = { display: "flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 700 };
const seccion = { background: "#FFF", border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
const tituloSec = { margin: 0, padding: 12, textAlign: "center", borderBottom: "2px solid #000" };
const lineaRow = { display: "grid", gridTemplateColumns: "1fr 180px", padding: "6px 14px", fontSize: 14 };
const totalRow = { display: "grid", gridTemplateColumns: "1fr 180px", padding: 12, background: "#EEE", fontWeight: 700, borderTop: "2px solid #000" };
