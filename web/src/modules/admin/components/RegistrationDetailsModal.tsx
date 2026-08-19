import { Button, Descriptions, Modal, Tag } from 'antd';

import { STATUS_COLORS } from '../../../shared/constants/colors';
import type { Visit } from '../types';

interface RegistrationDetailsModalProps {
  visit?: Visit;
  isUpdating: boolean;
  onClose: () => void;
  onApprove: (visitId: string) => void;
  onReject: (visitId: string) => void;
}

const RegistrationDetailsModal = ({
  visit,
  isUpdating,
  onClose,
  onApprove,
  onReject,
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
            {visit.status}
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
        <Descriptions.Item label="Last Updated">
          {new Date(visit.updatedAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    )}
  </Modal>
);

export default RegistrationDetailsModal;
