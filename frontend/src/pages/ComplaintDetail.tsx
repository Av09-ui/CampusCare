import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useComplaint } from '../hooks/useComplaints';
import { api } from '../api';
import { Button } from '../components/Button';
import { Card, CardHeader } from '../components/Card';
import { Badge, StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { Modal } from '../components/Modal';
import { Textarea } from '../components/Textarea';
import type { ComplaintDetail, ProgressUpdate, Support } from '../types';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const complaintId = parseInt(id || '0', 10);
  
  const { complaint, isLoading, error, refetch } = useComplaint(complaintId);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveText, setResolveText] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState('');
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [supportComment, setSupportComment] = useState('');
  const [isSupporting, setIsSupporting] = useState(false);
  const [supportError, setSupportError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSupport = async () => {
    if (!user) return;
    setIsSupporting(true);
    setSupportError(null);
    try {
      await api.supportComplaint(complaintId, supportComment || undefined);
      setSupportComment('');
      refetch();
    } catch (err: any) {
      setSupportError(err.response?.data?.error?.message || 'Failed to support complaint');
    } finally {
      setIsSupporting(false);
    }
  };

  const handleAddProgress = async () => {
    if (!progressMessage.trim()) return;
    setIsAddingProgress(true);
    try {
      await api.addProgressUpdate(complaintId, progressMessage.trim());
      setProgressMessage('');
      refetch();
    } catch (err: any) {
      setStatusError(err.response?.data?.error?.message || 'Failed to add progress update');
    } finally {
      setIsAddingProgress(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await api.updateComplaintStatus(complaintId, newStatus);
      refetch();
    } catch (err: any) {
      setStatusError(err.response?.data?.error?.message || 'Failed to update status');
    }
  };

  const handleResolve = async () => {
    if (!resolveText.trim()) {
      setResolveError('Please provide resolution details');
      return;
    }
    setIsResolving(true);
    setResolveError(null);
    try {
      await api.resolveComplaint(complaintId, resolveText.trim());
      setShowResolveModal(false);
      setResolveText('');
      refetch();
    } catch (err: any) {
      setResolveError(err.response?.data?.error?.message || 'Failed to resolve complaint');
    } finally {
      setIsResolving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="text-center py-12">
        <Alert type="error" message={error || 'Complaint not found'} />
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isOwner = user && complaint.student_id === user.id;
  const canSupport = user && user.role === 'STUDENT' && !isOwner && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED';
  const hasSupported = user && complaint.supports?.some(s => s.student_id === user.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            #{complaint.id} - {complaint.description.substring(0, 80)}{complaint.description.length > 80 ? '...' : ''}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <CategoryBadge category={complaint.category} />
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {statusError && <Alert type="error" message={statusError} onDismiss={() => setStatusError(null)} />}
      {supportError && <Alert type="error" message={supportError} onDismiss={() => setSupportError(null)} />}
      {resolveError && <Alert type="error" message={resolveError} onDismiss={() => setResolveError(null)} />}

      {/* Main Complaint Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Submitted by: <span className="font-medium text-gray-900 dark:text-white">{complaint.student_email || 'Unknown'}</span></span>
            <span>•</span>
            <span>Created: <span className="font-medium text-gray-900 dark:text-white">{formatDate(complaint.created_at)}</span></span>
            {complaint.updated_at !== complaint.created_at && (
              <>
                <span>•</span>
                <span>Updated: <span className="font-medium text-gray-900 dark:text-white">{formatDate(complaint.updated_at)}</span></span>
              </>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{complaint.description}</p>
          </div>

          {complaint.ai_category && complaint.ai_priority && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">AI Analysis</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Category:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">{complaint.ai_category}</span>
                </div>
                <div>
                  <span className="text-blue-700 dark:text-blue-300">Priority:</span>
                  <span className="ml-2 font-medium text-blue-900 dark:text-blue-100">{complaint.ai_priority}</span>
                </div>
              </div>
            </div>
          )}

          {complaint.similarity_matches && complaint.similarity_matches.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">Similar Complaints Found</h4>
              <ul className="space-y-2">
                {complaint.similarity_matches.map((match) => (
                  <li key={match.id} className="text-sm">
                    <Link 
                      to={`/complaints/${match.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      #{match.id} - {match.description.substring(0, 60)}{match.description.length > 60 ? '...' : ''}
                    </Link>
                    <span className="ml-2 text-yellow-700 dark:text-yellow-300 text-xs">
                      ({Math.round(match.similarity_score * 100)}% similar)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* Support Section */}
      {canSupport && !hasSupported && (
        <Card>
          <CardHeader title="Support This Complaint" subtitle="Indicate you experience the same issue" />
          <div className="space-y-4">
            <Textarea
              value={supportComment}
              onChange={(e) => setSupportComment(e.target.value)}
              placeholder="Optional: Add a comment about your experience..."
              rows={3}
            />
            <Button onClick={handleSupport} isLoading={isSupporting}>
              I Have This Problem Too
            </Button>
          </div>
        </Card>
      )}

      {hasSupported && (
        <Card>
          <CardHeader title="You Support This Complaint" subtitle="Thank you for adding your voice" />
          <Badge variant="success">Supported</Badge>
        </Card>
      )}

      {isOwner && (
        <Card>
          <CardHeader title="Your Complaint" subtitle="You submitted this complaint" />
          <Badge variant="info">Owner</Badge>
        </Card>
      )}

      {/* Progress Updates */}
      <Card>
        <CardHeader 
          title="Progress Updates" 
          subtitle={`${complaint.progress_updates?.length || 0} updates`}
          action={isAdmin && (
            <div className="space-y-2">
              <Textarea
                value={progressMessage}
                onChange={(e) => setProgressMessage(e.target.value)}
                placeholder="Add a progress update..."
                rows={2}
                className="w-80"
              />
              <Button size="sm" onClick={handleAddProgress} isLoading={isAddingProgress}>
                Add Update
              </Button>
            </div>
          )}
        />
        <div className="space-y-4">
          {complaint.progress_updates?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No progress updates yet</p>
          ) : (
            complaint.progress_updates?.map((update: ProgressUpdate) => (
              <div key={update.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {update.admin_email || 'Admin'} • {formatDate(update.created_at)}
                  </p>
                </div>
                <p className="mt-1">{update.message}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Supports */}
      <Card>
        <CardHeader title="Supporters" subtitle={`${complaint.supports?.length || 0} students affected`} />
        <div className="space-y-3">
          {complaint.supports?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No supporters yet</p>
          ) : (
            complaint.supports?.map((support: Support) => (
              <div key={support.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">{support.student_email}</span>
                    <span className="text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{formatDate(support.created_at)}</span>
                  </div>
                  {support.comment && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{support.comment}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Resolution */}
      {complaint.resolution && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardHeader title="Resolution" subtitle="This complaint has been resolved" />
          <div className="prose dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{complaint.resolution.resolution_text}</p>
          </div>
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Resolved by {complaint.resolution.admin_email || 'Admin'} on {formatDate(complaint.resolution.resolved_at)}
          </div>
        </Card>
      )}

      {/* Admin Actions */}
      {isAdmin && complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
        <Card>
          <CardHeader title="Admin Actions" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Update Status
              </label>
              <select
                className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={complaint.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="danger" 
                onClick={() => setShowResolveModal(true)}
              >
                Mark as Resolved
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Resolve Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Resolve Complaint"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Please provide resolution details before marking this complaint as resolved.</p>
          {resolveError && <Alert type="error" message={resolveError} onDismiss={() => setResolveError(null)} />}
          <Textarea
            value={resolveText}
            onChange={(e) => setResolveText(e.target.value)}
            placeholder="Describe how this issue was resolved..."
            rows={4}
            label="Resolution Details"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={() => setShowResolveModal(false)} disabled={isResolving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResolve} isLoading={isResolving}>
              Resolve
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}