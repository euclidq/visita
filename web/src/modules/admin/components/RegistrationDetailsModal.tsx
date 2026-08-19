import { Button, Descriptions, Modal, Tag } from 'antd';

import { formatVisitStatus, STATUS_COLORS } from '../../../shared/constants/colors';
import type { Visit } from '../types';
import { formatVisitDuration } from '../utils';

interface RegistrationDetailsModalProps {
  visit?: Visit;
  isUpdating: boolean;
  onClose: () => void;
  onApprove: (visitId: string) => void;
  onReject: (visitId: string) => void;
  onCheckIn: (visitId: string) => void;
  onCheckOut: (visitId: string) => void;
}

const RegistrationDetailsModal = ({
  visit,
  isUpdating,
  onClose,
  onApprove,
  onReject,
  onCheckIn,
  onCheckOut,
}: RegistrationDetailsModalProps) => (
  <Modal
    title={visit && <h2>Registration Details</h2>}
    open={Boolean(visit)}
    centered
    footer={visit ? (
      <>
        <Button onClick={onClose}>Close</Button>
        {visit.status === 'PENDING' && (
          <>
            <Button
              color="danger"
              variant="outlined"
              onClick={() => onReject(visit._id)}
            >
              Reject
            </Button>
            <Button
              color="green"
              variant="solid"
              loading={isUpdating}
              onClick={() => onApprove(visit._id)}
            >
              Approve
            </Button>
          </>
        )}
        {['APPROVED', 'CHECKED_IN'].includes(visit.status) && (
          <>
            <Button
              color="primary"
              variant="outlined"
              disabled={visit.status !== 'APPROVED'}
              loading={isUpdating && visit.status === 'APPROVED'}
              onClick={() => onCheckIn(visit._id)}
            >
              Check In
            </Button>
            <Button
              color="primary"
              variant="solid"
              disabled={visit.status !== 'CHECKED_IN'}
              loading={isUpdating && visit.status === 'CHECKED_IN'}
              onClick={() => onCheckOut(visit._id)}
            >
              Check Out
            </Button>
          </>
        )}
      </>
    ) : null}
    width={720}
    onCancel={onClose}
  >
    {visit && (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Reference Number">
          {visit.referenceNumber}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={STATUS_COLORS[visit.status] ?? 'default'} variant="solid">
            {formatVisitStatus(visit.status)}
          </Tag>
        </Descriptions.Item>
        {visit.rejectionReason && (
          <Descriptions.Item label="Rejection Reason">
            {visit.rejectionReason}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Visitor Name">
          {visit.firstName} {visit.lastName}
        </Descriptions.Item>
        <Descriptions.Item label="Email Address">{visit.emailAddress}</Descriptions.Item>
        <Descriptions.Item label="Mobile Number">{visit.mobileNumber}</Descriptions.Item>
        <Descriptions.Item label="Purpose">{visit.purpose}</Descriptions.Item>
        <Descriptions.Item label="Person to Visit">{visit.personToVisit}</Descriptions.Item>
        <Descriptions.Item label="Location">
          {visit.unitNumber}, {visit.unitBuilding}
        </Descriptions.Item>
        <Descriptions.Item label="Registration Date">
          {new Date(visit.createdAt).toLocaleString()}
        </Descriptions.Item>
        {visit.checkInAt && (
          <Descriptions.Item label="Check-in Time">
            {new Date(visit.checkInAt).toLocaleString()}
          </Descriptions.Item>
        )}
        {visit.checkOutAt && (
          <Descriptions.Item label="Check-out Time">
            {new Date(visit.checkOutAt).toLocaleString()}
          </Descriptions.Item>
        )}
        {visit.checkInAt && (
          <Descriptions.Item label="Visit Duration">
            {formatVisitDuration(visit.visitDuration)}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Last Updated">
          {new Date(visit.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default RegistrationDetailsModal;
