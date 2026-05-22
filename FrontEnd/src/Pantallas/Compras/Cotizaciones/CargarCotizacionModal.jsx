import React, { useMemo, useState, useEffect } from "react";
import { IconoCerrar } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

export default function CargarCotizacionModal({
  open,
  onClose,
  productos = [],
  proveedores = [],
  onGuardar
}) {

  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [detalles, setDetalles] = useState([]);
    useEffect(() => {

        if (open) {

            setDetalles(
            productos.map((p) => ({
                ...p,
                precioUnitario: "",
            }))
            );

            setProveedorSeleccionado("");
            setError("");

        }

    }, [open, productos]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");



  const handlePrecioChange = (index, valor) => {
    // limpiar error al escribir
    setError("");
    const copia = [...detalles];
    copia[index].precioUnitario = valor;
    setDetalles(copia);
  };

  const totalEstimado = useMemo(() => {
    return detalles.reduce((acc, item) => {
      const subtotal =
        Number(item.cantidad || 0) *
        Number(item.precioUnitario || 0);

      return acc + subtotal;
    }, 0);
  }, [detalles]);

    if (!open) return null;

  const handleGuardar = async () => {
    if (!proveedorSeleccionado) {
        setError("Debes seleccionar un proveedor.");
        return;
    }

    const sinPrecio = detalles.some(
        (item) =>
        !item.precioUnitario ||
        Number(item.precioUnitario) <= 0
    );


    if (sinPrecio) {
        setError("Todos los productos deben tener precio.");
        return;
    }

    setError("");
    setGuardando(true);

    try {

        const payload = {
        proveedor: proveedorSeleccionado,
        detalles: detalles.map((d) => ({
            id_producto: d.id,
            cantidad: d.cantidad,
            precio_unitario: Number(d.precioUnitario),
            subtotal:
            Number(d.cantidad) *
            Number(d.precioUnitario),
        })),
        total: totalEstimado,
        };

        if (onGuardar) {
        await onGuardar(payload);
        }

        onClose();

    } catch (err) {

        setError(
        err.message ||
        "Error al guardar cotización"
        );

    } finally {

        setGuardando(false);

    }
    };

  return (
    <div style={styles.overlay} onClick={onClose}>

      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >

        {/* HEADER */}
        <div style={styles.header}>

          <h2 style={styles.headerTitulo}>
            Cargar Cotización
          </h2>

          <button
            style={styles.botonCerrar}
            onClick={onClose}
          >
            <IconoCerrar />
          </button>

        </div>

        {/* BODY */}
        <div style={styles.body}>

          {/* SELECT PROVEEDOR */}
          <div style={styles.campo}>

            <label style={styles.label}>
              Proveedor
            </label>

            <select
              style={styles.select}
              value={proveedorSeleccionado}
              onChange={(e) =>
                setProveedorSeleccionado(e.target.value)
              }
            >
              <option value="">
                Seleccionar proveedor
              </option>

              {proveedores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}

            </select>

          </div>

          {/* TABLA */}
          <div style={styles.tablaContainer}>

            <table style={styles.table}>

              <thead>

                <tr>

                  <th style={styles.th}>Código</th>
                  <th style={styles.th}>Producto</th>
                  <th style={styles.th}>Cantidad</th>
                  <th style={styles.th}>Precio Unitario</th>
                  <th style={styles.th}>Subtotal</th>

                </tr>

              </thead>

              <tbody>

                {detalles.map((item, index) => {

                  const subtotal =
                    Number(item.cantidad || 0) *
                    Number(item.precioUnitario || 0);

                  return (

                    <tr key={index} style={styles.tr}>

                      <td style={styles.td}>
                        {item.id}
                      </td>

                      <td style={styles.td}>
                        {item.producto}
                      </td>

                      <td style={styles.td}>
                        {item.cantidad}
                      </td>

                      <td style={styles.td}>

                        <input
                            type="number"
                            min="0"
                            style={styles.input}
                            value={item.precioUnitario}
                            onChange={(e) => {

                                let valor = e.target.value;

                                // evitar negativos
                                if (Number(valor) < 0) {
                                valor = 0;
                                }

                                handlePrecioChange(index, valor);

                            }}
                        />

                      </td>

                      <td style={styles.td}>
                        {subtotal.toLocaleString("es-PY")}
                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

          {/* TOTAL */}
          <div style={styles.totalContainer}>

            <strong>
              Total estimado:
            </strong>

            <span>
              {totalEstimado.toLocaleString("es-PY")}
            </span>

          </div>

        </div>

        {error && (
            <div style={styles.error}>
                {error}
            </div>
            )}


        {/* FOOTER */}
        <div style={styles.footer}>

          <button
            style={styles.botonCancelar}
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            style={{
                ...styles.botonGuardar,
                opacity: guardando ? 0.6 : 1,
                cursor: guardando ? "not-allowed" : "pointer",
            }}
            onClick={handleGuardar}
            disabled={guardando}
        >
            {guardando ? "Guardando..." : "Guardar"}
        </button>

        </div>

      </div>

    </div>
  );
}

const styles = {

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: "1000px",
    maxWidth: "95vw",
    maxHeight: "92vh",
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
  },

  header: {
    background: getColor("amarillo"),
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitulo: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "Lato, sans-serif",
  },

  botonCerrar: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },

  error: {
    background: "#fff0f0",
    border: "1px solid #E30613",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#E30613",
    fontSize: 14,
    fontFamily: "Lato, sans-serif",
    },

  body: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
  },

  campo: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  label: {
    fontWeight: 700,
    fontSize: 14,
  },

  select: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  tablaContainer: {
    border: "1px solid #ccc",
    borderRadius: 12,
    overflow: "hidden",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: getColor("amarillo"),
    padding: 14,
    textAlign: "center",
    fontSize: 14,
  },

  tr: {
    borderBottom: "1px solid #ddd",
  },

  td: {
    padding: 12,
    textAlign: "center",
    fontSize: 14,
  },

  input: {
    padding: 8,
    borderRadius: 6,
    border: "1px solid #ccc",
    width: 140,
  },

  totalContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    fontSize: 18,
  },

  footer: {
    padding: 20,
    borderTop: "1px solid #eee",
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
  },

  botonCancelar: {
    padding: "10px 24px",
    borderRadius: 999,
    border: "1px solid #999",
    background: "#fff",
    cursor: "pointer",
  },

  botonGuardar: {
    padding: "10px 24px",
    borderRadius: 999,
    border: "none",
    background: getColor("amarillo"),
    fontWeight: "bold",
    cursor: "pointer",
  },
};
