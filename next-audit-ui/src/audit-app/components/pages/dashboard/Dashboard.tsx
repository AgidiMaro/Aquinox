import React, { useState } from 'react';
import './dashboard.scss';
import { useNavigate } from 'react-router-dom';

type Audit = {
  id: number;
  description: string;
  assignee: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate: string;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Mock audit data
  const audits: Audit[] = [
    {
      id: 1,
      description: "PC - Change Management",
      assignee: "Emmanuel Agidi",
      status: "Completed",
      dueDate: "2024-03-02",
    },
    {
      id: 2,
      description:
        "APD - Starters",
      assignee: "James Bond",
      status: "Completed",
      dueDate: "2024-07-05",
    },
    {
      id: 3,
      description: "APD - Leavers",
      assignee: "Ava Green",
      status: "In Progress",
      dueDate: "2023-12-15",
    },
    {
      id: 4,
      description: "APD - Recertification",
      assignee: "Olivia Rhye",
      status: "Not Started",
      dueDate: "2024-03-02",
    },
    {
      id: 5,
      description: "APD - Authentication",
      assignee: "James Bond",
      status: "In Progress",
      dueDate: "2024-07-05",
    },
    {
      id: 6,
      description: "APD - Privilege Access Management",
      assignee: "Ava Green",
      status: "Not Started",
      dueDate: "2023-12-15",
    },
    {
      id: 7,
      description:
        "CO - Batch job management",
      assignee: "Ava Green",
      status: "Completed",
      dueDate: "2023-12-15",
    },
    {
      id: 8,
      description: "CO - Backup and Restoration",
      assignee: "Ava Green",
      status: "Not Started",
      dueDate: "2023-12-15",
    },
    {
      id: 9,
      description:
        "PD - Program Development",
      assignee: "Ava Green",
      status: "Not Started",
      dueDate: "2023-12-15",
    },
    // ...other audits
  ];

  const filteredAudits = audits.filter(
    audit =>
      audit.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

// Use this for navigation when route is completed
  const navigateToAudit = (auditId: number) => {
    // navigate(`/audit/${auditId}`);
    navigate("/report");
    // navigate("/form");

  };

  return (
    <div className="dashboard mx-10">
      <div className="dashboard-header">
        <h2 className="text-3xl font-semibold">Welcome back, Phill</h2>
        <p>
          Prepare initial drafts of audit walkthroughs
        </p>
      </div>

      <div className="audit-status">
        {/* Status cards here */}
        <div className="status-card bg-pureWhite not-started">
          <h3>Not started</h3>
          <span className="status-number">4</span>
        </div>
        <div className="status-card bg-pureWhite in-progress">
          <h3>In progress</h3>
          <span className="status-number">2</span>
        </div>
        <div className="status-card bg-pureWhite completed">
          <h3>Completed</h3>
          <span className="status-number">3</span>
        </div>
      </div>
      <div className="audit-list mt-10">
        <div className="list-header">
          <h3 className="text-2xl font-semibold">All audits</h3>
          {/* Additional list controls here */}
          <input
            type="text"
            className="search-input"
            placeholder="Search audits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table className="audit-table mt-5 min-w-full bg-pureWhite rounded-lg ">
          <thead>
            <tr>
              <th>Audit</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>

          <tbody>
            {filteredAudits.map((audit) => (
              <tr
                onClick={() => navigateToAudit(audit.id)}
                className={`audit-item ${audit.status
                  .replace(/\s+/g, "-")
                  .toLowerCase()}`}
                key={audit.id}
              >
                <td>{audit.id}</td>
                <td id="description-cell">{audit.description}</td>
                <td>{audit.assignee}</td>
                <td>{audit.status}</td>
                <td>{audit.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
