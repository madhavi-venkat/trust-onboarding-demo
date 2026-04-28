const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  // Applications
  listApplications:  ()           => request('/applications'),
  getApplication:    (id)         => request(`/applications/${id}`),
  createApplication: (data)       => request('/applications', { method: 'POST', body: data }),
  updateApplication: (id, data)   => request(`/applications/${id}`, { method: 'PUT', body: data }),
  updateStatus:      (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteApplication: (id)         => request(`/applications/${id}`, { method: 'DELETE' }),

  // Trustees
  getTrustees:    (appId)       => request(`/applications/${appId}/trustees`),
  addTrustee:     (appId, data) => request(`/applications/${appId}/trustees`, { method: 'POST', body: data }),
  updateTrustee:  (id, data)    => request(`/trustees/${id}`, { method: 'PUT', body: data }),
  deleteTrustee:  (id)          => request(`/trustees/${id}`, { method: 'DELETE' }),

  // Beneficiaries
  getBeneficiaries:  (appId)       => request(`/applications/${appId}/beneficiaries`),
  addBeneficiary:    (appId, data) => request(`/applications/${appId}/beneficiaries`, { method: 'POST', body: data }),
  updateBeneficiary: (id, data)    => request(`/beneficiaries/${id}`, { method: 'PUT', body: data }),
  deleteBeneficiary: (id)          => request(`/beneficiaries/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (appId) => request(`/applications/${appId}/documents`),

  uploadDocument: (appId, file, documentType) => {
    const form = new FormData();
    form.append('file', file);
    form.append('documentType', documentType);
    return fetch(`${BASE}/applications/${appId}/documents`, { method: 'POST', body: form })
      .then((r) => { if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r.json(); });
  },

  downloadUrl:    (docId) => `${BASE}/documents/${docId}/download`,
  viewUrl:        (docId) => `${BASE}/documents/${docId}/view`,
  deleteDocument: (docId) => request(`/documents/${docId}`, { method: 'DELETE' }),

  // Review workflow
  reviewApplication: (id, data) => request(`/applications/${id}/review`, { method: 'POST', body: data }),
};
