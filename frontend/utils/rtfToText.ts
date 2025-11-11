/**
 * Convierte texto RTF a texto plano
 * Elimina todas las etiquetas RTF y devuelve solo el contenido legible
 */
export function rtfToText(rtf: string): string {
  if (!rtf || typeof rtf !== 'string') {
    return '';
  }

  // Si no es RTF, devolver tal cual
  if (!rtf.startsWith('{\\rtf')) {
    return rtf;
  }

  let text = rtf;

  // Eliminar encabezado RTF completo (incluyendo versión, charset, etc)
  text = text.replace(/\{\\rtf1[^}]*\}/g, '');
  
  // Eliminar tabla de fuentes completa
  text = text.replace(/\{\\fonttbl\{[^}]*\}+\}/g, '');
  text = text.replace(/\{\\fonttbl[^}]*\}/g, '');
  
  // Eliminar tabla de colores completa
  text = text.replace(/\{\\colortbl[^}]*\}/g, '');
  
  // Eliminar generador
  text = text.replace(/\{\\?\*\\generator[^}]*\}/g, '');
  
  // Reemplazar \par con saltos de línea ANTES de eliminar otros comandos
  text = text.replace(/\\par\b/g, '\n');
  text = text.replace(/\\par/g, '\n');
  text = text.replace(/\\line/g, '\n');
  
  // Reemplazar tabs
  text = text.replace(/\\tab/g, '\t');
  
  // Eliminar comandos de formato comunes
  text = text.replace(/\\viewkind\d+/g, '');
  text = text.replace(/\\uc\d+/g, '');
  text = text.replace(/\\pard/g, '');
  text = text.replace(/\\plain/g, '');
  text = text.replace(/\\sa\d+/g, '');
  text = text.replace(/\\sb\d+/g, '');
  text = text.replace(/\\fi\d+/g, '');
  text = text.replace(/\\li\d+/g, '');
  text = text.replace(/\\ri\d+/g, '');
  
  // Eliminar comandos de color y highlight
  text = text.replace(/\\cf\d+/g, '');
  text = text.replace(/\\highlight\d+/g, '');
  text = text.replace(/\\cb\d+/g, '');
  
  // Eliminar comandos de fuente
  text = text.replace(/\\f\d+/g, '');
  text = text.replace(/\\fs\d+/g, '');
  text = text.replace(/\\b\d*/g, '');
  text = text.replace(/\\i\d*/g, '');
  text = text.replace(/\\ul\d*/g, '');
  text = text.replace(/\\ulnone/g, '');
  text = text.replace(/\\strike\d*/g, '');
  
  // Eliminar comandos de charset y lenguaje
  text = text.replace(/\\ansi/g, '');
  text = text.replace(/\\ansicpg\d+/g, '');
  text = text.replace(/\\deff\d+/g, '');
  text = text.replace(/\\deflang\d+/g, '');
  text = text.replace(/\\nouicompat/g, '');
  
  // Eliminar comandos de caracteres especiales
  text = text.replace(/\\fnil/g, '');
  text = text.replace(/\\fcharset\d+/g, '');
  
  // Eliminar otros comandos RTF comunes (debe ser después de los específicos)
  text = text.replace(/\\[a-z]+\d*/g, ' ');
  text = text.replace(/\\[a-z]+/g, ' ');
  
  // Eliminar llaves
  text = text.replace(/[{}]/g, '');
  
  // Limpiar espacios múltiples
  text = text.replace(/[ \t]+/g, ' ');
  
  // Limpiar saltos de línea múltiples
  text = text.replace(/\n\s*\n+/g, '\n\n');
  
  // Trim cada línea
  text = text.split('\n').map(line => line.trim()).join('\n');
  
  // Trim final
  text = text.trim();

  return text;
}

/**
 * Verifica si un string es formato RTF
 */
export function isRTF(text: string): boolean {
  return !!(text && typeof text === 'string' && text.startsWith('{\\rtf'));
}
