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
    <div
      style={{
        width: "100%",
        background: getColor("blanco"),
        border: `2px solid ${getColor("grisOscuro")}`,
        borderRadius: 12,
        padding: 16,
        boxShadow: "0px 2px 8px rgba(0,0,0,0.15)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >

      {/* CONTROLES */}
      <div
        style={{
          display: "flex",
          gap: 20,
          marginBottom: 20,
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        {controls.map((control, i) => {

          // SEARCH
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

          // SELECT
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
      <div
        style={{
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
          border: `1px solid ${getColor("grisOscuro")}`,
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: columns
              .map(col => col.width || "1fr")
              .join(" "),
            fontWeight: "bold",
            background: getColor("amarillo"),
            color: getColor("text"),
            padding: 10,
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
                if (selectable) setSelectedId(item.id);
              }}
              onDoubleClick={() => handleClick(item)}
              style={{
                display: "grid",
                gridTemplateColumns: columns
                  .map(col => col.width || "1fr")
                  .join(" "),
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
    </div>
  );
}

export default List;
