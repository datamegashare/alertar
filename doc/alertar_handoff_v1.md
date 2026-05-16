# Alertar — Handoff v1
**Fecha:** 2026-05-16
**Estado:** Demo standalone entregada — sin backend aún

---

## Concepto

Timbre digital familiar. Un usuario presiona un botón y suena en todos los dispositivos de la casa que tengan la app abierta. Sin login complejo, sin infraestructura de servidor. Simple, rápido, instalable desde el celular.

---

## Decisiones tomadas

| Punto | Decisión |
|---|---|
| Nombre | Alertar |
| Casa (hardcoded) | Casa Cuarta |
| Usuarios | Pato, Mily, Ale |
| Passwords | Hash SHA-256 en el HTML, nunca texto plano |
| Identificación | Nombre de lista + password · guardado en `localStorage` |
| Acción | LLAMAR / CANCELAR (una sola acción, cualquiera cancela) |
| Duración alarma | 60 segundos, se apaga automático si nadie cancela |
| Sonido | Web Audio API · timbre tipo puerta (ding-dong, Si5 → Sol#5) |
| Presencia online | No implementada |
| Polling | Cada 4 segundos contra el backend (en v1: contra localStorage) |
| UX | Minimalista, rojo predominante, modo claro/oscuro |
| Font | DM Sans + DM Mono |

---

## Passwords (SHA-256)

| Usuario | Password | Hash |
|---|---|---|
| Pato | `pato123` | `a8b1c5607ebbb884aea455d8c0d80665...` |
| Mily | `mily123` | `1dd3e7a2a3b4ede1b03c472d0001d3fa...` |
| Ale  | `ale123`  | `4d5a1201a7e12fc0a6fb3a524cfffe39...` |

> Los hashes completos están embebidos en `USERS` dentro del HTML.
> Seguridad: adecuada para uso familiar. Un usuario técnico que abra el HTML puede identificarlos. No apta para datos sensibles.

---

## Archivos entregados

| Archivo | Versión | Estado |
|---|---|---|
| `alertar_v1.html` | v1.0 | ✅ Entregado — demo standalone |

---

## Arquitectura v1 (demo)

```
Browser A (localStorage) ←──── poll cada 4s ────→ Browser A
```

- El estado de alarma se guarda en `localStorage` del mismo browser.
- La alarma **solo se comparte entre tabs del mismo browser**, no entre dispositivos.
- Funciona para validar UX, flujo y sonido.

---

## Arquitectura v2 (producción)

```
Browser A ──POST──→ GAS Web App ──write──→ Google Sheet
Browser B ──GET───→ GAS Web App ──read───→ Google Sheet
Browser C ──GET───→ GAS Web App ──read───→ Google Sheet
```

- El Sheet tiene 3 tabs: `Config`, `Estado`, `Historial`
- El GAS expone dos endpoints: `?action=getStatus` y `?action=trigger` / `?action=cancel`
- Cada cliente hace polling cada 4 segundos al GAS

---

## Estructura del Sheet (v2)

### Tab `Config`
| clave | valor |
|---|---|
| `CASA_NOMBRE` | Casa Cuarta |

### Tab `Usuarios`
| nombre | password_hash |
|---|---|
| Pato | `a8b1c5...` |
| Mily | `1dd3e7...` |
| Ale  | `4d5a12...` |

### Tab `Estado`
| activa | quien | timestamp_inicio | cancelado_por | timestamp_fin |
|---|---|---|---|---|
| FALSE | — | — | — | — |

### Tab `Historial`
| quien | timestamp_inicio | timestamp_fin | cancelado_por | duracion_seg |
|---|---|---|---|---|

---

## Flujo de alarma

```
Usuario presiona LLAMAR
  → POST a GAS: { action: "trigger", user: "Pato" }
    → GAS escribe Estado: activa=TRUE, quien=Pato, ts_inicio=now()
      → Otros clientes (poll cada 4s) detectan activa=TRUE
        → Suenan (Web Audio API) + muestran overlay "Llamada entrante"
          → Cualquier usuario presiona CANCELAR
            → POST a GAS: { action: "cancel", user: "Mily" }
              → GAS escribe Estado: activa=FALSE, cancelado_por=Mily, ts_fin=now()
              → GAS append a Historial
                → Todos los clientes (next poll) ven activa=FALSE → silencio
```

- Si nadie cancela en 60 segundos: el cliente que llamó hace el cancel automático.

---

## Pantallas implementadas

| Pantalla | Estado |
|---|---|
| Login (nombre + password) | ✅ |
| Principal — botón LLAMAR | ✅ |
| Estado activo — animación + countdown | ✅ |
| Botón CANCELAR | ✅ |
| Overlay incoming (llamada de otro) | ✅ (simulado) |
| Historial de llamadas | ✅ (localStorage) |
| Modo claro / oscuro | ✅ |
| Auto-login si ya inició sesión | ✅ |

---

## Pendiente para v2

- [ ] GAS Web App (endpoints `getStatus`, `trigger`, `cancel`)
- [ ] Sheet con tabs `Config`, `Usuarios`, `Estado`, `Historial`
- [ ] Reemplazar localStorage por polling real al GAS
- [ ] `manifest.json` para PWA instalable
- [ ] `sw.js` Service Worker (cache + offline)
- [ ] Deploy en GitHub Pages
- [ ] Leer usuarios desde Sheet (opcional — hoy hardcodeados)

---

## Prompt de retoma

```
Proyecto: Alertar — timbre digital familiar
Stack: HTML puro + GAS Web App + Google Sheets + GitHub Pages
Estado actual: alertar_v1.html entregado (demo standalone, sin backend)
Próximo paso: construir GAS v1 + Sheet + reemplazar localStorage por polling real

Usuarios: Pato, Mily, Ale (hashes SHA-256 en el HTML)
Casa: Casa Cuarta
Sonido: Web Audio API, ding-dong (Si5 → Sol#5), loop cada 3.2s
Polling: cada 4 segundos
Duración alarma: 60 segundos automático

Conversemos antes de codear el GAS.
```

---

## Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| v1.0 | 2026-05-16 | Demo standalone — HTML hardcodeado, localStorage, UX completa |
