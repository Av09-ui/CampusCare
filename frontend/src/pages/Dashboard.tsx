import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../hooks/useComplaints';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card } from '../components/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Textarea } from '../components/Textarea';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { api } from '../api';
import type { ComplaintFilters } from '../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'FACILITIES', label: 'Facilities' },
  { value: 'IT', label: 'IT & Technology' },
  { value: 'HOUSING', label: 'Housing' },
  { value: 'FOOD', label: 'Food Services' },
  { value: 'SAFETY', label: 'Safety & Security' },
  { value: 'OTHER', label: 'Other' },
];

export function Dashboard() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState<ComplaintFilters>({
    category: '',
    priority: '',
    status: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { complaints, total, page, totalPages, isLoading, refetch } = useComplaints(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof ComplaintFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSupport = async (complaintId: number) => {
    try {
      await api.supportComplaint(complaintId);
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to support complaint');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAdminAction = async (complaintId: number, action: string) => {
    try {
      switch (action) {
        case 'assign':
          await api.assignComplaint(complaintId);
          break;
        case 'in_progress':
          await api.updateComplaintStatus(complaintId, 'IN_PROGRESS');
          break;
        case 'resolve':
          const resolution = prompt('Enter resolution details:');
          if (resolution) {
            await api.resolveComplaint(complaintId, resolution);
          }
          break;
      }
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || `Failed to ${action} complaint`);
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const limit = filters.limit ?? 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View and manage complaints
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Complaint
          </Button>
        )}
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}

      {/* Search & Filters */}
      <Card padding="md">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search complaints..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Select
                options={CATEGORY_OPTIONS}
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-48"
              />
              <Select
                options={PRIORITY_OPTIONS}
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-40"
              />
              <Select
                options={STATUS_OPTIONS}
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </form>
      </Card>

      {/* Complaints List */}
      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No complaints found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filters.search || filters.category || filters.priority || filters.status 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating a new complaint'}
            </p>
            {!isAdmin && !filters.search && !filters.category && !filters.priority && !filters.status && (
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                Create Complaint
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Complaint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Support
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link 
                          to={`/complaints/${complaint.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          #{complaint.id} - {complaint.description.substring(0, 60)}{complaint.description.length > 60 ? '...' : ''}
                        </Link>
                        {complaint.student_email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By {complaint.student_email}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CategoryBadge category={complaint.category} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PriorityBadge priority={complaint.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {complaint.support_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(complaint.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/complaints/${complaint.id}`}
                            className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </Link>
                          {!isAdmin && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSupport(complaint.id)}
                            >
                              Support
                            </Button>
                          )}
                          {isAdmin && (
                            <select
                              className="text-sm border border-gray-300 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 dark:border-gray-600"
                              onChange={(e) => e.target.value && handleAdminAction(complaint.id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Actions</option>
                              <option value="assign">Assign</option>
                              <option value="in_progress">Mark In Progress</option>
                              <option value="resolve">Resolve</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Create Complaint Modal */}
      <CreateComplaintModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
    </div>
  );
}

// Create Complaint Modal Component
function CreateComplaintModal({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
}) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please enter a complaint description');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await api.createComplaint(description.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create complaint');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Complaint" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe the issue
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the problem you're experiencing in detail..."
            rows={6}
            disabled={isLoading}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Be specific about the location, time, and nature of the issue.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Submit Complaint
          </Button>
        </div>
      </form>
    </Modal>
  );
}