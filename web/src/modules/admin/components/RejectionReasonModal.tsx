import { useEffect, useState } from 'react';
import { Button, Input, Modal } from 'antd';

import InputWrapper from '../../../shared/components/InputWrapper';

interface RejectionReasonModalProps {
  visitId?: string;
  isLoading: boolean;
  onCancel: () => void;
  onReject: (reason: string) => void;
}

const RejectionReasonModal = ({
  visitId,
  isLoading,
  onCancel,
  onReject,
}: RejectionReasonModalProps) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setReason('');
    setError('');
  }, [visitId]);

  return (
    <Modal
      title="Reject Visit"
      open={Boolean(visitId)}
      centered
      onCancel={onCancel}
      footer={[
        <Button key="cancel" disabled={isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="reject"
          color="danger"
          variant="solid"
          disabled={!reason.trim()}
          loading={isLoading}
          onClick={() => onReject(reason.trim())}
        >
          Reject
        </Button>,
      ]}
    >
      <div className="pb-6">
        <InputWrapper id="rejection-reason" label="Rejection Reason" error={error}>
          <Input.TextArea
            id="rejection-reason"
            rows={4}
            maxLength={500}
            showCount
            status={error ? 'error' : undefined}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            onBlur={() => setError(reason.trim() ? '' : 'Rejection Reason is required')}
          />
        </InputWrapper>
      </div>
    </Modal>
  );
};

export default RejectionReasonModal;
