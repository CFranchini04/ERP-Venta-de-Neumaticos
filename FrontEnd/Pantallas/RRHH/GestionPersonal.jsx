import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Button';
import EditEmpleadoModal from "../../components/EditModal";


export default function GestionPersonal({ usuario, empleado, onVolver, onLogout, onNavegar }) {

  const [editOpen, setEditOpen] = useState(false);
  const [seccion, setSeccion] = useState("");

  const isCreating = !empleado;

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

  useEffect(() => {
    if (empleado) {
      setForm(empleado);
    }
  }, [empleado]);

  const handleChange = (key, value) => {
    setForm({
      ...form,
      [key]: value
    });
  };

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>


        <div style={styles.wrapper}>
          <section style={styles.titulo}>
            <h1 style={{ fontSize: 32 }}>
              Gestion de Personal</h1>
          </section>

          <div style={styles.grid}>

            <div style={styles.card}>
              <h3 style={styles.title}>Datos personales</h3>

              <div style={styles.form}>
                <label>Nombre</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                  />
                  : <span>{form.nombre}</span>
                }
                <label>Apellido</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.apellido}
                    onChange={(e) => handleChange("apellido", e.target.value)}
                  />
                  : <span>{form.apellido}</span>
                }

                <label>CI</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.CI}
                    onChange={(e) => handleChange("CI", e.target.value)}
                  />
                  : <span>{form.CI}</span>
                }

                <label>Ciudad</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                  />
                  : <span>{form.ciudad}</span>
                }

                <label>Dirección</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.direccion}
                    onChange={(e) => handleChange("direccion", e.target.value)}
                  />
                  : <span>{form.direccion}</span>
                }

                <label>Correo</label>
                {isCreating
                  ? <input
                    style={styles.input}
                    value={form.correo_electronico}
                    onChange={(e) => handleChange("correo_electronico", e.target.value)}
                  />
                  : <span>{form.correo_electronico}</span>
                }
              </div>

              {!isCreating && (
                <Button
                  label="Editar"
                  variant="amarillo"
                  onClick={() => {
                    setSeccion("personal");
                    setEditOpen(true);
                  }}
                />
              )}
            </div>

            {/* DERECHA */}
            <div style={styles.right}>

              <div style={styles.card}>
                <h3 style={styles.title}>Datos empresariales</h3>

                <div style={styles.form}>
                  <label>Fecha inicio</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.fecha_inicio}
                      onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                    />
                    : <span>{form.fecha_inicio}</span>
                  }
                  <label>Cargo</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.cargo}
                      onChange={(e) => handleChange("cargo", e.target.value)}
                    />
                    : <span>{form.cargo}</span>
                  }
                  <label>Estado</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.estado}
                      onChange={(e) => handleChange("estado", e.target.value)}
                    />
                    : <span>{form.estado}</span>
                  }
                </div>

                {!isCreating && (
                  <Button
                    label="Editar"
                    variant="amarillo"
                    onClick={() => {
                      setSeccion("empresarial");
                      setEditOpen(true);
                    }}
                  />
                )}
              </div>

              <div style={styles.card}>
                <h3 style={styles.title}>Datos familiares</h3>

                <div style={styles.form}>
                  <label>Conyugue</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.conyugue}
                      onChange={(e) => handleChange("conyugue", e.target.value)}
                    />
                    : <span>{form.conyugue}</span>
                  }
                  <label>Hijos</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.hijos}
                      onChange={(e) => handleChange("hijos", e.target.value)}
                    />
                    : <span>{form.hijos}</span>
                  }
                  <label>Hijos menores</label>
                  {isCreating
                    ? <input
                      style={styles.input}
                      value={form.hijos_menores}
                      onChange={(e) => handleChange("hijos_menores", e.target.value)}
                    />
                    : <span>{form.hijos_menores}</span>
                  }
                </div>

                {!isCreating && (
                  <Button
                    label="Editar"
                    variant="amarillo"
                    onClick={() => {
                      setSeccion("familiar");
                      setEditOpen(true);
                    }}
                  />
                )}
              </div>

            </div>
          </div>

          <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
            <Button label="Volver" onClick={onVolver} variant="amarillo" />

            {isCreating && (
              <Button
                label="Crear empleado"
                variant="amarillo"
                onClick={() => {
                  //Modificar luego para que anhada en la bd
                  console.log("CREAR:", form);
                }}
              />
            )}
          </div>

        </div>

        <EditEmpleadoModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          seccion={seccion}
          empleado={empleado}
          onSave={(data) => {
            console.log("Guardar en BD:", data);
          }}
        />
      </main>
    </div>
  );
}

const styles = {
  pagina: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F5F5F5',
  },

  contenido: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    padding: 30,
  },
  titulo: {
    width: '100%',
    maxWidth: 860,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    marginTop: 20,
    marginBottom: 20,

  },
  wrapper: {
    width: "100%",
    maxWidth: 1000,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 20,
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    border: "1px solid #ddd",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
  },

  form: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    rowGap: 10,
    columnGap: 10,
    alignItems: "center",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #DADADA",
    outline: "none",
    fontSize: 14,
    transition: "all 0.2s ease",
    background: "#FAFAFA",
  }
};
