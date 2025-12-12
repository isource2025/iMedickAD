# 🚀 Configuración de Variables de Entorno en Render

## ❌ Problema Actual

La nueva instancia de Render (`imedickad-escuela.onrender.com`) está fallando con el error:
```
secretOrPrivateKey must have a value
```

Esto indica que **faltan las variables de entorno** en la configuración de Render.

---

## ✅ Solución: Configurar Variables de Entorno en Render

### 📋 Variables Requeridas

Debes configurar las siguientes variables de entorno en tu servicio de Render:

#### **1. Base de Datos (SQL Server)**
```
DB_SERVER=181.4.72.60
DB_PORT=1433
DB_DATABASE=isource
DB_USER=sa
DB_PASSWORD=isource
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

#### **2. JWT (Autenticación)** ⚠️ **CRÍTICO - FALTANTE**
```
JWT_SECRET=iMedicAD_2025_Secret_Key_Production_Secure
JWT_EXPIRES_IN=8h
```

#### **3. CORS (Orígenes Permitidos)**
```
CORS_ORIGIN=http://localhost:3000,https://i-medick-ad-g5cg.vercel.app
```

#### **4. Configuración General**
```
NODE_ENV=production
PORT=5000
```

---

## 🔧 Pasos para Configurar en Render

### **Opción 1: Desde el Dashboard de Render**

1. **Accede a tu servicio**: https://dashboard.render.com
2. **Selecciona tu servicio**: `imedickad-escuela`
3. **Ve a la pestaña**: `Environment`
4. **Agrega cada variable** haciendo click en `Add Environment Variable`
5. **Copia y pega** cada variable con su valor correspondiente
6. **Guarda los cambios**: Click en `Save Changes`
7. **Render automáticamente redesplegará** tu servicio

### **Opción 2: Desde un archivo .env (Render.yaml)**

Si prefieres automatizar, puedes crear un archivo `render.yaml` en la raíz del proyecto:

```yaml
services:
  - type: web
    name: imedickad-escuela
    env: node
    buildCommand: yarn
    startCommand: npm run dev
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 5000
      - key: DB_SERVER
        value: 181.4.72.60
      - key: DB_PORT
        value: 1433
      - key: DB_DATABASE
        value: isource
      - key: DB_USER
        value: sa
      - key: DB_PASSWORD
        value: isource
      - key: DB_ENCRYPT
        value: false
      - key: DB_TRUST_SERVER_CERTIFICATE
        value: true
      - key: JWT_SECRET
        value: iMedicAD_2025_Secret_Key_Production_Secure
      - key: JWT_EXPIRES_IN
        value: 8h
      - key: CORS_ORIGIN
        value: http://localhost:3000,https://i-medick-ad-g5cg.vercel.app
```

---

## 🔍 Verificación

Después de configurar las variables:

1. **Espera a que Render termine el redespliegue** (2-3 minutos)
2. **Verifica los logs** en Render Dashboard
3. **Deberías ver en los logs**:
   ```
   🌐 CORS Origins permitidos: [
     'http://localhost:3000',
     'https://i-medick-ad-g5cg.vercel.app'
   ]
   ✅ Conexión a SQL Server establecida
   ```
4. **Prueba el login** desde tu frontend en Vercel

---

## 🆚 Comparación de Instancias

| Variable | Instancia Funcionando | Nueva Instancia (imedickad-escuela) |
|----------|----------------------|-------------------------------------|
| JWT_SECRET | ✅ Configurado | ❌ **FALTA** |
| DB_* | ✅ Configurado | ❓ Verificar |
| CORS_ORIGIN | ✅ Configurado | ❓ Verificar |

---

## ⚠️ Notas Importantes

1. **JWT_SECRET**: Debe ser el mismo en ambas instancias si quieres que los tokens sean compatibles
2. **Seguridad**: En producción, usa un JWT_SECRET más complejo y único
3. **CORS**: Asegúrate de incluir la URL exacta de tu frontend en Vercel
4. **Base de Datos**: Ambas instancias apuntan a la misma BD, así que ten cuidado con cambios

---

## 🔐 Recomendación de Seguridad

Para producción, genera un JWT_SECRET más seguro usando:

```bash
# En tu terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Esto generará algo como:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Usa ese valor para `JWT_SECRET` en producción.

---

## 📞 Soporte

Si después de configurar las variables el error persiste:

1. Verifica los logs de Render
2. Confirma que todas las variables están presentes
3. Asegúrate de que no haya espacios extra en los valores
4. Verifica que el redespliegue se completó exitosamente
