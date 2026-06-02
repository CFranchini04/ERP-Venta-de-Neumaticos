import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Buttons';
import { useParams } from 'react-router-dom';
import fetchConToken from '../../token';
 
function Field({ label, name, value, onChange, editando, error }) {
  return (
    <>
      <label style={{ fontWeight: error ? 700 : undefined, color: error ? '#dc2626' : undefined }}>
        {label}{error ? ' *' : ''}
      </label>
 
      {editando ? (
        <div>
          <input
            value={value || ""}
            onChange={(e) => onChange(name, e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: 8,
              border: `1px solid ${error ? '#dc2626' : '#ccc'}`,
              fontSize: 14,
              width: "100%",
              boxSizing: "border-box",
              background: error ? '#fff5f5' : undefined,
            }}
          />
          {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
        </div>
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}
 
// Campos que no pueden estar vacíos al crear o editar
const CAMPOS_REQUERIDOS = {
  nombre: "Nombre",
  apellido: "Apellido",
  CI: "CI",
  correo_electronico: "Correo",
  fecha_inicio: "Fecha de inicio",
  cargo: "Cargo",
};
 
export default function GestionPersonal({ usuario, onLogout, onNavegar, onGuardado }) {
  const { id } = useParams();
  const modoCrear = !id;
 
  const [editando, setEditando] = useState(modoCrear);
  const [cargando, setCargando] = useState(!modoCrear);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
 
  const [form, setForm] = useState({
    nombre: "", apellido: "", CI: "", ciudad: "", direccion: "",
    correo_electronico: "", fecha_inicio: "", cargo: "", estado: "",
    conyugue: "", hijos: "", hijos_menores: ""
  });
 
  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";
 
  useEffect(() => {
    if (modoCrear) return;
    const cargarEmpleado = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`);
        const data = await res.json();
        const familiares = data.familiares || [];
        const hijos = familiares.filter(f => ['hijo', 'hija'].includes((f.relacion || '').toLowerCase()));
        const hijos_menores = familiares.filter(h => {
          const edad = new Date().getFullYear() - new Date(h.personas.fecha_nacimiento).getFullYear();
          return edad < 18;
        });
        const conyugue = familiares.find(f => (f.relacion || '').toLowerCase() === 'conyugue');
        setForm({
          nombre: data.personas?.nombre || "",
          apellido: data.personas?.apellido || "",
          CI: data.ci || "",
          ciudad: data.ciudad || "",
          direccion: data.personas?.direccion || "",
          correo_electronico: data.personas?.correo || "",
          fecha_inicio: data.personas_horario_cargo?.[0]?.fecha_inicio || "",
          cargo: data.personas_horario_cargo?.[0]?.cargo?.nombre || "",
          estado: data.personas_horario_cargo?.[0]?.estados?.nombre || "",
          conyugue: conyugue ? `${conyugue.personas?.nombre || ""} ${conyugue.personas?.apellido || ""}` : "",
          hijos: hijos.length,
          hijos_menores: hijos_menores.length
        });
      } finally {
        setCargando(false);
      }
    };
    cargarEmpleado();
  }, [id]);
 
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Limpiar error del campo al escribir
    if (errores[key]) setErrores(prev => ({ ...prev, [key]: "" }));
  };
 
  const validar = () => {
    const nuevosErrores = {};
    Object.entries(CAMPOS_REQUERIDOS).forEach(([campo, label]) => {
      if (!form[campo]?.toString().trim()) {
        nuevosErrores[campo] = `${label} es obligatorio`;
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
 
  const editEmpleado = async () => {
    if (!validar()) return;
    try {
      const payload = {
        ci: form.CI, nombre: form.nombre, apellido: form.apellido,
        direccion: form.direccion, correo: form.correo_electronico,
        fecha_inicio: form.fecha_inicio,
      };
      const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar el empleado");
      if (onGuardado) onGuardado(data);
      setEditando(false);
      setErrorGeneral("");
    } catch (err) {
      setErrorGeneral(err.message || "Error al guardar empleado");
    }
  };
 
  const crearEmpleado = () => {
    if (!validar()) return;
    console.log("CREAR:", form);
  };
 
  const cancelarEdicion = () => {
    setEditando(false);
    setErrores({});
    setErrorGeneral("");
  };
 
  if (cargando) return <div>Cargando...</div>;
 
  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />
 
      <main style={styles.contenido}>
        <div style={styles.wrapper}>
 
          <h1 style={styles.titulo}>
            {modoCrear ? "Crear Empleado" : "Gestión de Personal"}
          </h1>
 
          <div style={styles.grid}>
 
            {/* IZQUIERDA */}
            <div style={styles.card}>
              <h3>Datos personales</h3>
              <div style={styles.form}>
                <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} editando={editando} error={errores.nombre} />
                <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} editando={editando} error={errores.apellido} />
                <Field label="CI" name="CI" value={form.CI} onChange={handleChange} editando={editando} error={errores.CI} />
                <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} editando={editando} />
                <Field label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} editando={editando} />
                <Field label="Correo" name="correo_electronico" value={form.correo_electronico} onChange={handleChange} editando={editando} error={errores.correo_electronico} />
              </div>
            </div>
 
            {/* DERECHA */}
            <div style={styles.right}>
              <div style={styles.card}>
                <h3>Datos empresariales</h3>
                <div style={styles.form}>
                  <Field label="Fecha inicio" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} editando={editando} error={errores.fecha_inicio} />
                  <Field label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} editando={editando} error={errores.cargo} />
                  <Field label="Estado" name="estado" value={form.estado} onChange={handleChange} editando={editando} />
                </div>
              </div>
 
              <div style={styles.card}>
                <h3>Datos familiares</h3>
                <div style={styles.form}>
                  <Field label="Cónyuge" name="conyugue" value={form.conyugue} onChange={handleChange} editando={editando} />
                  <Field label="Hijos" name="hijos" value={form.hijos} onChange={handleChange} editando={editando} />
                  <Field label="Hijos menores" name="hijos_menores" value={form.hijos_menores} onChange={handleChange} editando={editando} />
                </div>
              </div>
            </div>
 
          </div>
 
          {/* Error general */}
          {errorGeneral && (
            <p style={styles.errorGeneral}>{errorGeneral}</p>
          )}
 
          {/* Aviso de campos requeridos si hay errores */}
          {Object.keys(errores).length > 0 && (
            <p style={styles.errorGeneral}>Completá los campos obligatorios antes de continuar.</p>
          )}
 
          {/* BOTONES */}
          <div style={styles.footer}>
            {modoCrear ? (
              <Button label="Crear empleado" variant="amarillo" onClick={crearEmpleado} />
            ) : (
              <>
                {!editando ? (
                  <Button label="Editar" variant="amarillo" onClick={() => setEditando(true)} />
                ) : (
                  <>
                    <Button label="Cancelar" variant="gris" onClick={cancelarEdicion} />
                    <Button label="Guardar" variant="amarillo" onClick={editEmpleado} />
                  </>
                )}
              </>
            )}
          </div>
 
        </div>
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: "flex",
    minHeight: "100vh",
    background: "#F5F5F5"
  },
  contenido: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px"
  },
  wrapper: {
    width: "100%",
    maxWidth: 1000
  },
  titulo: {
    textAlign: "center",
    fontSize: 30,
    marginBottom: 30
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  },
  card: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #ddd"
  },
  form: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 10,
    alignItems: "center"
  },
  right: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  footer: {
    marginTop: 30,
    display: "flex",
    justifyContent: "flex-end",
    gap: 10
  }
};
