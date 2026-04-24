import { useState } from "react";
import { getColor } from "./Colors";
import { Button } from "./Button";

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
    <div style={{ padding: 20 }}>

      {/* HEADER DINÁMICO */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20, alignItems: "center" }}>

        {controls.map((control, i) => {

          // search
          if (control.type === "search") {
            return (
              <input
                key={i}
                placeholder={control.placeholder || "Buscar..."}
                value={control.value || ""}
                onChange={control.onChange}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `2px solid ${getColor("gris-claro")}`,
                  outline: "none",
                  fontSize: 14,
                  fontFamily: "Lato",
                  width: 200,
                }}
              />
            );
          }

          // SELECT / FILTER
          if (control.type === "select") {
            return (
              <select
                key={i}
                value={control.value || ""}
                onChange={control.onChange}
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: `2px solid ${getColor("gris-claro")}`,
                  background: getColor("blanco"),
                  cursor: "pointer",
                }}
              >
                <option value="">
                  {control.placeholder || "Filtrar por..."}
                </option>

                {(control.options || []).map((opt, j) => (
                  <option key={j} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          }

          // BUTTONS
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

      {/* ENCABEZADOS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
          fontWeight: "bold",
          background: getColor("amarillo"),
          color: getColor("text"),
          padding: 10,
          borderRadius: 6,
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
            onClick={() => handleClick(item)}
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
              padding: 10,
              cursor: onRowClick ? "pointer" : "default",

              background: isSelected
                ? getColor("naranja")
                : index % 2 === 0
                  ? getColor("blanco")
                  : getColor("gris-claro"),
            }}
          >
            {columns.map((col, i) => (
              <span key={i} style={{ color: getColor("text") }}>
                {item[col.key]}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default List;
