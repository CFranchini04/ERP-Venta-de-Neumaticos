// Icons.jsx
// Componentes de íconos reutilizables
import { getColor } from "./Colors";

export function IconoCompras() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 32 32">
      <circle cx="10" cy="28" r="2" fill="currentColor"/>
      <circle cx="24" cy="28" r="2" fill="currentColor"/>
      <path fill="currentColor" d="M28 7H5.82L5 2.8A1 1 0 0 0 4 2H0v2h3.18L7 23.2a1 1 0 0 0 1 .8h18v-2H8.82L8 18h18a1 1 0 0 0 1-.78l2-9A1 1 0 0 0 28 7m-2.8 9H7.62l-1.4-7h20.53Z"/>
    </svg>
  );
}

export function IconoTesoreria() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 24 24">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M9 14c0 1.657 2.686 3 6 3s6-1.343 6-3s-2.686-3-6-3s-6 1.343-6 3"/>
        <path d="M9 14v4c0 1.656 2.686 3 6 3s6-1.344 6-3v-4M3 6c0 1.072 1.144 2.062 3 2.598s4.144.536 6 0S15 7.072 15 6s-1.144-2.062-3-2.598s-4.144-.536-6 0S3 4.928 3 6"/>
        <path d="M3 6v10c0 .888.772 1.45 2 2"/>
        <path d="M3 11c0 .888.772 1.45 2 2"/>
      </g>
    </svg>
  );
}

export function IconoVentas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 24 24">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
        <path strokeLinejoin="round" d="m21 6l-5.293 5.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 0-1.414 0L7 14"/>
        <path d="M3 3v14.8c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C4.52 21 5.08 21 6.2 21H21"/>
      </g>
    </svg>
  );
}

export function IconoRRHH() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 24 24">
      <path fill="currentColor" d="M13.07 10.41a5 5 0 0 0 0-5.82A3.4 3.4 0 0 1 15 4a3.5 3.5 0 0 1 0 7a3.4 3.4 0 0 1-1.93-.59M5.5 7.5A3.5 3.5 0 1 1 9 11a3.5 3.5 0 0 1-3.5-3.5m2 0A1.5 1.5 0 1 0 9 6a1.5 1.5 0 0 0-1.5 1.5M16 17v2H2v-2s0-4 7-4s7 4 7 4m-2 0c-.14-.78-1.33-2-5-2s-4.93 1.31-5 2m11.95-4A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4Z"/>
    </svg>
  );
}

export function IconoContabilidad() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="0 0 24 24">
      <path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 2v4h10V4zm0 6v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z"/>
    </svg>
  );
}

export function IconoSalir() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
      <g fill="none">
        <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
        <path fill="currentColor" d="M12 3a1 1 0 0 1 .117 1.993L12 5H7a1 1 0 0 0-.993.883L6 6v12a1 1 0 0 0 .883.993L7 19h4.5a1 1 0 0 1 .117 1.993L11.5 21H7a3 3 0 0 1-2.995-2.824L4 18V6a3 3 0 0 1 2.824-2.995L7 3zm5.707 5.464l2.828 2.829a1 1 0 0 1 0 1.414l-2.828 2.829a1 1 0 1 1-1.414-1.415L17.414 13H12a1 1 0 1 1 0-2h5.414l-1.121-1.121a1 1 0 0 1 1.414-1.415"/>
      </g>
    </svg>
  );
}

export function IconoLupa() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5A6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5S14 7.01 14 9.5S11.99 14 9.5 14m.5-7H9v2H7v1h2v2h1v-2h2V9h-2z"/></svg>
  );
}

export function IconoDinero() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25L17.9 4.45q.25-.5-.038-.975T17 3H7q-.575 0-.862.475T6.1 4.45zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21"/>
    </svg>
  );
}

export function IconoEditar() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M5 21h14c1.1 0 2-.9 2-2v-7h-2v7H5V5h7V3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2"/>
      <path fill="currentColor" d="M7 13v3c0 .55.45 1 1 1h3c.27 0 .52-.11.71-.29l9-9a.996.996 0 0 0 0-1.41l-3-3a.996.996 0 0 0-1.41 0l-9.01 8.99A1 1 0 0 0 7 13m10-7.59L18.59 7L17.5 8.09L15.91 6.5zm-8 8l5.5-5.5l1.59 1.59l-5.5 5.5H9z"/>
    </svg>
  );
}

export function IconoCheck() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="m9 20.42l-6.21-6.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83z"/>
    </svg>
  );
}

export function IconoPresupuestos() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="m9 20.42l-6.21-6.21l2.83-2.83L9 14.77l9.88-9.89l2.83 2.83z"/>
    </svg>
  );
}

export function IconoNotasDeCredito() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 3h10a2 2 0 0 1 2 2v10m0 4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5m6 2h4m-6 4h2m-2 4h4M3 3l18 18"/>
    </svg>
  );
}

export function IconoMas() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M18 10h-4V6a2 2 0 0 0-4 0l.071 4H6a2 2 0 0 0 0 4l4.071-.071L10 18a2 2 0 0 0 4 0v-4.071L18 14a2 2 0 0 0 0-4"/>
    </svg>
  );
}

export function IconoFlecha() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g fill="none">
        <path d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
        <path fill="currentColor" d="M12.707 3.636a1 1 0 0 0-1.414 0L5.636 9.293a1 1 0 1 0 1.414 1.414L11 6.757V20a1 1 0 1 0 2 0V6.757l3.95 3.95a1 1 0 0 0 1.414-1.414z"/>
      </g>
    </svg>
  );
}

export function IconoCarga() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={100}
      height={100}
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        fillOpacity={0}
        stroke={getColor('amarillo')} 
        strokeDasharray={60}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z"
      >
        <animate
          fill="freeze"
          attributeName="stroke-dashoffset"
          dur="1s"
          values="60;0"
        />
        <animate
          fill="freeze"
          attributeName="fill-opacity"
          begin="1s"
          dur="1s"
          to={1}
        />
      </path>
    </svg>
  );
}

export function IconoUsuario({ style }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={40}
      height={40}
      viewBox="0 0 24 24"
      style={style}
    >
      <g
        fill="none"
        stroke={getColor('amarillo')}
        strokeDasharray={28}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <path d="M4 21v-1c0 -3.31 2.69 -6 6 -6h4c3.31 0 6 2.69 6 6v1">
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.4s"
            values="28;0"
          />
        </path>
        <path
          strokeDashoffset={28}
          d="M12 11c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4Z"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            begin="0.4s"
            dur="0.4s"
            to={0}
          />
        </path>
      </g>
    </svg>
  );
}

export function IconoCalculadora() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path fill="currentColor" d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m0 2v4h10V4zm0 6v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2zm-8 4v2h2v-2zm4 0v2h2v-2zm4 0v2h2v-2z"/>
    </svg>
  );
}

export function IconoCotizaciones(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
      <path fill="currentColor" d="M21.71 20.29L20 18.56v-.31a2.75 2.75 0 0 0-2.75-2.75h-.34l-1.44-1.44a.7.7 0 0 1 .28-.06H19a1 1 0 0 0 0-2h-1.5v-1a1 1 0 0 0-2 0v1a2.74 2.74 0 0 0-1.47.59l-1.32-1.33a1 1 0 0 0-1.42 1.42L13 14.44v.31a2.75 2.75 0 0 0 2.75 2.75h.34l1.44 1.44a.7.7 0 0 1-.28.06H14a1 1 0 0 0 0 2h1.5v1a1 1 0 0 0 2 0v-1a2.74 2.74 0 0 0 1.5-.62l1.32 1.33a1 1 0 0 0 1.42 0a1 1 0 0 0-.03-1.42M10 19H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6v4a1 1 0 0 0 1 1h5a1 1 0 0 0 .92-.62a1 1 0 0 0-.21-1.09l-5-5a1 1 0 0 0-.28-.19h-.09a1.3 1.3 0 0 0-.28-.1H5a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h5a1 1 0 0 0 0-2m3-14.59L14.59 6H13Z">
        </path>
      </svg>
  );
}

export function IconoPedidos(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
      <path fill="currentColor" d="M20 8.94a1.3 1.3 0 0 0-.06-.27v-.09a1 1 0 0 0-.19-.28l-6-6a1 1 0 0 0-.28-.19a.3.3 0 0 0-.09 0a.9.9 0 0 0-.33-.11H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3zm-6-3.53L16.59 8H15a1 1 0 0 1-1-1ZM18 19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5v3a3 3 0 0 0 3 3h3Zm-4-5h-1v-1a1 1 0 0 0-2 0v1h-1a1 1 0 0 0 0 2h1v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2">
        </path>
      </svg>
  );
}

export function IconoOrdenCompra(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
      <path fill="currentColor" d="M13.09 20c.12.72.37 1.39.72 2H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9.09c-.33-.05-.66-.09-1-.09s-.67.04-1 .09V4h-5v8l-2.5-2.25L8 12V4H6v16zM20 18v-3h-2v3h-3v2h3v3h2v-3h3v-2z">
        </path>
      </svg>
  );
}

export function IconoOrdenPago(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 48 48">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}>
        <path d="M35 42.342a5.2 5.2 0 0 1-1.896.456C30.962 42.906 27.962 43 24 43s-6.962-.095-9.104-.203A5.2 5.2 0 0 1 13 42.342m26.5-5.463a5.2 5.2 0 0 1-2.554.818c-2.788.152-7.035.302-12.946.302s-10.158-.15-12.946-.302a5.2 5.2 0 0 1-2.554-.818M3.398 28.21c.246 2.495 2.258 4.288 4.763 4.425C11.382 32.812 16.562 33 24 33s12.618-.188 15.84-.365c2.504-.137 4.516-1.93 4.762-4.425c.212-2.149.398-5.183.398-9.21s-.186-7.061-.398-9.21c-.246-2.496-2.258-4.288-4.763-4.425C36.618 5.188 31.438 5 24 5s-12.618.188-15.84.365c-2.504.137-4.516 1.93-4.762 4.425C3.186 11.94 3 14.973 3 19s.186 7.061.398 9.21">
          </path><path d="M28 14.51s-1.6-1.225-4-1.225c-2 0-4 1.225-4 2.857c0 4.082 8 1.633 8 5.715c0 1.632-2 2.857-4 2.857c-2.4 0-4-1.225-4-1.225m4-10.203V11m0 16v-2.285M37 19h-1m-24 0h-1">
        </path>
      </g>
    </svg>
  );
}

export function IconoFactura(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
      <path fill="currentColor" d="M17 7v2H7V7zm-2 4v2H7v-2zm3 9l3 2V3H3v19l3-2l3 2l3-2l3 2zm1-15v13.26l-1-.66l-3 2l-3-2l-3 2l-3-2l-1 .66V5z">
        </path>
      </svg>
  );
}

export function IconoProveedor(){
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
      <path fill="currentColor" d="M5 19V5v4.475V9zm2-6h5.525q.05-.55.25-1.05t.5-.95H7zm0 4h3.925q.425-.5.975-.812t1.15-.513q-.1-.15-.175-.325T12.75 15H7zm0-8h10V7H7zM5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.45q-.35-.65-.85-1.15T19 9.475V5H5v14h5.05q-.025.15-.038.3t-.012.3V21zm10.225-5.725Q14.5 14.55 14.5 13.5t.725-1.775T17 11t1.775.725t.725 1.775t-.725 1.775T17 16t-1.775-.725M12 21v-1.4q0-.6.313-1.112t.887-.738q.9-.375 1.863-.562T17 17t1.938.188t1.862.562q.575.225.888.738T22 19.6V21z">
        </path>
      </svg>
  );
}
