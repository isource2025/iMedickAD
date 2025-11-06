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
