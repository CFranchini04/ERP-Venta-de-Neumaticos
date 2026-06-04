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
            <div key={i} onMouseDown={() => { onChange(op); setMostrar(false) }}
              style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid #f0f0f0' }}
              onMouseEnter={e => e.target.style.background = '#fff9e6'}
              onMouseLeave={e => e.target.style.background = '#fff'}>
              {op}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, name, value, onChange, editando, error, type = 'text' }) {
  return (
    <>
      <label style={{ fontWeight: error ? 700 : undefined, color: error ? '#dc2626' : undefined }}>
        {label}{error ? ' *' : ''}
      </label>
      {editando ? (
        <div>
          <input type={type} value={value || ""} onChange={(e) => onChange(name, e.target.value)}
            style={{
              padding: "8px 10px", borderRadius: 8,
              border: `1px solid ${error ? '#dc2626' : '#ccc'}`,
              fontSize: 14, width: "100%", boxSizing: "border-box",
              background: error ? '#fff5f5' : undefined,
            }} />
          {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
        </div>
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}

const CAMPOS_REQUERIDOS = {
  nombre: "Nombre", apellido: "Apellido", CI: "CI",
  correo_electronico: "Correo", fecha_inicio: "Fecha de inicio",
  cargo: "Cargo", estado: "Estado",
};

export default function GestionPersonal({ usuario, onLogout, onNavegar, onGuardado }) {
  const { id } = useParams();
  const modoCrear = !id || id === '-1';

  const [editando, setEditando] = useState(modoCrear);
  const [cargando, setCargando] = useState(!modoCrear);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [cargosDisponibles, setCargosDisponibles] = useState([]); // [{ id_cargo, nombre, salario }]
  const estadosDisponibles = ['Activo', 'Inactivo'];
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "", apellido: "", CI: "", direccion: "", correo_electronico: "",
    fecha_inicio: "", cargo: "", estado: "", salario_base: "",
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
          direccion: data.personas?.direccion || "",
          correo_electronico: data.personas?.correo || "",
          fecha_inicio: data.personas_horario_cargo?.[0]?.fecha_inicio || "",
          cargo: data.personas_horario_cargo?.[0]?.cargo?.nombre || "",
          estado: data.personas_horario_cargo?.[0]?.estados?.nombre || "",
          // salario viene del cargo relacionado
          salario_base: data.personas_horario_cargo?.[0]?.cargo?.salario ?? "",
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
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/cargos`);
        const data = await res.json();
        if (Array.isArray(data)) setCargosDisponibles(data);
        console.log(data)
      } catch (err) {
        console.error('Error cargando cargos:', err);
      }
    };
    cargarCargos();
  }, []);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errores[key]) setErrores(prev => ({ ...prev, [key]: "" }));
  };

  // Al seleccionar cargo, autocompletar salario
  const handleCargo = (nombreCargo) => {
    const cargoObj = cargosDisponibles.find(c => c.nombre === nombreCargo);
    setForm(prev => ({
      ...prev,
      cargo: nombreCargo,
      salario_base: cargoObj?.salario ?? ""
    }));
    if (errores.cargo) setErrores(prev => ({ ...prev, cargo: "" }));
  };

  const validar = () => {
    const nuevosErrores = {};
    Object.entries(CAMPOS_REQUERIDOS).forEach(([campo, label]) => {
      if (!form[campo]?.toString().trim()) nuevosErrores[campo] = `${label} es obligatorio`;
    });
    if(!form.correo_electronico.includes("@")) nuevosErrores.correo_electronico = "Correo no válido"
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const buildPayload = () => {
    const id_cargo = cargosDisponibles.find(c => c.nombre === form.cargo)?.id_cargo;
    const estado = form.estado === 'Activo' ? 6 : form.estado === 'Inactivo' ? 7 : null;
    return {
      ci: form.CI, nombre: form.nombre, apellido: form.apellido,
      direccion: form.direccion, correo: form.correo_electronico,
      conyugue: form.conyugue ?? "",
      nro_hijos: form.hijos !== "" ? Number(form.hijos) : null,
      hijos_menores: form.hijos_menores !== "" ? Number(form.hijos_menores) : null,
      fecha_inicio: form.fecha_inicio,
      id_cargo, id_estado: estado ?? null
    };
  };

  const editEmpleado = async () => {
    if (!validar()) return;
    try {
      await crearCargoInexistente()
      const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar el empleado");
      if (onGuardado) onGuardado(data);
      setEditando(false); setErrorGeneral("");
    } catch (err) {
      setErrorGeneral(err.message || "Error al guardar empleado");
    }
  };

  const crearCargoInexistente = async () => {
    try {
      const existeCargo = cargosDisponibles.some(
        e => e.nombre?.toLowerCase() === form.cargo.toLowerCase()
      );
      if (!existeCargo) {
        const cargoPayload = {
          nombre: form.cargo,
          jefe_inmediato: null,
          area_superior: "",
          salario: parseInt(form.salario_base) || 0
        }
        console.log("Payload enviado:", JSON.stringify(cargoPayload, null, 2));
        const resC = await fetchConToken(`${API_BASE}/rrhh/empleados/cargos`, {
          method: 'POST', headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cargoPayload)
        })
        const dataC = await resC.json()
        if (!resC.ok) throw new Error(dataC.message)
        setCargosDisponibles([...cargosDisponibles, dataC]);
      }
    }catch (err) {
      setErrorGeneral(err.message || "Error al crear empleado");
    }
  }

  const crearEmpleado = async () => {
    if (!validar()) return;
    try {
      await crearCargoInexistente()
      const res = await fetchConToken(`${API_BASE}/rrhh/empleados/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al crear el empleado");
      if (onGuardado) onGuardado(data);
      setErrorGeneral(""); navigate("/rrhh");
    } catch (err) {
      setErrorGeneral(err.message || "Error al crear empleado");
    }
  };

  const cancelarEdicion = () => { setEditando(false); setErrores({}); setErrorGeneral(""); };

  if (cargando) return <div>Cargando...</div>;

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />
      <main style={styles.contenido}>
        <div style={styles.wrapper}>

          <h1 style={styles.titulo}>{modoCrear ? "Crear Empleado" : "Gestión de Personal"}</h1>

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

                  {/* Fecha inicio */}
                  <label style={{ color: errores.fecha_inicio ? '#dc2626' : undefined, fontWeight: errores.fecha_inicio ? 700 : undefined }}>
                    Fecha inicio{errores.fecha_inicio ? ' *' : ''}
                  </label>
                  {editando ? (
                    <div>
                      <input type="date" value={form.fecha_inicio}
                        onChange={e => handleChange('fecha_inicio', e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: 8, width: "100%", boxSizing: "border-box", border: `1px solid ${errores.fecha_inicio ? '#dc2626' : '#ccc'}`, background: errores.fecha_inicio ? '#fff5f5' : undefined, fontSize: 14 }} />
                      {errores.fecha_inicio && <span style={{ fontSize: 11, color: '#dc2626' }}>{errores.fecha_inicio}</span>}
                    </div>
                  ) : <span>{form.fecha_inicio}</span>}

                  {/* Cargo y Estado */}
                  {!editando ? (
                    <>
                      <Field label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} editando={false} error={errores.cargo} />
                      <Field label="Estado" name="estado" value={form.estado} onChange={handleChange} editando={false} />
                    </>
                  ) : (
                    <>
                      <label style={{ color: errores.cargo ? '#dc2626' : undefined, fontWeight: errores.cargo ? 700 : undefined }}>
                        Cargo{errores.cargo ? ' *' : ''}
                      </label>
                      <div>
                        <InputSugerencias value={form.cargo} onChange={handleCargo}
                          opciones={cargosDisponibles.map(c => c.nombre)} placeholder="Cargo..." />
                        {errores.cargo && <span style={{ fontSize: 11, color: '#dc2626' }}>{errores.cargo}</span>}
                      </div>

                      <label style={{ color: errores.estado ? '#dc2626' : undefined, fontWeight: errores.estado ? 700 : undefined }}>
                        Estado{errores.estado ? ' *' : ''}
                      </label>
                      <div>
                        <InputSugerencias value={form.estado} onChange={val => handleChange('estado', val)}
                          opciones={estadosDisponibles} placeholder="Estado..." />
                        {errores.estado && <span style={{ fontSize: 11, color: '#dc2626' }}>{errores.estado}</span>}
                      </div>
                    </>
                  )}

                  {/* Salario base — siempre visible*/}
                  <label>Salario base</label>
                  {editando ? (
                    <div>
                      <div style={styles.salarioWrapper}>
                        <span style={styles.salarioPrefix}>Gs.</span>
                        <input
                          type="number" min="0"
                          value={form.salario_base}
                          disabled={!!cargosDisponibles.find(c => c.nombre === form.cargo)}
                          onChange={e => handleChange('salario_base', e.target.value)}
                          placeholder="Se completa al elegir cargo"
                          style={{
                            flex: 1, padding: "8px 10px", borderRadius: '0 8px 8px 0',
                            border: '1px solid #ccc', borderLeft: 'none', fontSize: 14,
                            background: cargosDisponibles.find(c => c.nombre === form.cargo) ? '#f0f0f0' : undefined,
                            cursor: cargosDisponibles.find(c => c.nombre === form.cargo) ? 'not-allowed' : undefined,
                            color: '#333',
                          }}
                        />
                      </div>
                      {form.cargo && !cargosDisponibles.find(c => c.nombre === form.cargo) && (
                        <span style={{ fontSize: 11, color: '#888' }}>Cargo no reconocido, ingresá el salario manualmente</span>
                      )}
                    </div>
                  ) : (
                    <span>
                      {form.salario_base ? `Gs. ${Number(form.salario_base).toLocaleString('es-PY')}` : '—'}
                    </span>
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

          {errorGeneral && <p style={styles.errorGeneral}>{errorGeneral}</p>}
          {Object.keys(errores).length > 0 && (
            <p style={styles.errorGeneral}>Completá los campos obligatorios antes de continuar.</p>
          )}

          <div style={styles.footer}>
            {!modoCrear && !editando && <Button label="Editar" variant="amarillo" onClick={() => setEditando(true)} />}
            {!modoCrear && editando && <Button label="Cancelar" variant="gris" onClick={cancelarEdicion} />}
            {modoCrear && <Button label="Crear empleado" variant="amarillo" onClick={crearEmpleado} />}
            {!modoCrear && editando && <Button label="Guardar" variant="amarillo" onClick={editEmpleado} />}
          </div>

        </div>
      </main>
    </div>
  );
}

const styles = {
  pagina: { display: "flex", minHeight: "100vh", background: "#F5F5F5" },
  contenido: { flex: 1, display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "40px" },
  wrapper: { width: "100%", maxWidth: 1000 },
  titulo: { textAlign: "center", fontSize: 30, marginBottom: 30 },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
  card: { background: "#fff", padding: 20, borderRadius: 12, border: "1px solid #ddd" },
  form: { display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" },
  right: { display: "flex", flexDirection: "column", gap: 20 },
  footer: { marginTop: 30, display: "flex", justifyContent: "flex-end", gap: 10 },
  errorGeneral: { marginTop: 12, color: "#dc2626", fontSize: 14, textAlign: "right" },
  salarioWrapper: { display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: 8, overflow: "hidden" },
  salarioPrefix: { padding: "8px 10px", background: "#f0f0f0", fontSize: 14, color: "#555", borderRight: "1px solid #ccc", whiteSpace: "nowrap" },
};
