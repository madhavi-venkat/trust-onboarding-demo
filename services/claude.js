const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

// Risk flag categories used across compliance report analysis
const RISK_CATEGORIES = [
  {
    id: "missing_documents",
    label: "Missing Required Documents",
    description:
      "Onboarding submission is incomplete — required files (ID, proof of address, signed agreements) were not uploaded.",
    severity: "high",
  },
  {
    id: "identity_mismatch",
    label: "Identity Verification Mismatch",
    description:
      "Name, DOB, or ID number on submitted documents does not match the information provided in the onboarding form.",
    severity: "high",
  },
  {
    id: "sanctions_hit",
    label: "Sanctions / Watchlist Hit",
    description:
      "Applicant name or associated entity appears on a government sanctions list or internal watchlist.",
    severity: "critical",
  },
  {
    id: "duplicate_account",
    label: "Duplicate Account Detected",
    description:
      "A previously onboarded account shares the same email, phone, or identity document as this submission.",
    severity: "medium",
  },
  {
    id: "high_risk_jurisdiction",
    label: "High-Risk Jurisdiction",
    description:
      "Applicant's country of residence or business registration is flagged as high-risk under current compliance policy.",
    severity: "high",
  },
  {
    id: "pep_flag",
    label: "Politically Exposed Person (PEP)",
    description:
      "Applicant is identified as a current or former government official, requiring enhanced due diligence.",
    severity: "high",
  },
  {
    id: "adverse_media",
    label: "Adverse Media / Negative News",
    description:
      "News screening returned results linking the applicant to fraud, money laundering, or other financial crimes.",
    severity: "medium",
  },
];

/**
 * Analyzes a raw onboarding document and returns a structured compliance report.
 * Uses Claude to extract fields and evaluate each risk category.
 */
async function analyzeComplianceReport(documentText) {
  const systemPrompt = `You are a compliance analyst AI. Given an onboarding document,
extract key fields and assess the following risk categories.
For each category, return a JSON object with:
- category_id (string)
- triggered (boolean)
- confidence (low | medium | high)
- evidence (short quote or explanation from the document)
- recommended_action (string)

Risk categories to evaluate: ${RISK_CATEGORIES.map((r) => r.id).join(", ")}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Analyze this onboarding document for compliance risks:\n\n${documentText}`,
      },
    ],
  });

  const rawText = response.content[0].text;

  // Extract JSON block from Claude's response
  const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) ||
    rawText.match(/(\[[\s\S]*\])/);
  if (!jsonMatch) {
    throw new Error("Claude did not return a parseable JSON compliance report");
  }

  const flags = JSON.parse(jsonMatch[1]);
  return {
    triggered_flags: flags.filter((f) => f.triggered),
    all_flags: flags,
    summary: buildSummary(flags),
  };
}

/**
 * Extracts structured fields from an onboarding document using Claude.
 * Returns name, DOB, address, document type, and document number.
 */
async function extractDocumentFields(documentText) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Extract the following fields from this identity document as JSON:
- full_name
- date_of_birth (ISO 8601)
- address
- document_type (passport | drivers_license | national_id)
- document_number
- expiry_date (ISO 8601, if present)
- issuing_country

Document:\n${documentText}

Return only valid JSON, no explanation.`,
      },
    ],
  });

  return JSON.parse(response.content[0].text);
}

function buildSummary(flags) {
  const triggered = flags.filter((f) => f.triggered);
  if (triggered.length === 0) return "No compliance flags detected.";

  const bySeverity = {};
  for (const flag of triggered) {
    const category = RISK_CATEGORIES.find((r) => r.id === flag.category_id);
    const sev = category?.severity ?? "unknown";
    bySeverity[sev] = (bySeverity[sev] || 0) + 1;
  }

  const parts = Object.entries(bySeverity).map(
    ([sev, count]) => `${count} ${sev}`
  );
  return `${triggered.length} flag(s) triggered: ${parts.join(", ")}.`;
}

module.exports = {
  analyzeComplianceReport,
  extractDocumentFields,
  RISK_CATEGORIES,
};
