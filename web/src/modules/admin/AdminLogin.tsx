import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import { Button, Input } from 'antd';

import Header from '../../shared/components/Header';
import InputWrapper from '../../shared/components/InputWrapper';
import useOpenNotification from '../../shared/hooks/useOpenNotification';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [formData, setFormData] = useState({
    emailAddress: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      })
      .then(() => navigate({ to: '/admin/dashboard' }))
      .catch((error) => {
        if (!axios.isAxiosError(error) || error.response?.status !== 401) {
          openApiError(error, 'Session Check Failed', 'Unable to verify your session');
        }
      });
  }, [navigate, openApiError]);

  const validateField = (name: string, value: string) => {
    if (!value.trim()) {
      return `${name === 'emailAddress' ? 'Email address' : 'Password'} is required`;
    }
    if (name === 'emailAddress' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email address';
    }
    return '';
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleLogin = async () => {
    const nextErrors = Object.fromEntries(
      Object.entries(formData).map(([name, value]) => [name, validateField(name, value)]),
    );
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        formData,
        { withCredentials: true },
      );
      openNotification('success', response.data.title, response.data.message);
      await navigate({ to: '/admin/dashboard' });
    } catch (error) {
      openApiError(error, 'Login Failed', 'Unable to log in');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {contextHolder}
      <div className="container center">
        <form
          className="card flex flex-col gap-4 w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <h2>Admin Login</h2>
          <InputWrapper
            id="email-address"
            label="Email Address"
            error={errors.emailAddress}
          >
            <Input
              id="email-address"
              name="emailAddress"
              value={formData.emailAddress}
              status={errors.emailAddress ? 'error' : undefined}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
          </InputWrapper>
          <InputWrapper id="password" label="Password" error={errors.password}>
            <Input.Password
              id="password"
              name="password"
              value={formData.password}
              status={errors.password ? 'error' : undefined}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
            />
          </InputWrapper>
          <Button type="primary" htmlType="submit" loading={isLoggingIn}>
            Log In
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
