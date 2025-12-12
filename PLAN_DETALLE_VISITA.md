# Plan de Implementación: Detalle Completo de Visita

## Objetivo
Cuando el usuario hace click en una visita, mostrar toda la información relacionada de las siguientes tablas:
- imHCI (Historia Clínica de Ingreso)
- imInterCtrlMedicamento (Control de Medicamentos)
- imHCEvolucion (Evoluciones)
- imFacPracticas (Prácticas Médicas)
- imHCEpicrisis (Epicrisis)

## Relaciones Identificadas

### ⚠️ IMPORTANTE: Diferencias en las columnas de relación

| Tabla | Columna de Relación | Tipo | Notas |
|-------|-------------------|------|-------|
| imHCI | `NumeroVisita` | int | Usa NUMEROVISITA de imVisita |
| imInterCtrlMedicamento | `NumeroVisita` | int | Usa NUMEROVISITA de imVisita |
| imHCEvolucion | `IdVisita` | int | ⚠️ Usa un ID diferente, no NumeroVisita |
| imFacPracticas | `NumeroVisita` | int | Usa NUMEROVISITA de imVisita |
| imHCEpicrisis | `IdVisita` | int | ⚠️ Usa un ID diferente, no NumeroVisita |

### Pregunta Pendiente
**¿Cómo se relaciona `IdVisita` con `imVisita`?**
- Opciones:
  1. `IdVisita` podría ser igual a `NUMEROVISITA`
  2. `imVisita` podría tener una columna `IdVisita` que no vimos
  3. Necesitamos verificar con una consulta

**Consulta para verificar:**
```sql
-- Ver si imVisita tiene IdVisita
SELECT TOP 5 
    NUMEROVISITA,
    IDPACIENTE,
    *
FROM imVisita
WHERE NUMEROVISITA IN (43900, 44149, 44305);

-- Comparar con imHCEvolucion
SELECT TOP 5 * FROM imHCEvolucion WHERE IdVisita IN (43900, 44149, 44305);

-- Comparar con imHCEpicrisis  
SELECT TOP 5 * FROM imHCEpicrisis WHERE IdVisita IN (43900, 44149, 44305);
```

## Estructura de Datos

### 1. imHCI (Historia Clínica de Ingreso)
**Campos principales:**
- `IdHCIngreso` (PK)
- `NumeroVisita` (FK)
- `IMPRESIONDIAGNOSTICA` (varchar 8000)
- `COMENTARIODEINGRESO` (varchar 1000)
- Múltiples campos de examen físico (aparato respiratorio, cardiovascular, abdomen, etc.)

**Uso:** Mostrar el examen de ingreso completo

### 2. imInterCtrlMedicamento (Control de Medicamentos)
**Campos principales:**
- `IDCtrlMedica` (PK)
- `NumeroVisita` (FK)
- Campos de medicamentos administrados

**Uso:** Mostrar lista de medicamentos administrados durante la internación

### 3. imHCEvolucion (Evoluciones)
**Campos principales:**
- `IdHCEvolucion` (PK)
- `IdVisita` (FK) ⚠️
- `Fecha` (date)
- `Hora` (int)
- `Evolucion` (varchar 8000)
- `IdProfesional` (int)

**Uso:** Mostrar evoluciones diarias ordenadas por fecha

### 4. imFacPracticas (Prácticas Médicas)
**Campos principales:**
- `Valor` (PK)
- `NumeroVisita` (FK)
- `TipoPractica` (char 2)
- `Practica` (int)
- `FechaPractica` (int - formato Clarion)
- `Observaciones` (varchar 1000)

**Uso:** Mostrar prácticas médicas realizadas

### 5. imHCEpicrisis (Epicrisis)
**Campos principales:**
- `IdHCEpicrisis` (PK)
- `IdVisita` (FK) ⚠️
- `Fecha` (date)
- `Epicrisis` (varchar 8000)
- `Diagnostico` (varchar 8)
- `DiagnosticoText` (varchar 8000)

**Uso:** Mostrar resumen final de la internación

## Implementación Backend

### Paso 1: Crear nuevo servicio `visitDetail.service.js`

```javascript
const { getConnection, sql } = require('../config/db');
const { clarionToDate, clarionToTime } = require('../utils/dateConverter');

class VisitDetailService {
  /**
   * Obtener detalle completo de una visita
   */
  async obtenerDetalleCompleto(numeroVisita) {
    try {
      const pool = await getConnection();
      
      // Obtener datos básicos de la visita
      const visitaBasica = await this.obtenerVisitaBasica(pool, numeroVisita);
      
      if (!visitaBasica) {
        return null;
      }
      
      // Obtener datos relacionados en paralelo
      const [hci, medicamentos, evoluciones, practicas, epicrisis] = await Promise.all([
        this.obtenerHCI(pool, numeroVisita),
        this.obtenerMedicamentos(pool, numeroVisita),
        this.obtenerEvoluciones(pool, numeroVisita),
        this.obtenerPracticas(pool, numeroVisita),
        this.obtenerEpicrisis(pool, numeroVisita)
      ]);
      
      return {
        visita: visitaBasica,
        historiaClinicaIngreso: hci,
        medicamentos: medicamentos,
        evoluciones: evoluciones,
        practicas: practicas,
        epicrisis: epicrisis
      };
    } catch (error) {
      console.error('Error al obtener detalle de visita:', error);
      throw error;
    }
  }
  
  async obtenerVisitaBasica(pool, numeroVisita) {
    // Query para obtener datos básicos de imVisita
  }
  
  async obtenerHCI(pool, numeroVisita) {
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          IdHCIngreso,
          NumeroVisita,
          IMPRESIONDIAGNOSTICA,
          COMENTARIODEINGRESO,
          -- Agregar otros campos relevantes
        FROM imHCI
        WHERE NumeroVisita = @numeroVisita
      `);
    
    return result.recordset[0] || null;
  }
  
  async obtenerMedicamentos(pool, numeroVisita) {
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT *
        FROM imInterCtrlMedicamento
        WHERE NumeroVisita = @numeroVisita
        ORDER BY Fecha DESC, Hora DESC
      `);
    
    return result.recordset;
  }
  
  async obtenerEvoluciones(pool, numeroVisita) {
    // ⚠️ NOTA: Verificar si IdVisita = NumeroVisita
    const result = await pool.request()
      .input('idVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          IdHCEvolucion,
          IdVisita,
          Fecha,
          Hora,
          Evolucion,
          IdProfesional
        FROM imHCEvolucion
        WHERE IdVisita = @idVisita
        ORDER BY Fecha DESC, Hora DESC
      `);
    
    return result.recordset.map(e => ({
      id: e.IdHCEvolucion,
      fecha: e.Fecha,
      hora: e.Hora ? clarionToTime(e.Hora) : '',
      evolucion: e.Evolucion || '',
      profesional: e.IdProfesional
    }));
  }
  
  async obtenerPracticas(pool, numeroVisita) {
    const result = await pool.request()
      .input('numeroVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          Valor,
          NumeroVisita,
          TipoPractica,
          Practica,
          FechaPractica,
          Observaciones
        FROM imFacPracticas
        WHERE NumeroVisita = @numeroVisita
        ORDER BY FechaPractica DESC
      `);
    
    return result.recordset.map(p => ({
      id: p.Valor,
      tipo: p.TipoPractica,
      practica: p.Practica,
      fecha: p.FechaPractica ? clarionToDate(p.FechaPractica) : null,
      observaciones: p.Observaciones || ''
    }));
  }
  
  async obtenerEpicrisis(pool, numeroVisita) {
    // ⚠️ NOTA: Verificar si IdVisita = NumeroVisita
    const result = await pool.request()
      .input('idVisita', sql.Int, numeroVisita)
      .query(`
        SELECT 
          IdHCEpicrisis,
          IdVisita,
          Fecha,
          Epicrisis,
          Diagnostico,
          DiagnosticoText
        FROM imHCEpicrisis
        WHERE IdVisita = @idVisita
      `);
    
    const e = result.recordset[0];
    if (!e) return null;
    
    return {
      id: e.IdHCEpicrisis,
      fecha: e.Fecha,
      epicrisis: e.Epicrisis || '',
      diagnostico: e.Diagnostico || '',
      diagnosticoTexto: e.DiagnosticoText || ''
    };
  }
}

module.exports = new VisitDetailService();
```

### Paso 2: Crear controlador y ruta

**Controller:** `visitDetail.controller.js`
```javascript
const visitDetailService = require('../services/visitDetail.service');

class VisitDetailController {
  async obtenerDetalleCompleto(req, res) {
    try {
      const { numeroVisita } = req.params;
      
      const detalle = await visitDetailService.obtenerDetalleCompleto(numeroVisita);
      
      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Visita no encontrada'
        });
      }
      
      res.json({
        success: true,
        data: detalle
      });
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener detalle de visita'
      });
    }
  }
}

module.exports = new VisitDetailController();
```

**Route:** Agregar a `visits.routes.js`
```javascript
// GET /api/visits/:numeroVisita/detalle
router.get('/:numeroVisita/detalle', visitsController.obtenerDetalleCompleto);
```

## Implementación Frontend

### Paso 1: Crear tipos TypeScript

**`types/visitDetail.ts`**
```typescript
export interface HistoriaClinicaIngreso {
  id: number;
  impresionDiagnostica: string;
  comentarioIngreso: string;
  // ... otros campos
}

export interface Medicamento {
  id: number;
  // ... campos de medicamento
}

export interface Evolucion {
  id: number;
  fecha: string;
  hora: string;
  evolucion: string;
  profesional: number;
}

export interface Practica {
  id: number;
  tipo: string;
  practica: number;
  fecha: string | null;
  observaciones: string;
}

export interface Epicrisis {
  id: number;
  fecha: string;
  epicrisis: string;
  diagnostico: string;
  diagnosticoTexto: string;
}

export interface VisitDetail {
  visita: VisitBasic;
  historiaClinicaIngreso: HistoriaClinicaIngreso | null;
  medicamentos: Medicamento[];
  evoluciones: Evolucion[];
  practicas: Practica[];
  epicrisis: Epicrisis | null;
}
```

### Paso 2: Crear servicio

**`services/visitDetailService.ts`**
```typescript
import { VisitDetail } from '@/types/visitDetail';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class VisitDetailService {
  async obtenerDetalleCompleto(numeroVisita: string): Promise<VisitDetail> {
    const token = authService.getToken();
    
    if (!token) {
      throw new Error('No autenticado');
    }

    const response = await fetch(`${API_URL}/visits/${numeroVisita}/detalle`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener detalle');
    }

    return data.data;
  }
}

export default new VisitDetailService();
```

### Paso 3: Crear componente de detalle

**`app/dashboard/visits/[id]/page.tsx`**
```typescript
'use client';

import { use, useState, useEffect } from 'react';
import visitDetailService from '@/services/visitDetailService';
import { VisitDetail } from '@/types/visitDetail';
import styles from './styles.module.css';

export default function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detalle, setDetalle] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('evolucion');

  useEffect(() => {
    const cargarDetalle = async () => {
      try {
        const data = await visitDetailService.obtenerDetalleCompleto(id);
        setDetalle(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDetalle();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (!detalle) return <div>Visita no encontrada</div>;

  return (
    <div className={styles.container}>
      <h1>Detalle de Visita #{detalle.visita.numeroVisita}</h1>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        <button onClick={() => setActiveTab('evolucion')}>Evoluciones</button>
        <button onClick={() => setActiveTab('practicas')}>Prácticas</button>
        <button onClick={() => setActiveTab('medicamentos')}>Medicamentos</button>
        <button onClick={() => setActiveTab('ingreso')}>HC Ingreso</button>
        <button onClick={() => setActiveTab('epicrisis')}>Epicrisis</button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {activeTab === 'evolucion' && (
          <div>
            <h2>Evoluciones</h2>
            {detalle.evoluciones.map(ev => (
              <div key={ev.id} className={styles.evolucionCard}>
                <div className={styles.evolucionHeader}>
                  <span>{ev.fecha}</span>
                  <span>{ev.hora}</span>
                </div>
                <p>{ev.evolucion}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'practicas' && (
          <div>
            <h2>Prácticas Médicas</h2>
            {/* Mostrar prácticas */}
          </div>
        )}

        {/* ... otros tabs */}
      </div>
    </div>
  );
}
```

## Próximos Pasos

1. **URGENTE: Verificar relación IdVisita**
   - Ejecutar consultas de verificación
   - Confirmar si `IdVisita` = `NUMEROVISITA`

2. **Implementar backend**
   - Crear `visitDetail.service.js`
   - Crear `visitDetail.controller.js`
   - Agregar ruta

3. **Implementar frontend**
   - Crear tipos TypeScript
   - Crear servicio
   - Crear página de detalle con tabs

4. **Testing**
   - Probar con diferentes visitas
   - Verificar que todos los datos se muestren correctamente

## Consulta de Verificación Necesaria

```sql
-- Ejecutar esta consulta para verificar la relación IdVisita
SELECT 
    v.NUMEROVISITA,
    v.IDPACIENTE,
    (SELECT COUNT(*) FROM imHCEvolucion WHERE IdVisita = v.NUMEROVISITA) as EvolucionesConNumeroVisita,
    (SELECT COUNT(*) FROM imHCEpicrisis WHERE IdVisita = v.NUMEROVISITA) as EpicrisisConNumeroVisita
FROM imVisita v
WHERE v.NUMEROVISITA IN (43900, 44149, 44305);
```

Si los conteos son > 0, entonces `IdVisita` = `NUMEROVISITA` ✅
