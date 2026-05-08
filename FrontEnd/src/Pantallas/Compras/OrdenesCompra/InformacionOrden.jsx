import React from "react";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import List from "../../../components/Lista";

export default function InformacionOrden({
    usuario,
    orden,
    onVolver,
    onLogout,
    onNavegar
}) {

    if (!orden) {
        return <div>No hay orden seleccionada</div>;
    }

    return (
        <div style={styles.pagina}>

            <Sidebar
                usuario={usuario}
                onNavegar={onNavegar}
                onLogout={onLogout}
            />

            <main style={styles.contenido}>

                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Ordenes de Compra</h1>
                    <div style={styles.separador} />
                </header>


                <div style={styles.contenedorEncabezado}>

                    <h3 style={styles.subtitulo}>
                        Información de la Orden
                    </h3>

                    <div style={styles.subcontenedor}>
                        <div style={styles.item}>
                            <strong>Código:</strong> {orden.codigo}
                        </div>

                        <div style={styles.item}>
                            <strong>Estado:</strong> {orden.estado}
                        </div>

                        <div style={styles.item}>
                            <strong>Fecha:</strong> {orden.fecha}
                        </div>
                    </div>

                </div>

                
                <div style={styles.detalle}>

                    <h3 style={styles.subtitulo}>
                        Detalle de la Orden
                    </h3>

                    <List
                        data={orden.detalle || []}
                        columns={[
                            { key: "producto", label: "Producto" },
                            { key: "categoria", label: "Categoría" },
                            { key: "marca", label: "Marca" },
                            { key: "estado", label: "Estado" },
                            { key: "cantidad", label: "Cantidad" },
                            { key: "precio", label: "Precio" },
                            { key: "total", label: "Total" },
                        ]}
                        DoubleClick={(item) => {
                            // Para despues ;)
                        }}
                    />

                </div>

                <Button
                    label="Volver"
                    onClick={onVolver}
                    variant="amarillo"
                />

            </main>
        </div>
    );
}

const styles = {
    pagina: {
        display: "flex",
        minHeight: "100vh",
        background: "#F5F5F5",
    },

    contenido: {
        flex: 1,
        padding: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
    },

    encabezado: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        padding: "21px 0",
    },

    titulo: {
        color: "#000",
        fontSize: 42,
        fontFamily: "Lato, sans-serif",
        fontWeight: 700,
        margin: 0,
        textAlign: "center",
    },

    separador: {
        width: "min(1100px, 80%)",
        height: 4,
        background: "#000",
    },

    contenedorEncabezado: {
        width: "100%",
        maxWidth: 900,
        border: "2px solid #000",
        borderRadius: 8,
        padding: 20,
        background: getColor("blanco"),
        boxSizing: "border-box",
    },

    subtitulo: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },

    subcontenedor: {
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap",
        width: "100%",
    },

    item: {
        flex: "1 1 200px",
        background: "#F9F9F9",
        padding: 10,
        borderRadius: 6,
        border: "1px solid #ccc",
    },

    detalle: {
        width: "100%",
        maxWidth: 900,
        border: "2px solid #000",
        borderRadius: 8,
        padding: 20,
        background: getColor("blanco"),
        boxSizing: "border-box",
        overflowX: "auto",
    },
};
