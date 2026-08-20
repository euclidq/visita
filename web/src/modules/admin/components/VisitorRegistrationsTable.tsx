import { Button, Table, Tag } from 'antd';
import { Eye } from 'lucide-react';

import { formatVisitStatus, STATUS_COLORS } from '../../../shared/constants/colors';
import type { VisitTableRow } from '../types';
import { formatVisitDuration } from '../utils';

type SortOrder = 'ascend' | 'descend';

interface VisitorRegistrationsTableProps {
  visits: VisitTableRow[];
  page: number;
  total: number;
  pageSize?: number;
  sortField: string;
  sortOrder: SortOrder;
  isLoading: boolean;
  viewingVisitId?: string;
  onPageChange: (page: number) => void;
  onSortChange: (field: string, order: SortOrder) => void;
  onView: (visitId: string) => void;
}

const VisitorRegistrationsTable = ({
  visits,
  page,
  total,
  pageSize = 5,
  sortField,
  sortOrder,
  isLoading,
  viewingVisitId,
  onPageChange,
  onSortChange,
  onView,
}: VisitorRegistrationsTableProps) => (
  <Table<VisitTableRow>
    rowKey="_id"
    loading={isLoading}
    dataSource={visits}
    pagination={{
      current: page,
      pageSize,
      total,
      showSizeChanger: false,
      onChange: onPageChange,
    }}
    scroll={{ x: 'max-content' }}
    onChange={(_, __, sorter, extra) => {
      if (extra.action === 'sort' && !Array.isArray(sorter)) {
        onSortChange(
          sorter.order ? String(sorter.field) : 'createdAt',
          sorter.order ?? 'descend',
        );
      }
    }}
    columns={[
      {
        title: 'Actions',
        key: 'actions',
        render: (_, visit) => (
          <Button
            color="primary"
            variant="link"
            size="small"
            loading={viewingVisitId === visit._id}
            onClick={() => onView(visit._id)}
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
            {formatVisitStatus(value)}
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
        title: 'Check-in Time',
        dataIndex: 'checkInAt',
        render: (value) => value ? new Date(value).toLocaleString() : '—',
      },
      {
        title: 'Check-out Time',
        dataIndex: 'checkOutAt',
        render: (value) => value ? new Date(value).toLocaleString() : '—',
      },
      {
        title: 'Visit Duration',
        dataIndex: 'visitDuration',
        render: (value) => formatVisitDuration(value),
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
);

export default VisitorRegistrationsTable;
