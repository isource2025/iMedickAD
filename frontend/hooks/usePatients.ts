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
