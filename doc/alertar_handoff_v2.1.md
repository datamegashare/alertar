# Alertar — Handoff v2.1
**Fecha:** 2026-05-17
**Estado:** Proyecto completo y funcional ✅

---

## Concepto

Timbre digital familiar. Un usuario presiona un botón y suena en todos los dispositivos de la casa que tengan la app abierta. Sin login complejo, sin infraestructura de servidor. Simple, rápido, instalable desde el celular como app nativa.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | HTML/CSS/JS puro — GitHub Pages |
| Backend | Google Apps Script Web App |
| Datos | Google Sheets |
| PWA | manifest.json + sw.js (Service Worker) |
| Audio | Web Audio API — timbre ding-dong (Si5 → Sol#5) |
| Autenticación | SHA-256 del password, verificado en cliente |

---

## Archivos del proyecto

| Archivo | Versión | Descripción |
|---|---|---|
| `alertar_v2.html` | v2.1 | Frontend completo — PWA instalable |
| `manifest.json` | v2.0 | PWA manifest |
| `sw.js` | v2.0 | Service Worker — cache + offline |
| `icon-192.png` | — | Ícono Android home screen |
| `icon-180.png` | — | Apple touch icon (iOS) |
| `icon-512.png` | — | Ícono general / splash |
| `Code.gs` | v2.0 | GAS router — menú, doGet, doPost |
| `Setup.gs` | v2.0 | Creación/completado de hojas |
| `Alarm.gs` | v2.0 | Lógica getStatus, trigger, cancel |

Todos los archivos van en la misma carpeta del repo de GitHub Pages.

---

## Google Sheet

**ID:** `1SoeGsklyxsfoN3veriBNsbdxv9HEHC2Wqab3DLq0AyY`

| Tab | Columnas | Notas |
|---|---|---|
| `Config` | clave, valor | CASA_NOMBRE, ALARM_DURATION, HISTORY_ROWS, VERSION |
| `Usuarios` | nombre, password_hash | SHA-256 — creados por Setup |
| `Estado` | activa, quien, ts_inicio, cancelado_por, ts_fin | Fila única, se sobreescribe |
| `Historial` | quien, ts_inicio, ts_fin, cancelado_por, duracion_seg | Append, máx. 30 filas |

---

## Usuarios y passwords

| Usuario | Password | Hash SHA-256 (completo en `usersMap` del HTML) |
|---|---|---|
| Pato | `pato123` | `a8b1c5607ebbb884aea455d8c0d80665...` |
| Mily | `mily123` | `1dd3e7a2a3b4ede1b03c472d0001d3fa...` |
| Ale  | `ale123`  | `4d5a1201a7e12fc0a6fb3a524cfffe39...` |

Para cambiar un password: calcular SHA-256 del nuevo valor y actualizar en `usersMap` dentro del HTML y en el Sheet tab `Usuarios`.

---

## Endpoints GAS

| Método | Parámetro / Body | Acción |
|---|---|---|
| GET | `?action=getStatus` | Estado alarma + usuarios + config + historial |
| GET | `?action=ping` | Health check |
| POST | `{ action: "trigger", user: "Pato" }` | Activar alarma |
| POST | `{ action: "cancel",  user: "Mily" }` | Cancelar alarma |

Todos los POST usan `Content-Type: text/plain` para evitar CORS preflight.

---

## Flujo de alarma

```
Usuario presiona LLAMAR
  → POST {trigger, user} → GAS → Sheet Estado: activa=TRUE
    → Otros clientes (poll cada 4s) detectan activa=TRUE
      → Suena timbre (ding-dong Web Audio, loop cada 3.2s)
      → Aparece overlay "Llamada entrante — [quien]"
        → Cualquiera presiona CANCELAR
          → POST {cancel, user} → GAS → Sheet Estado: activa=FALSE
          → GAS append a Historial
            → Todos los clientes (next poll) silencio

Si nadie cancela en 60s → el cliente que llamó hace cancel automático
```

---

## Comportamiento del botón Instalar PWA

- El botón **"⬇ Instalar"** aparece en el topbar (junto al toggle de modo oscuro)
- Es visible **solo cuando el browser detecta que la app es instalable** (evento `beforeinstallprompt`)
- Una vez instalada como app, el evento no se dispara → el botón no aparece
- Al tocar: lanza el diálogo nativo del sistema operativo
- Al confirmar: desaparece solo y muestra un toast de confirmación
- iOS: el botón no aparece (Safari no soporta `beforeinstallprompt`) → instalar manualmente desde el menú Compartir → "Agregar a pantalla de inicio"

---

## Pasos de deployment (desde cero)

### 1 — GAS

1. Ir a [script.google.com](https://script.google.com) → Nuevo proyecto → Renombrar: **Alertar**
2. Crear 3 archivos `.gs`: `Code.gs`, `Setup.gs`, `Alarm.gs` — pegar contenido de cada uno
3. Ejecutar `setupSheets` desde el editor (primera vez pide permisos de Google)
4. Verificar las 4 tabs en el Sheet
5. **Implementar como Web App:**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
   - Guardar → copiar la URL del deployment

### 2 — HTML

1. Abrir `alertar_v2.html`
2. Reemplazar `PEGAR_AQUI_TU_GAS_DEPLOYMENT_URL` con la URL del paso anterior
3. Guardar

### 3 — GitHub Pages

Subir al repo todos estos archivos en la misma carpeta:
```
alertar_v2.html
manifest.json
sw.js
icon-192.png
icon-180.png
icon-512.png
```

### 4 — Instalar en el celular

- **Android** (Chrome): el botón "Instalar" aparece en el topbar de la app → tocarlo
- **iOS** (Safari): Compartir → "Agregar a pantalla de inicio"

---

## Decisiones de diseño

| Punto | Decisión |
|---|---|
| UX | Minimalista, rojo predominante, modo claro/oscuro |
| Font | DM Sans + DM Mono |
| Autenticación | Password verificado en cliente con SHA-256 — suficiente para uso familiar |
| Usuarios | Hardcodeados en HTML (`usersMap`) + en el Sheet (referencia) |
| Config | Leída desde el Sheet en cada `getStatus` |
| Historial | Máximo 30 filas en el Sheet, trim automático |
| Sonido | Web Audio API — sin archivos externos |
| Offline | Service Worker cachea el HTML — funciona sin red, pero no puede llamar |
| Polling | Cada 4 segundos — banner de offline si falla la conexión |

---

## Menú GAS (desde el Sheet)

Al abrir el Sheet aparece el menú **🔴 Alertar** con:
- ⚙️ Crear / completar hojas
- 🔔 Simular alarma (test)
- ✕ Cancelar alarma activa
- 📋 Ver estado actual

---

## Pendiente / Mejoras futuras

- [ ] Notificaciones push cuando la app está cerrada (requiere push server externo)
- [ ] Leer hashes de passwords desde el Sheet (endpoint adicional autenticado)
- [ ] Gestión de usuarios desde UI admin (sin tocar el HTML)
- [ ] Múltiples casas / grupos

---

## Prompt de retoma

```
Proyecto: Alertar v2.1 — timbre digital familiar
Stack: HTML puro + GAS Web App + Google Sheets + GitHub Pages + PWA
Sheet ID: 1SoeGsklyxsfoN3veriBNsbdxv9HEHC2Wqab3DLq0AyY
Tabs: Config, Usuarios, Estado, Historial
GAS: Code.gs + Setup.gs + Alarm.gs (todos v2.0)
Frontend: alertar_v2.html (v2.1) + manifest.json + sw.js + iconos
Usuarios: Pato, Mily, Ale — passwords hasheados en usersMap del HTML
Estado: proyecto completo y deployado
Próximo paso: [describir]
```

---

## Historial de versiones

| Versión | Fecha | Cambios |
|---|---|---|
| v1.0 | 2026-05-16 | Demo standalone — HTML hardcodeado, localStorage, sin backend |
| v2.0 | 2026-05-17 | GAS backend real, polling al Sheet, PWA instalable |
| v2.1 | 2026-05-17 | Botón instalar PWA en topbar, iconos generados (192/180/512px), apple-touch-icon |
