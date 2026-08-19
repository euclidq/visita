import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Button, Modal, Space } from 'antd';
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
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          withCredentials: true,
        });
        setUser(response.data.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await navigate({ to: '/admin/login' });
        } else {
          openApiError(error, 'Account Loading Failed', 'Unable to load your account');
        }
      }
    };

    void fetchUser();
  }, [navigate, openApiError]);

  const handleLogout = async () => {
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
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      content: "Are you sure you want to log out?",
      centered: true,
      okText: "Log Out",
      cancelText: "Cancel",
      okButtonProps: {
        id: "confirm-logout-button",
        color: "danger",
        variant: "solid",
      },
      onOk: async () => {
        await handleLogout();
      },
    });
  };

  return (
    <>
      {contextHolder}
      <nav className="bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-2">
          <Space>
            <Button
              color="primary"
              variant="link"
              onClick={() => navigate({ to: '/admin/dashboard' })}
            >
              Dashboard
            </Button>
            <Button
              color="primary"
              variant="link"
              onClick={() => navigate({ to: '/admin/visitor-registrations' })}
            >
              Visitor Registrations
            </Button>
          </Space>
          <Space>
            {user && <span>{user.firstName} {user.lastName}</span>}
            <Button
              id="logout-button"
              onClick={confirmLogout}>
              Log Out
            </Button>
          </Space>
        </div>
      </nav>
    </>
  );
};

export default AdminNavbar;
