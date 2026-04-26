import React, { useState, useEffect } from "react";
import { Button } from "./Button";
import { getColor } from "./Colors";

export default function EditEmpleadoModal({
  open,
  onClose,
  seccion,
  empleado,
  onSave,
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (empleado) {
      setForm(empleado);
    }
  }, [empleado]);

  if (!open) return null;

  const handleChange = (key, value) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(form);
    }
  };

  const renderCampos = () => {
    switch (seccion) {
      case "personal":
        return (
          <>
            <Input label="Nombre" value={form.nombre} onChange={(v) => handleChange("nombre", v)} />
            <Input label="Apellido" value={form.apellido} onChange={(v) => handleChange("apellido", v)} />
            <Input label="CI" value={form.CI} onChange={(v) => handleChange("CI", v)} />
            <Input label="Ciudad" value={form.ciudad} onChange={(v) => handleChange("ciudad", v)} />
            <Input label="Dirección" value={form.direccion} onChange={(v) => handleChange("direccion", v)} />
            <Input label="Correo" value={form.correo_electronico} onChange={(v) => handleChange("correo_electronico", v)} />
          </>
        );

      case "empresarial":
        return (
          <>
            <Input label="Fecha inicio" value={form.fecha_inicio} onChange={(v) => handleChange("fecha_inicio", v)} />
            <Input label="Cargo" value={form.cargo} onChange={(v) => handleChange("cargo", v)} />
            <Input label="Estado" value={form.estado} onChange={(v) => handleChange("estado", v)} />
          </>
        );

      case "familiar":
        return (
          <>
            <Input label="Cónyuge" value={form.conyugue} onChange={(v) => handleChange("conyugue", v)} />
            <Input label="Hijos" value={form.hijos} onChange={(v) => handleChange("hijos", v)} />
            <Input label="Hijos menores" value={form.hijos_menores} onChange={(v) => handleChange("hijos_menores", v)} />
          </>
        );

      default:
        return <div>No hay sección seleccionada</div>;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={{ margin: 0 }}>Editar datos</h2>
          <span style={styles.close} onClick={onClose}>✕</span>
        </div>

        {/* FORM */}
        <div style={styles.form}>
          {renderCampos()}
        </div>

        {/* ACTIONS */}
        <div style={styles.actions}>
          <Button label="Cancelar" variant="gris-claro" onClick={onClose} />
          <Button label="Guardar" variant="amarillo" onClick={handleSave} />
        </div>

      </div>
    </div>
  );
}

/* INPUT REUTILIZABLE */
function Input({ label, value, onChange }) {
  return (
    <>
      <label style={styles.label}>{label}</label>
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
        onFocus={(e) => e.target.style.border = `1px solid ${getColor("amarillo")}`}
        onBlur={(e) => e.target.style.border = `1px solid ${getColor("gris-claro")}`}
      />
    </>
  );
}

/* STYLES */
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: "600px",
    maxWidth: "90%",
    background: "#fff",
    borderRadius: 12,
    padding: 25,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    animation: "fadeIn 0.2s ease",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  close: {
    cursor: "pointer",
    fontSize: 20,
  },

  form: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 12,
    alignItems: "center",
  },

  label: {
    fontWeight: 500,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid #CECECE`,
    outline: "none",
    fontSize: 14,
    transition: "all 0.2s ease",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
};
