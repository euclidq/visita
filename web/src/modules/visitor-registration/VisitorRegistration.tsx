import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';

import InputWrapper from '../../shared/components/InputWrapper';
import useOpenNotification from '../../shared/hooks/useOpenNotification';
import { Button, Input, Space, Steps } from 'antd';
import Header from '../../shared/components/Header';

const VisitorRegistration = () => {
  const navigate = useNavigate();
  const { openNotification, openApiError, contextHolder } = useOpenNotification();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    mobileNumber: '',
    purpose: '',
    personToVisit: '',
    unitNumber: '',
    unitBuilding: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOtpCountdownActive = otpCountdown > 0;
  let sendOtpButtonLabel = 'Send OTP';

  if (isEmailVerified) {
    sendOtpButtonLabel = 'Verified';
  } else if (isOtpCountdownActive) {
    sendOtpButtonLabel = `Resend OTP after (${otpCountdown}s)`;
  } else if (otpSent) {
    sendOtpButtonLabel = 'Resend OTP';
  }

  useEffect(() => {
    if (!isOtpCountdownActive || isEmailVerified) {
      return;
    }

    const countdownTimer = window.setInterval(() => {
      setOtpCountdown((currentCountdown) => Math.max(currentCountdown - 1, 0));
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [isOtpCountdownActive, isEmailVerified]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'emailAddress') {
      setOtpSent(false);
      setOtp('');
      setIsEmailVerified(false);
      setVerificationToken('');
      setOtpCountdown(0);
    }
  };

  const validateField = (name: string, value: string) => {
    const fieldLabels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      emailAddress: 'Email address',
      mobileNumber: 'Mobile number',
      otp: 'OTP',
      purpose: 'Purpose',
      personToVisit: 'Person to visit',
      unitNumber: 'Unit number',
      unitBuilding: 'Building',
    };

    if (!value.trim()) return `${fieldLabels[name] ?? 'This field'} is required`;
    if (name === 'emailAddress' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Enter a valid email address';
    }
    if (name === 'mobileNumber' && !/^\+?[\d\s()-]{10,20}$/.test(value)) {
      return 'Enter a valid mobile number';
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

      setOtpSent(true);
      setOtp('');
      setIsEmailVerified(false);
      setVerificationToken('');
      setOtpCountdown(Number.isFinite(interval) && interval > 0 ? Math.floor(interval) : 0);
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      console.error('Error sending OTP:', error);
      openApiError(error, 'OTP Sending Failed', 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;

    setIsVerifyingOtp(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/otp/verify`, {
        emailAddress: formData.emailAddress,
        otp,
      });
      setVerificationToken(response.data.verificationToken);
      setIsEmailVerified(true);
      openNotification('success', response.data.title, response.data.message);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      openApiError(error, 'OTP Verification Failed', 'Failed to verify OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleClearForm = () => {
    setCurrentStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      emailAddress: '',
      mobileNumber: '',
      purpose: '',
      personToVisit: '',
      unitNumber: '',
      unitBuilding: '',
    });
    setErrors({});
    setOtpSent(false);
    setOtp('');
    setIsEmailVerified(false);
    setVerificationToken('');
    setOtpCountdown(0);
  };

  const handleNext = () => {
    const fields = ['firstName', 'lastName', 'emailAddress', 'mobileNumber'];
    const nextErrors = Object.fromEntries(
      fields.map((field) => [field, validateField(field, formData[field as keyof typeof formData])]),
    );
    setErrors((previousErrors) => ({ ...previousErrors, ...nextErrors }));

    if (Object.values(nextErrors).every((error) => !error) && isEmailVerified) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const nextErrors = Object.fromEntries(
      Object.entries(formData).map(([field, value]) => [field, validateField(field, value)]),
    );
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/visit/register`, {
        ...formData,
        verificationToken,
      });
      navigate({
        to: '/visitor-registration/success',
        state: {
          referenceNumber: response.data.data.referenceNumber,
          title: response.data.title,
          message: response.data.message,
        },
      });
      handleClearForm();
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting form:', error);
      openApiError(error, 'Registration Failed', 'Failed to submit form');
    }
  };

  const isVisitorStepValid = [
    ['firstName', formData.firstName],
    ['lastName', formData.lastName],
    ['emailAddress', formData.emailAddress],
    ['mobileNumber', formData.mobileNumber],
  ].every(([name, value]) => !validateField(name, value));

  const isVisitStepValid = [
    ['purpose', formData.purpose],
    ['personToVisit', formData.personToVisit],
    ['unitNumber', formData.unitNumber],
    ['unitBuilding', formData.unitBuilding],
  ].every(([name, value]) => !validateField(name, value));

  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <div className="container max-w-2xl space-y-4">
        {contextHolder}
        <h2>Visitor Registration</h2>
        <form
          className="card flex flex-col gap-4"
          onSubmit={(event) => {
            if (currentStep === 1) {
              event.preventDefault();
              handleNext();
            } else {
              void handleSubmit(event);
            }
          }}
        >
          <Steps
            current={currentStep - 1}
            items={[
              { title: 'Visitor Details' },
              { title: 'Visit Details' },
            ]}
          />
          {currentStep === 1 ? (
            <>
              <h3 className="text-center">Visitor Details</h3>
              <InputWrapper id="first-name" label="First Name" error={errors.firstName}>
                <Input
                  id="first-name"
                  name="firstName"
                  value={formData.firstName}
                  status={errors.firstName ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
              <InputWrapper id="last-name" label="Last Name" error={errors.lastName}>
                <Input
                  id="last-name"
                  name="lastName"
                  value={formData.lastName}
                  status={errors.lastName ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
              <InputWrapper id="email-address" label="Email Address" error={errors.emailAddress}>
                <Space.Compact className="w-full">
                  <Input
                    id="email-address"
                    name="emailAddress"
                    value={formData.emailAddress}
                    status={errors.emailAddress ? 'error' : undefined}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}/>
                  <Button
                    id="send-otp-button"
                    color="primary"
                    variant="solid"
                    disabled={isEmailVerified || isOtpCountdownActive}
                    loading={isSendingOtp}
                    onClick={handleSendOtp}>
                    {sendOtpButtonLabel}
                  </Button>
                </Space.Compact>
              </InputWrapper>
              {otpSent && (
                <InputWrapper id="otp" label="OTP" error={errors.otp}>
                  <Space.Compact className="w-full">
                    <Input
                      id="otp"
                      name="otp"
                      value={otp}
                      status={errors.otp ? 'error' : undefined}
                      onChange={(event) => setOtp(event.target.value)}
                      onBlur={handleInputBlur}
                      disabled={!otpSent}/>
                    <Button
                      id="verify-otp-button"
                      color="primary"
                      variant="solid"
                      disabled={isEmailVerified || !otp}
                      loading={isVerifyingOtp}
                      onClick={handleVerifyOtp}>
                      {isEmailVerified ? 'Verified' : 'Verify OTP'}
                    </Button>
                  </Space.Compact>
                </InputWrapper>
              )}
              <InputWrapper id="mobile-number" label="Mobile Number" error={errors.mobileNumber}>
                <Input
                  id="mobile-number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  status={errors.mobileNumber ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                />
              </InputWrapper>
              <div className="flex justify-between">
                <Button
                  id="go-home"
                  onClick={() => { handleClearForm(); navigate({ to: '/' }); }}>
                  Back to Menu
                </Button>
                <Button
                  id="next"
                  color="primary"
                  variant="solid"
                  htmlType="submit"
                  disabled={!isVisitorStepValid || !isEmailVerified}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-center">Visit Details</h3>
              <InputWrapper id="purpose" label="Purpose" error={errors.purpose}>
                <Input
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  status={errors.purpose ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
              <InputWrapper id="person-to-visit" label="Person to Visit" error={errors.personToVisit}>
                <Input
                  id="person-to-visit"
                  name="personToVisit"
                  value={formData.personToVisit}
                  status={errors.personToVisit ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
                <InputWrapper id="unit-number" label="Unit Number" error={errors.unitNumber}>
                <Input
                  id="unit-number"
                  name="unitNumber"
                  value={formData.unitNumber}
                  status={errors.unitNumber ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
              <InputWrapper id="building" label="Building" error={errors.unitBuilding}>
                <Input
                  id="building"
                  name="unitBuilding"
                  value={formData.unitBuilding}
                  status={errors.unitBuilding ? 'error' : undefined}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}/>
              </InputWrapper>
              <div className="flex justify-between">
                <Button
                  id="back"
                  onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  id="submit"
                  color="primary"
                  variant="solid"
                  htmlType="submit"
                  disabled={!isVisitStepValid}
                  loading={isSubmitting}
                >
                  Submit
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default VisitorRegistration;
