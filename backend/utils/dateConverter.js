/**
 * Convierte fecha Clarion a formato ISO date string (YYYY-MM-DD)
 * Formato Clarion: días desde 28/12/1800
 * Retorna string en formato ISO para evitar problemas de timezone
 */
function clarionToDate(clarionDate) {
  if (!clarionDate || clarionDate <= 0 || clarionDate > 2958465) {
    return null;
  }
  
  // Usar UTC para evitar problemas de timezone
  const baseDate = new Date(Date.UTC(1800, 11, 28)); // 28 de diciembre de 1800
  const resultDate = new Date(baseDate);
  resultDate.setUTCDate(baseDate.getUTCDate() + clarionDate - 1);
  
  // Retornar en formato ISO date string (YYYY-MM-DD)
  const year = resultDate.getUTCFullYear();
  const month = String(resultDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(resultDate.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Convierte hora Clarion a formato HH:MM:SS
 * Formato Clarion: centésimas de segundo desde medianoche
 */
function clarionToTime(clarionTime) {
  if (!clarionTime || clarionTime < 0) {
    return '00:00:00';
  }
  
  const totalSeconds = Math.floor(clarionTime / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Formatea fecha para SQL Server
 */
function formatDateForSQL(date) {
  if (!date) return null;
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

module.exports = {
  clarionToDate,
  clarionToTime,
  formatDateForSQL
};
