import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Buttons';
import { useParams } from 'react-router-dom';
import fetchConToken from '../../token';

function Field({ label, name, value, onChange, editando }) {
  return (
    <>
      <label>{label}</label>

      {editando ? (
        <input
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          style={{
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
            width: "100%"
          }}
        />
      ) : (
        <span>{value}</span>
      )}
    </>
  );
}

export default function GestionPersonal({ usuario, onLogout, onNavegar }) {
  const { id } = useParams();

  const modoCrear = !id;

  const [editando, setEditando] = useState(modoCrear);
  const [cargando, setCargando] = useState(!modoCrear);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    CI: "",
    ciudad: "",
    direccion: "",
    correo_electronico: "",
    fecha_inicio: "",
    cargo: "",
    estado: "",
    conyugue: "",
    hijos: "",
    hijos_menores: ""
  });

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

  useEffect(() => {
    if (modoCrear) return;

    const cargarEmpleado = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`);
        const dataArr = await res.json();
        const data = dataArr[0];

        const familiares = data.familiares || [];

        const hijos = familiares.filter(f =>
          ['hijo', 'hija'].includes((f.relacion || '').toLowerCase())
        );

        const hijos_menores = familiares.filter(h => {
          const cumple = new Date(h.personas.fecha_nacimiento);
          let edad = new Date().getFullYear() - cumple.getFullYear();
          return edad < 18;
        });

        const conyugue = familiares.find(f =>
          (f.relacion || '').toLowerCase() === 'conyugue'
        );

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
          conyugue: conyugue
            ? `${conyugue.personas?.nombre || ""} ${conyugue.personas?.apellido || ""}`
            : "",
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
                <Field label="Nombre" name="nombre" value={form.nombre} onChange={handleChange} editando={editando} />
                <Field label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} editando={editando} />
                <Field label="CI" name="CI" value={form.CI} onChange={handleChange} editando={editando} />
                <Field label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} editando={editando} />
                <Field label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} editando={editando} />
                <Field label="Correo" name="correo_electronico" value={form.correo_electronico} onChange={handleChange} editando={editando} />
              </div>
            </div>

            {/* DERECHA */}
            <div style={styles.right}>

              <div style={styles.card}>
                <h3>Datos empresariales</h3>

                <div style={styles.form}>
                  <Field label="Fecha inicio" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} editando={editando} />
                  <Field label="Cargo" name="cargo" value={form.cargo} onChange={handleChange} editando={editando} />
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

          {/* BOTONES */}
          <div style={styles.footer}>

            {modoCrear ? (
              <Button
                label="Crear empleado"
                variant="amarillo"
                onClick={() => console.log("CREAR:", form)}
              />
            ) : (
              <>
                {!editando ? (
                  <Button label="Editar" variant="amarillo" onClick={() => setEditando(true)} />
                ) : (
                  <>
                    <Button label="Cancelar" variant="gris" onClick={() => setEditando(false)} />
                    <Button
                      label="Guardar"
                      variant="amarillo"
                      onClick={() => {
                        console.log("UPDATE:", form);
                        setEditando(false);
                      }}
                    />
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
