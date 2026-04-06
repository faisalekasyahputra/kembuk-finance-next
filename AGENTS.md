# Kembuk Finance - Agent Collaboration Guide

## Project Overview
Next.js financial management app with Supabase backend and Gemini AI for receipt scanning.

---

## Team Members
| Identity | Role | Can Edit | Can Push | Can Deploy |
|----------|------|----------|----------|------------|
| Ndrogrok | AI Agent | ✅ | ✅ | ✅ |
| Kembukbot | AI Agent | ✅ | ✅ | ✅ |
| Faisal Eka Syahputra (Kembuk) | Owner | ✅ | ✅ | ✅ |

---

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

---

## Collaboration Rules (WAJIB DIIKUTI)

### 1. STRICT SEQUENCE (WAJIB)
```
BEFORE ANY WORK:
1. git pull origin main
2. Check git log: git log --oneline -5
3. Check what files were recently changed
4. Only then claim & work
```

### 2. File Locking System
**EFORE editing ANY file:**
1. Check GitHub Issues: https://github.com/faisalekasyahputra/kembuk-finance-next/issues
2. If task exists, comment: "[AgentName]: Working on [file.tsx]"
3. If task doesn't exist, CREATE ISSUE first
4. Only then edit

### 3. DON'T Edit Same File at Same Time (HARD RULE)
- If another agent claimed a file in last 24h, DON'T touch it
- Check: `git log --oneline --author=[AgentName] -3`
- Wait for the agent to push and deploy

### 4. Always Pull Before Edit
```bash
git pull origin main
git log --oneline -5  # Check recent changes
```

### 5. Test Before Push
```bash
npm run build  # Must pass
npm run lint   # Must pass
```

### 6. Deploy After Push
After pushing, deploy immediately so other agents can see changes.

---

## Commit Message Format (WAJIB)

Every commit MUST include identity prefix:
```
[AgentName]: [Action] [What was changed]
```

Format rules:
- Action: Add, Fix, Update, Refactor, Remove, Improve
- What: Brief description in English
- End with period (.)

Examples:
```
Ndrogrok: Add transaction list component with CRUD operations.
Kembukbot: Fix CSS dark theme for mobile navigation.
Faisal Eka Syahputra: Update dashboard with weekly summary charts.
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
# Ndrogrok
git config user.name "Ndrogrok"
git config user.email "opencode@kembuk.com"

# Kembukbot
git config user.name "Kembukbot"
git config user.email "kembukbot@kembuk.com"

# Kembuk
git config user.name "Faisal Eka Syahputra"
git config user.email "faisalekasyahputra@gmail.com"
```

### 3. Pull Latest Changes (MANDATORY)
```bash
git pull origin main
```

### 4. Create/Check GitHub Issue for Your Task
```bash
# If task not listed, create issue:
# Title: "[Feature/Bug]: Brief description"
# Body: "Agent: [who will work] | Status: [TODO/IN PROGRESS/DONE]"
```

### 5. Edit Code
Edit only your assigned files/tasks.

### 6. Test Locally
```bash
npm run build      # Build must succeed
npm run lint       # No lint errors
```

### 7. Push to GitHub
```bash
git add .
git commit -m "[AgentName]: [Action] [What was changed]."
git push origin main
```

### 8. Deploy to Vercel
```bash
# MUST pull first
git pull origin main

# Deploy production
npx vercel --token YOUR_VERCEL_TOKEN --prod --yes --scope faisalekasyahputras-projects
```

### 9. Update GitHub Issue
Comment: "Agent: DONE - Deployed to https://kembuk-finance-next.vercel.app"

---

## Conflict Resolution

### If git pull shows conflicts:
```bash
# See conflicted files
git status

# Resolve conflicts manually, then:
git add .
git commit -m "Ndrogrok: Resolve merge conflicts."
git push origin main
```

### If another agent pushed while you were working:
```bash
# Option A: Stash your changes
git stash
git pull origin main
git stash pop
# Fix any conflicts, then push

# Option B: Fetch and rebase
git fetch origin
git rebase origin/main
# Fix conflicts during rebase, then push
```

---

## Branching Strategy

For small fixes: Direct push to `main`

For large features: Create feature branch
```bash
git checkout -b feature/receipt-scanner
# Work on feature...
git push origin feature/receipt-scanner
# Create PR or merge after testing
git checkout main
git merge feature/receipt-scanner
git push origin main
```

---

## Issue Status Workflow

| Status | Meaning | Action |
|--------|---------|--------|
| TODO | Not started | Agent can claim |
| IN_PROGRESS | Being worked on | Only assigned agent edits |
| REVIEW | Work done, needs check | Other agent reviews |
| DONE | Deployed & verified | Close issue |

---

## Testing Checklist (Before Deploy)

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Database connection works
- [ ] New features work as expected

---

## Rollback Procedure

If deployed version has issues:

```bash
# Find last working commit
git log --oneline

# Revert problematic commit
git revert HEAD
git push origin main

# Deploy again
npx vercel --token YOUR_VERCEL_TOKEN --prod --yes --scope faisalekasyahputras-projects
```

---

## Communication Protocol

### Before Starting Work:
1. Check GitHub Issues for current tasks
2. Claim task by commenting: "AgentName: Working on this"
3. Pull latest changes

### During Work:
1. Work on ONLY your assigned task
2. Don't touch files other agents are working on
3. Push early and often

### After Completing:
1. Test thoroughly
2. Push code
3. Deploy to Vercel
4. Update GitHub Issue status
5. Comment what was done

---

## Database Schema

### Table: kf_transactions
```sql
id          UUID PRIMARY KEY
user_id     TEXT (use 'shared' for all users)
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

---

## Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main app UI |
| `src/lib/supabase.ts` | Supabase client |
| `src/lib/formatters.ts` | Currency/date formatters |
| `src/app/api/analyze-receipt/route.ts` | Receipt OCR API |

---

## Important Notes

1. **NO AUTH** - This app is shared between Kembuk and girlfriend (1 user)
2. **Shared Data** - All transactions use `user_id: 'shared'`
3. **NO SECRETS** - Never push API keys or tokens to GitHub
4. **ALWAYS PULL** - Before editing anything
5. **TEST FIRST** - Build must pass before push

---

## File Lock Status
**Current file locks (DO NOT edit if locked by another agent):**

| File | Locked By | Status | Since |
|------|-----------|--------|-------|
| src/app/page.tsx | - | UNLOCKED | - |

---

## Contact
- Owner: Faisal Eka Syahputra (paisaleee@gmail.com)
