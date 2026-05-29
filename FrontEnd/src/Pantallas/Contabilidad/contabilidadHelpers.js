export const API = "http://localhost:3000/api";

export const fmt = (n) =>
  `Gs. ${(n ?? 0).toLocaleString("es-PY", { maximumFractionDigits: 0 })}`;

export const rubroDe = (codigo) => codigo.split(".")[0];

export const esDeudora = (codigo) => {
  const r = rubroDe(codigo);
  if (r === "1") return true;
  if (r === "2" || r === "3") return false;
  if (r === "4") {
    if (codigo === "4.1.1.1.01") return false;
    if (codigo.startsWith("4.1.2.1")) return false;
    if (codigo === "4.1.2.3.01") return false;
    return true;
  }
  return true;
};

// Fetchers
export const fetchCuentas = () =>
  fetch(`${API}/cuentas`).then((r) => r.json());

export const fetchAsientos = (desde, hasta) => {
  const qs = new URLSearchParams();
  if (desde) qs.set("desde", desde);
  if (hasta) qs.set("hasta", hasta);
  const url = `${API}/asientos${qs.toString() ? `?${qs}` : ""}`;
  return fetch(url).then((r) => r.json());
};

export const crearAsientoAPI = (asiento) =>
  fetch(`${API}/asientos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(asiento),
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error || "Error al crear asiento");
    return r.json();
  });

export const crearCuentaAPI = (cuenta) =>
  fetch(`${API}/cuentas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuenta),
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error || "Error al crear cuenta");
    return r.json();
  });

export const actualizarCuentaAPI = (codigo, cambios) =>
  fetch(`${API}/cuentas/${encodeURIComponent(codigo)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cambios),
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).error || "Error al actualizar cuenta");
    return r.json();
  });


export const calcularSumasSaldos = (asientos, desde, hasta) => {
  const totales = {};
  for (const a of asientos) {
    if (desde && a.fecha < desde) continue;
    if (hasta && a.fecha > hasta) continue;
    for (const l of a.lineas) {
      if (!totales[l.codigo]) totales[l.codigo] = { debe: 0, haber: 0, cuenta: l.cuenta };
      totales[l.codigo].debe += l.debe;
      totales[l.codigo].haber += l.haber;
    }
  }
  return Object.entries(totales)
    .map(([codigo, t]) => {
      const neto = t.debe - t.haber;
      return {
        codigo,
        cuenta: t.cuenta,
        debe: t.debe,
        haber: t.haber,
        saldoDeudor: neto > 0 ? neto : 0,
        saldoAcreedor: neto < 0 ? -neto : 0,
      };
    })
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
};

export const saldoNatural = (fila) =>
  esDeudora(fila.codigo)
    ? fila.saldoDeudor - fila.saldoAcreedor
    : fila.saldoAcreedor - fila.saldoDeudor;
