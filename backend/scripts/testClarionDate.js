// Test de conversión de fechas Clarion

function clarionToDateOLD(clarionDate) {
  if (!clarionDate || clarionDate <= 0) return null;
  const baseDate = new Date(Date.UTC(1800, 11, 28));
  const resultDate = new Date(baseDate);
  resultDate.setUTCDate(baseDate.getUTCDate() + clarionDate - 1);
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function clarionToDateNEW(clarionDate) {
  if (!clarionDate || clarionDate <= 0) return null;
  const baseDate = new Date(Date.UTC(1800, 11, 28));
  const resultDate = new Date(baseDate);
  resultDate.setUTCDate(baseDate.getUTCDate() + clarionDate); // SIN -1
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

console.log('🧪 TEST DE CONVERSIÓN CLARION\n');
console.log('='.repeat(80));

// Datos reales de la BD
const ejemplos = [
  { visita: 384835, admision: '2025-11-14', egresoInt: 82136 },
  { visita: 384833, admision: '2025-11-14', egresoInt: 82136 },
  { visita: 384832, admision: '2025-11-14', egresoInt: 82136 }
];

console.log('\nVisita | Admisión   | Egreso(Int) | OLD (con -1)  | NEW (sin -1)  | Diferencia');
console.log('-'.repeat(80));

ejemplos.forEach(e => {
  const egresoOLD = clarionToDateOLD(e.egresoInt);
  const egresoNEW = clarionToDateNEW(e.egresoInt);
  
  const admDate = new Date(e.admision);
  const egresoOLDDate = new Date(egresoOLD);
  const egresoNEWDate = new Date(egresoNEW);
  
  const diffOLD = Math.floor((egresoOLDDate - admDate) / (1000 * 60 * 60 * 24));
  const diffNEW = Math.floor((egresoNEWDate - admDate) / (1000 * 60 * 60 * 24));
  
  console.log(
    `${e.visita} | ${e.admision} | ${String(e.egresoInt).padEnd(11)} | ${egresoOLD} | ${egresoNEW} | OLD:${diffOLD} NEW:${diffNEW}`
  );
});

console.log('\n' + '='.repeat(80));
console.log('\n💡 CONCLUSIÓN:');
console.log('   Si la diferencia es negativa con OLD, significa que el egreso está ANTES de la admisión');
console.log('   Debemos usar NEW (sin -1) para corregir el problema\n');

// Test con fechas conocidas
console.log('='.repeat(80));
console.log('\n🔍 TEST CON FECHAS CONOCIDAS:\n');

// Si hoy es 14/11/2025, ¿cuál es el número Clarion?
const hoy = new Date('2025-11-14');
const base = new Date(Date.UTC(1800, 11, 28));
const diasDesdeBase = Math.floor((hoy - base) / (1000 * 60 * 60 * 24));

console.log(`Hoy: 2025-11-14`);
console.log(`Días desde 28/12/1800: ${diasDesdeBase}`);
console.log(`Número en BD: 82136`);
console.log(`Diferencia: ${82136 - diasDesdeBase} días`);

console.log(`\nConversión con OLD (82136): ${clarionToDateOLD(82136)}`);
console.log(`Conversión con NEW (82136): ${clarionToDateNEW(82136)}`);
console.log(`\n✅ La versión correcta es: ${clarionToDateNEW(82136) === '2025-11-14' ? 'NEW' : 'OLD'}`);
