// ============================================================
//  Alertar — GAS Backend
//  Alarm.gs — Lógica de alarma
//  Versión: v2.0 | 2026-05-17
// ============================================================

// ── getStatus ─────────────────────────────────────────────────
// Devuelve: estado de alarma + lista de usuarios + config + historial
function getStatus() {
  const ss = SpreadsheetApp.openById(SHEET_ID);

  // — Estado actual —
  const shEst  = ss.getSheetByName('Estado');
  const estRow = shEst.getRange(2, 1, 1, 5).getValues()[0];
  const alarm  = {
    active:      estRow[0] === true || estRow[0] === 'TRUE',
    who:         estRow[1] || '',
    tsStart:     estRow[2] ? new Date(estRow[2]).getTime() : null,
    cancelledBy: estRow[3] || '',
    tsEnd:       estRow[4] ? new Date(estRow[4]).getTime() : null,
  };

  // — Usuarios (nombres) —
  const users = Object.keys(getUsers());

  // — Config —
  const casaNombre     = getConfig('CASA_NOMBRE')    || 'Casa';
  const alarmDuration  = parseInt(getConfig('ALARM_DURATION') || '60');
  const historyRows    = parseInt(getConfig('HISTORY_ROWS')   || '30');

  // — Historial (últimas N filas) —
  const shHist  = ss.getSheetByName('Historial');
  const lastRow = shHist.getLastRow();
  let history   = [];
  if (lastRow > 1) {
    const count = Math.min(lastRow - 1, historyRows);
    const rows  = shHist.getRange(lastRow - count + 1, 1, count, 5).getValues();
    history = rows.reverse().map(r => ({
      who:         r[0],
      tsStart:     r[1] ? new Date(r[1]).getTime() : null,
      tsEnd:       r[2] ? new Date(r[2]).getTime() : null,
      cancelledBy: r[3],
      durSec:      r[4],
    }));
  }

  return {
    ok:            true,
    version:       VERSION,
    casaNombre,
    alarmDuration,
    alarm,
    users,
    history,
    serverTs:      Date.now(),
  };
}

// ── triggerAlarm ──────────────────────────────────────────────
function triggerAlarm(user) {
  if (!user) return { ok: false, error: 'Falta el usuario' };

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const shEst = ss.getSheetByName('Estado');

  // Verificar si ya hay una alarma activa
  const current = shEst.getRange(2, 1).getValue();
  if (current === true || current === 'TRUE') {
    return { ok: false, error: 'Ya hay una alarma activa' };
  }

  const now = new Date();
  shEst.getRange(2, 1, 1, 5).setValues([[
    true,
    user,
    now,
    '',
    '',
  ]]);

  return { ok: true, action: 'triggered', who: user, ts: now.getTime() };
}

// ── cancelAlarm ───────────────────────────────────────────────
function cancelAlarm(user) {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const shEst = ss.getSheetByName('Estado');

  const estRow = shEst.getRange(2, 1, 1, 5).getValues()[0];
  const active = estRow[0] === true || estRow[0] === 'TRUE';

  if (!active) return { ok: false, error: 'No hay alarma activa' };

  const tsStart = estRow[2] ? new Date(estRow[2]) : new Date();
  const tsEnd   = new Date();
  const durSec  = Math.round((tsEnd - tsStart) / 1000);
  const who     = estRow[1];
  const cancelledBy = user || '(auto)';

  // Actualizar Estado
  shEst.getRange(2, 1, 1, 5).setValues([[
    false,
    who,
    tsStart,
    cancelledBy,
    tsEnd,
  ]]);

  // Append a Historial
  _appendHistory(ss, who, tsStart, tsEnd, cancelledBy, durSec);

  return { ok: true, action: 'cancelled', cancelledBy, durSec };
}

// ── _appendHistory ────────────────────────────────────────────
function _appendHistory(ss, who, tsStart, tsEnd, cancelledBy, durSec) {
  const shHist  = ss.getSheetByName('Historial');
  const maxRows = parseInt(getConfig('HISTORY_ROWS') || '30');

  shHist.appendRow([who, tsStart, tsEnd, cancelledBy, durSec]);

  // Trim: mantener solo las últimas maxRows filas (+ 1 header)
  const last = shHist.getLastRow();
  if (last > maxRows + 1) {
    shHist.deleteRow(2); // borra la más antigua (fila 2, debajo del header)
  }
}
