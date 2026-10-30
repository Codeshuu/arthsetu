# Database Schema - Arthsetu

## Entities
- `users`: User authentication, roles, timestamps
- `businesses`: Legal identity, GSTIN, PAN, industry
- `transactions`: Date, amount, debit/credit, category, source references
- `sources`: Bank accounts, ERP systems, accounting exports
- `import_batches`: Batch upload tracking, status, error logs
- `import_rows`: Raw parsed row records and validation status
- `reconciliations`: Match pairs, confidence scores, discrepancy records
- `passports`: Generated credit readiness passports, score snapshots, evidence tokens
