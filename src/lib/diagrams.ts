// Single source for the Mermaid diagrams shown on /architecture. The same
// diagram text is mirrored in the backend README so GitHub renders it inline.
// Keep these in sync with backend/README.md if either changes.

export const ARCHITECTURE_DIAGRAM = `flowchart LR
  FE["Next.js Frontend<br/>(Vercel)"]
  API["CRM API (FastAPI)<br/>customers / segments / campaigns / ai / receipts"]
  CH["Channel Service<br/>(FastAPI stub)"]
  DB[("Supabase Postgres<br/>+ Supabase Auth")]
  LLM["LLM<br/>Groq Llama 3.3 70B primary<br/>OpenRouter fallback"]

  FE -->|"HTTPS, JWT"| API
  API -->|"batch POST /send"| CH
  CH -.->|"async HMAC-signed callbacks<br/>POST /receipts"| API
  API --> DB
  API -->|"prompt, parse, validate"| LLM
`;

export const RECEIPT_LOOP_DIAGRAM = `sequenceDiagram
  autonumber
  participant CH as Channel Service
  participant R as CRM /receipts
  participant E as Events log (append-only)
  participant C as Communications (derived status)

  CH->>R: POST batch [delivered, clicked dup, delivered dup, failed]
  Note over R: Verify HMAC-SHA256 over raw body. 401 before any parse if wrong.
  Note over R: In-batch dedupe by (communication_id, event_type)
  R->>E: INSERT ON CONFLICT (communication_id, event_type) DO NOTHING
  Note over E: Duplicate callbacks become silent no-ops (idempotency)
  R->>C: UPDATE status WHERE status_rank < incoming_rank
  Note over C: Out-of-order safe. clicked(5) before delivered(2) upgrades; late delivered never downgrades.
  CH->>R: Retry same batch with backoff
  R->>E: ON CONFLICT DO NOTHING returns 0 new rows
  Note over R,C: Retry storm is harmless, status unchanged
  R-->>CH: 200 {accepted, duplicate, unknown_communication}
`;
