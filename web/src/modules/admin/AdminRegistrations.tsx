import { useEffect, useState } from 'react';
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
import type { Visit } from './types';
import { Eye } from 'lucide-react';

const AdminRegistrations = () => {
  const navigate = useNavigate();
  const { openApiError, contextHolder } = useOpenNotification();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>();
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState<Visit>();

  useEffect(() => {
    setIsLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/visit`, {
        params: {
          page,
          limit: 10,
          search,
          status,
          sortField,
          sortOrder: sortOrder === 'ascend' ? 'asc' : 'desc',
        },
        withCredentials: true,
      })
      .then(({ data }) => {
        setVisits(data.data);
        setTotal(data.pagination.total);
      })
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          void navigate({ to: '/admin/login' });
        } else {
          openApiError(error, 'Unable to Load Registrations', 'Unable to load registrations');
        }
      })
      .finally(() => setIsLoading(false));
  }, [navigate, openApiError, page, search, sortField, sortOrder, status]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNavbar />
      {contextHolder}
      <div className="container max-w-7xl space-y-4">
        <div className="card flex flex-col gap-4 w-full">
          <h2>Visitor Registrations</h2>
          <Space wrap>
            <Input.Search
              allowClear
              placeholder="Search registrations"
              onSearch={(value) => {
                setPage(1);
                setSearch(value);
              }}
            />
            <Select
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
          <Table<Visit>
            rowKey="_id"
            loading={isLoading}
            dataSource={visits}
            pagination={{
              current: page,
              pageSize: 10,
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
                render: (_, visit) => (
                  <Button
                    type="link"
                    onClick={() => setSelectedVisit(visit)}
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
                title: 'Visitor Name',
                dataIndex: 'firstName',
                sorter: true,
                sortOrder: sortField === 'firstName' ? sortOrder : null,
                render: (_, visit) => `${visit.firstName} ${visit.lastName}`,
              },
              {
                title: 'Email',
                dataIndex: 'emailAddress',
                sorter: true,
                sortOrder: sortField === 'emailAddress' ? sortOrder : null,
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
          <div className="flex items-center gap-2">
            {selectedVisit.referenceNumber}
            <Tag
              color={STATUS_COLORS[selectedVisit.status] ?? 'default'}
              variant="solid"
            >
              {selectedVisit.status}
            </Tag>
          </div>
        )}
        open={Boolean(selectedVisit)}
        centered
        footer={null}
        width={720}
        onCancel={() => setSelectedVisit(undefined)}
      >
        {selectedVisit && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Visitor">
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

export default AdminRegistrations;
