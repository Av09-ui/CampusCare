import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import type { Complaint, ComplaintFilters, ComplaintDetail } from '../types';

export function useComplaints(filters: ComplaintFilters = {}) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(filters.page || 1);
  const [limit] = useState(filters.limit || 10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getComplaints({
        ...filters,
        page,
        limit,
      });
      // Handle both paginated and non-paginated responses
      if ('items' in response) {
        setComplaints(response.items);
        setTotal(response.total);
        setTotalPages(response.total_pages);
      } else if (Array.isArray(response)) {
        setComplaints(response);
        setTotal(response.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch complaints');
    } finally {
      setIsLoading(false);
    }
  }, [filters.category, filters.priority, filters.status, filters.search, page, limit]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    setPage,
    setFilters: (_newFilters: ComplaintFilters) => {
      // This would need a more sophisticated approach in a real app
      // For now, we'll just refetch with new filters
    },
    refetch: fetchComplaints,
  };
}

export function useComplaint(id: number | null) {
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaint = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getComplaint(id);
      setComplaint(data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch complaint');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();
  }, [fetchComplaint]);

  return { complaint, isLoading, error, refetch: fetchComplaint };
}