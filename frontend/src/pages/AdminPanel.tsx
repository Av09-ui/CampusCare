import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../hooks/useComplaints';
import { api } from '../api';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Input } from '../components/Input';
import { Select } from '../components/Select';

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

export function AdminPanel() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState({
    category: '',
    priority: '',
    status: '',
    search: '',
    page: 1,
    limit: 15,
  });
  const [selectedComplaints, setSelectedComplaints] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { complaints, total, page, totalPages, isLoading, refetch } = useComplaints(filters);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedComplaints(complaints.map(c => c.id));
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectComplaint = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedComplaints(prev => [...prev, id]);
    } else {
      setSelectedComplaints(prev => prev.filter(c => c !== id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedComplaints.length === 0) return;
    
    setIsBulkProcessing(true);
    setError(null);
    setSuccess(null);
    
    try {
      for (const id of selectedComplaints) {
        switch (bulkAction) {
          case 'assign':
            await api.assignComplaint(id);
            break;
          case 'in_progress':
            await api.updateComplaintStatus(id, 'IN_PROGRESS');
            break;
          case 'resolved':
            await api.updateComplaintStatus(id, 'RESOLVED');
            break;
          case 'closed':
            await api.updateComplaintStatus(id, 'CLOSED');
            break;
        }
      }
      setSuccess(`Successfully updated ${selectedComplaints.length} complaints`);
      setSelectedComplaints([]);
      setBulkAction('');
      refetch();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Bulk action failed');
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleSingleAction = async (complaintId: number, action: string) => {
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

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Alert type="error" message="Access denied. Admin privileges required." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage all complaints and perform administrative actions
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onDismiss={() => setError(null)} />}
      {success && <Alert type="success" message={success} onDismiss={() => setSuccess(null)} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={total} icon="📋" />
        <StatCard 
          title="Pending" 
          value={complaints.filter(c => c.status === 'PENDING').length} 
          icon="⏳" 
          color="warning"
        />
        <StatCard 
          title="In Progress" 
          value={complaints.filter(c => c.status === 'IN_PROGRESS').length} 
          icon="🔧" 
          color="info"
        />
        <StatCard 
          title="Resolved" 
          value={complaints.filter(c => c.status === 'RESOLVED').length} 
          icon="✅" 
          color="success"
        />
      </div>

      {/* Filters */}
      <Card padding="md">
        <form className="space-y-4">
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

      {/* Complaints Table */}
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
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {/* Bulk Actions Bar */}
            {selectedComplaints.length > 0 && (
              <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedComplaints.length} complaint(s) selected
                </span>
                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Action...</option>
                    <option value="assign">Assign</option>
                    <option value="in_progress">Mark In Progress</option>
                    <option value="resolved">Mark Resolved</option>
                    <option value="closed">Mark Closed</option>
                  </select>
                  <Button 
                    size="sm" 
                    onClick={handleBulkAction} 
                    isLoading={isBulkProcessing}
                    disabled={!bulkAction}
                  >
                    Apply
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedComplaints([])}>
                    Clear
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={complaints.length > 0 && selectedComplaints.length === complaints.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Select all complaints"
                      />
                    </th>
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
                      Student
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
                        <input
                          type="checkbox"
                          checked={selectedComplaints.includes(complaint.id)}
                          onChange={(e) => handleSelectComplaint(complaint.id, e)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={`/complaints/${complaint.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          #{complaint.id} - {complaint.description.substring(0, 60)}{complaint.description.length > 60 ? '...' : ''}
                        </a>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {complaint.student_email || 'Unknown'}
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
                          <a
                            href={`/complaints/${complaint.id}`}
                            className="text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </a>
                          <select
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700"
                            defaultValue=""
                            onChange={(e) => e.target.value && handleSingleAction(complaint.id, e.target.value)}
                          >
                            <option value="" disabled>Actions</option>
                            <option value="assign">Assign</option>
                            <option value="in_progress">Mark In Progress</option>
                            <option value="resolve">Resolve</option>
                          </select>
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
                  Showing {((page - 1) * filters.limit) + 1} to {Math.min(page * filters.limit, total)} of {total} results
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
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon, color = 'default' }: { 
  title: string; 
  value: number; 
  icon: string; 
  color?: 'default' | 'success' | 'warning' | 'info';
}) {
  const colorClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    info: 'bg-purple-500',
  };

  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
}

