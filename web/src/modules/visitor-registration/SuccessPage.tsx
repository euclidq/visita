import { useLocation, useNavigate } from '@tanstack/react-router';
import { Button, Result, Typography } from 'antd';
import Header from '../../shared/components/Header';

const SuccessPage = () => {
  const navigate = useNavigate();
  const { referenceNumber, title, message } = useLocation({
    select: (location) => ({
      referenceNumber: location.state.referenceNumber,
      title: location.state.title,
      message: location.state.message,
    }),
  });

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="container flex flex-1 items-center justify-center">
        <Result
          className="card max-w-2xl"
          status="success"
          title={title}
          subTitle={
            <div className="flex flex-col gap-2">
              <span>{message}</span>
              <span>Take a screenshot of this reference number to track your status later:</span>
              <Typography.Text copyable={Boolean(referenceNumber)} strong>
                {referenceNumber ?? 'Reference number unavailable'}
              </Typography.Text>
            </div>
          }
          extra={
            <Button
              color="primary"
              variant="solid"
              onClick={() => navigate({ to: '/' })}
            >
              Back to Home
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default SuccessPage;
