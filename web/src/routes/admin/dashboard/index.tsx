import { createFileRoute } from '@tanstack/react-router';
import AdminDashboard from '../../../modules/admin/AdminDashboard';

export const Route = createFileRoute('/admin/dashboard/')({
  component: AdminDashboard,
});
