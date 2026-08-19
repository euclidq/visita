import { useState } from 'react';

import Header from '../../shared/components/Header';
import AdminNavbar from './AdminNavbar';
import DashboardMetrics from './components/DashboardMetrics';
import VisitorRegistrationsPanel from './components/VisitorRegistrationsPanel';

const AdminDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshPanels = () => setRefreshKey((current) => current + 1);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AdminNavbar />

      <div className="container max-w-7xl space-y-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DashboardMetrics refreshKey={refreshKey} />
        <VisitorRegistrationsPanel
          heading="Visitor Registrations"
          pageSize={5}
          initialStatus="PENDING"
          refreshKey={refreshKey}
          onVisitUpdated={refreshPanels}
        />
        <VisitorRegistrationsPanel
          heading="Active Visitors"
          pageSize={5}
          activeOnly
          showFilters={false}
          searchId="ActiveSearch"
          statusId="ActiveStatus"
          refreshKey={refreshKey}
          onVisitUpdated={refreshPanels}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
