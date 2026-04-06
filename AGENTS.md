# Kembuk Finance - Agent Collaboration Guide

## Project Overview
Next.js financial management app with Supabase backend and Gemini AI for receipt scanning.

## Access Credentials (Ask Paesol/Kembuk for latest tokens)

### Supabase
- URL: `https://pdvvjfydlucotahmqagf.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdnZqZnlkbHVjb3RhaG1xYWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNDU4MzAsImV4cCI6MjA3OTYyMTgzMH0.dy1QDbPU2JyMgv9cmf5oIH76nFavzgaO_-a2MMUZijw`

### Vercel
- Project: `kembuk-finance-next`
- Token: Ask Paesol for token
- Project ID: `prj_wgcZsCMuMMXQSTxmVX6jG9mB1UQ0`

### GitHub
- Owner: `faisalekasyahputra`
- Repo: `kembuk-finance-next`
- PAT: Ask Paesol for token

## Database Tables
- `kf_transactions` - Transaction records (user_id, type, amount, category, date, etc.)
- `p2p_users` - User accounts (email, balance, role)
- `p2p_devices` - Device tracking
- `p2p_contacts` - Contact management
- `melly_projects` - Projects management

## Commit Message Format

**IMPORTANT:** Setiap commit HARUS include identity agent:
```
[AgentName]: Explain what was changed in English
```

Example:
```
Ndrogrok: Fix shared data query to show all transactions from kf_transactions table
Opencode: Add delete transaction functionality
Agent-Lio: Implement chart visualization for dashboard
```

## Workflow

### 1. Before Starting
```bash
# Clone the repo
git clone https://github.com/faisalekasyahputra/kembuk-finance-next.git
cd kembuk-finance-next

# Install dependencies
npm install

# Create .env.local with credentials
```

### 2. Development
```bash
npm run dev  # Start local dev server
npm run build  # Build for production
```

### 3. Deploy to Vercel
```bash
# Push to GitHub first
git add .
git commit -m "feat: your changes"
git push origin main

# Then deploy via Vercel API
curl -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer <VERCEL_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"gitSource":{"type":"github","repo":"faisalekasyahputra/kembuk-finance-next","ref":"main"},"project":"prj_wgcZsCMuMMXQSTxmVX6jG9mB1UQ0"}'
```

### 4. Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://pdvvjfydlucotahmqagf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
GEMINI_API_KEY=<gemini-key>
```

## Tech Stack
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI**: Google Gemini for receipt analysis
- **Deployment**: Vercel

## Key Files
- `src/app/page.tsx` - Main app UI
- `src/lib/supabase.ts` - Supabase client
- `src/app/api/analyze-receipt/route.ts` - Receipt OCR API

## Contact
Owner: faisalekasyahputra / paisaleee@gmail.com
