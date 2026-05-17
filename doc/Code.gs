// ============================================================
//  Alertar — GAS Backend
//  Code.gs — Router principal + Menú
//  Versión: v2.0 | 2026-05-17
// ============================================================

const SHEET_ID = '1SoeGsklyxsfoN3veriBNsbdxv9HEHC2Wqab3DLq0AyY';
const VERSION  = 'v2.0';

// ── MENÚ ────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🔴 Alertar')
    .addItem('⚙️  Crear / completar hojas', 'setupSheets')
    .addSeparator()
    .addItem('🔔 Simular alarma (test)', 'testTrigger')
    .addItem('✕  Cancelar alarma activa', 'testCancel')
    .addSeparator()
    .addItem('📋 Ver estado actual', 'testGetStatus')
    .addToUi();
}

// ── CORS HELPER ─────────────────────────────────────────────
function corsOutput(data) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── doGet — health check + getStatus ────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'getStatus';
  try {
    if (action === 'getStatus') return corsOutput(getStatus());
    if (action === 'ping')      return corsOutput({ ok: true, version: VERSION, ts: Date.now() });
    return corsOutput({ ok: false, error: 'Acción desconocida: ' + action });
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
}

// ── doPost — trigger / cancel ────────────────────────────────
function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents);
    const action = body.action || '';

    if (action === 'trigger') return corsOutput(triggerAlarm(body.user));
    if (action === 'cancel')  return corsOutput(cancelAlarm(body.user));

    return corsOutput({ ok: false, error: 'Acción desconocida: ' + action });
  } catch (err) {
    return corsOutput({ ok: false, error: err.message });
  }
}

// ── TEST HELPERS (desde el menú) ─────────────────────────────
function testTrigger() {
  const r = triggerAlarm('Test');
  SpreadsheetApp.getUi().alert('triggerAlarm → ' + JSON.stringify(r));
}
function testCancel() {
  const r = cancelAlarm('Test');
  SpreadsheetApp.getUi().alert('cancelAlarm → ' + JSON.stringify(r));
}
function testGetStatus() {
  const r = getStatus();
  SpreadsheetApp.getUi().alert('getStatus → ' + JSON.stringify(r, null, 2));
}
