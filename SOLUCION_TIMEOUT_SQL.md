# Solución: Error de Timeout SQL Server

## Error Actual

```
ConnectionError: Failed to connect to 201.235.17.254:1433 in 15000ms
code: 'ETIMEOUT'
```

## Diagnóstico Rápido

### 1. Ejecutar Scripts de Diagnóstico

```powershell
# En PowerShell (como Administrador)
cd backend\scripts
.\testConectividad.ps1
```

```bash
# En terminal normal
cd backend\scripts
node testConexionSQL.js
```

## Causas Comunes y Soluciones

### ✅ Solución 1: Verificar Conectividad de Red

**Problema:** No hay conexión de red al servidor SQL.

**Verificar:**
```powershell
# Hacer ping al servidor
ping 201.235.17.254

# Probar puerto TCP
Test-NetConnection -ComputerName 201.235.17.254 -Port 1433
```

**Solución:**
- Si ping falla: Verificar conexión VPN o red
- Si puerto falla: Continuar con las siguientes soluciones

### ✅ Solución 2: Configurar SQL Server para Conexiones Remotas

**Problema:** SQL Server no acepta conexiones remotas.

**Pasos:**

1. **Abrir SQL Server Configuration Manager**
   - Buscar en Windows: "SQL Server Configuration Manager"

2. **Habilitar TCP/IP**
   - Ir a: SQL Server Network Configuration > Protocols for MSSQLSERVER
   - Click derecho en "TCP/IP" > Enable
   - Click derecho en "TCP/IP" > Properties
   - En la pestaña "IP Addresses":
     - Buscar "IPAll"
     - TCP Port: `1433`
     - TCP Dynamic Ports: (dejar vacío)

3. **Reiniciar SQL Server**
   - Ir a: SQL Server Services
   - Click derecho en "SQL Server (MSSQLSERVER)" > Restart

### ✅ Solución 3: Configurar Firewall de Windows

**Problema:** Firewall bloqueando puerto 1433.

**Pasos:**

1. **Abrir Firewall de Windows Defender con Seguridad Avanzada**
   - Buscar en Windows: "Firewall"

2. **Crear Regla de Entrada**
   - Click en "Reglas de entrada" > "Nueva regla..."
   - Tipo: Puerto
   - Protocolo: TCP
   - Puerto específico: `1433`
   - Acción: Permitir la conexión
   - Perfil: Todos (Dominio, Privado, Público)
   - Nombre: "SQL Server Port 1433"

3. **Crear Regla de Salida**
   - Repetir los pasos anteriores en "Reglas de salida"

**Comando PowerShell (como Administrador):**
```powershell
# Regla de entrada
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow

# Regla de salida
New-NetFirewallRule -DisplayName "SQL Server" -Direction Outbound -Protocol TCP -LocalPort 1433 -Action Allow
```

### ✅ Solución 4: Verificar Servicio SQL Server

**Problema:** SQL Server no está corriendo.

**Pasos:**

1. **Abrir Servicios**
   - Presionar `Win + R`
   - Escribir: `services.msc`
   - Enter

2. **Buscar y Verificar:**
   - `SQL Server (MSSQLSERVER)` - Debe estar "En ejecución"
   - `SQL Server Browser` - Debe estar "En ejecución"

3. **Si no están corriendo:**
   - Click derecho > Iniciar
   - Click derecho > Propiedades > Tipo de inicio: Automático

### ✅ Solución 5: Verificar Autenticación SQL Server

**Problema:** SQL Server no acepta autenticación SQL.

**Pasos:**

1. **Abrir SQL Server Management Studio (SSMS)**
   - Conectar con Windows Authentication

2. **Habilitar Autenticación Mixta**
   - Click derecho en el servidor > Properties
   - Security > Server authentication
   - Seleccionar: "SQL Server and Windows Authentication mode"
   - OK

3. **Reiniciar SQL Server**

4. **Verificar Usuario SA**
   - Security > Logins > sa
   - Click derecho > Properties
   - General: Desmarcar "Enforce password policy" (opcional)
   - Status: Login: Enabled
   - OK

### ✅ Solución 6: Configuración Alternativa (Servidor Local)

Si el servidor SQL está en la misma máquina, puedes usar:

**Opción A: localhost**
```env
DB_SERVER=localhost
DB_PORT=1433
```

**Opción B: IP local**
```env
DB_SERVER=127.0.0.1
DB_PORT=1433
```

**Opción C: Named Pipe**
```env
DB_SERVER=localhost\\MSSQLSERVER
# No especificar puerto
```

### ✅ Solución 7: Aumentar Timeout (Temporal)

Si la conexión es lenta pero funciona:

**Editar:** `backend/config/db.js`

```javascript
options: {
  encrypt: process.env.DB_ENCRYPT === 'true',
  trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  enableArithAbort: true,
  connectionTimeout: 60000, // Aumentar a 60 segundos
  requestTimeout: 60000
}
```

### ✅ Solución 8: Verificar Credenciales

**Problema:** Usuario o contraseña incorrectos.

**Verificar archivo .env:**
```env
DB_SERVER=201.235.17.254
DB_PORT=1433
DB_DATABASE=isource
DB_USER=sa
DB_PASSWORD=isource
```

**Probar credenciales en SSMS:**
1. Abrir SQL Server Management Studio
2. Server name: `201.235.17.254,1433`
3. Authentication: SQL Server Authentication
4. Login: `sa`
5. Password: `isource`
6. Connect

Si falla en SSMS, el problema es de credenciales o permisos.

## Soluciones para Servidor Remoto

### Si el servidor está en otra ubicación:

1. **Verificar VPN**
   - ¿Estás conectado a la VPN de la empresa?
   - ¿La VPN permite acceso al puerto 1433?

2. **Contactar Administrador del Servidor**
   - Verificar que el firewall del servidor permite conexiones desde tu IP
   - Verificar que SQL Server está configurado para conexiones remotas
   - Verificar que el puerto 1433 está abierto en el router/firewall

3. **Usar IP Pública vs Privada**
   - `201.235.17.254` es una IP pública
   - Verificar si necesitas usar una IP privada (192.168.x.x o 10.x.x.x)

## Checklist de Verificación

- [ ] Ping al servidor funciona
- [ ] Puerto 1433 está abierto (Test-NetConnection)
- [ ] SQL Server está corriendo (services.msc)
- [ ] TCP/IP está habilitado en SQL Server Configuration Manager
- [ ] Firewall permite puerto 1433 (entrada y salida)
- [ ] SQL Server acepta autenticación SQL (modo mixto)
- [ ] Usuario SA está habilitado
- [ ] Credenciales son correctas
- [ ] Base de datos "isource" existe
- [ ] VPN conectada (si es servidor remoto)

## Comandos Útiles

### PowerShell (como Administrador)

```powershell
# Verificar conectividad
Test-NetConnection -ComputerName 201.235.17.254 -Port 1433

# Ver servicios SQL
Get-Service | Where-Object {$_.DisplayName -like "*SQL*"}

# Iniciar SQL Server
Start-Service MSSQLSERVER

# Ver reglas de firewall
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*SQL*"}

# Crear regla de firewall
New-NetFirewallRule -DisplayName "SQL Server" -Direction Inbound -Protocol TCP -LocalPort 1433 -Action Allow
```

### CMD

```cmd
# Ping
ping 201.235.17.254

# Telnet (si está instalado)
telnet 201.235.17.254 1433

# Ver servicios
sc query MSSQLSERVER
```

## Próximos Pasos

1. **Ejecutar diagnóstico:**
   ```bash
   cd backend\scripts
   node testConexionSQL.js
   ```

2. **Si el diagnóstico falla:**
   - Seguir las soluciones en orden
   - Verificar cada punto del checklist

3. **Si todo falla:**
   - Contactar al administrador del servidor SQL
   - Verificar logs de SQL Server en: `C:\Program Files\Microsoft SQL Server\MSSQL15.MSSQLSERVER\MSSQL\Log\ERRORLOG`

## Contacto y Soporte

Si ninguna solución funciona, proporciona:
- Resultado del script `testConexionSQL.js`
- Resultado del script `testConectividad.ps1`
- Logs de SQL Server
- Configuración de red (VPN, etc.)
