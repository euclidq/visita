import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Button, Input, Select, Space } from 'antd';
import { RefreshCw } from 'lucide-react';

import Header from '../../shared/components/Header';
import useOpenNotification from '../../shared/hooks/useOpenNotification';
import AdminNavbar from './AdminNavbar';
import ApprovalConfirmationModal from './components/ApprovalConfirmationModal';
import RegistrationDetailsModal from './components/RegistrationDetailsModal';
import RejectionReasonModal from './components/RejectionReasonModal';
import VisitorRegistrationsTable from './components/VisitorRegistrationsTable';
import type { Visit, VisitTableRow } from './types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [visits, setVisits] = useState<VisitTableRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('PENDING');
  const [sortField, setSortField] = useState('createdAt');
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
          limit: 5,
          search,
          status,
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
  }, [navigate, openApiError, openNotification, page, search, sortField, sortOrder, status]);

  useEffect(() => {
    void fetchVisits();
  }, [fetchVisits]);

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

      setSelectedVisit((current) => current?._id === visitId ? response.data.data : current);
      setApprovalVisitId(undefined);
      setRejectionVisitId(undefined);
      await fetchVisits();
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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNavbar />
      {contextHolder}

      <div className="container max-w-7xl space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="card flex flex-col gap-4 w-full">
          <h2>Visitor Registrations</h2>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Space wrap>
              <Input.Search
                id="Search"
                allowClear
                placeholder="Search registrations"
                onSearch={(value) => {
                  setPage(1);
                  setSearch(value);
                }}
              />
              <Select
                id="Status"
                allowClear
                virtual={false}
                placeholder="All statuses"
                value={status}
                className="w-44"
                options={['PENDING', 'APPROVED', 'REJECTED'].map((value) => ({
                  value,
                  label: value,
                }))}
                onChange={(value) => {
                  setPage(1);
                  setStatus(value);
                }}
              />
            </Space>
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
        </div>
      </div>

      <RegistrationDetailsModal
        visit={selectedVisit}
        isUpdating={updatingVisitId === selectedVisit?._id}
        onClose={() => setSelectedVisit(undefined)}
        onApprove={setApprovalVisitId}
        onReject={setRejectionVisitId}
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
    </div>
  );
};

export default AdminDashboard;
