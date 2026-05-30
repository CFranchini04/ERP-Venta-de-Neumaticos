import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getColor } from "../../components/Colors";
import { calcularSumasSaldos, fetchAsientos, fmt } from "./contabilidadHelpers";

export default function BalanceSumasSaldos({ usuario = "Empleado", onNavegar, onLogout }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [asientos, setAsientos] = useState([]);
  useEffect(() => { fetchAsientos().then(setAsientos).catch(() => setAsientos([])); }, []);

  const filas = useMemo(() => calcularSumasSaldos(asientos, desde || undefined, hasta || undefined), [desde, hasta, asientos]);
  const tot = filas.reduce(
    (s, f) => ({
      debe: s.debe + f.debe,
      haber: s.haber + f.haber,
      sd: s.sd + f.saldoDeudor,
      sa: s.sa + f.saldoAcreedor,
    }),
    { debe: 0, haber: 0, sd: 0, sa: 0 }
  );

  const cuadra = tot.debe === tot.haber && tot.sd === tot.sa;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "4px solid #000" }}>
          Balance de Sumas y Saldos
        </h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label style={controlLabel}>Desde: <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <label style={controlLabel}>Hasta: <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <span style={{ marginLeft: "auto", color: cuadra ? "green" : "crimson", fontWeight: 700 }}>
            {cuadra ? "✓ Balance cuadrado" : "✗ Balance no cuadrado"}
          </span>
        </div>

        <div style={tablaWrap}>
          <div style={{ ...filaHeader, gridTemplateColumns: "140px 1fr 140px 140px 140px 140px" }}>
            <span>Código</span><span style={{ textAlign: "left" }}>Cuenta</span>
            <span style={{ textAlign: "right" }}>Debe</span>
            <span style={{ textAlign: "right" }}>Haber</span>
            <span style={{ textAlign: "right" }}>S. Deudor</span>
            <span style={{ textAlign: "right" }}>S. Acreedor</span>
          </div>
          {filas.map((f, i) => (
            <div key={f.codigo} style={{ ...fila, gridTemplateColumns: "140px 1fr 140px 140px 140px 140px", background: i % 2 === 0 ? "#FFF" : getColor("gris-claro") }}>
              <span>{f.codigo}</span>
              <span style={{ textAlign: "left" }}>{f.cuenta}</span>
              <span style={{ textAlign: "right" }}>{fmt(f.debe)}</span>
              <span style={{ textAlign: "right" }}>{fmt(f.haber)}</span>
              <span style={{ textAlign: "right" }}>{f.saldoDeudor ? fmt(f.saldoDeudor) : ""}</span>
              <span style={{ textAlign: "right" }}>{f.saldoAcreedor ? fmt(f.saldoAcreedor) : ""}</span>
            </div>
          ))}
          {filas.length === 0 && (
            <div style={{ padding: 30, textAlign: "center", color: "#777" }}>Sin movimientos en el rango.</div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr 140px 140px 140px 140px", padding: 12, background: getColor("amarillo"), fontWeight: 700 }}>
            <span style={{ gridColumn: "1 / span 2" }}>TOTALES</span>
            <span style={{ textAlign: "right" }}>{fmt(tot.debe)}</span>
            <span style={{ textAlign: "right" }}>{fmt(tot.haber)}</span>
            <span style={{ textAlign: "right" }}>{fmt(tot.sd)}</span>
            <span style={{ textAlign: "right" }}>{fmt(tot.sa)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const controlInput = { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none", background: "#F9F9F9" };
const controlLabel = { display: "flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 700 };
const tablaWrap = { background: "#FFF", border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
const filaHeader = { display: "grid", padding: 10, background: getColor("amarillo"), fontWeight: 700 };
const fila = { display: "grid", padding: 10, alignItems: "center" };
