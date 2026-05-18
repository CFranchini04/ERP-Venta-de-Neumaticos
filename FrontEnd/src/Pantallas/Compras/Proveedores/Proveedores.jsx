import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { Button } from "../../../components/Buttons";
import { getColor } from "../../../components/Colors";
import Lista from "../../../components/Lista";
import { IconoLupa } from "../../../components/Icons";
import List from "../../../components/Lista";

export default function Proveedores({ usuario, onLogout, onNavegar }) {

    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("");
    const [filtroProveedor, setFiltroProveedor] = useState("");

    
    const columns = [
        { key: "proveedor", label: "Proveedor" },
        { key: "ruc", label: "RUC" },
        { key: "ubicacion", label: "Ubicación" },
        { key: "telefono", label: "Teléfono" },
        { key: "entrega", label: "Tiempo de entrega" },
    ];

    function handleNuevo() {
        //Deberia llevar a la pag de crear proveedor
        console.log("Nuevo proveedor");
    }

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onLogout={onLogout} onNavegar={onNavegar} />

            <main style={styles.contenido}>
                <header style={styles.encabezado}>
                    <h1 style={styles.titulo}>Proveedores</h1>
                    <div style={styles.separador} />
                </header>

                <section style={styles.listaStyle}>
                    <Lista
                        data={[]}
                        columns={columns}
                        controls={[
                            {
                                type: "search",
                                placeholder: "Buscar proveedor...",
                                value: search,
                                onChange: (e) => setSearch(e.target.value)
                            },
                            {
                                type: "select",
                                label: "Ordenar por:",
                                placeholder: "Seleccionar",
                                value: orderBy,
                                onChange: (e) => setOrderBy(e.target.value),

                                options: [
                                    { key: "proveedor", label: "Proveedor" },
                                    { key: "ruc", label: "RUC" },
                                    { key: "ubicacion", label: "Ubicación" },
                                    { key: "telefono", label: "Teléfono" },
                                    { key: "entrega", label: "Tiempo de entrega" },

                                ]
                            },
                            {
                                type: "select",
                                label: "Filtrar por:",
                                placeholder: "Seleccionar",
                                value: filtroProveedor,
                                onChange: (e) => setFiltroProveedor(e.target.value),

                                options: [
                                    { key: "proveedor", label: "Proveedor" },
                                    { key: "ruc", label: "RUC" },
                                    { key: "ubicacion", label: "Ubicación" },
                                    { key: "telefono", label: "Teléfono" },
                                    { key: "entrega", label: "Tiempo de entrega" },

                                ]

                            },
                            {
                                type: "button",
                                label: "Registrar Proveedor",
                                size: "lg",
                                onClick: handleNuevo
                            }
                        ]}
                        searchWidth={250}
                    />
                </section>

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
