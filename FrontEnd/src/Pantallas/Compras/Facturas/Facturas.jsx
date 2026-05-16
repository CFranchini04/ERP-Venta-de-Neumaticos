
import React from "react";
import Sidebar from "../../../components/Sidebar";
import { getColor } from "../../../components/Colors";

export default function Facturas({ usuario, onLogout }) {
    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Facturas</h1>
                    <div style={styles.separador} />
                </header>
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
        padding: 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
        color: "#000000",
        fontSize: 42,
        fontFamily: "Lato, sans-serif",
        fontWeight: 700,
        margin: 0,
        textAlign: "center",
    },
    separador: {
        width: "min(1100px, 80%)",
        height: 4,
        background: "#000000",
    },
};
