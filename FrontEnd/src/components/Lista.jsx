import { useState } from "react";
import { getColor } from "./Colors";
import { Button } from "./Buttons";

function List({
  data,
  columns,
  onRowClick,
  selectable = false,
  controls = []
}) {

  const [selectedId, setSelectedId] = useState(null);

  const handleClick = (item) => {
    if (selectable) {
      setSelectedId(item.id);
    }

    if (onRowClick) {
      onRowClick(item);
    }
  };

  return (
    <div style={styles.container}>

      {/* CONTROLES */}
      <div style={styles.controlsContainer}>

        {controls.map((control, i) => {

          // SEARCH
          if (control.type === "search") {
            return (
              <div key={i} style={styles.searchContainer}>
                <input
                  placeholder={control.placeholder || "Buscar..."}
                  value={control.value || ""}
                  onChange={control.onChange}
                  style={styles.searchInput}
                />
              </div>
            );
          }

          // SELECT
          if (control.type === "select") {
            return (
              <div key={i} style={styles.selectContainer}>

                <div style={styles.selectLabel}>
                  {control.label || "Filtrar por:"}
                </div>

                <div style={styles.selectWrapper}>
                  <select
                    value={control.value || ""}
                    onChange={control.onChange}
                    style={styles.select}
                  >
                    <option value="">
                      {control.placeholder || "Seleccionar"}
                    </option>

                    {(control.options || []).map((opt, j) => (
                      <option key={j} value={opt.key}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            );
          }

          // BUTTON
          if (control.type === "button") {
            return (
              <Button
                key={i}
                label={control.label}
                variant={control.variant || "amarillo"}
                onClick={control.onClick}
              />
            );
          }

          return null;
        })}
      </div>

      {/* TABLA */}
      <div style={styles.tableContainer}>

        {/* HEADER */}
        <div
          style={{
            ...styles.header,
            gridTemplateColumns: columns
              .map(col => col.width || "1fr")
              .join(" "),
          }}
        >
          {columns.map((col, i) => (
            <span key={i}>{col.label}</span>
          ))}
        </div>

        {/* FILAS */}
        {data.map((item, index) => {

          const isSelected = selectedId === item.id;

          return (
            <div
              key={item.id || index}
              onClick={() => {
                if (selectable) handleClick(item);
              }}
              style={{
                ...styles.row,
                gridTemplateColumns: columns
                  .map(col => col.width || "1fr")
                  .join(" "),
                cursor: onRowClick ? "pointer" : "default",
                background: isSelected
                  ? getColor("naranja")
                  : index % 2 === 0
                    ? getColor("blanco")
                    : getColor("gris-claro"),
              }}
            >
              {columns.map((col, i) => (
                <span key={i} style={styles.cellText}>
                  {col.render ? col.render(item) : item[col.key]}
                </span>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {

  container: {
    width: "100%",
    background: getColor("blanco"),
    border: `2px solid ${getColor("grisOscuro")}`,
    borderRadius: 12,
    padding: 16,
    boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  controlsContainer: {
    display: "flex",
    gap: 20,
    marginBottom: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },

  searchContainer: {
    height: 40,
    background: "#F9F9F9",
    borderRadius: 8,
    border: `1px solid ${getColor("grisOscuro")}`,
    display: "flex",
    alignItems: "center",
    padding: "0 12px",
  },

  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    fontFamily: "Lato",
    width: 200,
    color: getColor("text"),
  },

  selectContainer: {
    height: 40,
    background: "#F9F9F9",
    overflow: "hidden",
    borderRadius: 8,
    border: "1px solid #444444",
    display: "flex",
    alignItems: "center",
  },

  selectLabel: {
    height: "100%",
    padding: "0 12px",
    background: "#F9F9F9",
    borderRight: "1px solid #444444",
    display: "flex",
    alignItems: "center",
    fontSize: 15,
    fontFamily: "Lato",
    fontWeight: "700",
    color: "#1D1D1D",
    whiteSpace: "nowrap",
  },

  selectWrapper: {
    height: "100%",
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    background: "#F9F9F9",
  },

  select: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 15,
    fontFamily: "Lato",
    cursor: "pointer",
    color: "#444",
  },

  tableContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: `1px solid ${getColor("grisOscuro")}`,
  },

  header: {
    display: "grid",
    fontWeight: "bold",
    background: getColor("amarillo"),
    color: getColor("text"),
    padding: 10,
  },

  row: {
    display: "grid",
    padding: 10,
    alignItems: "center",
  },

  cellText: {
    color: getColor("text"),
  },
};

export default List;
