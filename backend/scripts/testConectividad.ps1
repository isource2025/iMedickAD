# Script de diagnóstico de conectividad a SQL Server
# Ejecutar en PowerShell

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔍 DIAGNÓSTICO DE CONECTIVIDAD SQL SERVER" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$server = "201.235.17.254"
$port = 1433

# 1. Test de Ping
Write-Host "1️⃣  Probando PING al servidor..." -ForegroundColor Yellow
Write-Host "   Servidor: $server" -ForegroundColor Gray
Write-Host ""

try {
    $ping = Test-Connection -ComputerName $server -Count 4 -ErrorAction Stop
    Write-Host "   ✅ PING EXITOSO" -ForegroundColor Green
    Write-Host "   Tiempo promedio: $([math]::Round(($ping | Measure-Object -Property ResponseTime -Average).Average, 2))ms" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ❌ PING FALLÓ" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "   ⚠️  El servidor no responde a ping. Esto puede ser normal si:" -ForegroundColor Yellow
    Write-Host "      - El firewall bloquea ICMP" -ForegroundColor Gray
    Write-Host "      - El servidor está configurado para no responder ping" -ForegroundColor Gray
    Write-Host ""
}

# 2. Test de Puerto TCP
Write-Host "2️⃣  Probando conexión TCP al puerto $port..." -ForegroundColor Yellow
Write-Host ""

try {
    $tcpTest = Test-NetConnection -ComputerName $server -Port $port -WarningAction SilentlyContinue
    
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "   ✅ PUERTO $port ACCESIBLE" -ForegroundColor Green
        Write-Host "   El servidor SQL Server está escuchando en el puerto" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "   ❌ PUERTO $port NO ACCESIBLE" -ForegroundColor Red
        Write-Host ""
        Write-Host "   🔍 POSIBLES CAUSAS:" -ForegroundColor Yellow
        Write-Host "      1. Firewall bloqueando el puerto 1433" -ForegroundColor Gray
        Write-Host "      2. SQL Server no está corriendo" -ForegroundColor Gray
        Write-Host "      3. SQL Server no está configurado para escuchar en TCP/IP" -ForegroundColor Gray
        Write-Host "      4. Puerto incorrecto" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "   ❌ ERROR AL PROBAR PUERTO" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    Write-Host ""
}

# 3. Verificar reglas de firewall local
Write-Host "3️⃣  Verificando reglas de firewall local..." -ForegroundColor Yellow
Write-Host ""

try {
    $firewallRules = Get-NetFirewallRule | Where-Object {
        $_.DisplayName -like "*SQL*" -or $_.DisplayName -like "*1433*"
    } | Select-Object DisplayName, Enabled, Direction, Action

    if ($firewallRules.Count -gt 0) {
        Write-Host "   📋 Reglas de firewall relacionadas con SQL:" -ForegroundColor Gray
        $firewallRules | Format-Table -AutoSize
    } else {
        Write-Host "   ⚠️  No se encontraron reglas de firewall específicas para SQL Server" -ForegroundColor Yellow
        Write-Host "   Esto puede ser normal si el firewall está deshabilitado" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar firewall (requiere permisos de administrador)" -ForegroundColor Yellow
    Write-Host ""
}

# 4. Información de red
Write-Host "4️⃣  Información de red local..." -ForegroundColor Yellow
Write-Host ""

$networkInfo = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*"
} | Select-Object IPAddress, InterfaceAlias

Write-Host "   📡 Interfaces de red activas:" -ForegroundColor Gray
$networkInfo | Format-Table -AutoSize

# 5. Resumen y recomendaciones
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📝 RESUMEN Y RECOMENDACIONES" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($tcpTest.TcpTestSucceeded) {
    Write-Host "✅ La conectividad de red es correcta" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si aún tienes problemas de conexión, verifica:" -ForegroundColor Yellow
    Write-Host "   1. Credenciales de SQL Server (usuario/contraseña)" -ForegroundColor Gray
    Write-Host "   2. Nombre de la base de datos" -ForegroundColor Gray
    Write-Host "   3. Configuración de autenticación de SQL Server" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ejecuta el test de Node.js:" -ForegroundColor Yellow
    Write-Host "   node scripts/testConexionSQL.js" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "❌ Hay problemas de conectividad" -ForegroundColor Red
    Write-Host ""
    Write-Host "PASOS RECOMENDADOS:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Verificar que SQL Server está corriendo:" -ForegroundColor White
    Write-Host "   - Abrir 'Servicios' (services.msc)" -ForegroundColor Gray
    Write-Host "   - Buscar 'SQL Server (MSSQLSERVER)'" -ForegroundColor Gray
    Write-Host "   - Verificar que está 'En ejecución'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Configurar SQL Server para aceptar conexiones remotas:" -ForegroundColor White
    Write-Host "   - Abrir 'SQL Server Configuration Manager'" -ForegroundColor Gray
    Write-Host "   - SQL Server Network Configuration > Protocols" -ForegroundColor Gray
    Write-Host "   - Habilitar 'TCP/IP'" -ForegroundColor Gray
    Write-Host "   - Reiniciar servicio SQL Server" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Configurar firewall:" -ForegroundColor White
    Write-Host "   - Abrir 'Firewall de Windows Defender'" -ForegroundColor Gray
    Write-Host "   - Crear regla de entrada para puerto 1433 TCP" -ForegroundColor Gray
    Write-Host "   - Permitir conexiones" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Si estás conectando a un servidor remoto:" -ForegroundColor White
    Write-Host "   - Verificar VPN/conexión de red" -ForegroundColor Gray
    Write-Host "   - Contactar al administrador del servidor" -ForegroundColor Gray
    Write-Host "   - Verificar firewall del servidor remoto" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
