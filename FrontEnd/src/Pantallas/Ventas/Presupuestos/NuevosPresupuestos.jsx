import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { IconoMenos } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";
import fetchConToken from "../../../token";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:9128/api";

export default function NuevosPresupuestos({ usuario, onNavegar, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [idCliente, setIdCliente] = useState("");
  const [clientesDisponibles, setClientesDisponibles] = useState([]);

  const [productos, setProductos] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState("");
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resProductos = await fetchConToken(`${API_BASE}/ventas/presupuestos/productos/search`);
        if (resProductos.ok) {
          const dataProductos = await resProductos.json();
          setProductosDisponibles(Array.isArray(dataProductos) ? dataProductos : []);
        } else {
          console.error("Error productos:", resProductos.status, resProductos.statusText);
        }

        const resClientes = await fetchConToken(`${API_BASE}/ventas/presupuestos/clientes/all`);
        if (resClientes.ok) {
          const dataClientes = await resClientes.json();
          setClientesDisponibles(Array.isArray(dataClientes) ? dataClientes : []);
        } else {
          console.error("Error clientes:", resClientes.status, resClientes.statusText);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
    };
    cargarDatos();
  }, []);

  const handleAgregarProducto = () => {
    if (cantidad < 1 || !productoSeleccionado) return;

    const p = productosDisponibles.find((x) => x.id_producto === parseInt(productoSeleccionado));
    if (!p) return;

    const precioUnitario = p.precio_venta || 0;
    const subtotal = precioUnitario * cantidad;

    const prod = {
      id_producto: p.id_producto,
      nombre: p.nombre,
      cantidad,
      precio_unitario: precioUnitario,
      subtotal,
      _uid: Date.now() + Math.random()
    };

    setProductos((prev) => [...prev, prod]);
    setProductoSeleccionado("");
    setCantidad(1);
  };

  const handleEliminarProducto = (uid) => {
    setProductos((prev) => prev.filter((p) => p._uid !== uid));
  };

   const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
   const iva = subtotal * 0.1;
   const total = subtotal + iva;

   const hoy = new Date();
   const fechaHoy = hoy.toISOString().split("T")[0];
   const fechaValida = new Date(hoy.setDate(hoy.getDate() + 10)).toISOString().split("T")[0];

   const clienteSeleccionado = clientesDisponibles.find(c => c.id_cliente === parseInt(idCliente));

   const handleGuardar = async () => {
     if (!idCliente) {
       setError("Selecciona un cliente");
       return;
     }
     if (productos.length === 0) {
       setError("Agrega al menos un producto");
       return;
     }

     setLoading(true);
     setError("");

     try {
       const fechaHoy = new Date().toISOString().split("T")[0];
       
       const resPresupuesto = await fetchConToken(`${API_BASE}/ventas/presupuestos`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           id_cliente: parseInt(idCliente),
           fecha_creacion: fechaHoy
         })
       });

       if (!resPresupuesto.ok) {
         const errorData = await resPresupuesto.json();
         throw new Error(errorData.message || "Error al crear presupuesto");
       }

       const dataPresupuesto = await resPresupuesto.json();
       const idPresupuesto = dataPresupuesto.id_presupuesto;

       const detallesPayload = productos.map(p => ({
         id_presupuesto: idPresupuesto,
         id_producto: p.id_producto,
         cantidad: p.cantidad,
         precio_unitario: p.precio_unitario
       }));

       const resDetalles = await fetchConToken(`${API_BASE}/ventas/presupuestos/detalle`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(detallesPayload)
       });

       if (!resDetalles.ok) {
         const errorData = await resDetalles.json();
         throw new Error(errorData.message || "Error al agregar detalles");
       }

       navigate(`/ventas/presupuestos/${idPresupuesto}`);
     } catch (err) {
       setError(err.message || "Error al guardar presupuesto");
     } finally {
       setLoading(false);
     }
   };

  return (
    <div style={styles.pagina}>
      <Sidebar usuario={usuario} onNavegar={onNavegar} onLogout={onLogout} />

      <main style={styles.contenido}>
        <header style={styles.encabezado}>
          <h1 style={styles.titulo}>Nuevo Presupuesto</h1>
          <div style={styles.separador} />
        </header>

         <div style={styles.contenedorForm}>
           <div style={styles.doColumnas}>
             <div style={styles.columnaIzq}>
               <div style={styles.card}>
                 <h3 style={styles.cardTitulo}>Seleccionar Cliente</h3>

                 <div style={styles.grupoInput}>
                   <label style={styles.label}>Cliente *</label>
                   <select
                     value={idCliente}
                     onChange={(e) => setIdCliente(e.target.value)}
                     style={styles.selectProducto}
                   >
                     <option value="">-- Seleccionar Cliente --</option>
                     {clientesDisponibles.map((c) => (
                       <option key={c.id_cliente} value={c.id_cliente}>
                         {c.id_persona ? `${c.id_persona} - ${c.nombre || ""}` : `ID ${c.id_cliente}`}
                       </option>
                     ))}
                   </select>
                 </div>

                 {clienteSeleccionado && (
                   <div style={styles.cardInfo}>
                     <strong>Información del Cliente</strong>
                     <p style={{ margin: "8px 0 0 0", fontSize: 12 }}>
                       {`${clienteSeleccionado.nombre || ""} - CI/RUC: ${clienteSeleccionado.ci || "N/A"}`}
                     </p>
                   </div>
                 )}
               </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Productos y Servicios</h3>

                <div style={styles.selectoresProducto}>
                  <select
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                    style={styles.selectProducto}
                  >
                    <option value="">Seleccionar Productos...</option>
                    {productosDisponibles.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>

                  <div style={styles.grupoNumerico}>
                    <button
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                      style={styles.botonNumerico}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      style={styles.inputNumerico}
                      min="1"
                    />
                    <button
                      onClick={() => setCantidad(cantidad + 1)}
                      style={styles.botonNumerico}
                    >
                      +
                    </button>
                  </div>

                  <button onClick={handleAgregarProducto} style={styles.botonMas}>
                    +
                  </button>
                </div>

                <div style={styles.tablaProductos}>
                  <div style={styles.tablaHeaderProducto}>
                    <div style={{ flex: 2 }}>Producto</div>
                    <div style={{ flex: 1, textAlign: "center" }}>Cantidad</div>
                    <div style={{ flex: 1, textAlign: "right" }}>Precio Unit.</div>
                    <div style={{ flex: 1, textAlign: "right" }}>Subtotal</div>
                    <div style={{ width: 40 }}></div>
                  </div>
                  {productos.length === 0 ? (
                    <div style={styles.tablaVacia}>No hay productos seleccionados...</div>
                  ) : (
                    productos.map((p, idx) => (
                      <div
                        key={p._uid}
                        style={{
                          ...styles.tablaFilaProducto,
                          background: idx % 2 === 0 ? "#F9F9F9" : "#FFFFFF"
                        }}
                      >
                        <div style={{ flex: 2 }}>{p.nombre}</div>
                        <div style={{ flex: 1, textAlign: "center" }}>{p.cantidad}</div>
                        <div style={{ flex: 1, textAlign: "right" }}>
                          {Number(p.precio_unitario || 0).toLocaleString("es-PY")} Gs.
                        </div>
                        <div style={{ flex: 1, textAlign: "right", fontWeight: "600" }}>
                          {Number(p.subtotal || 0).toLocaleString("es-PY")} Gs.
                        </div>
                        <button
                          onClick={() => handleEliminarProducto(p._uid)}
                          style={styles.botonEliminar}
                        >
                          <IconoMenos />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={styles.columnaDer}>
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Resumen:</h3>

                <div style={styles.filaResumen}>
                  <span>Fecha:</span>
                  <span style={{ fontWeight: "600" }}>{fechaHoy}</span>
                </div>

                <div style={styles.filaResumen}>
                  <span>Válido hasta:</span>
                  <span style={{ fontWeight: "600" }}>{fechaValida}</span>
                </div>

                <div style={styles.filaResumen}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(subtotal || 0).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumen}>
                  <span>IVA (10%):</span>
                  <span style={{ fontWeight: "600" }}>
                    {Number(iva || 0).toLocaleString("es-PY")} Gs.
                  </span>
                </div>

                <div style={styles.filaResumenTotal}>
                  <span>Total:</span>
                  <span>{Number(total || 0).toLocaleString("es-PY")} Gs.</span>
                </div>

                <div style={styles.cardInfo}>
                  <strong>Información</strong>
                  <p style={{ margin: "8px 0 0 0", fontSize: 12 }}>
                    El presupuesto tendrá una validez de 10 días hábiles desde su creación.
                  </p>
                </div>

                {error && <div style={styles.errorMsg}>{error}</div>}

                <button
                  onClick={handleGuardar}
                  disabled={loading}
                  style={{
                    ...styles.botonGuardar,
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? "Guardando..." : "Guardar Presupuesto"}
                </button>
              </div>
            </div>
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
    padding: 20,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflowY: "auto"
  },
  encabezado: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    padding: "21px 0",
    marginBottom: 20
  },
  titulo: {
    color: "#000000",
    fontSize: 42,
    fontFamily: "Lato, sans-serif",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    textAlign: "center"
  },
  separador: {
    width: "min(1100px, 80%)",
    height: 4,
    background: "#000000"
  },
  contenedorForm: {
    width: "100%",
    maxWidth: 1200
  },
  doColumnas: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: 20
  },
  columnaIzq: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  columnaDer: {
    display: "flex",
    flexDirection: "column",
    gap: 20
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #CCCCCC",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)"
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    margin: "0 0 15px 0",
    textAlign: "center",
    borderBottom: "2px solid #E0E0E0",
    paddingBottom: 10
  },
  grupoInput: {
    display: "flex",
    flexDirection: "column",
    gap: 5
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#333333"
  },
  selectoresProducto: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginBottom: 15
  },
  selectProducto: {
    flex: 1,
    padding: "10px",
    border: "1px solid #CCCCCC",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    outline: "none",
    background: "#FAFAFA"
  },
  grupoNumerico: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "#FAFAFA",
    borderRadius: 6,
    border: "1px solid #CCCCCC",
    padding: "2px"
  },
  botonNumerico: {
    width: 30,
    height: 30,
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "700",
    color: "#000000"
  },
  inputNumerico: {
    width: 50,
    padding: "5px",
    border: "none",
    borderRadius: 4,
    textAlign: "center",
    fontSize: 14,
    outline: "none",
    background: "transparent"
  },
  botonMas: {
    width: 30,
    height: 30,
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: "700",
    color: "#000000"
  },
  tablaProductos: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid #E0E0E0",
    borderRadius: 8,
    overflow: "hidden"
  },
  tablaHeaderProducto: {
    display: "flex",
    background: getColor("amarillo"),
    padding: "10px",
    fontWeight: "700",
    fontSize: 13,
    color: "#000000",
    borderBottom: "1px solid #D0D0D0"
  },
  tablaFilaProducto: {
    display: "flex",
    padding: "10px",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 13,
    color: "#333333",
    alignItems: "center"
  },
  tablaVacia: {
    padding: "20px",
    textAlign: "center",
    color: "#999999",
    fontSize: 13
  },
  botonEliminar: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    color: "#666666",
    padding: 4,
    display: "flex",
    alignItems: "center"
  },
  filaResumen: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #E0E0E0",
    fontSize: 14
  },
  filaResumenTotal: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderTop: "2px solid #333333",
    borderBottom: "2px solid #333333",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15
  },
  cardInfo: {
    background: getColor("amarillo"),
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 12,
    lineHeight: 1.5
  },
  errorMsg: {
    background: "#FFE0E0",
    color: "#C00000",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    fontSize: 13,
    fontWeight: "700"
  },
  botonGuardar: {
    width: "100%",
    padding: "12px",
    background: getColor("amarillo"),
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "700",
    cursor: "pointer",
    color: "#000000"
  }
};
