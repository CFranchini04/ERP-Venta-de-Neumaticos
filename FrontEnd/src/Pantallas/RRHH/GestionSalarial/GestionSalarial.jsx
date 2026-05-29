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
  const [mostrarResumen, setMostrarResumen] = useState(false);


  const [periodo, setPeriodo] = useState({
    fechaInicio: "",
    fechaFin: ""
  });

  const [nomina, setNomina] = useState({
    salarioBase: 0,
    horasExtras: 0,
    bonos: 0,
    ausencias: 0,
  });

  const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

  const handlePeriodoChange = (nuevoPeriodo) => {
    setPeriodo(nuevoPeriodo);

    if (nuevoPeriodo.fechaInicio && nuevoPeriodo.fechaFin) {
      setNominaExpanded(true);
    }
  };

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

  const salarioBase = Number(empleado.salarioBase || 0);

  // IPS 9%
  const ips = salarioBase * 0.09;

  // Hora normal (30 días, 8 horas)
  const horaNormal = salarioBase / (30 * 8);

  // Hora extra 150%
  const valorHoraExtra = horaNormal * 1.5;

  // Pago horas extras
  const pagoHorasExtras =
    (Number(nomina.horasExtras) || 0) * valorHoraExtra;

  // Valor día
  const valorDia = salarioBase / 30;

  // Descuento por ausencias
  const descuentoAusencias =
    (Number(nomina.ausencias) || 0) * valorDia;

  // Bonos
  const bonos = Number(nomina.bonos || 0);

  // SALARIO FINAL
  const salarioFinal =
    salarioBase +
    pagoHorasExtras +
    bonos -
    ips -
    descuentoAusencias;

  const imprimirRecibo = () => {
    const ventana = window.open('', '_blank');

    ventana.document.write(`
    <html>
      <head>
        <title>Recibo de Pago</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #222;
          }

          h1 {
            text-align: center;
            margin-bottom: 40px;
          }

          .fila {
            display: flex;
            justify-content: space-between;
            margin-bottom: 14px;
            font-size: 16px;
          }

          .linea {
            border-top: 1px solid #ccc;
            margin: 20px 0;
          }

          .total {
            font-size: 22px;
            font-weight: bold;
          }

          .footer {
            margin-top: 50px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>

      <body>

        <h1>Recibo de Pago</h1>

        <div class="fila">
          <span>Empleado:</span>
          <strong>${empleado.nombre} ${empleado.apellido}</strong>
        </div>

        <div class="fila">
          <span>Cargo:</span>
          <strong>${empleado.cargo}</strong>
        </div>

        <div class="fila">
          <span>Período:</span>
          <strong>${periodo.fechaInicio} - ${periodo.fechaFin}</strong>
        </div>

        <div class="linea"></div>

        <div class="fila">
          <span>Salario Base:</span>
          <strong>Gs. ${empleado.salarioBase}</strong>
        </div>

        <div class="fila">
          <span>Horas Extras:</span>
          <strong>Gs. ${nomina.horasExtras || 0}</strong>
        </div>

        <div class="fila">
          <span>Bonos:</span>
          <strong>Gs. ${nomina.bonos || 0}</strong>
        </div>

        <div class="fila">
          <span>IPS (9%):</span>
          <strong>- Gs. ${ips.toFixed(0)}</strong>
        </div>

        <div class="fila">
          <span>Ausencias:</span>
          <strong>- Gs. ${nomina.ausencias || 0}</strong>
        </div>

        <div class="linea"></div>

        <div class="fila total">
          <span>Total Neto:</span>
          <strong>Gs. ${salarioFinal.toFixed(0)}</strong>
        </div>

        <div class="footer">
          Recibo generado automáticamente por el sistema de gestión salarial.
        </div>

      </body>
    </html>
  `);

    ventana.document.close();
    ventana.print();
  };

  const periodoIncompleto = !periodo.fechaInicio || !periodo.fechaFin;

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
              <span style={styles.valorInfo}>
                {empleado.nombre} {empleado.apellido}
              </span>
            </div>

            <div style={styles.infoEmpleado}>
              <span style={styles.labelInfo}>Cargo:</span>
              <span style={styles.valorInfo}>{empleado.cargo}</span>
            </div>
          </div>

        </div>

        {/* ================= PERÍODO ================= */}
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

              {/* SALARIO BASE */}
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
                      setNomina({
                        ...nomina,
                        horasExtras: e.target.value
                      })
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
                      setNomina({
                        ...nomina,
                        bonos: e.target.value
                      })
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
                    type="text"
                    value={`${ips.toFixed(0)} Gs. (9%)`}
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
                      setNomina({
                        ...nomina,
                        ausencias: e.target.value
                      })
                    }
                    style={styles.inputNumero}
                  />
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================= BOTÓN ================= */}
        {/* ================= BOTÓN ================= */}
        <div style={styles.botonContainer}>

          {periodoIncompleto && (
            <p style={{ color: "red", margin: 0 }}>
              Debes seleccionar un período antes de continuar
            </p>
          )}
          <div style={{ flex: 1 }}></div>
          <button
            style={{
              ...styles.btnContinuar,
              opacity: periodoIncompleto ? 0.5 : 1,
              cursor: periodoIncompleto ? "not-allowed" : "pointer",
            }}
            disabled={periodoIncompleto}
            onClick={() => setMostrarResumen(true)}
          >
            Continuar
          </button>

        </div>


        {/* ================= MODAL RESUMEN ================= */}
        {mostrarResumen && (
          <div style={styles.overlay}>

            <div style={styles.modal}>

              <h2 style={styles.modalTitulo}>
                Resumen de Nómina
              </h2>

              <div style={styles.modalContenido}>

                <div style={styles.modalFila}>
                  <span>Empleado</span>
                  <strong>
                    {empleado.nombre} {empleado.apellido}
                  </strong>
                </div>

                <div style={styles.modalFila}>
                  <span>Cargo</span>
                  <strong>{empleado.cargo}</strong>
                </div>

                <div style={styles.modalFila}>
                  <span>Período</span>

                  <strong>
                    {periodo.fechaInicio} - {periodo.fechaFin}
                  </strong>
                </div>

                <div style={styles.linea}></div>

                <div style={styles.modalFila}>
                  <span>Salario Base</span>
                  <strong>Gs. {empleado.salarioBase}</strong>
                </div>

                <div style={styles.modalFila}>
                  <span>Horas Extras</span>
                  <strong>Gs. {nomina.horasExtras || 0}</strong>
                </div>

                <div style={styles.modalFila}>
                  <span>Bonos</span>
                  <strong>Gs. {nomina.bonos || 0}</strong>
                </div>

                <div style={styles.modalFila}>
                  <span>IPS (9%)</span>
                  <strong>- Gs. {ips.toFixed(0)}</strong>
                </div>

                <div style={styles.modalFila}>
                  <span>Ausencias</span>
                  <strong>- Gs. {nomina.ausencias || 0}</strong>
                </div>

                <div style={styles.linea}></div>

                <div style={styles.modalFilaTotal}>
                  <span>Total Neto</span>
                  <strong>
                    Gs. {salarioFinal.toFixed(0)}
                  </strong>
                </div>

              </div>

              <p style={styles.mensajeRevision}>
                Revise cuidadosamente los datos antes de continuar
              </p>

              <div style={styles.modalBotones}>

                <button
                  style={styles.btnEditar}
                  onClick={() => setMostrarResumen(false)}
                >
                  Seguir editando
                </button>

                <button
                  style={styles.btnPagar}
                  onClick={imprimirRecibo}
                >
                  Pagar
                </button>

              </div>

            </div>

          </div>
        )}

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
    fontSize: 30,
    fontWeight: 700,
    marginTop: 5,
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
    marginBottom: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    userSelect: "none",
  },

  subtitulo: {
    fontSize: 18,
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
    gap: 5,
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

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 18,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    boxShadow: "0 10px 35px rgba(0,0,0,0.15)",
  },

  modalTitulo: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
    textAlign: "center",
  },

  modalContenido: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  modalFila: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 15,
  },

  modalFilaTotal: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 18,
    fontWeight: 700,
  },

  linea: {
    width: "100%",
    height: 1,
    background: "#E5E5E5",
  },

  mensajeRevision: {
    margin: 0,
    textAlign: "center",
    color: "#777",
    fontSize: 14,
  },

  modalBotones: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  btnEditar: {
    background: "#E0E0E0",
    border: "none",
    padding: "12px 18px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },

  btnPagar: {
    background: getColor("amarillo"),
    border: "none",
    padding: "12px 22px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },
};