import jsPDF from 'jspdf';

const SEVERITY_COLOR = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#059669',
};

function generatePDF(application) {
  const { applicant_name, submitted_date, risk_rating, compliance_report } = application;
  const doc = new jsPDF();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text('Compliance Report', 20, 28);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, 20, 36);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 41, 190, 41);

  // Applicant info section
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Applicant Information', 20, 52);

  const infoRows = [
    ['Name', applicant_name],
    ['Submitted', submitted_date],
    ['Risk Rating', risk_rating.toUpperCase()],
    ['Report Status', compliance_report.status.replace(/_/g, ' ').toUpperCase()],
    ['Reviewed', compliance_report.reviewed_date],
    ['Reviewer', compliance_report.reviewer],
  ];

  let y = 61;
  doc.setFontSize(10);
  infoRows.forEach(([label, value]) => {
    doc.setTextColor(100, 116, 139);
    doc.text(`${label}:`, 22, y);
    doc.setTextColor(15, 23, 42);
    doc.text(value, 70, y);
    y += 8;
  });

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, y, 190, y);
  y += 10;

  // Summary section
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Summary', 20, y);
  y += 9;

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(compliance_report.summary, 170);
  doc.text(summaryLines, 20, y);
  y += summaryLines.length * 6 + 10;

  // Risk flags section
  if (compliance_report.flags && compliance_report.flags.length > 0) {
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    y += 10;

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Risk Flags', 20, y);
    y += 9;

    compliance_report.flags.forEach((flag) => {
      // Severity color bar
      const [r, g, b] = hexToRgb(SEVERITY_COLOR[flag.severity] || '#94A3B8');
      doc.setFillColor(r, g, b);
      doc.rect(20, y - 4, 3, 14, 'F');

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${flag.category.replace(/_/g, ' ').toUpperCase()} — ${flag.severity.toUpperCase()}`,
        26,
        y + 1
      );
      y += 7;

      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(flag.description, 160);
      doc.text(descLines, 26, y);
      y += descLines.length * 5 + 2;

      doc.setTextColor(148, 163, 184);
      doc.text(`Confidence: ${flag.confidence}%`, 26, y);
      y += 9;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text('No risk flags identified.', 20, y);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Trust Onboarding Demo — Confidential', 20, 285);
  doc.text('Page 1', 182, 285);

  doc.save(
    `compliance-report-${applicant_name.replace(/\s+/g, '-').toLowerCase()}.pdf`
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [148, 163, 184];
}

export default function ComplianceReport({ application }) {
  const { compliance_report } = application;
  const isApproved = compliance_report.status === 'approved';

  return (
    <div className="card">
      <div className="report-header">
        <h2>Compliance Report</h2>
        {isApproved && (
          <button className="btn-primary" onClick={() => generatePDF(application)}>
            Download PDF
          </button>
        )}
      </div>

      <div className={`report-status-banner ${compliance_report.status}`}>
        Status: {compliance_report.status.replace(/_/g, ' ').toUpperCase()}
      </div>

      <p className="report-summary">{compliance_report.summary}</p>

      {compliance_report.flags.length > 0 && (
        <>
          <h3>Risk Flags</h3>
          {compliance_report.flags.map((flag, i) => (
            <div
              key={i}
              className="flag-card"
              style={{ borderLeftColor: SEVERITY_COLOR[flag.severity] || '#94A3B8' }}
            >
              <div
                className="flag-title"
                style={{ color: SEVERITY_COLOR[flag.severity] || '#64748B' }}
              >
                {flag.category.replace(/_/g, ' ')} &mdash; {flag.severity}
              </div>
              <div className="flag-desc">{flag.description}</div>
              <div className="flag-confidence">Confidence: {flag.confidence}%</div>
            </div>
          ))}
        </>
      )}

      <div className="report-meta">
        Reviewed {compliance_report.reviewed_date} &nbsp;&middot;&nbsp; {compliance_report.reviewer}
      </div>
    </div>
  );
}
