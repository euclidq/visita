import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import {
  Button,
  Descriptions,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';

import Header from '../../shared/components/Header';
import { STATUS_COLORS } from '../../shared/constants/colors';
import useOpenNotification from '../../shared/hooks/useOpenNotification';
import AdminNavbar from './AdminNavbar';
import type { Visit, VisitTableRow } from './types';
import { Eye, RefreshCw } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [visits, setVisits] = useState<VisitTableRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>();
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewingVisitId, setViewingVisitId] = useState<string>();
  const [selectedVisit, setSelectedVisit] = useState<Visit>();

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

      if (showSuccessNotification) openNotification('success', response.data.title , response.data.message);
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
                placeholder="All statuses"
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
          <Table<VisitTableRow>
            rowKey="_id"
            loading={isLoading}
            dataSource={visits}
            pagination={{
              current: page,
              pageSize: 5,
              total,
              showSizeChanger: false,
              onChange: setPage,
            }}
            scroll={{ x: 'max-content' }}
            onChange={(_, __, sorter, extra) => {
              if (extra.action === 'sort' && !Array.isArray(sorter)) {
                setPage(1);
                setSortField(sorter.order ? String(sorter.field) : 'createdAt');
                setSortOrder(sorter.order ?? 'descend');
              }
            }}
            columns={[
              {
                title: 'Actions',
                key: 'actions',
                render: (_, visit) => (
                  <Button
                    id="view"
                    type="link"
                    size="small"
                    loading={viewingVisitId === visit._id}
                    onClick={() => void handleView(visit._id)}
                  >
                    <Eye size={16} />
                    View
                  </Button>
                ),
              },
              {
                title: 'Reference Number',
                dataIndex: 'referenceNumber',
                sorter: true,
                sortOrder: sortField === 'referenceNumber' ? sortOrder : null,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                sorter: true,
                sortOrder: sortField === 'status' ? sortOrder : null,
                render: (value) => (
                  <Tag color={STATUS_COLORS[value] ?? 'default'} variant="solid">
                    {value}
                  </Tag>
                ),
              },
              {
                title: 'Visitor Name',
                dataIndex: 'firstName',
                sorter: true,
                sortOrder: sortField === 'firstName' ? sortOrder : null,
                render: (_, visit) => `${visit.firstName} ${visit.lastName}`,
              },
              {
                title: 'Person to Visit',
                dataIndex: 'personToVisit',
                sorter: true,
                sortOrder: sortField === 'personToVisit' ? sortOrder : null,
              },
              {
                title: 'Location',
                dataIndex: 'unitBuilding',
                sorter: true,
                sortOrder: sortField === 'unitBuilding' ? sortOrder : null,
                render: (_, visit) => `${visit.unitNumber}, ${visit.unitBuilding}`,
              },
              {
                title: 'Registration Date',
                dataIndex: 'createdAt',
                sorter: true,
                sortOrder: sortField === 'createdAt' ? sortOrder : null,
                render: (value) => new Date(value).toLocaleString(),
              },
            ]}
          />
        </div>
      </div>

      <Modal
        title={selectedVisit && (
          <h2>Registration Details</h2>
        )}
        open={Boolean(selectedVisit)}
        centered
        footer={null}
        width={720}
        onCancel={() => setSelectedVisit(undefined)}
      >
        {selectedVisit && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Reference Number">
              {selectedVisit.referenceNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_COLORS[selectedVisit.status] ?? 'default'} variant="solid">
                {selectedVisit.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Visitor Name">
              {selectedVisit.firstName} {selectedVisit.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">
              {selectedVisit.emailAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile Number">
              {selectedVisit.mobileNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Purpose">{selectedVisit.purpose}</Descriptions.Item>
            <Descriptions.Item label="Person to Visit">
              {selectedVisit.personToVisit}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedVisit.unitNumber}, {selectedVisit.unitBuilding}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Date">
              {new Date(selectedVisit.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {new Date(selectedVisit.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
