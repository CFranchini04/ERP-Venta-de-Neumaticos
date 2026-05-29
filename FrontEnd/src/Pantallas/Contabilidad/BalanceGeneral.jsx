import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { getColor } from "../../components/Colors";
import { calcularSumasSaldos, fetchAsientos, fmt, saldoNatural } from "./contabilidadHelpers";

const nombreRubro = {
  "1.1": "ACTIVO CORRIENTE",
  "1.2": "ACTIVO NO CORRIENTE",
  "2.1": "PASIVO CORRIENTE",
  "2.2": "PASIVO NO CORRIENTE",
  "3.1": "CAPITAL",
  "3.2": "RESULTADOS ACUMULADOS",
};

export default function BalanceGeneral({ usuario = "Empleado", onNavegar, onLogout }) {
  const [fecha, setFecha] = useState("");
  const [asientos, setAsientos] = useState([]);
  useEffect(() => { fetchAsientos().then(setAsientos).catch(() => setAsientos([])); }, []);

  const datos = useMemo(() => {
    const filas = calcularSumasSaldos(asientos, undefined, fecha || undefined);

    // Calculo resultado del ejercicio (rubro 4)
    let resultadoEjercicio = 0;
    for (const f of filas) {
      if (f.codigo.startsWith("4")) {
        resultadoEjercicio += saldoNatural(f); // ingresos suman, gastos restan (signo via esDeudora)
      }
    }
    // Para resultados: cuentas acreedoras (ventas/intereses ganados) suman positivo,
    // cuentas deudoras (gastos) suman negativo a "resultado".
    // saldoNatural devuelve positivo para "su naturaleza". Necesitamos: ingresos (+) - gastos (-).
    resultadoEjercicio = 0;
    for (const f of filas) {
      if (!f.codigo.startsWith("4")) continue;
      const acreedor = f.saldoAcreedor;
      const deudor = f.saldoDeudor;
      resultadoEjercicio += acreedor - deudor;
    }

    const grupos = {};
    for (const key of Object.keys(nombreRubro)) {
      grupos[key] = { titulo: nombreRubro[key], lineas: [], total: 0 };
    }

    for (const f of filas) {
      const prefijo = f.codigo.split(".").slice(0, 2).join(".");
      if (!grupos[prefijo]) continue;
      const monto = saldoNatural(f);
      if (monto === 0) continue;
      grupos[prefijo].lineas.push({ codigo: f.codigo, cuenta: f.cuenta, monto });
      grupos[prefijo].total += monto;
    }

    // Agregar el resultado del ejercicio al PN
    if (resultadoEjercicio !== 0) {
      grupos["3.2"].lineas.push({ codigo: "3.2.2.02", cuenta: "RESULTADO DEL EJERCICIO", monto: resultadoEjercicio });
      grupos["3.2"].total += resultadoEjercicio;
    }

    const totalActivo = grupos["1.1"].total + grupos["1.2"].total;
    const totalPasivo = grupos["2.1"].total + grupos["2.2"].total;
    const totalPN = grupos["3.1"].total + grupos["3.2"].total;

    return { grupos, totalActivo, totalPasivo, totalPN };
  }, [fecha, asientos]);

  const cuadra = Math.abs(datos.totalActivo - (datos.totalPasivo + datos.totalPN)) < 0.01;

  const Columna = ({ titulo, claves, total }) => (
    <div style={columna}>
      <h2 style={tituloCol}>{titulo}</h2>
      {claves.map((k) => {
        const g = datos.grupos[k];
        if (!g || (g.lineas.length === 0 && g.total === 0)) return null;
        return (
          <div key={k} style={{ marginBottom: 14 }}>
            <div style={subRubro}>{g.titulo}</div>
            {g.lineas.map((l) => (
              <div key={l.codigo} style={lineaRow}>
                <span style={{ paddingLeft: 16 }}>{l.cuenta}</span>
                <span style={{ textAlign: "right" }}>{fmt(l.monto)}</span>
              </div>
            ))}
            <div style={subtotalRow}>
              <span>Subtotal</span>
              <span style={{ textAlign: "right" }}>{fmt(g.total)}</span>
            </div>
          </div>
        );
      })}
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
          Balance General
        </h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontWeight: 700 }}>
            Al: <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ padding: "8px 10px", border: "1px solid #444", borderRadius: 6 }} />
          </label>
          <span style={{ marginLeft: "auto", color: cuadra ? "green" : "crimson", fontWeight: 700 }}>
            {cuadra ? "✓ Activo = Pasivo + PN" : `✗ Diferencia: ${fmt(datos.totalActivo - (datos.totalPasivo + datos.totalPN))}`}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Columna titulo="ACTIVO" claves={["1.1", "1.2"]} total={datos.totalActivo} />
          <div>
            <Columna titulo="PASIVO" claves={["2.1", "2.2"]} total={datos.totalPasivo} />
            <div style={{ height: 20 }} />
            <Columna titulo="PATRIMONIO NETO" claves={["3.1", "3.2"]} total={datos.totalPN} />
          </div>
        </div>
      </div>
    </div>
  );
}

const columna = { background: "#FFF", border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
const tituloCol = { textAlign: "center", borderBottom: "3px solid #000", paddingBottom: 8, marginBottom: 14 };
const subRubro = { fontWeight: 700, textDecoration: "underline", padding: "6px 0" };
const lineaRow = { display: "grid", gridTemplateColumns: "1fr 160px", padding: "3px 0", fontSize: 14 };
const subtotalRow = { display: "grid", gridTemplateColumns: "1fr 160px", padding: "6px 0", borderTop: "1px solid #DDD", fontStyle: "italic" };
const totalRow = { display: "grid", gridTemplateColumns: "1fr 160px", padding: 10, background: getColor("amarillo"), fontWeight: 700, marginTop: 10, borderRadius: 6 };
