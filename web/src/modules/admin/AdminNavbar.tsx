import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Button, Space } from 'antd';
import useOpenNotification from '../../shared/hooks/useOpenNotification';

interface User {
  firstName: string;
  lastName: string;
  role: string;
}

const AdminNavbar = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      })
      .then(({ data }) => setUser(data.data))
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          void navigate({ to: '/admin/login' });
        } else {
          openApiError(error, 'Account Loading Failed', 'Unable to load your account');
        }
      });
  }, [navigate, openApiError]);

  return (
    <>
      {contextHolder}
      <nav className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-2">
          <Button type="link" onClick={() => navigate({ to: '/admin/dashboard' })}>
            Dashboard
          </Button>
          <Space>
            {user && <span>{user.firstName} {user.lastName} ({user.role})</span>}
            <Button
              onClick={async () => {
                try {
                  const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/logout`,
                    {},
                    { withCredentials: true },
                  );
                  openNotification('success', response.data.title, response.data.message);
                  await navigate({ to: '/admin/login' });
                } catch (error) {
                  openApiError(error, 'Logout Failed', 'Unable to log out');
                }
              }}
            >
              Log Out
            </Button>
          </Space>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
