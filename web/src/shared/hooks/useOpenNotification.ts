import { notification } from 'antd';
import { useCallback } from 'react';
import axios from 'axios';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

const useOpenNotification = () => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback((
    type: NotificationType,
    title: string,
    description: string,
  ) => {
    api[type]({
      title,
      description,
    });
  }, [api]);

  const openApiError = useCallback((
    error: unknown,
    title: string,
    message: string,
  ) => {
    const response = axios.isAxiosError<{ title?: string; message?: string }>(error)
      ? error.response?.data
      : undefined;

    api.error({
      title: response?.title ?? title,
      description: response?.message ?? message,
    });
  }, [api]);

  return { openNotification, openApiError, contextHolder };
};

export default useOpenNotification;
