@echo off
echo ========================================
echo TESTEANDO SISTEMA DE ARCHIVOS
echo ========================================
echo.

echo 1. Obteniendo detalles de la visita #379267...
curl -s "http://localhost:5000/api/visits/379267" > visita_379267.json
echo OK - Datos guardados en visita_379267.json
echo.

echo 2. Verificando endpoint de archivos...
echo    Probando descarga de archivo...
curl -v "http://localhost:5000/api/archivos/descargar?path=\\server\Imagenes\Vidal\379267%%20SCHERMAN%%20JUAN%%20PABLO\54463%%20SHERMAN.pdf" -o test_download.pdf 2>&1 | findstr /C:"HTTP" /C:"Content-Type" /C:"Content-Length"
echo.

echo 3. URLs para testing manual:
echo    - Frontend: http://localhost:3000/dashboard/visits/379267
echo    - API: http://localhost:5000/api/visits/379267
echo    - Descargar archivo: http://localhost:5000/api/archivos/descargar?path=\\server\Imagenes\Vidal\379267%%20SCHERMAN%%20JUAN%%20PABLO\54463%%20SHERMAN.pdf
echo.
echo ========================================
echo Test completado
echo ========================================
pause
