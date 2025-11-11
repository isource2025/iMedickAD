/**
 * Pruebas para la función rtfToText
 * Ejecutar con: npm test o simplemente verificar visualmente
 */

import { rtfToText, isRTF } from './rtfToText';

// Ejemplo real del sistema
const rtfExample = `{\\rtf1\\ansi\\ansicpg1252\\deff0\\nouicompat\\deflang3082{\\fonttbl{\\f0\\fnil\\fcharset0 Microsoft Sans Serif;}}
{\\colortbl ;\\red0\\green0\\blue0;\\red8\\green0\\blue0;}
{\\*\\generator Riched20 10.0.19041}\\viewkind4\\uc1 
\\pard\\cf1\\highlight0\\f0\\fs18 Paciente a cargo de servicio de cirugia general. Pasara a sala cuando se cuente con cama disponible \\cf2\\par
}`;

const expectedOutput = "Paciente a cargo de servicio de cirugia general. Pasara a sala cuando se cuente con cama disponible";

console.log('=== PRUEBA DE DECODIFICACIÓN RTF ===\n');

console.log('INPUT (RTF):');
console.log(rtfExample);
console.log('\n---\n');

console.log('OUTPUT (Texto Plano):');
const result = rtfToText(rtfExample);
console.log(result);
console.log('\n---\n');

console.log('ESPERADO:');
console.log(expectedOutput);
console.log('\n---\n');

console.log('¿Es RTF?', isRTF(rtfExample));
console.log('¿Coincide con lo esperado?', result.trim() === expectedOutput.trim());

// Prueba con texto normal (no RTF)
const normalText = "Este es un texto normal sin formato RTF";
console.log('\n=== PRUEBA CON TEXTO NORMAL ===\n');
console.log('INPUT:', normalText);
console.log('OUTPUT:', rtfToText(normalText));
console.log('¿Es RTF?', isRTF(normalText));
