import { Button, Descriptions, Input, Space, Tag } from "antd";
import InputWrapper from "../../shared/components/InputWrapper";
import { useEffect, useState } from "react";
import useOpenNotification from "../../shared/hooks/useOpenNotification";
import axios from "axios";
import Header from "../../shared/components/Header";
import { STATUS_COLORS } from "../../shared/constants/colors";
import { useNavigate } from '@tanstack/react-router';

interface Visit {
  referenceNumber: string;
  firstName: string;
  lastName: string;
  purpose: string;
  personToVisit: string;
  unitNumber: string;
  unitBuilding: string;
  status: string;
}

const TrackRegistration = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [formData, setFormData] = useState({
    referenceNumber: '',
    emailAddress: '',
    otp: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isTrackingRegistration, setIsTrackingRegistration] = useState(false);
  const [visit, setVisit] = useState<Visit | null>(null);

  const isOtpCountdownActive = otpCountdown > 0;

  useEffect(() => {
    if (!isOtpCountdownActive || isOtpVerified) {
      return;
    }

    const countdownTimer = window.setInterval(() => {
      setOtpCountdown((currentCountdown) => Math.max(currentCountdown - 1, 0));
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [isOtpCountdownActive, isOtpVerified]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
      ...(name === 'emailAddress' ? { otp: '' } : {}),
    }));

    if (name === 'emailAddress') {
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setOtpCountdown(0);
      setVisit(null);
    }
  };

  const validateField = (name: string, value: string) => {
    const fieldLabels: Record<string, string> = {
      referenceNumber: 'Reference number',
      emailAddress: 'Email address',
      otp: 'OTP',
    };

    if (!value.trim()) return (fieldLabels[name] ?? 'This field') + ' is required';
    if (name === 'emailAddress' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email address';
    }
    return '';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((previousErrors) => ({
      ...previousErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleClearForm = () => {
    setFormData({
      referenceNumber: '',
      emailAddress: '',
      otp: ''
    });
    setErrors({});
    setIsOtpSent(false);
    setIsOtpVerified(false);
    setOtpCountdown(0);
    setVisit(null);
  };

  const handleSendOtp = async () => {
    const emailError = validateField('emailAddress', formData.emailAddress);
    setErrors((previousErrors) => ({
      ...previousErrors,
      emailAddress: emailError,
    }));

    if (emailError) {
      openNotification('error', 'Invalid email', emailError);
      return;
    }

    setIsSendingOtp(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/otp/send`, {
        emailAddress: formData.emailAddress,
      });
      const interval = Number(response.data.interval);

      setIsOtpSent(true);
      setFormData((previousData) => ({ ...previousData, otp: '' }));
      setOtpCountdown(Number.isFinite(interval) && interval > 0 ? Math.floor(interval) : 0);
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      console.error('Error sending OTP:', error);
      openApiError(error, 'OTP Sending Failed', 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleTrackRegistration = async () => {
    const nextErrors = Object.fromEntries(
      Object.entries(formData).map(([field, value]) => [field, validateField(field, value)]),
    );
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    setIsTrackingRegistration(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/visit/track`,
        formData,
      );
      setVisit(response.data.data);
      setIsOtpVerified(true);
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      console.error("Error tracking visit:", error);
      setVisit(null);
      openApiError(
        error,
        'Unable to Track Visit',
        'Check your details and OTP, then try again.',
      );
    } finally {
      setIsTrackingRegistration(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {contextHolder}
      <div className="container max-w-2xl space-y-4">
        <h2>Track Registration</h2>
        <form
          className="card flex flex-col gap-4 w-full"
          onSubmit={(event) => {
            event.preventDefault();
            void handleTrackRegistration();
          }}
        >
          <InputWrapper id="reference-number-field" label="Reference Number" error={errors.referenceNumber}>
            <Input
              id="reference-number-field"
              name="referenceNumber"
              value={formData.referenceNumber}
              status={errors.referenceNumber ? "error" : undefined}
              onChange={handleInputChange}
              onBlur={handleInputBlur} />
          </InputWrapper>
          <InputWrapper id="email-address-field" label="Email Address" error={errors.emailAddress}>
            <Space.Compact className="w-full">
              <Input
                id="email-address-field"
                name="emailAddress"
                value={formData.emailAddress}
                status={errors.emailAddress ? "error" : undefined}
                onChange={handleInputChange}
                onBlur={handleInputBlur} />
              <Button
                id="send-otp"
                color="primary"
                variant="solid"
                loading={isSendingOtp}
                disabled={isOtpVerified || isOtpCountdownActive}
                onClick={handleSendOtp}>
                {isOtpVerified
                  ? "Verified"
                  : isOtpCountdownActive
                    ? `Resend OTP after (${otpCountdown}s)`
                    : isOtpSent
                      ? "Resend OTP"
                      : "Send OTP"}
              </Button>
            </Space.Compact>
          </InputWrapper>
          {isOtpSent && (
            <InputWrapper id="otp-field" label="OTP" error={errors.otp}>
              <Input
                id="otp-field"
                name="otp"
                value={formData.otp}
                status={errors.otp ? "error" : undefined}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                disabled={!isOtpSent || isOtpVerified} />
            </InputWrapper>
          )}
          <div className="flex justify-between">
            <Button
              id="go-home"
              onClick={() => { handleClearForm(); navigate({ to: '/' }); }}>
              Back to Menu
            </Button>
            <Button
              id="track-registration"
              color="primary"
              variant="solid"
              htmlType="submit"
              loading={isTrackingRegistration}
              disabled={
                isOtpVerified
                || !formData.referenceNumber
                || !formData.emailAddress
                || !formData.otp
              }>
              {isOtpVerified ? "Verified" : "Track Registration"}
            </Button>
          </div>
        </form>
        {visit && (
          <div
            className="card"
            title="Visit Details">
            <div className="flex items-center justify-between mb-4">
              <h3>Visit Details</h3>
              <Tag color={STATUS_COLORS[visit.status] ?? 'default'} variant="solid">
                {visit.status}
              </Tag>
            </div>


            <Descriptions bordered column={1}>
              <Descriptions.Item label="Reference Number">
                <span id="reference-number">{visit.referenceNumber}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Visitor Name">
                <span id="visitor-name">{visit.firstName} {visit.lastName}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Purpose">
                <span id="purpose">{visit.purpose}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Person to Visit">
                <span id="person-to-visit">{visit.personToVisit}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <span id="location">Unit {visit.unitNumber}, {visit.unitBuilding}</span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </div>
    </div>
  )
};

export default TrackRegistration;
