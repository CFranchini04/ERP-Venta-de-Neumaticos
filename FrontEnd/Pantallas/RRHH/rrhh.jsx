import React, { useEffect, useState } from 'react';
import Sidebar from "../../components/Sidebar";
import { Button } from '../../components/Button';
import { IconoRRHH, IconoDinero } from '../../components/Icons';
import List from '../../components/Lista';

const SUPABASE_URL = "https://skumubfkuzruzgkswutv.supabase.co";
const SUPABASE_KEY = "sb_publishable_Achm8f37YDHChJy_mS0SGw_GBAdKfC6";

export default function RRHH({ usuario = 'Empleado', onLogout, onNavegar }) {
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
    const [empleados, setEmpleados] = useState([]);
    const [search, setSearch] = useState("");
    const [orderBy, setOrderBy] = useState("");

    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'CI', label: 'CI' },
        { key: 'fecha_inicio', label: 'Fecha de Inicio' },
    ];

    useEffect(() => {
        const cargarEmpleados = async () => {
            const respuesta = await fetch(
                `${SUPABASE_URL}/rest/v1/empleados?select=id_empleado,fecha_de_contraracion,personas(nombre),cargo(nombre)&order=id_empleado.asc`,
                {
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                    },
                }
            );

            const data = await respuesta.json();

            const formateado = data.map((item) => ({
                id: item.id_empleado,
                nombre: item.personas?.nombre ?? '',
                apellido: item.personas?.apellido ?? '',
                cargo: item.cargo?.nombre ?? '',
                CI: item.personas?.ci ?? '',
                fecha_inicio: item.fecha_de_contraracion ?? '',
            }));

            setEmpleados(formateado);
        };

        cargarEmpleados();
    }, []);

    function handleNavegar(moduloId, empleado) {
        if (onNavegar) {
            onNavegar(moduloId, empleado);
        }
    }

    function handleNuevo() {
        handleNavegar('crear-empleado');
    }

    const empleadosFiltrados = empleados
        .filter((emp) => {
            const texto = search.toLowerCase();

            return (
                emp.nombre.toLowerCase().includes(texto) ||
                emp.apellido.toLowerCase().includes(texto) ||
                emp.cargo.toLowerCase().includes(texto) ||
                emp.CI.toLowerCase().includes(texto)
            );
        })
        .sort((a, b) => {
            if (!orderBy) return 0;

            const valA = a[orderBy]?.toString().toLowerCase() || "";
            const valB = b[orderBy]?.toString().toLowerCase() || "";

            return valA.localeCompare(valB);
        });

    return (
        <div style={styles.pagina}>
            <Sidebar usuario={usuario} onNavegar={handleNavegar} onLogout={onLogout} />
            <main style={styles.contenido}>
                <section style={styles.bienvenida}>
                    <h1 style={{ fontSize: 32 }}>Bienvenido a RRHH</h1>
                </section>
                {/* Botones de acciones principales */}
                <section style={styles.acciones}>
                    <div style={styles.actionContainer}>
                        <IconoRRHH size={50} />
                        <Button
                            label="Gestión de personal"
                            variant="amarillo"
                            onClick={() => {
                                if (empleadoSeleccionado) {
                                    handleNavegar('gestion-personal', empleadoSeleccionado);
                                } else {
                                    alert("Debes seleccionar un empleado primero");
                                }
                            }}
                            size={24}
                        />
                    </div>
                    <div style={styles.actionContainer}>
                        <IconoDinero size={50} />
                        <Button
                            label="Gestión de salarios"
                            variant="amarillo"
                            onClick={() => {
                                if (empleadoSeleccionado) {
                                    handleNavegar('gestion-salarios', empleadoSeleccionado);
                                } else {
                                    alert("Debes seleccionar un empleado primero");
                                }
                            }}
                            size={24}
                        />
                    </div>
                </section>
                {/* Lista de empleados y acciones para filtrar etc.*/}
                <section style={styles.listaEmpleados}>
                    <List
                        data={empleadosFiltrados}
                        columns={columns}
                        selectable
                        onRowClick={(emp) => setEmpleadoSeleccionado(emp)}
                        controls={[
                            {
                                type: "search",
                                placeholder: "Buscar empleado...",
                                value: search,
                                onChange: (e) => setSearch(e.target.value)
                            },
                            {
                                type: "select",
                                options: columns,
                                placeholder: "Ordenar por...",
                                value: orderBy,
                                onChange: (e) => setOrderBy(e.target.value)
                            },

                            {
                                type: "button",
                                label: "Nuevo",
                                onClick: handleNuevo
                            }
                        ]}
                    />
                </section>
            </main>
        </div>
    );
}

const styles = {
    pagina: {
        display: 'flex',
        minHeight: '100vh',
        background: '#F5F5F5',
    },
    contenido: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        textAlign: 'center',
        padding: 0,
        boxSizing: 'border-box',
        gap: 20,
    },
    bienvenida: {
        width: '100%',
        maxWidth: 860,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        marginTop: 20,
        marginBottom: 20,
    },
    actionContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 30,
        background: '#ffffff',
        padding: 20,
        borderRadius: 8,
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.25)',
        border: '3px solid #444444',
    },
    listaEmpleados: {
        width: '100%',
        maxWidth: 860,
        textAlign: 'left',
    },
    lista: {
        marginTop: 16,
        paddingLeft: 20,
        display: 'grid',
    },
    acciones: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: 30,
        flexWrap: 'wrap',
        padding: 5,
        minHeight: 80,
    },

};
