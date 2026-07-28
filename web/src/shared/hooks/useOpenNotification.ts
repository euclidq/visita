import { notification } from 'antd';
import { useCallback } from 'react';

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

  return { openNotification, contextHolder };
};

export default useOpenNotification;
