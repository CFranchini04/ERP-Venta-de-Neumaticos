import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Buttons';
import { useNavigate, useParams } from 'react-router-dom';
import fetchConToken from '../../token';
function InputSugerencias({ value, onChange, opciones, placeholder }) {
  const [mostrar, setMostrar] = useState(false)

  const sugerencias = opciones.filter(op =>
    op.toLowerCase().includes(value.toLowerCase()) && value.trim()
  )

  return (
    <div style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(e) => { onChange(e.target.value); setMostrar(true) }}
        onBlur={() => setTimeout(() => setMostrar(false), 150)}
        placeholder={placeholder}
        style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' }}
      />

      {mostrar && sugerencias.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#fff', border: '1px solid #ddd', borderRadius: '0 0 8px 8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: 200, overflowY: 'auto'
        }}>
          {sugerencias.map((op, i) => (
            <div
              key={i}
              onMouseDown={() => { onChange(op); setMostrar(false) }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f0f0f0' }}
              onMouseEnter={e => e.target.style.background = '#fff9e6'}
              onMouseLeave={e => e.target.style.background = '#fff'}
            >
              {op}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
  const modoCrear = !id || id === '-1';

  const [editando, setEditando] = useState(modoCrear);
  const [cargando, setCargando] = useState(!modoCrear);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargo, setCargo] = useState('')
  const [cargosDisponibles, setCargosDisponibles] = useState([])
  const estadosDisponibles = ['Confirmado', 'Anulado']
  const navigate = useNavigate();


  const [form, setForm] = useState({
    nombre: "", apellido: "", CI: "", //ciudad: "",
    direccion: "",
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
        setForm({
          nombre: data.personas?.nombre || "",
          apellido: data.personas?.apellido || "",
          CI: data.ci || "",
          //ciudad: data.ciudad || "",
          direccion: data.personas?.direccion || "",
          correo_electronico: data.personas?.correo || "",
          fecha_inicio: data.personas_horario_cargo?.[0]?.fecha_inicio || "",
          cargo: data.personas_horario_cargo?.[0]?.cargo?.nombre || "",
          estado: data.personas_horario_cargo?.[0]?.estados?.nombre || "",
          conyugue: data.conyugue || "",
          hijos: data.nro_hijos || 0,
          hijos_menores: data.hijos_menores || 0
        });

      } finally {
        setCargando(false);
      }
    };
    cargarEmpleado();
  }, [id]);

  useEffect(() => {
    const cargarCargos = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/cargos`)
        const data = await res.json()
        if (Array.isArray(data))
          setCargosDisponibles(data.map(c => ({ id_cargo: c.id_cargo, nombre: c.nombre })))
      } catch (err) {
        console.error('Error cargando cargos:', err)
      }
    }
    cargarCargos()
  }, [])

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
        conyugue: form.conyugue, nro_hijos: form.hijos, hijos_menores: form.hijos_menores,
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

  const crearEmpleado = async () => {
    if (!validar()) return;
    try {
      const id_cargo = cargosDisponibles.find(c => c.nombre === form.cargo)?.id_cargo
      const payload = {
        ci: form.CI,
        nombre: form.nombre,
        apellido: form.apellido,
        direccion: form.direccion,
        correo: form.correo_electronico,
        conyugue: form.conyugue ?? "",
        nro_hijos: form.hijos !== "" ? Number(form.hijos) : null,       // ← null si vacío
        hijos_menores: form.hijos_menores !== "" ? Number(form.hijos_menores) : null,
        fecha_inicio: form.fecha_inicio,
        id_cargo,
        id_estado: form.id_estado ?? null
      }

      const res = await fetchConToken(`${API_BASE}/rrhh/empleados/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Error al crear el empleado")
      if (onGuardado) onGuardado(data)
      setErrorGeneral("")
      navigate("/rrhh")
    } catch (err) {
      setErrorGeneral(err.message || "Error al crear empleado")
    }
  }

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
                  {!editando ? (
                    <>
                      <Field label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} editando={editando} error={errores.cargo} />
                      <Field label="Estado" name="estado" value={form.estado} onChange={handleChange} editando={editando} />
                    </>

                  ) : (
                    <>
                      <p>Cargo:</p>
                      <InputSugerencias
                        value={form.cargo}
                        onChange={(val) => handleChange('cargo', val)}
                        opciones={cargosDisponibles.map(c => c.nombre)}
                        placeholder="Cargo..."
                      />
                      <p>Estado:</p>
                      <InputSugerencias
                        value={form.estado}
                        onChange={(val) => handleChange('estado', val)}
                        opciones={estadosDisponibles}
                        placeholder="Estado..."
                      />
                    </>
                  )}
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
            {!modoCrear && !editando && (
              <Button label="Editar" variant="amarillo" onClick={() => setEditando(true)} />
            )}
            {!modoCrear && editando && (
              <Button label="Cancelar" variant="gris" onClick={cancelarEdicion} />
            )}
            {modoCrear && (
              <Button label="Crear empleado" variant="amarillo" onClick={crearEmpleado} />
            )}
            {!modoCrear && editando && (
              <Button label="Guardar" variant="amarillo" onClick={editEmpleado} />
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
