// ============================================================
//  Alertar — GAS Backend
//  Setup.gs — Creación / completado de hojas
//  Versión: v2.0 | 2026-05-17
// ============================================================

function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const ui = SpreadsheetApp.getUi();

  _setupConfig(ss);
  _setupUsuarios(ss);
  _setupEstado(ss);
  _setupHistorial(ss);

  // Ordenar tabs
  const ORDER = ['Config', 'Usuarios', 'Estado', 'Historial'];
  ORDER.forEach((name, i) => {
    const sh = ss.getSheetByName(name);
    if (sh) ss.setActiveSheet(sh), ss.moveActiveSheet(i + 1);
  });

  ui.alert('✅ Alertar — Setup completo\n\nHojas creadas/verificadas:\n• Config\n• Usuarios\n• Estado\n• Historial');
}

// ── CONFIG ───────────────────────────────────────────────────
function _setupConfig(ss) {
  let sh = ss.getSheetByName('Config');
  if (!sh) sh = ss.insertSheet('Config');

  const defaults = [
    ['CASA_NOMBRE',     'Casa Cuarta'],
    ['ALARM_DURATION',  '60'],
    ['HISTORY_ROWS',    '30'],
    ['VERSION',         VERSION],
  ];

  sh.clearContents();
  sh.getRange(1, 1, 1, 2).setValues([['clave', 'valor']]);
  sh.getRange(2, 1, defaults.length, 2).setValues(defaults);

  // Estilo header
  sh.getRange(1, 1, 1, 2)
    .setBackground('#D63031').setFontColor('#FFFFFF').setFontWeight('bold');
  sh.setColumnWidth(1, 180);
  sh.setColumnWidth(2, 220);
}

// ── USUARIOS ─────────────────────────────────────────────────
function _setupUsuarios(ss) {
  let sh = ss.getSheetByName('Usuarios');
  if (!sh) sh = ss.insertSheet('Usuarios');

  // Solo escribe encabezado si la hoja está vacía
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 2).setValues([['nombre', 'password_hash']]);

    // Usuarios iniciales con sus hashes SHA-256
    const users = [
      ['Pato', 'a8b1c5607ebbb884aea455d8c0d80665e1687577a5035a73e039508987d96f17'],
      ['Mily', '1dd3e7a2a3b4ede1b03c472d0001d3fa23ddbfcf2e5ffe7bc885f5a83451c9ab'],
      ['Ale',  '4d5a1201a7e12fc0a6fb3a524cfffe39fd58a47e093c005e181a7d8d15c5c651'],
    ];
    sh.getRange(2, 1, users.length, 2).setValues(users);
  }

  // Estilo header
  sh.getRange(1, 1, 1, 2)
    .setBackground('#D63031').setFontColor('#FFFFFF').setFontWeight('bold');
  sh.setColumnWidth(1, 120);
  sh.setColumnWidth(2, 380);
}

// ── ESTADO ───────────────────────────────────────────────────
function _setupEstado(ss) {
  let sh = ss.getSheetByName('Estado');
  if (!sh) sh = ss.insertSheet('Estado');

  const headers = ['activa', 'quien', 'ts_inicio', 'cancelado_por', 'ts_fin'];
  sh.clearContents();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Estado inicial: sin alarma
  sh.getRange(2, 1, 1, headers.length).setValues([[false, '', '', '', '']]);

  // Estilo header
  sh.getRange(1, 1, 1, headers.length)
    .setBackground('#D63031').setFontColor('#FFFFFF').setFontWeight('bold');
  sh.setColumnWidths(1, headers.length, 160);
}

// ── HISTORIAL ─────────────────────────────────────────────────
function _setupHistorial(ss) {
  let sh = ss.getSheetByName('Historial');
  if (!sh) sh = ss.insertSheet('Historial');

  if (sh.getLastRow() === 0) {
    const headers = ['quien', 'ts_inicio', 'ts_fin', 'cancelado_por', 'duracion_seg'];
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);

    // Estilo header
    sh.getRange(1, 1, 1, headers.length)
      .setBackground('#D63031').setFontColor('#FFFFFF').setFontWeight('bold');
    sh.setColumnWidths(1, headers.length, 160);
  }
}

// ── LEER CONFIG ───────────────────────────────────────────────
function getConfig(key) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('Config');
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) return data[i][1];
  }
  return null;
}

// ── LEER USUARIOS ─────────────────────────────────────────────
function getUsers() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName('Usuarios');
  const data = sh.getDataRange().getValues();
  const users = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) users[data[i][0]] = data[i][1];
  }
  return users;
}
