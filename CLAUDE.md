# Kembuk Finance - Development Guide

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://pdvvjfydlucotahmqagf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-key
```

3. Run dev server:
```bash
npm run dev
```

## Tech Stack
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React icons

## Key Components
- `src/app/page.tsx` - Main dashboard
- `src/lib/supabase.ts` - Database client
- `src/lib/formatters.ts` - Currency/date formatting
- `src/app/api/analyze-receipt/route.ts` - Gemini OCR

## Deployment
Push to GitHub and Vercel will auto-deploy. Or use Vercel CLI:
```bash
npm i -g vercel
vercel --prod
```
