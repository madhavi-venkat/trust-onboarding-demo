import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const STATUS_LABEL = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const TRUST_TYPE_LABEL = {
  INDIVIDUAL_FAMILY: 'Individual / Family',
  CHARITABLE: 'Charitable',
  SUPERANNUATION: 'Superannuation',
};

function StatusBadge({ value }) {
  const key = value?.toLowerCase().replace('_', '_');
  const cssClass = `badge badge-${value?.toLowerCase()}`;
  return <span className={cssClass}>{STATUS_LABEL[value] ?? value}</span>;
}

function parseFlags(json) {
  if (!json || json === '[]') return [];
  try {
    return JSON.parse(json).map((f) => f.flag?.replace(/_/g, ' ') ?? '').filter(Boolean);
  } catch {
    return [];
  }
}

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listApplications()
      .then(setApplications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p style={{ color: '#64748B' }}>Loading applications…</p></div>;
  if (error)   return <div className="page"><p style={{ color: '#EF4444' }}>Error: {error}</p></div>;

  const counts = applications.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    {}
  );

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1>Applications Dashboard</h1>
        <Link to="/applications/new" className="btn-primary" style={{ textDecoration: 'none' }}>
          + New Application
        </Link>
      </div>
      <p className="page-subtitle">
        {applications.length} total
        {Object.entries(counts).map(([status, n]) => (
          <span key={status}> &middot; {n} {STATUS_LABEL[status] ?? status}</span>
        ))}
      </p>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Trust Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Trustees</th>
              <th>Beneficiaries</th>
              <th>Risk Flags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const flags = parseFlags(app.aiRiskFlags);
              return (
                <tr key={app.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748B' }}>
                    {app.applicationRef}
                  </td>
                  <td>
                    <div className="applicant-name">{app.trustName}</div>
                    <div className="applicant-email">
                      {new Date(app.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}
                    </div>
                  </td>
                  <td>{TRUST_TYPE_LABEL[app.trustType] ?? app.trustType}</td>
                  <td><StatusBadge value={app.status} /></td>
                  <td>{app.trusteeCount}</td>
                  <td>{app.beneficiaryCount}</td>
                  <td className="flag-list">
                    {flags.length > 0 ? flags.join(', ') : '—'}
                  </td>
                  <td>
                    <Link to={`/applications/${app.id}`} className="btn-link">View</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
