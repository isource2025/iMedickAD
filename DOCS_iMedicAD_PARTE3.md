# iMedicAD - Sistema de Auditorías Médicas
## Documentación Técnica Completa - Parte 3: Frontend React/Next.js

---

## 7. Frontend - Configuración Inicial

### 7.1 Crear Proyecto Next.js

```bash
# Crear proyecto Next.js con TypeScript
npx create-next-app@latest frontend --typescript --app --no-tailwind --no-src-dir

cd frontend

# Instalar dependencias adicionales
npm install
```

### 7.2 Configuración package.json (Frontend)

```json
{
  "name": "imedicad-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### 7.3 Variables de Entorno Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 8. Tipos TypeScript

### 8.1 Tipos de Autenticación (types/auth.ts)

```typescript
export interface LoginCredentials {
  usuario: string;
  password: string;
}

export interface User {
  idUsuario: number;
  usuario: string;
  nombre: string;
  email: string;
  hospitalAsignado: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### 8.2 Tipos de Pacientes (types/patient.ts)

```typescript
export interface Patient {
  numeroDocumento: string;
  apellidoNombre: string;
  fechaNacimiento: string | null;
  sexo: string;
  telefono: string;
  domicilio: string;
  localidad?: string;
  email: string;
  totalVisitas: number;
}

export interface PatientsResponse {
  data: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
```

### 8.3 Tipos de Visitas (types/visit.ts)

```typescript
export interface Visit {
  numeroVisita: string;
  numeroDocumento: string;
  fechaAdmision: string | null;
  horaAdmision: string;
  fechaEgreso: string | null;
  horaEgreso: string;
  hospital: string;
  sector: string;
  clasePaciente: string;
  tipoIngreso: string;
  estado: string;
  observaciones: string;
  diagnostico: string;
  tipoDiagnostico: string;
}

export interface VisitDetail extends Visit {
  paciente: {
    apellidoNombre: string;
    fechaNacimiento: string | null;
    sexo: string;
  };
}

export interface VisitsResponse {
  data: Visit[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}
```

---

## 9. Servicios Frontend

### 9.1 Servicio de Autenticación (services/authService.ts)

```typescript
import { LoginCredentials, AuthResponse, User } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class AuthService {
  /**
   * Login de usuario
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en autenticación');
      }

      // Guardar token en localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Verificar token
   */
  async verifyToken(token: string): Promise<User> {
    try {
      const response = await fetch(`${API_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token inválido');
      }

      return data.data;
    } catch (error) {
      console.error('Error al verificar token:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Obtener token del localStorage
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  /**
   * Obtener usuario del localStorage
   */
  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }
}

export default new AuthService();
```

### 9.2 Servicio de Pacientes (services/patientService.ts)

```typescript
import { PatientsResponse, Patient } from '@/types/patient';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class PatientService {
  /**
   * Buscar pacientes
   */
  async buscarPacientes(
    search: string = '',
    page: number = 1,
    limit: number = 30
  ): Promise<PatientsResponse> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_URL}/patients?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar pacientes');
      }

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      throw error;
    }
  }

  /**
   * Obtener paciente por documento
   */
  async obtenerPaciente(numeroDocumento: string): Promise<Patient> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/patients/${numeroDocumento}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener paciente');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw error;
    }
  }
}

export default new PatientService();
```

### 9.3 Servicio de Visitas (services/visitService.ts)

```typescript
import { VisitsResponse, VisitDetail } from '@/types/visit';
import authService from './authService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class VisitService {
  /**
   * Obtener visitas de un paciente
   */
  async obtenerVisitasPorPaciente(
    numeroDocumento: string,
    page: number = 1,
    limit: number = 50
  ): Promise<VisitsResponse> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${API_URL}/visits/patient/${numeroDocumento}?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener visitas');
      }

      return {
        data: data.data,
        pagination: data.pagination,
      };
    } catch (error) {
      console.error('Error al obtener visitas:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de una visita
   */
  async obtenerVisita(numeroVisita: string): Promise<VisitDetail> {
    try {
      const token = authService.getToken();
      
      if (!token) {
        throw new Error('No autenticado');
      }

      const response = await fetch(`${API_URL}/visits/${numeroVisita}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener visita');
      }

      return data.data;
    } catch (error) {
      console.error('Error al obtener visita:', error);
      throw error;
    }
  }
}

export default new VisitService();
```

---

## 10. Custom Hooks

### 10.1 Hook de Autenticación (hooks/useAuth.ts)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { User, LoginCredentials } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si hay sesión activa
    const storedToken = authService.getToken();
    const storedUser = authService.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      router.push('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };
}
```

### 10.2 Hook de Pacientes (hooks/usePatients.ts)

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import patientService from '@/services/patientService';
import { Patient } from '@/types/patient';

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPatients = useCallback(async () => {
    if (search.length > 0 && search.length < 3) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await patientService.buscarPacientes(
        search,
        currentPage,
        30
      );

      setPatients(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
    } catch (err: any) {
      setError(err.message || 'Error al cargar pacientes');
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    patients,
    isLoading,
    error,
    search,
    currentPage,
    totalPages,
    totalCount,
    handleSearch,
    handlePageChange,
    refetch: fetchPatients,
  };
}
```

### 10.3 Hook de Visitas (hooks/useVisits.ts)

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import visitService from '@/services/visitService';
import { Visit } from '@/types/visit';

export function useVisits(numeroDocumento: string) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVisits = useCallback(async () => {
    if (!numeroDocumento) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await visitService.obtenerVisitasPorPaciente(
        numeroDocumento,
        currentPage,
        50
      );

      setVisits(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
    } catch (err: any) {
      setError(err.message || 'Error al cargar visitas');
      setVisits([]);
    } finally {
      setIsLoading(false);
    }
  }, [numeroDocumento, currentPage]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    visits,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    handlePageChange,
    refetch: fetchVisits,
  };
}
```

---

**Continúa en DOCS_iMedicAD_PARTE4.md**
