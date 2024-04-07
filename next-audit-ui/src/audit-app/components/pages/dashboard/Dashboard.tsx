import React from 'react';
import './dashboard.scss'; // This is where your CSS will be imported from
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  // This would typically come from props or a state management store in a real application
  const navigate = useNavigate();
  
  const audits = [
    {
      id: 1,
      description: 'A basic library for quick sketches and rapid prototyping.',
      assignee: 'Olivia Rhye',
      status: 'Active',
      dueDate: '2 Mar 2027'
    },
    {
      id: 2,
      description: 'A Different Kind of Audit',
      assignee: 'James Bond',
      status: 'Active',
      dueDate: '5 July 2026'
    },
    // ...other audits
  ];

  const navigateToAudit = () => {
    navigate("/test");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header mb-10">
        <h2 className="text-3xl">Welcome back, Scott</h2>
        <p>Elevate your audits with seamless management powered by AI and NLP</p>
      </div>
      <div className="audit-status">
        <div className="status-card bg-pureWhite not-started">
          <h3>Not started</h3>
          <span className="status-number">2,420</span>
        </div>
        <div className="status-card bg-pureWhite in-progress">
          <h3>In progress</h3>
          <span className="status-number">2,420</span>
        </div>
        <div className="status-card bg-pureWhite completed">
          <h3>Completed</h3>
          <span className="status-number">2,420</span>
        </div>
      </div>
      <div className="audit-list mt-10">
        <div className="list-header">
          <h3 className="text-2xl">All audits</h3>
        </div>
        <table className="table-auto mt-5 min-w-full audit-table bg-pureWhite">
          <thead className="border-b border-neutral-200 font-medium dark:border-white/10 bg-lightWhite">
            <tr>
              <th>Audits</th>
              <th>Description</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
          {audits.map(audit => (
              <tr onClick={navigateToAudit} className="audit-item border-b border-neutral-200" key={audit.id}>
                <td>Audits {audit.id}</td>
                <td>{audit.description}</td>
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
}

export default Dashboard;