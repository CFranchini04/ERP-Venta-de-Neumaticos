import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { Button } from "../../components/Buttons";
import { getColor } from "../../components/Colors";
import { IconoMas, IconoCerrar } from "../../components/Icons";
import { fetchAsientos, fetchCuentas, crearAsientoAPI, fmt } from "./contabilidadHelpers";

function ModalAsiento({ proximoNumero, cuentasImputables, onClose, onSubmit }) {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [concepto, setConcepto] = useState("");
  const [lineas, setLineas] = useState([
    { codigo: "", debe: 0, haber: 0 },
    { codigo: "", debe: 0, haber: 0 },
  ]);

  const totalDebe = lineas.reduce((s, l) => s + Number(l.debe || 0), 0);
  const totalHaber = lineas.reduce((s, l) => s + Number(l.haber || 0), 0);
  const balanceado = totalDebe === totalHaber && totalDebe > 0;

  const setLinea = (i, k, v) =>
    setLineas((prev) => prev.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)));
  const agregarLinea = () => setLineas((prev) => [...prev, { codigo: "", debe: 0, haber: 0 }]);
  const quitarLinea = (i) => setLineas((prev) => prev.filter((_, idx) => idx !== i));

  const guardar = () => {
    if (!concepto.trim()) return alert("Ingresá un concepto");
    if (!balanceado) return alert("El asiento no está balanceado (Debe ≠ Haber)");
    const lineasOk = lineas
      .filter((l) => l.codigo && (Number(l.debe) > 0 || Number(l.haber) > 0))
      .map((l) => {
        const c = cuentasImputables.find((cc) => cc.codigo === l.codigo);
        return { codigo: l.codigo, cuenta: c?.cuenta || "", debe: Number(l.debe) || 0, haber: Number(l.haber) || 0 };
      });
    if (lineasOk.length < 2) return alert("Se requieren al menos 2 líneas válidas");
    onSubmit({ fecha, concepto, lineas: lineasOk });
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={{ ...modalStyles.box, width: 720 }}>
        <div style={modalStyles.header}>
          <span style={{ fontWeight: 700 }}>Nuevo asiento N° {proximoNumero}</span>
          <span style={{ cursor: "pointer" }} onClick={onClose}><IconoCerrar /></span>
        </div>

        <div style={modalStyles.body}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: "0 0 180px" }}>
              <label style={modalStyles.label}>Fecha</label>
              <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={modalStyles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={modalStyles.label}>Concepto</label>
              <input value={concepto} onChange={(e) => setConcepto(e.target.value)} style={modalStyles.input} placeholder="Descripción del asiento" />
            </div>
          </div>

          <label style={{ ...modalStyles.label, marginTop: 14 }}>Líneas</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px 40px", gap: 6, fontWeight: 700, fontSize: 13 }}>
            <span>Cuenta</span><span style={{ textAlign: "right" }}>Debe</span><span style={{ textAlign: "right" }}>Haber</span><span />
          </div>
          {lineas.map((l, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 140px 140px 40px", gap: 6, alignItems: "center" }}>
              <select value={l.codigo} onChange={(e) => setLinea(i, "codigo", e.target.value)} style={modalStyles.input}>
                <option value="">— Seleccionar cuenta —</option>
                {cuentasImputables.map((c) => (
                  <option key={c.codigo} value={c.codigo}>{c.codigo} — {c.cuenta}</option>
                ))}
              </select>
              <input type="number" min={0} value={l.debe} onChange={(e) => setLinea(i, "debe", e.target.value)} style={{ ...modalStyles.input, textAlign: "right" }} />
              <input type="number" min={0} value={l.haber} onChange={(e) => setLinea(i, "haber", e.target.value)} style={{ ...modalStyles.input, textAlign: "right" }} />
              <span style={{ cursor: "pointer", textAlign: "center" }} onClick={() => quitarLinea(i)}>✕</span>
            </div>
          ))}

          <div><Button label="+ Agregar línea" variant="gris-claro" onClick={agregarLinea} size="sm" /></div>

          <div style={{ marginTop: 10, padding: 10, background: "#F5F5F5", borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
            <span>Total Debe: <b>{fmt(totalDebe)}</b></span>
            <span>Total Haber: <b>{fmt(totalHaber)}</b></span>
            <span style={{ color: balanceado ? "green" : "crimson" }}>{balanceado ? "✓ Balanceado" : "✗ No balanceado"}</span>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <Button label="Cancelar" variant="gris-claro" onClick={onClose} />
          <Button label="Guardar asiento" variant="amarillo" onClick={guardar} />
        </div>
      </div>
    </div>
  );
}

export default function LibroDiario({ usuario = "Empleado", onNavegar, onLogout }) {
  const [asientos, setAsientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [modal, setModal] = useState(false);
  const [expandido, setExpandido] = useState(null);

  const recargar = () =>
    fetchAsientos().then(setAsientos).catch((e) => alert("Error cargando asientos: " + e.message));

  useEffect(() => {
    recargar();
    fetchCuentas()
      .then((data) => setCuentas(data.filter((c) => c.imputable)))
      .catch((e) => alert("Error cargando cuentas: " + e.message));
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return asientos.filter((a) => {
      if (q && !a.concepto.toLowerCase().includes(q) && !String(a.numero).includes(q)) return false;
      if (desde && a.fecha < desde) return false;
      if (hasta && a.fecha > hasta) return false;
      return true;
    });
  }, [asientos, busqueda, desde, hasta]);

  const guardar = async (a) => {
    try {
      await crearAsientoAPI(a);
      setModal(false);
      recargar();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "4px solid #000" }}>Libro Diario</h1>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="Buscar por concepto o N°..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={controlInput} />
          <label style={controlLabel}>Desde: <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <label style={controlLabel}>Hasta: <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} style={{ ...controlInput, width: 160 }} /></label>
          <Button
            label={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><IconoMas /> Nuevo asiento</span>}
            variant="amarillo"
            onClick={() => setModal(true)}
          />
        </div>

        <div style={tablaWrap}>
          <div style={{ ...filaHeader, gridTemplateColumns: "80px 130px 1fr 160px 160px" }}>
            <span>N°</span><span>Fecha</span><span>Concepto</span>
            <span style={{ textAlign: "right" }}>Debe</span>
            <span style={{ textAlign: "right" }}>Haber</span>
          </div>

          {filtrados.map((a, idx) => {
            const totD = a.lineas.reduce((s, l) => s + l.debe, 0);
            const totH = a.lineas.reduce((s, l) => s + l.haber, 0);
            const isOpen = expandido === a.id;
            return (
              <div key={a.id}>
                <div
                  onClick={() => setExpandido(isOpen ? null : a.id)}
                  style={{ ...filaCab, gridTemplateColumns: "80px 130px 1fr 160px 160px", background: idx % 2 === 0 ? "#FFF" : getColor("gris-claro") }}
                >
                  <span>{a.numero}</span>
                  <span>{a.fecha}</span>
                  <span style={{ textAlign: "left" }}>{a.concepto}</span>
                  <span style={{ textAlign: "right" }}>{fmt(totD)}</span>
                  <span style={{ textAlign: "right" }}>{fmt(totH)}</span>
                </div>
                {isOpen && (
                  <div style={{ padding: "8px 16px 14px", background: "#FAFAFA", borderBottom: "1px solid #DDD" }}>
                    {a.lineas.map((l, i) => (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 160px 160px", padding: "4px 0" }}>
                        <span>{l.codigo}</span>
                        <span style={{ paddingLeft: l.haber > 0 ? 40 : 0 }}>{l.cuenta}</span>
                        <span style={{ textAlign: "right" }}>{l.debe ? fmt(l.debe) : ""}</span>
                        <span style={{ textAlign: "right" }}>{l.haber ? fmt(l.haber) : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {filtrados.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#777" }}>Sin asientos en el rango seleccionado.</div>}
        </div>
      </div>

      {modal && (
        <ModalAsiento
          proximoNumero={asientos.length + 1}
          cuentasImputables={cuentas}
          onClose={() => setModal(false)}
          onSubmit={guardar}
        />
      )}
    </div>
  );
}

const controlInput = { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none", background: "#F9F9F9" };
const controlLabel = { display: "flex", gap: 6, alignItems: "center", fontSize: 13, fontWeight: 700 };
const tablaWrap = { background: "#FFF", border: `2px solid ${getColor("grisOscuro")}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" };
const filaHeader = { display: "grid", padding: 10, background: getColor("amarillo"), fontWeight: 700 };
const filaCab = { display: "grid", padding: 10, cursor: "pointer", alignItems: "center" };

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  box: { background: "#FFF", maxHeight: "90vh", overflow: "auto", borderRadius: 12, border: `2px solid ${getColor("grisOscuro")}`, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", fontFamily: "Lato, sans-serif" },
  header: { background: getColor("amarillo"), padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000" },
  body: { padding: 20, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 700 },
  input: { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
  footer: { padding: 16, display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #DDD" },
};
