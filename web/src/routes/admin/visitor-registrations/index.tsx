import { createFileRoute } from '@tanstack/react-router';
import AdminVisitorRegistrations from '../../../modules/admin/AdminVisitorRegistrations';

export const Route = createFileRoute('/admin/visitor-registrations/')({
  component: AdminVisitorRegistrations,
});
