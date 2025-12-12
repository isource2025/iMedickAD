# 🔄 Decodificación de RTF en Resultados de Estudios

## ❌ Problema Identificado

Los resultados de estudios (`TextoProtocolo` de `imProtocolosResultados`) vienen en formato **RTF** (Rich Text Format):

```rtf
{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang3082{\fonttbl{\f0\fnil\fcharset0 Microsoft Sans Serif;}}
{\colortbl ;\red0\green0\blue0;\red8\green0\blue0;}
{\*\generator Riched20 10.0.19041}\viewkind4\uc1 
\pard\cf1\highlight0\f0\fs18 Paciente a cargo de servicio de cirugia general. Pasara a sala cuando se cuente con cama disponible \cf2\par
}
```

Esto se mostraba como código ilegible en el frontend.

---

## ✅ Solución Implementada

### 1. Utilidad de Decodificación RTF

**Archivo:** `frontend/utils/rtfToText.ts`

Funciones creadas:
- `rtfToText(rtf: string): string` - Convierte RTF a texto plano
- `isRTF(text: string): boolean` - Verifica si un string es formato RTF

### 2. Proceso de Decodificación

La función `rtfToText()` realiza los siguientes pasos:

1. **Verifica** si el texto es RTF (comienza con `{\rtf`)
2. **Elimina** encabezados RTF (versión, charset, etc.)
3. **Elimina** tablas de fuentes y colores
4. **Convierte** comandos de formato:
   - `\par` → Salto de línea (`\n`)
   - `\tab` → Tabulación (`\t`)
5. **Elimina** todos los comandos RTF:
   - Colores: `\cf1`, `\highlight0`
   - Fuentes: `\f0`, `\fs18`
   - Formato: `\b`, `\i`, `\ul`
6. **Limpia** llaves `{}` y espacios múltiples
7. **Retorna** texto plano legible

### 3. Integración en el Frontend

**Archivo:** `frontend/app/dashboard/visits/[id]/page.tsx`

```typescript
import { rtfToText } from '@/utils/rtfToText';

// En el render de resultados:
{est.tieneResultado && est.resultadoEstudio ? (
  rtfToText(est.resultadoEstudio)
) : (
  <p className={styles.noData}>Resultado pendiente</p>
)}
```

---

## 📊 Ejemplo de Conversión

### Entrada (RTF):
```rtf
{\rtf1\ansi\ansicpg1252\deff0\nouicompat\deflang3082{\fonttbl{\f0\fnil\fcharset0 Microsoft Sans Serif;}}
{\colortbl ;\red0\green0\blue0;\red8\green0\blue0;}
{\*\generator Riched20 10.0.19041}\viewkind4\uc1 
\pard\cf1\highlight0\f0\fs18 Paciente a cargo de servicio de cirugia general. Pasara a sala cuando se cuente con cama disponible \cf2\par
}
```

### Salida (Texto Plano):
```
Paciente a cargo de servicio de cirugia general. Pasara a sala cuando se cuente con cama disponible
```

---

## 🎯 Casos de Uso

### Caso 1: Resultado en RTF
- **Input:** Texto RTF desde la base de datos
- **Proceso:** `rtfToText()` decodifica el RTF
- **Output:** Texto limpio y legible

### Caso 2: Resultado en Texto Plano
- **Input:** Texto normal (sin formato RTF)
- **Proceso:** `rtfToText()` detecta que no es RTF
- **Output:** Retorna el texto tal cual (sin modificaciones)

### Caso 3: Sin Resultado
- **Input:** `null` o vacío
- **Proceso:** Validación inicial
- **Output:** Mensaje "Resultado pendiente"

---

## 🔍 Verificación

Para probar la decodificación:

1. **Buscar paciente:** DNI `29981104` (FERNANDEZ ENZO RAUL)
2. **Abrir visita:** `363192`
3. **Ir a pestaña:** "Estudios"
4. **Ver resultado:** El texto debe mostrarse limpio, sin códigos RTF

**Resultado esperado:**
```
Paciente a cargo de servicio de cirugia general. 
Pasara a sala cuando se cuente con cama disponible
```

---

## 📝 Notas Técnicas

### Comandos RTF Soportados:
- ✅ Encabezados (`\rtf1`, `\ansi`, `\ansicpg`)
- ✅ Tablas de fuentes (`\fonttbl`)
- ✅ Tablas de colores (`\colortbl`)
- ✅ Formato de texto (`\b`, `\i`, `\ul`)
- ✅ Colores (`\cf`, `\highlight`, `\cb`)
- ✅ Párrafos (`\par`, `\pard`)
- ✅ Tabulaciones (`\tab`)
- ✅ Saltos de línea (`\line`)

### Limitaciones:
- No renderiza formato visual (negritas, colores, etc.)
- Solo extrae el texto plano
- Ideal para mostrar contenido médico sin distracciones visuales

---

## 🚀 Archivos Modificados

1. ✅ `frontend/utils/rtfToText.ts` (NUEVO)
   - Función de decodificación RTF

2. ✅ `frontend/utils/rtfToText.test.ts` (NUEVO)
   - Pruebas y ejemplos

3. ✅ `frontend/app/dashboard/visits/[id]/page.tsx`
   - Import de `rtfToText`
   - Uso en render de resultados

---

## ✨ Resultado Final

Los resultados de estudios ahora se muestran como **texto limpio y legible**, sin códigos RTF, mejorando significativamente la experiencia del usuario al revisar los resultados médicos.
