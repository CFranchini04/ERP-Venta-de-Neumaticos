import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import List from "../../components/Lista";
import { Button } from "../../components/Buttons";
import { getColor } from "../../components/Colors";
import { IconoMas, IconoEditar, IconoCerrar } from "../../components/Icons";
import { fetchCuentas, crearCuentaAPI, actualizarCuentaAPI } from "./contabilidadHelpers";

const sortByCodigo = (a, b) => {
  const pa = a.codigo.split(".").map(Number);
  const pb = b.codigo.split(".").map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const va = pa[i] ?? 0;
    const vb = pb[i] ?? 0;
    if (va !== vb) return va - vb;
  }
  return 0;
};

const nivelDe = (codigo) => codigo.split(".").length;

const formatoMoneda = (n) =>
  `Gs. ${(n ?? 0).toLocaleString("es-PY", { maximumFractionDigits: 0 })}`;

function ModalCuenta({ titulo, valor, onClose, onSubmit, codigoBloqueado = false }) {
  const [form, setForm] = useState(valor || { codigo: "", cuenta: "", imputable: true });
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.box}>
        <div style={modalStyles.header}>
          <span style={{ fontWeight: 700 }}>{titulo}</span>
          <span style={{ cursor: "pointer" }} onClick={onClose}><IconoCerrar /></span>
        </div>

        <div style={modalStyles.body}>
          <label style={modalStyles.label}>Código</label>
          <input value={form.codigo} disabled={codigoBloqueado} onChange={(e) => update("codigo", e.target.value)} style={modalStyles.input} placeholder="ej. 1.1.1.1.05" />

          <label style={modalStyles.label}>Cuenta</label>
          <input value={form.cuenta} onChange={(e) => update("cuenta", e.target.value)} style={modalStyles.input} placeholder="Nombre de la cuenta" />

          <label style={{ ...modalStyles.label, display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={!!form.imputable} onChange={(e) => update("imputable", e.target.checked)} />
            Imputable
          </label>
        </div>

        <div style={modalStyles.footer}>
          <Button label="Cancelar" variant="gris" onClick={onClose} />
          <Button label="Guardar" variant="amarillo" onClick={() => onSubmit(form)} />
        </div>
      </div>
    </div>
  );
}

export default function PlanDeCuentas({ usuario = "Empleado", onNavegar, onLogout }) {
  const [cuentas, setCuentas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [modal, setModal] = useState(null);

  useEffect(() => {
    fetchCuentas()
      .then((data) => setCuentas([...data].sort(sortByCodigo)))
      .catch((e) => alert("Error al cargar cuentas: " + e.message));
  }, []);

  const datos = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return cuentas.filter((c) => {
      if (q && !c.codigo.toLowerCase().includes(q) && !c.cuenta.toLowerCase().includes(q)) return false;
      if (filtroTipo === "imputables" && !c.imputable) return false;
      if (filtroTipo === "rubros" && c.imputable) return false;
      if (filtroTipo && /^[1-5]$/.test(filtroTipo) && c.codigo.split(".")[0] !== filtroTipo) return false;
      return true;
    });
  }, [cuentas, busqueda, filtroTipo]);

  const columns = [
    { key: "codigo", label: "Código", width: "180px",
      render: (item) => <span style={{ fontWeight: item.imputable ? 400 : 700 }}>{item.codigo}</span> },
    { key: "cuenta", label: "Cuenta",
      render: (item) => {
        const indent = (nivelDe(item.codigo) - 1) * 16;
        return (
          <span style={{ display: "block", textAlign: "left", paddingLeft: indent, fontWeight: item.imputable ? 400 : 700, textDecoration: nivelDe(item.codigo) <= 2 ? "underline" : "none" }}>
            {item.cuenta}
          </span>
        );
      } },
    { key: "imputable", label: "Imputable", width: "120px", render: (i) => (i.imputable ? "SI" : "NO") },
    { key: "saldo", label: "Saldo", width: "160px", render: (i) => (i.imputable ? formatoMoneda(i.saldo) : "—") },
    { key: "acciones", label: "Acciones", width: "120px",
      render: (item) => (
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          <span style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); setModal({ modo: "editar", cuenta: item }); }} title="Editar">
            <IconoEditar />
          </span>
        </div>
      ) },
  ];

  const guardar = async (form) => {
    try {
      if (modal.modo === "nuevo") {
        const nueva = await crearCuentaAPI({
          codigo: form.codigo.trim(),
          cuenta: form.cuenta.trim(),
          imputable: !!form.imputable,
        });
        setCuentas((prev) => [...prev, nueva].sort(sortByCodigo));
      } else {
        const actualizada = await actualizarCuentaAPI(modal.cuenta.codigo, {
          cuenta: form.cuenta,
          imputable: !!form.imputable,
        });
        setCuentas((prev) => prev.map((c) => (c.codigo === modal.cuenta.codigo ? actualizada : c)));
      }
      setModal(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />
      <div style={{ flex: 1, padding: 40, overflowY: "auto", background: "#F9F9F9", fontFamily: "Lato, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: 20, paddingBottom: 10, borderBottom: "4px solid #000" }}>Plan de Cuentas</h1>

        <List
          data={datos}
          columns={columns}
          controls={[
            { type: "search", placeholder: "Buscar por código o nombre...", value: busqueda, onChange: (e) => setBusqueda(e.target.value) },
            { type: "select", label: "Filtrar por:", value: filtroTipo, onChange: (e) => setFiltroTipo(e.target.value),
              options: [
                { key: "imputables", label: "Solo imputables" },
                { key: "rubros", label: "Solo rubros" },
                { key: "1", label: "Activo" },
                { key: "2", label: "Pasivo" },
                { key: "3", label: "Patrimonio Neto" },
                { key: "4", label: "Resultados" },
                { key: "5", label: "Cuentas de Orden" },
              ] },
            { type: "button",
              label: <span style={{ display: "flex", alignItems: "center", gap: 6 }}><IconoMas /> Nueva cuenta</span>,
              variant: "amarillo", onClick: () => setModal({ modo: "nuevo" }) },
          ]}
        />
      </div>

      {modal && (
        <ModalCuenta
          titulo={modal.modo === "nuevo" ? "Nueva cuenta" : "Editar cuenta"}
          valor={modal.cuenta}
          codigoBloqueado={modal.modo === "editar"}
          onClose={() => setModal(null)}
          onSubmit={guardar}
        />
      )}
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  box: { background: "#FFF", width: 440, borderRadius: 12, border: `2px solid ${getColor("grisOscuro")}`, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", overflow: "hidden", fontFamily: "Lato, sans-serif" },
  header: { background: getColor("amarillo"), padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000" },
  body: { padding: 20, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 700, marginTop: 8 },
  input: { padding: "8px 10px", border: "1px solid #444", borderRadius: 6, fontFamily: "Lato", fontSize: 14, outline: "none" },
  footer: { padding: 16, display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #DDD" },
};
