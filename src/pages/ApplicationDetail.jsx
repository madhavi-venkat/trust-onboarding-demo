import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import ComplianceReport from '../components/ComplianceReport';
import DocumentsSection from '../components/DocumentsSection';
import WorkflowPanel from '../components/WorkflowPanel';

const TRUST_TYPE_LABEL = {
  INDIVIDUAL_FAMILY: 'Individual / Family',
  CHARITABLE:        'Charitable',
  SUPERANNUATION:    'Superannuation',
};

const STATUS_LABEL = {
  DRAFT: 'Draft', SUBMITTED: 'Submitted', UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved', REJECTED: 'Rejected',
};

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <span style={{ minWidth: 160, color: '#64748B', fontSize: 13 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 13 }}>{value || '—'}</span>
    </div>
  );
}

function TrusteeCard({ trustee }) {
  return (
    <div style={{ padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {trustee.trusteeType === 'CORPORATE' ? trustee.companyName : trustee.fullName}
        <span style={{ marginLeft: 8, fontSize: 11, color: '#94A3B8', fontWeight: 400 }}>
          {trustee.trusteeType === 'CORPORATE' ? 'Corporate' : 'Individual'}
        </span>
      </div>
      {trustee.email   && <div style={{ fontSize: 13, color: '#64748B' }}>{trustee.email}</div>}
      {trustee.phone   && <div style={{ fontSize: 13, color: '#64748B' }}>{trustee.phone}</div>}
      {trustee.address && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{trustee.address}</div>}
    </div>
  );
}

function BeneficiaryCard({ ben }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '10px 14px', border: '1px solid #E2E8F0', borderRadius: 8, marginBottom: 8 }}>
      <div>
        <span style={{ fontWeight: 600, fontSize: 13 }}>{ben.fullName}</span>
        {ben.relationship && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#94A3B8' }}>{ben.relationship}</span>
        )}
        {ben.isPrimary && (
          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 600, color: '#059669',
            background: '#D1FAE5', padding: '1px 6px', borderRadius: 9999 }}>Primary</span>
        )}
      </div>
      {ben.entitlementPercentage != null && (
        <span style={{ fontWeight: 700, color: '#3B82F6' }}>{ben.entitlementPercentage}%</span>
      )}
    </div>
  );
}

function buildComplianceData(app) {
  let flags = [];
  try { flags = JSON.parse(app.aiRiskFlags || '[]'); } catch { /* ignore */ }

  return {
    status:        app.status?.toLowerCase(),
    summary:       app.aiComplianceReport || 'No compliance report available.',
    flags:         flags.map((f) => ({
      category:    f.flag,
      description: f.flag?.replace(/_/g, ' ') + ' detected.',
      severity:    f.severity,
      confidence:  f.confidence,
    })),
    reviewed_date: app.updatedAt
      ? new Date(app.updatedAt).toLocaleDateString('en-AU') : '—',
    reviewer: 'AI System',
  };
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const [app,     setApp]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    api.getApplication(id)
      .then(setApp)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><p style={{ color: '#64748B' }}>Loading…</p></div>;
  if (error)   return <div className="page"><p style={{ color: '#EF4444' }}>Error: {error}</p></div>;
  if (!app)    return <div className="page"><p>Application not found.</p></div>;

  const complianceData = buildComplianceData(app);
  const appForPdf = {
    applicant_name:    app.trustName,
    submitted_date:    app.createdAt
      ? new Date(app.createdAt).toLocaleDateString('en-AU') : '—',
    risk_rating:       complianceData.flags[0]?.severity ?? 'low',
    compliance_report: complianceData,
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

      {/* Page header with Edit button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
        <div>
          <h1>{app.trustName}</h1>
          <p className="page-subtitle">
            {app.applicationRef} &nbsp;&middot;&nbsp;
            {TRUST_TYPE_LABEL[app.trustType] ?? app.trustType} &nbsp;&middot;&nbsp;
            <span className={`badge badge-${app.status?.toLowerCase()}`} style={{ marginLeft: 4 }}>
              {STATUS_LABEL[app.status] ?? app.status}
            </span>
          </p>
        </div>
        <Link to={`/applications/${id}/edit`} className="btn-primary" style={{ textDecoration: 'none', marginTop: 4 }}>
          Edit
        </Link>
      </div>

      <div className="two-col">
        {/* Left column */}
        <div>
          {/* Trust summary */}
          <div className="card">
            <h2>Trust Details</h2>
            <InfoRow label="Trust Name"         value={app.trustName} />
            <InfoRow label="Trust Type"         value={TRUST_TYPE_LABEL[app.trustType]} />
            <InfoRow label="ABN"                value={app.trustAbn} />
            <InfoRow label="Establishment Date" value={app.establishmentDate} />
            <InfoRow label="Application Ref"    value={app.applicationRef} />
            <InfoRow label="Submitted"
              value={app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-AU', { dateStyle: 'medium' }) : null} />
          </div>

          {/* Trustees */}
          {app.trustees?.length > 0 && (
            <div className="card">
              <h2>Trustees ({app.trustees.length})</h2>
              {app.trustees.map((t) => <TrusteeCard key={t.id} trustee={t} />)}
            </div>
          )}

          {/* Beneficiaries */}
          {app.beneficiaries?.length > 0 && (
            <div className="card">
              <h2>Beneficiaries ({app.beneficiaries.length})</h2>
              {app.beneficiaries.map((b) => <BeneficiaryCard key={b.id} ben={b} />)}
            </div>
          )}

          {/* Documents */}
          <DocumentsSection applicationId={id} />
        </div>

        {/* Right column — workflow + compliance report */}
        <div>
          <WorkflowPanel application={app} onUpdate={setApp} />
          <ComplianceReport application={appForPdf} />
        </div>
      </div>
    </div>
  );
}
