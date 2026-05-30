import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Buttons';
import EditEmpleadoModal from "../../components/EditModal";
import { useParams, useNavigate } from 'react-router-dom';
import fetchConToken from '../../token';



export default function GestionPersonal({ usuario, empleado, onVolver, onLogout, onNavegar }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreating = !id;
  const [editOpen, setEditOpen] = useState(false);
  const [seccion, setSeccion] = useState("");
  const [cargando, setCargando] = useState(!isCreating);

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
    if (!id) return;

    const cargarEmpleado = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`);
        const dataArr = await res.json();
        //Ns pq lql trae los datos dentro de un array, abajo lo traigo como un object
        const data = dataArr[0];
        console.log("Respuesta de la API:", data);
        // EXTRACCION DE DATOS 
        const hoy = new Date();
        const parseFecha = hoy.toISOString().split('T')[0];
        const familiares = data.familiares //lista de familiares
        const hijos = familiares.filter(f => f.relacion.toLowerCase() === 'hijo' || f.relacion.toLowerCase() === 'hija') //lista de hijos
        const hijos_menores = familiares.filter(h => {    // lista de hijos menores
          var cumple = new Date(h.personas.fecha_nacimiento)
          var edad = hoy.getFullYear() - cumple.getFullYear()
          if (hoy.getMonth() <= cumple.getMonth()) edad--
          return (edad < 18 && (h.relacion.toLowerCase() === 'hijo' || h.relacion.toLowerCase() === 'hija'))
        })
        const conyugue = familiares.filter(f => f.relacion.toLowerCase() === 'conyugue') // Conyugue
        setForm({
          nombre: data.personas?.nombre ?? '',
          apellido: data.personas?.apellido ?? '',
          CI: data.ci ?? '',
          ciudad: data?.ciudad ?? '', //Este dato no hay en la db todavia
          direccion: data.personas?.direccion ?? '',
          correo_electronico: data.personas?.correo ?? '',
          fecha_inicio: data.personas_horario_cargo?.[0]?.fecha_inicio ?? '',
          cargo: data.personas_horario_cargo?.[0]?.cargo?.nombre ?? '',
          estado: data.personas_horario_cargo?.[0]?.estados?.nombre ?? '',
          conyugue: conyugue[0]?.personas?.nombre + " " + conyugue[0]?.personas?.apellido ?? '',
          hijos: hijos.length ?? '',
          hijos_menores: hijos_menores.length ?? '',
        });
      } catch (error) {
        console.error("Error cargando empleado:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarEmpleado();
  }, [id]);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  if (cargando) return <div>Cargando...</div>;


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
                <div style={{ transform: "scale(1.1)", display: "inline-block", alignSelf:"center", marginTop: 20 }}>
                <Button
                  label="Editar"
                  variant="amarillo"
                  onClick={() => {
                    setSeccion("personal");
                    setEditOpen(true);
                  }}
                />
                </div>
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
                  <div style={{ transform: "scale(1.1)", display: "inline-block", alignSelf:"center" }}>
                  <Button
                    label="Editar"
                    variant="amarillo"
                    onClick={() => {
                      setSeccion("empresarial");
                      setEditOpen(true);
                    }}
                  />
                  </div>
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
                  <div style={{ transform: "scale(1.1)", display: "inline-block", alignSelf:"center" }}>
                  <Button
                    label="Editar"
                    variant="amarillo"
                    onClick={() => {
                      setSeccion("familiar");
                      setEditOpen(true);
                    }}
                  />
                  </div>
                )}
              </div>

            </div>

            {isCreating && (
              <Button
                label="Crear empleado"
                variant="amarillo"
                onClick={() => {
                  //Modificar luego para que anhada en la bd
                  console.log("CREAR:", form);
                }}
                size="md"
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
    gridTemplateColumns: "1fr 1.5fr",
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
