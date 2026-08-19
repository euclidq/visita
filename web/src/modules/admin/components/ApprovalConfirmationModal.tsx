import { Modal } from 'antd';

interface ApprovalConfirmationModalProps {
  open: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ApprovalConfirmationModal = ({
  open,
  isLoading,
  onCancel,
  onConfirm,
}: ApprovalConfirmationModalProps) => (
  <Modal
    title="Confirm Approval"
    open={open}
    centered
    okText="Approve"
    cancelText="Cancel"
    okButtonProps={{ color: 'green', variant: 'solid' }}
    confirmLoading={isLoading}
    onCancel={onCancel}
    onOk={onConfirm}
  >
    <p>Are you sure you want to approve this visitor registration?</p>
  </Modal>
);

export default ApprovalConfirmationModal;
