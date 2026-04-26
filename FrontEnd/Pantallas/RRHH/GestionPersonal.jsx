import React, { useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Button';
import EditEmpleadoModal from "../../components/EditModal";


export default function GestionPersonal({ usuario, empleado, onVolver, onLogout, onNavegar }) {

const [editOpen, setEditOpen] = useState(false);
const [seccion, setSeccion] = useState("");

  if (!empleado) return <div>No hay empleado seleccionado</div>;

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
                <label>Nombre</label><span>{empleado.nombre}</span>
                <label>Apellido</label><span>{empleado.apellido}</span>
                <label>CI</label><span>{empleado.CI}</span>
                <label>Ciudad</label><span>{empleado.ciudad}</span>
                <label>Dirección</label><span>{empleado.direccion}</span>
                <label>Correo</label><span>{empleado.correo_electronico}</span>
              </div>

              <Button
                label="Editar"
                variant="amarillo"
                onClick={() => {
                  setSeccion("personal");
                  setEditOpen(true);
                }}
              />
            </div>

            {/* DERECHA */}
            <div style={styles.right}>

              <div style={styles.card}>
                <h3 style={styles.title}>Datos empresariales</h3>

                <div style={styles.form}>
                  <label>Fecha inicio</label><span>{empleado.fecha_inicio}</span>
                  <label>Cargo</label><span>{empleado.cargo}</span>
                  <label>Estado</label><span>{empleado.estado}</span>
                </div>

                <Button
                  label="Editar"
                  variant="amarillo"
                  onClick={() => {
                    setSeccion("empresarial");
                    setEditOpen(true);
                  }}
                />
              </div>

              <div style={styles.card}>
                <h3 style={styles.title}>Datos familiares</h3>

                <div style={styles.form}>
                  <label>Conyugue</label><span>{empleado.conyugue}</span>
                  <label>Hijos</label><span>{empleado.hijos}</span>
                  <label>Hijos menores</label><span>{empleado.hijos_menores}</span>
                </div>

                <Button
                  label="Editar"
                  variant="amarillo"
                  onClick={() => {
                    setSeccion("familiar");
                    setEditOpen(true);
                  }}
                />
              </div>

            </div>
          </div>

          <div style={{ marginTop: 30 }}>
            <Button label="Volver"
              onClick={onVolver} variant="amarillo" />
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
  }
};