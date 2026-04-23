import { Link } from 'react-router-dom';
import { applications } from '../data/applications';

const STATUS_LABEL = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

const RISK_LABEL = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

function StatusBadge({ value }) {
  return (
    <span className={`badge badge-${value}`}>
      {STATUS_LABEL[value] ?? value}
    </span>
  );
}

function RiskBadge({ value }) {
  return (
    <span className={`badge badge-${value}`}>
      {RISK_LABEL[value] ?? value}
    </span>
  );
}

export default function Dashboard() {
  const total = applications.length;
  const pending = applications.filter((a) => a.status === 'pending').length;
  const underReview = applications.filter((a) => a.status === 'under_review').length;
  const approved = applications.filter((a) => a.status === 'approved').length;
  const rejected = applications.filter((a) => a.status === 'rejected').length;

  return (
    <div className="page">
      <h1>Applications Dashboard</h1>
      <p className="page-subtitle">
        {total} total &nbsp;&middot;&nbsp; {approved} approved &nbsp;&middot;&nbsp; {underReview} under
        review &nbsp;&middot;&nbsp; {pending} pending &nbsp;&middot;&nbsp; {rejected} rejected
      </p>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Submitted</th>
              <th>Document</th>
              <th>Status</th>
              <th>Risk Rating</th>
              <th>Flags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td>
                  <div className="applicant-name">{app.applicant_name}</div>
                  <div className="applicant-email">{app.email}</div>
                </td>
                <td>{app.submitted_date}</td>
                <td>{app.document_type}</td>
                <td>
                  <StatusBadge value={app.status} />
                </td>
                <td>
                  <RiskBadge value={app.risk_rating} />
                </td>
                <td className="flag-list">
                  {app.flags.length > 0
                    ? app.flags.map((f) => f.replace(/_/g, ' ')).join(', ')
                    : '—'}
                </td>
                <td>
                  <Link to={`/applications/${app.id}`} className="btn-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
