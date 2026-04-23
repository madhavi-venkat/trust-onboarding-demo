import { useParams, Link } from 'react-router-dom';
import { applications } from '../data/applications';
import DynamicForm from '../components/DynamicForm';
import ComplianceReport from '../components/ComplianceReport';

const ONBOARDING_SCHEMA = [
  { id: 'full_name',       label: 'Full Name',          type: 'text',     required: true,  placeholder: 'Full legal name' },
  { id: 'date_of_birth',   label: 'Date of Birth',      type: 'date',     required: true },
  { id: 'document_type',   label: 'Document Type',      type: 'select',   required: true,  options: ['Passport', 'Driver License', 'National ID'] },
  { id: 'document_number', label: 'Document Number',    type: 'text',     required: true,  placeholder: 'e.g. US123456789' },
  { id: 'issuing_country', label: 'Issuing Country',    type: 'text',     required: true,  placeholder: 'Country of issue' },
  { id: 'expiry_date',     label: 'Expiry Date',        type: 'date',     required: true },
  { id: 'email',           label: 'Email Address',      type: 'email',    required: true,  placeholder: 'name@example.com' },
  { id: 'phone',           label: 'Phone Number',       type: 'tel',      required: false, placeholder: '+1 555 000 0000' },
  { id: 'address',         label: 'Residential Address',type: 'textarea', required: true,  placeholder: 'Full street address', fullWidth: true },
];

export default function ApplicationDetail() {
  const { id } = useParams();
  const application = applications.find((a) => a.id === id);

  if (!application) {
    return (
      <div className="page">
        <p>Application not found.</p>
        <Link to="/dashboard" className="back-link" style={{ marginTop: 12, display: 'inline-block' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const initialValues = {
    full_name:       application.applicant_name,
    date_of_birth:   application.date_of_birth,
    document_type:   application.document_type,
    document_number: application.document_number,
    issuing_country: application.issuing_country,
    expiry_date:     application.expiry_date,
    address:         application.address,
    email:           application.email,
    phone:           application.phone,
  };

  return (
    <div className="page">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

      <h1 style={{ marginTop: 16 }}>{application.applicant_name}</h1>
      <p className="page-subtitle">
        Application #{application.id} &nbsp;&middot;&nbsp; Submitted {application.submitted_date}
      </p>

      <div className="two-col">
        <div>
          <div className="card">
            <h2>Applicant Information</h2>
            <DynamicForm
              schema={ONBOARDING_SCHEMA}
              initialValues={initialValues}
              onSave={(values) => {
                console.log('Saved application data:', values);
              }}
            />
          </div>
        </div>

        <div>
          <ComplianceReport application={application} />
        </div>
      </div>
    </div>
  );
}
