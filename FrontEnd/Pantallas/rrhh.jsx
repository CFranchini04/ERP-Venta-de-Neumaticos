import React, { useState } from 'react';
import Sidebar from "../components/Sidebar";
import { Button } from '../components/Button';
import { IconoRRHH, IconoDinero } from '../components/Icons';
import List from '../components/Lista';

export default function RRHH({ usuario = 'Empleado', onLogout, onNavegar }) {
    const [empleados, setEmpleados] = useState([
        { id: 1, nombre: 'Camila', apellido: 'Pavon', cargo: 'Gerente', CI: '5648253', fecha_inicio: '2023-01-15' },
        { id: 2, nombre: 'Yeny', apellido: 'Miño', cargo: 'Cajero', CI: '1234567', fecha_inicio: '2023-02-01' },
        { id: 3, nombre: 'Daniel', apellido: 'Cáceres', cargo: 'Supervisor', CI: '7654321', fecha_inicio: '2023-03-01' },
    ]);

    const columns = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'CI', label: 'CI' },
        { key: 'fecha_inicio', label: 'Fecha de Inicio' },
    ];

    function handleNavegar(moduloId) {
        if (onNavegar) {
            onNavegar(moduloId);
        }
    }

    function handleNuevo() {
        console.log('Agregar nuevo empleado');
    }

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
                            onClick={() => handleNavegar('gestion-personal')}
                            size={24}
                        />
                    </div>
                    <div style={styles.actionContainer}>
                        <IconoDinero size={50} />
                        <Button
                            label="Gestión de salarios"
                            variant="amarillo"
                            onClick={() => handleNavegar('gestion-salarios')}
                            size={24}
                        />
                    </div>
                </section>
                {/* Lista de empleados y acciones para filtrar etc.*/}
                <section style={styles.listaEmpleados}> 
                    <div style={styles.listaContainer}>
                        <List data={empleados} columns={columns} onNuevo={handleNuevo} />
                    </div>
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
