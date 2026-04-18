import { getColor } from "./Colors";

function List({ data, columns, onNuevo }) {
    return (
        <div style={{ padding: 20 }}>

            {/* HEADER */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>

                <input placeholder="Buscar..." />

                <select>
                    {columns.map((col, i) => (
                        <option key={i} value={col.key}>
                            {col.label}
                        </option>
                    ))}
                </select>

                <button onClick={onNuevo}>
                    Nuevo
                </button>

            </div>

            {/* TABLA */}

            {/* encabezados */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                    fontWeight: "bold",
                    background: getColor("amarillo"),
                    color: "white",
                    padding: 10,
                    borderRadius: 6,
                }}
            >
                {columns.map((col, i) => (
                    <span key={i}>{col.label}</span>
                ))}
            </div>

            {/* filas */}
            {data.map((item, index) => (
                <div
                    key={index}
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
                        padding: 10,
                        background: index % 2 === 0 ? getColor("blanco") : getColor("gris-claro"),
                    }}
                >


                    {columns.map((col, i) => (
                        <span key={i} style={{ color: getColor("text") }}>
                            {item[col.key]}
                        </span>
                    ))}
                </div>
            ))}

        </div>
    );
}

export default List;
