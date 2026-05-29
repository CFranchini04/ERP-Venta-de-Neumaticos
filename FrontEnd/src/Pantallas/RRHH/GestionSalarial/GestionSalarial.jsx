import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../../../components/Sidebar';
import fetchConToken from '../../../token';
import { getColor } from '../../../components/Colors';
import { IconoDropdown } from '../../../components/Icons';

export default function GestionSalarial({ usuario, onLogout, onNavegar }) {
  const { id } = useParams();

  const [empleado, setEmpleado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [periodoExpanded, setPeriodoExpanded] = useState(true);
  const [nominaExpanded, setNominaExpanded] = useState(false);

  const [periodo, setPeriodo] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const handlePeriodoChange = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);

    if (nuevoPeriodo.fechaInicio && nuevoPeriodo.fechaFin) {
      setNominaExpanded(true);
    }
  };


  const [nomina, setNomina] = useState({
    salarioBase: 0,
    horasExtras: 0,
    bonos: 0,
    ausencias: 0,
  });

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

  useEffect(() => {
    if (!id) {
      setCargando(false);
      return;
    }

    const cargarEmpleado = async () => {
      try {
        const res = await fetchConToken(`${API_BASE}/rrhh/empleados/${id}`);
        const data = await res.json();

        setEmpleado({
          nombre: data?.personas?.nombre ?? '',
          apellido: data?.personas?.apellido ?? '',
          cargo: data?.personas_horario_cargo?.[0]?.cargo?.nombre ?? '',
          salarioBase: data?.salario_base ?? 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarEmpleado();
  }, [id]);

  if (cargando) return <div>Cargando...</div>;
  if (!empleado) return <div>No hay empleado seleccionado</div>;

  return (
    <div style={styles.pagina}>

      <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />


      <main style={styles.contenido}>

        <div style={styles.headerTitulo}>
          <h1 style={styles.titulo}>Gestión Salarial</h1>
        </div>

        {/* ================= EMPLEADO ================= */}
        <div style={styles.seccion}>

          <h2 style={styles.subtitulo}>Empleado</h2>

          <div style={styles.infoEmpleadoContainer}>
            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Nombre:</span>
              <span style={styles.valorInfo}>{empleado.nombre}</span>
            </div>

            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Cargo:</span>
              <span style={styles.valorInfo}>{empleado.cargo}</span>
            </div>
          </div>

        </div>

        {/* ================= PERÍODO (ABANICO) ================= */}
        <div style={styles.seccion}>

          <div
            style={styles.seccionHeader}
            onClick={() => setPeriodoExpanded(v => !v)}
          >
            <h2 style={styles.subtitulo}>
              Seleccionar período
              {(periodo.fechaInicio || periodo.fechaFin) && (
                <span style={styles.badge}>
                  {periodo.fechaInicio} - {periodo.fechaFin}
                </span>
              )}
            </h2>

            <IconoDropdown active={periodoExpanded} />
          </div>

          {periodoExpanded && (
            <div style={styles.periodoGeneral}>

              <div style={styles.periodoContainer}>

                <div style={styles.periodoCard}>
                  <span style={styles.dataLabel}>Fecha de Inicio</span>

                  <input
                    type="date"
                    value={periodo.fechaInicio}
                    onChange={(e) =>
                      handlePeriodoChange({
                        ...periodo,
                        fechaInicio: e.target.value
                      })
                    }
                    style={styles.inputFecha}
                  />
                </div>

                <div style={styles.periodoCard}>
                  <span style={styles.dataLabel}>Fecha de Fin</span>

                  <input
                    type="date"
                    value={periodo.fechaFin}
                    onChange={(e) =>
                      handlePeriodoChange({
                        ...periodo,
                        fechaFin: e.target.value
                      })
                    }
                    style={styles.inputFecha}
                  />
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ================= NÓMINA ================= */}
        {nominaExpanded && (
          <div style={styles.seccion}>

            <div style={styles.seccionHeader}>
              <h2 style={styles.subtitulo}>
                Cálculo de nómina
              </h2>
            </div>

            <div style={styles.nominaContainer}>

              {/* SALARIO BASE (NO EDITABLE) */}
              <div style={styles.nominaCard}>
                <span style={styles.dataLabel}>Salario Base</span>

                <input
                  type="number"
                  value={empleado.salarioBase}
                  disabled
                  style={styles.inputNumeroDisabled}
                />
              </div>

              {/* INGRESOS */}
              <h3 style={styles.subtituloSec}>Ingresos adicionales</h3>

              <div style={styles.nominaRow}>

                <div style={styles.nominaCard}>
                  <span style={styles.dataLabel}>Horas extras</span>
                  <input
                    type="number"
                    value={nomina.horasExtras}
                    onChange={(e) =>
                      setNomina({ ...nomina, horasExtras: e.target.value })
                    }
                    style={styles.inputNumero}
                  />
                </div>

                <div style={styles.nominaCard}>
                  <span style={styles.dataLabel}>Bonos por desempeño</span>
                  <input
                    type="number"
                    value={nomina.bonos}
                    onChange={(e) =>
                      setNomina({ ...nomina, bonos: e.target.value })
                    }
                    style={styles.inputNumero}
                  />
                </div>

              </div>

              {/* DEDUCCIONES */}
              <h3 style={styles.subtituloSec}>Deducciones</h3>

              <div style={styles.nominaRow}>

                <div style={styles.nominaCard}>
                  <span style={styles.dataLabel}>IPS (9%)</span>
                  <input
                    type="number"
                    value={`${(empleado.salarioBase * 0.09).toFixed(0)} (9%)`}
                    disabled
                    style={styles.inputNumeroDisabled}

                  />
                </div>

                <div style={styles.nominaCard}>
                  <span style={styles.dataLabel}>Ausencias</span>
                  <input
                    type="number"
                    value={nomina.ausencias}
                    onChange={(e) =>
                      setNomina({ ...nomina, ausencias: e.target.value })
                    }
                    style={styles.inputNumero}
                  />
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ================= BOTÓN ================= */}
        <div style={styles.botonContainer}>
          <button
            style={styles.btnContinuar}
            onClick={() => onNavegar("siguientePagina")}
          >
            Continuar
          </button>
        </div>

      </main>
    </div>
  );
}

const styles = {

  pagina: {
    display: "flex",
    width: "100vw",
    height: "100vh",
    background: "#F9F9F9",
    fontFamily: "Lato, sans-serif",
  },

  contenido: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: "20px 40px",
    gap: 25,
  },

  titulo: {
    fontSize: 35,
    fontWeight: 700,
    marginTop: 10,
  },

  headerTitulo: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
  },
  seccion: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  seccionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },

  subtitulo: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  badge: {
    fontSize: 14,
    background: getColor("amarillo"),
    padding: "2px 10px",
    borderRadius: 6,
  },



  infoEmpleadoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingLeft: 10,
  },

  infoEmpleado: {
    display: "flex",
    gap: 8,
    fontSize: 18,
  },

  labelInfo: {
    fontWeight: 700,
    color: "#555",
  },

  valorInfo: {
    color: "#1D1D1D",
  },



periodoGeneral: {
  width: "100%",
  maxWidth: 750,
  alignSelf: "center",   
  background: "#F5F5F5",
  border: "1px solid #E5E5E5",
  borderRadius: 12,
  padding: 24,
},

  periodoContainer: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
  },

  periodoCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  dataLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#777",
  },

  inputFecha: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },



  botonContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-end",
  },

  btnContinuar: {
    background: getColor("amarillo"),
    border: "none",
    padding: "12px 24px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },
  nominaContainer: {
    width: "100%",
    maxWidth: 750,
    margin: "0 auto",
    background: "#F5F5F5",
    border: "1px solid #E5E5E5",
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  nominaRow: {
    display: "flex",
    gap: 20,
  },

  nominaCard: {
    flex: 1,
    background: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 10,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  inputNumero: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
  },

  inputNumeroDisabled: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    background: "#eee",
    cursor: "not-allowed",
  },

  subtituloSec: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 10,
    color: "#444",
  },
};
