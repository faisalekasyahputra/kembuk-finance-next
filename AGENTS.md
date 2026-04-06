# Kembuk Finance - Agent Collaboration Guide

## Project Overview
Next.js financial management app with Supabase backend and Gemini AI for receipt scanning.

## Team Members
| Identity | Role | Can Edit | Can Push | Can Deploy |
|----------|------|----------|----------|------------|
| Ndrogrok | AI Agent | ✅ | ✅ | ✅ |
| Kembukbot | AI Agent | ✅ | ✅ | ✅ |
| Faisal Eka Syahputra (Kembuk) | Owner | ✅ | ✅ | ✅ |

## Access Credentials

### GitHub
```
Owner: faisalekasyahputra
Repo: https://github.com/faisalekasyahputra/kembuk-finance-next
PAT: github_pat_xxx (ask Kembuk)
```

### Vercel
```
Project: kembuk-finance-next
Token: vcp_xxx (ask Kembuk)
Project ID: prj_wgcZsCMuMMXQSTxmVX6jG9mB1UQ0
Scope: faisalekasyahputras-projects
URL: https://kembuk-finance-next.vercel.app
```

### Supabase
```
URL: https://pdvvjfydlucotahmqagf.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Commit Message Format (WAJIB)

Every commit MUST include identity prefix:
```
[AgentName]: Explain what was changed in English
```

Examples:
```
Ndrogrok: Fix shared data query to show all transactions from kf_transactions table
Kembukbot: Add delete transaction functionality
Faisal Eka Syahputra: Update dashboard UI design
```

---

## Complete Workflow

### 1. Clone Repository
```bash
git clone https://github.com/faisalekasyahputra/kembuk-finance-next.git
cd kembuk-finance-next
```

### 2. Setup Git Identity
```bash
# Choose one identity:
git config user.name "Ndrogrok"
git config user.email "opencode@kembuk.com"

# OR
git config user.name "Kembukbot"
git config user.email "kembukbot@kembuk.com"

# OR
git config user.name "Faisal Eka Syahputra"
git config user.email "faisalekasyahputra@gmail.com"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create .env.local (for local dev)
```bash
touch .env.local
```

Add these variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://pdvvjfydlucotahmqagf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### 5. Development
```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Build for production
npm run lint        # Check code style
```

### 6. Edit Code
- Edit files in `src/` directory
- Main UI: `src/app/page.tsx`
- Database: `src/lib/supabase.ts`
- API routes: `src/app/api/`

### 7. Push Changes to GitHub
```bash
# Stage changes
git add .

# Commit with identity prefix
git commit -m "[AgentName]: [Explain what was changed in English]"

# Push to GitHub
git push origin main
```

### 8. Deploy to Vercel
```bash
# Pull latest from GitHub (recommended)
git pull origin main

# Deploy to production
npx vercel --token YOUR_VERCEL_TOKEN --prod --yes --scope faisalekasyahputras-projects

# Or deploy preview
npx vercel --token YOUR_VERCEL_TOKEN --yes --scope faisalekasyahputras-projects
```

---

## Database Schema

### Table: kf_transactions
```sql
id          UUID PRIMARY KEY
user_id     TEXT
type        TEXT ('income' or 'expense')
category_id TEXT
category_name TEXT
category_group TEXT
amount      NUMERIC
description TEXT
date        DATE
created_at  TIMESTAMP
```

### Table: p2p_users
```sql
id              UUID PRIMARY KEY
email           TEXT
full_name      TEXT
avatar_url     TEXT
role           TEXT
balance        NUMERIC
referral_code  TEXT
bank_name      TEXT
bank_account   TEXT
status         TEXT
created_at     TIMESTAMP
```

---

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Lucide Icons
- **Backend**: Supabase (PostgreSQL)
- **AI**: Google Gemini for receipt OCR
- **Deployment**: Vercel

## Key Files
- `src/app/page.tsx` - Main app UI
- `src/lib/supabase.ts` - Supabase client
- `src/lib/formatters.ts` - Currency/date formatters
- `src/app/api/analyze-receipt/route.ts` - Receipt OCR API

## Contact
- Owner: Faisal Eka Syahputra (paisaleee@gmail.com)
