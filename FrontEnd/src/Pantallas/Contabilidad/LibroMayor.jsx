import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getColor } from "../../components/Colors";
import { fetchAsientos, fetchCuentas } from "./contabilidadHelpers";

const fmt = (n) =>
  `Gs. ${(n ?? 0).toLocaleString("es-PY", { maximumFractionDigits: 0 })}`;


// Heurística: cuentas que empiezan con 1 o 4. (Activo / Resultados negativos) son deudoras.
// 2, 3, 4.1.1.1.01 (Ventas) son acreedoras. Para simplificar: Activo (1) y Gasto/Resultado negativo (4.1.1.x salvo 4.1.1.1.01) son deudoras.
const esDeudora = (codigo) => {
  const r = codigo[0];
  if (r === "1") return true;
  if (r === "4") return codigo !== "4.1.1.1.01" && !codigo.startsWith("4.1.2.1") && !codigo.startsWith("4.1.2.3.01");
  return false;
};

export default function LibroMayor({ usuario = "Empleado", onNavegar, onLogout }) {
  const [codigoSel, setCodigoSel] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [asientos, setAsientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);

  useEffect(() => {
    fetchAsientos().then(setAsientos).catch(() => setAsientos([]));
    fetchCuentas().then((cs) => setCuentas(cs.filter((c) => c.imputable))).catch(() => setCuentas([]));
  }, []);

  const cuentasImputables = cuentas;

  const movimientos = useMemo(() => {
    if (!codigoSel) return [];
    const rows = [];
    const asientosOrdenados = [...asientos].sort((a, b) => a.fecha.localeCompare(b.fecha));
    for (const a of asientosOrdenados) {
      if (desde && a.fecha < desde) continue;
      if (hasta && a.fecha > hasta) continue;
      for (const l of a.lineas) {
        if (l.codigo === codigoSel) {
          rows.push({
            fecha: a.fecha,
            numero: a.numero,
            concepto: a.concepto,
            debe: l.debe,
            haber: l.haber,
          });
        }
      }
    }
    let saldo = 0;
    const deudora = esDeudora(codigoSel);
    return rows.map((r) => {
      saldo += deudora ? r.debe - r.haber : r.haber - r.debe;
      return { ...r, saldo };
    });
  }, [codigoSel, desde, hasta, asientos]);

  const cuenta = cuentasImputables.find((c) => c.codigo === codigoSel);
  const totD = movimientos.reduce((s, r) => s + r.debe, 0);
  const totH = movimientos.reduce((s, r) => s + r.haber, 0);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "4px solid #000" }}>
          Libro Mayor
        </h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <label style={controlLabel}>Cuenta:
            <select value={codigoSel} onChange={(e) => setCodigoSel(e.target.value)} style={{ ...controlInput, minWidth: 380 }}>
              <option value="">— Seleccionar cuenta —</option>
              {cuentasImputables.map((c) => (
                <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.cuenta}</option>
              ))}
            </select>
          </label>
          <label style={controlLabel}>Desde: <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <label style={controlLabel}>Hasta: <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
        </div>

        {!codigoSel && (
          <div style={{ padding: 40, textAlign: "center", color: "#777", background: "#FFF", borderRadius: 12, border: `2px dashed ${getColor("grisOscuro")}` }}>
            Seleccioná una cuenta para ver sus movimientos.
          </div>
        )}

        {codigoSel && (
          <>
            <div style={{ background: "#FFF", padding: "12px 18px", marginBottom: 10, border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12 }}>
              <b>{cuenta?.codigo}</b> — {cuenta?.cuenta} &nbsp;
              <span style={{ color: "#666" }}>({esDeudora(codigoSel) ? "Cuenta deudora" : "Cuenta acreedora"})</span>
            </div>

            <div style={tablaWrap}>
              <div style={{ ...filaHeader, gridTemplateColumns: "120px 80px 1fr 140px 140px 160px" }}>
                <span>Fecha</span><span>N°</span><span>Concepto</span>
                <span style={{ textAlign: "right" }}>Debe</span>
                <span style={{ textAlign: "right" }}>Haber</span>
                <span style={{ textAlign: "right" }}>Saldo</span>
              </div>
              {movimientos.map((m, i) => (
                <div key={i} style={{ ...filaCab, gridTemplateColumns: "120px 80px 1fr 140px 140px 160px", background: i % 2 === 0 ? "#FFF" : getColor("gris-claro") }}>
                  <span>{m.fecha}</span>
                  <span>{m.numero}</span>
                  <span style={{ textAlign: "left" }}>{m.concepto}</span>
                  <span style={{ textAlign: "right" }}>{m.debe ? fmt(m.debe) : ""}</span>
                  <span style={{ textAlign: "right" }}>{m.haber ? fmt(m.haber) : ""}</span>
                  <span style={{ textAlign: "right", fontWeight: 700 }}>{fmt(m.saldo)}</span>
                </div>
              ))}
              {movimientos.length === 0 && (
                <div style={{ padding: 30, textAlign: "center", color: "#777" }}>Sin movimientos para esta cuenta.</div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "120px 80px 1fr 140px 140px 160px", padding: 12, background: getColor("amarillo"), fontWeight: 700 }}>
                <span colSpan={3} style={{ gridColumn: "1 / span 3" }}>Totales</span>
                <span style={{ textAlign: "right" }}>{fmt(totD)}</span>
                <span style={{ textAlign: "right" }}>{fmt(totH)}</span>
                <span style={{ textAlign: "right" }}>{fmt(movimientos.at(-1)?.saldo || 0)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const controlInput = { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none", background: "#F9F9F9" };
const controlLabel = { display: "flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 700 };
const tablaWrap = { background: "#FFF", border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
const filaHeader = { display: "grid", padding: 10, background: getColor("amarillo"), fontWeight: 700 };
const filaCab = { display: "grid", padding: 10, alignItems: "center" };
