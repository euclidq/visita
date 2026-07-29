import { createFileRoute } from '@tanstack/react-router';
import AdminRegistrations from '../../../modules/admin/AdminRegistrations';

export const Route = createFileRoute('/admin/dashboard/')({
  component: AdminRegistrations,
});
