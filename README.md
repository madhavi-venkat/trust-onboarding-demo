# Trust Onboarding Demo

An AI-powered onboarding experience built with Claude and the Anthropic API, demonstrating how intelligent automation can streamline trust and compliance workflows.

## AI Capabilities

### Intelligent Document Analysis
- Automatically extracts and summarizes key information from onboarding documents
- Identifies missing fields, inconsistencies, and compliance gaps using Claude's reasoning
- Supports PDFs, forms, and unstructured text

### Conversational Onboarding Assistant
- Guides users through onboarding steps via natural language conversation
- Answers policy and compliance questions in real time
- Escalates edge cases to human reviewers with full context

### Automated Compliance Checks
- Cross-references submitted data against configurable trust and safety rules
- Generates audit-ready summaries of onboarding decisions
- Flags high-risk signals for manual review

### Workflow Orchestration via MCP
- Integrates with Google Drive, Gmail, and Calendar via MCP servers
- Pulls documents, sends notifications, and schedules follow-ups automatically
- Extensible to Figma, Miro, and other tools via the MCP protocol

## Tech Stack

- **AI**: [Claude](https://www.anthropic.com/claude) (Anthropic API)
- **Protocol**: [Model Context Protocol (MCP)](https://modelcontextprotocol.io) for tool integrations
- **Integrations**: Google Drive, Gmail, Google Calendar, Figma, Miro

## Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/trust-onboarding-demo.git
cd trust-onboarding-demo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your ANTHROPIC_API_KEY and other credentials

# Run the app
npm start
```

## Project Structure

```
trust-onboarding-demo/
├── README.md
├── src/
│   ├── agent/        # Claude agent and tool definitions
│   ├── mcp/          # MCP server integrations
│   └── workflows/    # Onboarding workflow logic
└── docs/             # Policy and compliance reference docs
```

## License

MIT
