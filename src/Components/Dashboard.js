import React from 'react';
import Deals from './Deals';
import Leads from './Leads';
import Quotes from './Quotes';
import DashboardCRM from './DashboardCRM';
import Tasks from './Tasks';
import Reports from './Reports';
import OrganizationsInCards from './OrganizationsInCards';
import Accounting from './Accounting';
import EmailManagement from './EmailManagement';

import CustomerComplaints from './CustomerComplaints';

import Projects from './Projects';


import IntegrationCard from './IntegrationCard';
import EmployeeContacts from './EmployeeContacts';
import Schedule from './Schedule';
import Finance from './Finance';
import Settings from './Settings';
import ClientContacts from './ClientContacts';

function Dashboard({ activeContent, setActiveContent }) {
  return (
    <div className="dashboard">
      {activeContent === "dashboardCRM" && (
        <DashboardCRM setActiveContent={setActiveContent} />
      )}
      {activeContent === "tasks" && <Tasks />}
      {activeContent === "Organization" && <OrganizationsInCards />}
      {activeContent === "events" && <Leads />}
      {activeContent === "leads" && <Leads />}
      {activeContent === "contacts" && <ClientContacts />}
      {activeContent === "schedule" && <Schedule />}
      {activeContent === "quotes" && <Quotes />}
      {activeContent === "deals" && <Deals />}

      {activeContent === "reports" && <Reports />}
      {activeContent === "emails" && <EmailManagement />}
      {activeContent === "integration" && <IntegrationCard />}
      {activeContent === "accounting" && <Accounting />}
      {activeContent === "projects" && <Projects />}
      {activeContent === "finance" && <Finance />}
      {activeContent === "complains" && <CustomerComplaints />}
      {activeContent === "setting" && <Settings />}

    </div>
  );
}

export default Dashboard;
