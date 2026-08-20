import Header from '../../shared/components/Header';
import AdminNavbar from './AdminNavbar';
import VisitorRegistrationsPanel from './components/VisitorRegistrationsPanel';

const AdminVisitorRegistrations = () => (
  <div className="flex flex-1 flex-col">
    <Header />
    <AdminNavbar />

    <div className="container max-w-7xl space-y-4">
      <h1 className="text-2xl font-semibold">Visitor Registrations</h1>
      <VisitorRegistrationsPanel
        heading="All Visitor Registrations"
        pageSize={20}
        searchId="RegistrationSearch"
        statusId="RegistrationStatus"
      />
    </div>
  </div>
);

export default AdminVisitorRegistrations;
