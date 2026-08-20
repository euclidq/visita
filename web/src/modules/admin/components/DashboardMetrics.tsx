import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Skeleton, Statistic } from 'antd';

import useOpenNotification from '../../../shared/hooks/useOpenNotification';

interface VisitMetrics {
  pending: number;
  approved: number;
  checkedIn: number;
}

interface DashboardMetricsProps {
  refreshKey: number;
}

const DashboardMetrics = ({ refreshKey }: DashboardMetricsProps) => {
  const navigate = useNavigate();
  const { openApiError, contextHolder } = useOpenNotification();
  const [metrics, setMetrics] = useState<VisitMetrics>({
    pending: 0,
    approved: 0,
    checkedIn: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axios.get<{ data: VisitMetrics }>(
        `${import.meta.env.VITE_API_URL}/visit/metrics`,
        { withCredentials: true },
      );
      setMetrics(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        await navigate({ to: '/admin/login' });
      } else {
        openApiError(error, 'Metrics Loading Failed', 'Unable to load visit metrics');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, openApiError]);

  useEffect(() => {
    void refreshKey;
    void fetchMetrics();
  }, [fetchMetrics, refreshKey]);

  return (
    <section aria-label="Visit Metrics" className="grid gap-4 sm:grid-cols-3">
      {contextHolder}
      <div className="card" style={{ borderColor: '#faad14', backgroundColor: '#fffbe6' }}>
        {isLoading ? <Skeleton active paragraph={false} /> : (
          <Statistic title="Pending" value={metrics.pending} />
        )}
      </div>
      <div className="card" style={{ borderColor: '#52c41a', backgroundColor: '#f6ffed' }}>
        {isLoading ? <Skeleton active paragraph={false} /> : (
          <Statistic title="Approved" value={metrics.approved} />
        )}
      </div>
      <div className="card" style={{ borderColor: '#1677ff', backgroundColor: '#e6f4ff' }}>
        {isLoading ? <Skeleton active paragraph={false} /> : (
          <Statistic title="Checked In" value={metrics.checkedIn} />
        )}
      </div>
    </section>
  );
};

export default DashboardMetrics;
