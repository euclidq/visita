import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Button, Input, Select, Space } from 'antd';
import { RefreshCw } from 'lucide-react';

import useOpenNotification from '../../../shared/hooks/useOpenNotification';
import { formatVisitStatus, VISIT_STATUS_OPTIONS } from '../../../shared/constants/colors';
import type { Visit, VisitTableRow } from '../types';
import ApprovalConfirmationModal from './ApprovalConfirmationModal';
import RegistrationDetailsModal from './RegistrationDetailsModal';
import RejectionReasonModal from './RejectionReasonModal';
import VisitorRegistrationsTable from './VisitorRegistrationsTable';

interface VisitorRegistrationsPanelProps {
  heading: string;
  pageSize: number;
  initialStatus?: string;
  activeOnly?: boolean;
  showFilters?: boolean;
  searchId?: string;
  statusId?: string;
  refreshKey?: number;
  onVisitUpdated?: () => void;
}

const VisitorRegistrationsPanel = ({
  heading,
  pageSize,
  initialStatus = '',
  activeOnly = false,
  showFilters = true,
  searchId = 'Search',
  statusId = 'Status',
  refreshKey = 0,
  onVisitUpdated,
}: VisitorRegistrationsPanelProps) => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [visits, setVisits] = useState<VisitTableRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [sortField, setSortField] = useState(activeOnly ? 'checkInAt' : 'createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingVisitId, setViewingVisitId] = useState<string>();
  const [selectedVisit, setSelectedVisit] = useState<Visit>();
  const [updatingVisitId, setUpdatingVisitId] = useState<string>();
  const [approvalVisitId, setApprovalVisitId] = useState<string>();
  const [rejectionVisitId, setRejectionVisitId] = useState<string>();

  const fetchVisits = useCallback(async (showSuccessNotification = false) => {
    setIsLoading(true);

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/visit`, {
        params: {
          page,
          limit: pageSize,
          search,
          status: activeOnly || !status || status === 'ALL' ? undefined : status,
          active: activeOnly || undefined,
          sortField,
          sortOrder: sortOrder === 'ascend' ? 'asc' : 'desc',
        },
        withCredentials: true,
      });

      setVisits(response.data.data);
      setTotal(response.data.pagination.total);

      if (showSuccessNotification) {
        openNotification('success', response.data.title, response.data.message);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await navigate({ to: '/admin/login' });
      } else {
        openApiError(error, 'Unable to Load Registrations', 'Unable to load registrations');
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeOnly, navigate, openApiError, openNotification, page, pageSize, search, sortField, sortOrder, status]);

  useEffect(() => {
    void refreshKey;
    void fetchVisits();
  }, [fetchVisits, refreshKey]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchVisits(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleView = async (visitId: string) => {
    setViewingVisitId(visitId);
    setSelectedVisit(undefined);

    try {
      const response = await axios.get<{ data: Visit }>(
        `${import.meta.env.VITE_API_URL}/visit/${visitId}`,
        { withCredentials: true },
      );
      setSelectedVisit(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await navigate({ to: '/admin/login' });
      } else {
        openApiError(error, 'Unable to Load Registration', 'Unable to load registration details');
      }
    } finally {
      setViewingVisitId(undefined);
    }
  };

  const handleStatusUpdate = async (
    visitId: string,
    nextStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) => {
    setUpdatingVisitId(visitId);

    try {
      const response = await axios.patch<{ title: string; message: string; data: Visit }>(
        `${import.meta.env.VITE_API_URL}/visit/${visitId}/status`,
        { status: nextStatus, rejectionReason },
        { withCredentials: true },
      );

      setSelectedVisit(response.data.data);
      setApprovalVisitId(undefined);
      setRejectionVisitId(undefined);
      await fetchVisits();
      onVisitUpdated?.();
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await navigate({ to: '/admin/login' });
      } else {
        openApiError(error, 'Status Update Failed', 'Unable to update visit status');
      }
    } finally {
      setUpdatingVisitId(undefined);
    }
  };

  const handleVisitAction = async (visitId: string, action: 'check-in' | 'check-out') => {
    setUpdatingVisitId(visitId);

    try {
      const response = await axios.patch<{ title: string; message: string; data: Visit }>(
        `${import.meta.env.VITE_API_URL}/visit/${visitId}/${action}`,
        {},
        { withCredentials: true },
      );

      setSelectedVisit(response.data.data);
      await fetchVisits();
      onVisitUpdated?.();
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await navigate({ to: '/admin/login' });
      } else {
        openApiError(
          error,
          action === 'check-in' ? 'Check-in Failed' : 'Check-out Failed',
          `Unable to ${action} visitor`,
        );
      }
    } finally {
      setUpdatingVisitId(undefined);
    }
  };

  return (
    <>
      {contextHolder}
      <section aria-label={heading} className="card flex w-full flex-col gap-4">
        <h2>{heading}</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          {showFilters ? (
            <Space wrap>
              <Input.Search
                id={searchId}
                allowClear
                placeholder="Search registrations"
                onSearch={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
              />
              <Select
                id={statusId}
                allowClear
                virtual={false}
                placeholder="All statuses"
                value={status || undefined}
                className="w-44"
                options={[
                  { value: 'ALL', label: 'ALL STATUSES' },
                  ...VISIT_STATUS_OPTIONS.map((value) => ({
                    value,
                    label: formatVisitStatus(value),
                  })),
                ]}
                onChange={(value) => {
                  setPage(1);
                  setStatus(value ?? '');
                }}
              />
            </Space>
          ) : <span />}
          <Button
            icon={<RefreshCw size={16} />}
            loading={isRefreshing}
            onClick={() => void handleRefresh()}
          >
            Refresh
          </Button>
        </div>

        <VisitorRegistrationsTable
          visits={visits}
          page={page}
          pageSize={pageSize}
          total={total}
          sortField={sortField}
          sortOrder={sortOrder}
          isLoading={isLoading}
          viewingVisitId={viewingVisitId}
          onPageChange={setPage}
          onSortChange={(field, order) => {
            setPage(1);
            setSortField(field);
            setSortOrder(order);
          }}
          onView={(visitId) => void handleView(visitId)}
        />
      </section>

      <RegistrationDetailsModal
        visit={selectedVisit}
        isUpdating={updatingVisitId === selectedVisit?._id}
        onClose={() => setSelectedVisit(undefined)}
        onApprove={setApprovalVisitId}
        onReject={setRejectionVisitId}
        onCheckIn={(visitId) => void handleVisitAction(visitId, 'check-in')}
        onCheckOut={(visitId) => void handleVisitAction(visitId, 'check-out')}
      />
      <ApprovalConfirmationModal
        open={Boolean(approvalVisitId)}
        isLoading={updatingVisitId === approvalVisitId}
        onCancel={() => setApprovalVisitId(undefined)}
        onConfirm={() => approvalVisitId
          && void handleStatusUpdate(approvalVisitId, 'APPROVED')}
      />
      <RejectionReasonModal
        visitId={rejectionVisitId}
        isLoading={updatingVisitId === rejectionVisitId}
        onCancel={() => setRejectionVisitId(undefined)}
        onReject={(reason) => rejectionVisitId
          && void handleStatusUpdate(rejectionVisitId, 'REJECTED', reason)}
      />
    </>
  );
};

export default VisitorRegistrationsPanel;
