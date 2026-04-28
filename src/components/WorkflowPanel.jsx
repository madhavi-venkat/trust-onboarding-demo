import { useState } from 'react';
import { api } from '../services/api';

const STEPS = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED'];

const STEP_LABEL = {
  DRAFT:        'Draft',
  SUBMITTED:    'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED:     'Approved',
  REJECTED:     'Rejected',
};

function stepIndex(status) {
  if (status === 'REJECTED') return 2; // sits at UNDER_REVIEW position
  return STEPS.indexOf(status);
}

export default function WorkflowPanel({ application, onUpdate }) {
  const [reviewedBy, setReviewedBy] = useState('');
  const [notes,      setNotes]      = useState('');
  const [busy,       setBusy]       = useState(false);
  const [error,      setError]      = useState(null);

  const { status } = application;
  const currentIdx  = stepIndex(status);
  const isRejected  = status === 'REJECTED';
  const isDone      = status === 'APPROVED' || status === 'REJECTED';

  async function doAction(action) {
    if (!reviewedBy.trim() && action !== 'submit') {
      setError('Please enter the reviewer name.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await api.reviewApplication(application.id, { action, notes, reviewedBy });
      onUpdate(updated);
      setNotes('');
    } catch (e) {
      setError(`Action failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h2>Application Workflow</h2>

      {/* Status timeline */}
      <div className="workflow-timeline">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx || (idx === currentIdx && !isRejected);
          const active  = idx === currentIdx && !isRejected;
          const rejected = isRejected && idx === 2;

          let dotClass = 'wf-dot';
          if (rejected)     dotClass += ' wf-dot-rejected';
          else if (done)    dotClass += ' wf-dot-done';
          else if (active)  dotClass += ' wf-dot-active';

          return (
            <div key={step} className="wf-step">
              <div className={dotClass}>
                {done && !active ? '✓' : (rejected ? '✕' : idx + 1)}
              </div>
              <div className={`wf-label${active || done || rejected ? ' wf-label-active' : ''}`}>
                {rejected ? 'Rejected' : STEP_LABEL[step]}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`wf-connector${idx < currentIdx ? ' wf-connector-done' : ''}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Action area */}
      {isDone ? (
        <div className={`wf-result ${isRejected ? 'wf-result-rejected' : 'wf-result-approved'}`}>
          <div className="wf-result-title">
            {isRejected ? 'Application Rejected' : 'Application Approved'}
          </div>
          {application.reviewedBy && (
            <div className="wf-result-meta">
              Reviewed by <strong>{application.reviewedBy}</strong>
              {application.reviewedAt && (
                <> on {new Date(application.reviewedAt).toLocaleDateString('en-AU', { dateStyle: 'medium' })}</>
              )}
            </div>
          )}
          {application.reviewNotes && (
            <div className="wf-result-notes">{application.reviewNotes}</div>
          )}
        </div>
      ) : (
        <div className="wf-actions">
          {status !== 'DRAFT' && (
            <div className="wf-field">
              <label>Reviewer Name <span className="required-star">*</span></label>
              <input
                className="input"
                placeholder="Enter your name"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
              />
            </div>
          )}

          {status === 'UNDER_REVIEW' && (
            <div className="wf-field">
              <label>Review Notes</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Add notes (required for rejection)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>
          )}

          {error && <p className="error-msg" style={{ marginBottom: 8 }}>{error}</p>}

          <div className="wf-buttons">
            {status === 'DRAFT' && (
              <button className="btn-primary" disabled={busy} onClick={() => doAction('submit')}>
                {busy ? 'Submitting…' : 'Submit for Review'}
              </button>
            )}
            {status === 'SUBMITTED' && (
              <button className="btn-primary" disabled={busy} onClick={() => doAction('start_review')}>
                {busy ? 'Starting…' : 'Start Review'}
              </button>
            )}
            {status === 'UNDER_REVIEW' && (
              <>
                <button className="btn-approve" disabled={busy} onClick={() => doAction('approve')}>
                  {busy ? 'Processing…' : 'Approve'}
                </button>
                <button className="btn-reject" disabled={busy} onClick={() => doAction('reject')}>
                  {busy ? 'Processing…' : 'Reject'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
