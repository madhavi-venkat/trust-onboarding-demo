import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import DocumentsSection from '../components/DocumentsSection';

const TRUST_TYPES = [
  { value: 'INDIVIDUAL_FAMILY', label: 'Individual / Family' },
  { value: 'CHARITABLE',        label: 'Charitable' },
  { value: 'SUPERANNUATION',    label: 'Superannuation' },
];

const emptyTrustee = () => ({
  _new: true,
  trusteeType: 'INDIVIDUAL',
  fullName: '', dateOfBirth: '', taxFileNumber: '',
  companyName: '', acn: '',
  email: '', phone: '', address: '',
});

const emptyBeneficiary = () => ({
  _new: true,
  fullName: '', relationship: '', dateOfBirth: '',
  entitlementPercentage: '', isPrimary: false,
});

function Field({ label, required, error, children }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span className="required-star">*</span>}</label>
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

function TrusteeForm({ trustee, index, errors, onChange, onRemove }) {
  const err = (f) => errors[`trustee_${index}_${f}`];
  const set = (f) => (e) => onChange(index, f, e.target.value);

  return (
    <div className="dynamic-card">
      <div className="dynamic-card-header">
        <span className="dynamic-card-title">
          Trustee {index + 1}
          {trustee._new && <span style={{ marginLeft: 8, fontSize: 11, color: '#3B82F6', fontWeight: 400 }}>New</span>}
        </span>
        <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
      </div>

      <div className="form-grid">
        <Field label="Trustee Type" required>
          <select className="input" value={trustee.trusteeType} onChange={set('trusteeType')}>
            <option value="INDIVIDUAL">Individual</option>
            <option value="CORPORATE">Corporate</option>
          </select>
        </Field>

        {trustee.trusteeType === 'INDIVIDUAL' ? (
          <>
            <Field label="Full Name" required error={err('fullName')}>
              <input className={`input${err('fullName') ? ' has-error' : ''}`}
                value={trustee.fullName || ''} onChange={set('fullName')} placeholder="Full legal name" />
            </Field>
            <Field label="Date of Birth">
              <input type="date" className="input" value={trustee.dateOfBirth || ''} onChange={set('dateOfBirth')} />
            </Field>
            <Field label="Tax File Number">
              <input className="input" value={trustee.taxFileNumber || ''} onChange={set('taxFileNumber')} placeholder="000 000 000" />
            </Field>
          </>
        ) : (
          <>
            <Field label="Company Name" required error={err('companyName')}>
              <input className={`input${err('companyName') ? ' has-error' : ''}`}
                value={trustee.companyName || ''} onChange={set('companyName')} placeholder="Registered company name" />
            </Field>
            <Field label="ACN">
              <input className="input" value={trustee.acn || ''} onChange={set('acn')} placeholder="000 000 000" />
            </Field>
          </>
        )}

        <Field label="Email">
          <input type="email" className="input" value={trustee.email || ''} onChange={set('email')} placeholder="name@example.com" />
        </Field>
        <Field label="Phone">
          <input type="tel" className="input" value={trustee.phone || ''} onChange={set('phone')} placeholder="+61 400 000 000" />
        </Field>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea className="input" rows={2} value={trustee.address || ''} onChange={set('address')} placeholder="Full street address" />
        </div>
      </div>
    </div>
  );
}

function BeneficiaryForm({ ben, index, errors, onChange, onRemove }) {
  const err = (f) => errors[`ben_${index}_${f}`];
  const set = (f) => (e) => onChange(index, f, e.target.value);

  return (
    <div className="dynamic-card">
      <div className="dynamic-card-header">
        <span className="dynamic-card-title">
          Beneficiary {index + 1}
          {ben._new && <span style={{ marginLeft: 8, fontSize: 11, color: '#3B82F6', fontWeight: 400 }}>New</span>}
        </span>
        <button type="button" className="btn-remove" onClick={onRemove}>Remove</button>
      </div>

      <div className="form-grid">
        <Field label="Full Name" required error={err('fullName')}>
          <input className={`input${err('fullName') ? ' has-error' : ''}`}
            value={ben.fullName || ''} onChange={set('fullName')} placeholder="Beneficiary full name" />
        </Field>
        <Field label="Relationship">
          <input className="input" value={ben.relationship || ''} onChange={set('relationship')} placeholder="e.g. Spouse, Child" />
        </Field>
        <Field label="Date of Birth">
          <input type="date" className="input" value={ben.dateOfBirth || ''} onChange={set('dateOfBirth')} />
        </Field>
        <Field label="Entitlement (%)">
          <input type="number" className="input" min="0" max="100" step="0.01"
            value={ben.entitlementPercentage ?? ''} onChange={set('entitlementPercentage')} placeholder="0.00" />
        </Field>
        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 20 }}>
            <input type="checkbox" checked={ben.isPrimary || false}
              onChange={(e) => onChange(index, 'isPrimary', e.target.checked)} />
            Primary Beneficiary
          </label>
        </div>
      </div>
    </div>
  );
}

export default function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [trust,       setTrust]       = useState({ trustName: '', trustType: 'INDIVIDUAL_FAMILY', trustAbn: '', establishmentDate: '' });
  const [trustees,    setTrustees]    = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    api.getApplication(id).then((app) => {
      setTrust({
        trustName:         app.trustName         || '',
        trustType:         app.trustType          || 'INDIVIDUAL_FAMILY',
        trustAbn:          app.trustAbn           || '',
        establishmentDate: app.establishmentDate  || '',
      });
      setTrustees((app.trustees || []).map((t) => ({ ...t, _new: false })));
      setBeneficiaries((app.beneficiaries || []).map((b) => ({
        ...b,
        entitlementPercentage: b.entitlementPercentage ?? '',
        _new: false,
      })));
    }).finally(() => setLoading(false));
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!trust.trustName.trim()) errs.trustName = 'Trust name is required';
    trustees.forEach((t, i) => {
      if (t.trusteeType === 'INDIVIDUAL' && !t.fullName?.trim())
        errs[`trustee_${i}_fullName`] = 'Full name is required';
      if (t.trusteeType === 'CORPORATE' && !t.companyName?.trim())
        errs[`trustee_${i}_companyName`] = 'Company name is required';
    });
    beneficiaries.forEach((b, i) => {
      if (!b.fullName?.trim())
        errs[`ben_${i}_fullName`] = 'Full name is required';
    });
    return errs;
  };

  const trustChange = (field, value) => {
    setTrust((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const trusteeChange = (i, field, value) => {
    setTrustees((p) => p.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
    setErrors((p) => ({ ...p, [`trustee_${i}_${field}`]: undefined }));
  };

  const benChange = (i, field, value) => {
    setBeneficiaries((p) => p.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
    setErrors((p) => ({ ...p, [`ben_${i}_${field}`]: undefined }));
  };

  const removeTrustee = async (index) => {
    const t = trustees[index];
    if (!t._new && t.id) await api.deleteTrustee(t.id);
    setTrustees((p) => p.filter((_, idx) => idx !== index));
  };

  const removeBeneficiary = async (index) => {
    const b = beneficiaries[index];
    if (!b._new && b.id) await api.deleteBeneficiary(b.id);
    setBeneficiaries((p) => p.filter((_, idx) => idx !== index));
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.updateApplication(id, {
        trustName:         trust.trustName,
        trustType:         trust.trustType,
        trustAbn:          trust.trustAbn         || null,
        establishmentDate: trust.establishmentDate || null,
      });

      for (const t of trustees) {
        const payload = {
          trusteeType:   t.trusteeType,
          fullName:      t.fullName      || null,
          dateOfBirth:   t.dateOfBirth   || null,
          taxFileNumber: t.taxFileNumber || null,
          companyName:   t.companyName   || null,
          acn:           t.acn           || null,
          email:         t.email         || null,
          phone:         t.phone         || null,
          address:       t.address       || null,
        };
        if (t._new) {
          await api.addTrustee(id, payload);
        } else {
          await api.updateTrustee(t.id, payload);
        }
      }

      for (const b of beneficiaries) {
        const payload = {
          fullName:             b.fullName,
          relationship:         b.relationship         || null,
          dateOfBirth:          b.dateOfBirth          || null,
          entitlementPercentage: b.entitlementPercentage !== '' ? parseFloat(b.entitlementPercentage) : null,
          isPrimary:             b.isPrimary || false,
        };
        if (b._new) {
          await api.addBeneficiary(id, payload);
        } else {
          await api.updateBeneficiary(b.id, payload);
        }
      }

      navigate(`/applications/${id}`);
    } catch (e) {
      setSubmitError(`Save failed: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page"><p style={{ color: '#64748B' }}>Loading…</p></div>;

  return (
    <div className="page">
      <Link to={`/applications/${id}`} className="back-link">← Back to Detail</Link>
      <h1 style={{ marginTop: 16 }}>Edit Application</h1>
      <p className="page-subtitle">Update trust details, trustees, and beneficiaries then save.</p>

      {/* ── Trust Details ─────────────────────────────────────────────────── */}
      <div className="card">
        <h2>Trust Details</h2>
        <div className="form-grid">
          <Field label="Trust Name" required error={errors.trustName}>
            <input className={`input${errors.trustName ? ' has-error' : ''}`}
              value={trust.trustName}
              onChange={(e) => trustChange('trustName', e.target.value)} />
          </Field>

          <Field label="Trust Type" required>
            <select className="input" value={trust.trustType}
              onChange={(e) => trustChange('trustType', e.target.value)}>
              {TRUST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Trust ABN">
            <input className="input" value={trust.trustAbn}
              onChange={(e) => trustChange('trustAbn', e.target.value)} placeholder="00 000 000 000" />
          </Field>

          <Field label="Establishment Date">
            <input type="date" className="input" value={trust.establishmentDate}
              onChange={(e) => trustChange('establishmentDate', e.target.value)} />
          </Field>
        </div>
      </div>

      {/* ── Trustees ──────────────────────────────────────────────────────── */}
      <div className="card">
        <div className="section-header">
          <h2>Trustees</h2>
          <button type="button" className="btn-add"
            onClick={() => setTrustees((p) => [...p, emptyTrustee()])}>
            + Add Trustee
          </button>
        </div>
        {trustees.length === 0 && (
          <p style={{ color: '#94A3B8', fontSize: 13 }}>No trustees — click Add Trustee to add one.</p>
        )}
        {trustees.map((t, i) => (
          <TrusteeForm key={i} trustee={t} index={i} errors={errors}
            onChange={trusteeChange}
            onRemove={() => removeTrustee(i)} />
        ))}
      </div>

      {/* ── Beneficiaries ─────────────────────────────────────────────────── */}
      <div className="card">
        <div className="section-header">
          <h2>Beneficiaries</h2>
          <button type="button" className="btn-add"
            onClick={() => setBeneficiaries((p) => [...p, emptyBeneficiary()])}>
            + Add Beneficiary
          </button>
        </div>
        {beneficiaries.length === 0 && (
          <p style={{ color: '#94A3B8', fontSize: 13 }}>No beneficiaries added yet.</p>
        )}
        {beneficiaries.map((b, i) => (
          <BeneficiaryForm key={i} ben={b} index={i} errors={errors}
            onChange={benChange}
            onRemove={() => removeBeneficiary(i)} />
        ))}
      </div>

      {/* ── Documents ─────────────────────────────────────────────────────── */}
      <DocumentsSection applicationId={id} />

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      {submitError && <p style={{ color: '#EF4444', marginBottom: 12 }}>{submitError}</p>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 48 }}>
        <button className="btn-primary" onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </button>
        <Link to={`/applications/${id}`} className="btn-secondary">Cancel</Link>
      </div>
    </div>
  );
}
