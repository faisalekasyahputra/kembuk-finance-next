# Kembuk Finance - Agent Collaboration Guide

## Universal Workflow (Works for ALL Projects)

```
Agent push → GitHub → Vercel Git Integration → Auto Deploy
```

---

## Team Members

| Identity | Role | Git Name | Email |
|----------|------|---------|-------|
| Ndrogrok | AI Agent | Ndrogrok | opencode@kembuk.com |
| Kembukbot | AI Agent | Kembukbot | kembukbot@kembuk.com |
| Faisal Eka Syahputra | Owner | Faisal Eka Syahputra | faisalekasyahputra@gmail.com |

---

## Setup Git Identity

```bash
# Ndrogrok
git config user.name "Ndrogrok"
git config user.email "opencode@kembuk.com"

# Kembukbot
git config user.name "Kembukbot"
git config user.email "kembukbot@kembuk.com"

# Kembuk (Owner)
git config user.name "Faisal Eka Syahputra"
git config user.email "faisalekasyahputra@gmail.com"
```

---

## Complete Workflow

### 1. Clone
```bash
git clone https://github.com/faisalekasyahputra/kembuk-finance-next.git
cd kembuk-finance-next
```

### 2. Pull (ALWAYS BEFORE EDIT)
```bash
git pull origin main
git log --oneline -5
```

### 3. Edit
Edit only your assigned files.

### 4. Test
```bash
npm run build  # Must pass
npm run lint   # No errors
```

### 5. Commit
```bash
git add .
git commit -m "[AgentName]: [Action] [What changed]."
```

**Format:** `[AgentName]: [Action] [What changed].`

**Examples:**
```
Ndrogrok: Add transaction list component with CRUD operations.
Kembukbot: Fix CSS dark theme for mobile navigation.
Faisal Eka Syahputra: Update dashboard with weekly summary charts.
```

### 6. Push
```bash
git push origin main
# AUTO-DEPLOY TRIGGERS!
```

### 7. Verify
Check: https://kembuk-finance-next.vercel.app

---

## Conflict Resolution

### If Conflict
```bash
git stash
git pull origin main
git stash pop
# Fix conflicts, then push
```

---

## Important Rules

1. **ALWAYS pull before edit**
2. **Commit message MUST include agent identity**
3. **Test before push** (build must pass)
4. **Don't edit same file simultaneously** - coordinate first
5. **NO SECRETS** - Never push API keys to GitHub

---

## Project-Specific Info

### Access
- **GitHub**: https://github.com/faisalekasyahputra/kembuk-finance-next
- **Vercel**: https://kembuk-finance-next.vercel.app (auto-deploy on push)
- **Supabase**: pdvvjfydlucotahmqagf.supabase.co

### Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Supabase
- Gemini AI (receipt OCR)
- Vercel

### Key Files
| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main app UI |
| `src/lib/supabase.ts` | Supabase client |
| `src/app/api/analyze-receipt/route.ts` | Gemini OCR API |

### Notes
- No Auth - Kembuk & pacar share data (user_id: 'shared')
- All transactions use `user_id: 'shared'`

---

## For New Projects

See: Universal Multi-Agent Collaboration Template

1. Create GitHub repo
2. Connect Vercel to GitHub (Settings → Git → Connect)
3. Clone locally
4. Setup git identity
5. Push → Auto deploy!

---

## Contact
- Owner: Faisal Eka Syahputra (paisaleee@gmail.com)
