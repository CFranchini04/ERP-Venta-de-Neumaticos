import React, { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import { IconoLupa } from "../../../components/Icons";
import { getColor } from "../../../components/Colors";

export default function NuevosPedidos({
  usuario,
  onNavegar,
  onLogout
}) {

  const [busqueda, setBusqueda] = useState("");

  const productos = [
    {
      id: "01",
      nombre: "Neumático Nieve",
      categoria: "Calle",
      marca: "Good Year",
      inventario: 360,
      cantidad: 100,
      precio: "1.350.000",
      subtotal: "135.000.000"
    },
    {
      id: "02",
      nombre: "Neumático Liso",
      categoria: "Pista",
      marca: "Pirelli",
      inventario: 25,
      cantidad: 20,
      precio: "2.000.000",
      subtotal: "40.000.000"
    }
  ];

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#F9F9F9"
    }}>

      {/* SIDEBAR */}
      <Sidebar
        usuario={usuario}
        onNavegar={onNavegar}
        onLogout={onLogout}
      />

      {/* CONTENIDO */}
      <div style={{
        flex: 1,
        padding: 20,
        overflow: "auto"
      }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 20
        }}>

          <button
            onClick={() => onNavegar("pedidos")}
            style={{
              marginRight: 20,
              cursor: "pointer"
            }}
          >
            ←
          </button>

          <h1 style={{
            flex: 1,
            textAlign: "center",
            borderBottom: "2px solid black"
          }}>
            Nuevo Pedido
          </h1>
        </div>

        {/* CARD SUPERIOR */}
        <div style={{
          background: "#ECECEC",
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          border: "1px solid #999"
        }}>

          <h2 style={{
            textAlign: "center",
            marginBottom: 20
          }}>
            Añadir producto
          </h2>

          {/* BUSCADOR */}
          <div style={{
            display: "flex",
            gap: 10,
            marginBottom: 20
          }}>

            <input
              placeholder="Buscar producto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 8,
                border: "1px solid #999"
              }}
            />

            <button>
              <IconoLupa />
            </button>

            <input
              type="number"
              defaultValue={30}
              style={{
                width: 80
              }}
            />

            <button style={{
              background: "#FFCC00",
              borderRadius: 8,
              padding: "10px 20px",
              border: "1px solid black",
              cursor: "pointer"
            }}>
              Añadir a la Orden
            </button>

          </div>

          {/* INFO PRODUCTO */}
          <div style={{
            background: "#DDD",
            borderRadius: 12,
            padding: 20,
            display: "flex",
            gap: 30
          }}>

            <div style={{
              width: 100,
              height: 100,
              background: "white",
              borderRadius: 12
            }} />

            <div style={{ flex: 1 }}>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10
              }}>

                <div>Nombre:</div>
                <div>Último precio:</div>

                <div>Categoría:</div>
                <div>Inventario mínimo:</div>

                <div>Marca:</div>
                <div>Inventario máximo:</div>

              </div>

            </div>

          </div>

        </div>

        {/* TABLA */}
        <div style={{
          background: "#ECECEC",
          borderRadius: 16,
          padding: 20,
          border: "1px solid #999"
        }}>

          <h2 style={{
            textAlign: "center",
            marginBottom: 20
          }}>
            Orden de Compra
          </h2>

          {/* HEADER TABLA */}
          <div style={{
            display: "grid",
            gridTemplateColumns:
              "80px 1fr 1fr 1fr 1fr 1fr 1fr 80px",
            background: "#FFCC00",
            padding: 10,
            fontWeight: "bold"
          }}>
            <div>ID</div>
            <div>Producto</div>
            <div>Categoría</div>
            <div>Marca</div>
            <div>Inventario</div>
            <div>Cantidad</div>
            <div>Último Precio</div>
            <div></div>
          </div>

          {/* FILAS */}
          {productos.map((p, index) => (

            <div
              key={p.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "80px 1fr 1fr 1fr 1fr 1fr 1fr 80px",
                padding: 10,
                background:
                  index % 2 === 0
                    ? "#F9F9F9"
                    : "#D9D9D9"
              }}
            >

              <div>{p.id}</div>
              <div>{p.nombre}</div>
              <div>{p.categoria}</div>
              <div>{p.marca}</div>
              <div>{p.inventario}</div>
              <div>{p.cantidad}</div>
              <div>{p.precio}</div>

              <div style={{
                display: "flex",
                justifyContent: "center"
              }}>
                <IconoLupa />
              </div>

            </div>

          ))}

          {/* FOOTER */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 20,
            alignItems: "center"
          }}>

            <h2>
              Costo total estimado:
            </h2>

            <button style={{
              background: "#FFCC00",
              padding: "10px 30px",
              borderRadius: 12,
              border: "1px solid black",
              fontWeight: "bold",
              cursor: "pointer"
            }}>
              Guardar
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
