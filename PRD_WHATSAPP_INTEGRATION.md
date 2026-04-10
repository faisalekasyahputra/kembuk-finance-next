# PRD: WhatsApp Notification Integration

## Overview

Integrasi WhatsApp ke OpenClaw dan Kembuk Finance untuk mengirim notifikasi struk/transaksi, sebagai alternatif atau backup dari Telegram.

---

## Goals

1. Kirim notifikasi struk/transaksi via WhatsApp
2. Tersambung ke OpenClaw (agent bisa mengirim pesan WA)
3. User dapat memilih channel notifikasi (Telegram / WhatsApp / Both)

---

## Current State

### Telegram (Sudah ada)
- Bot Telegram untuk notifikasi struk
- API route: `/api/telegram/send-receipt`
- Config di `~/.openclaw/telegram/`

### WhatsApp (Plan)
- OpenClaw sudah support WhatsApp via Baileys
- Pakai unofficial WhatsApp Web protocol
- Resiko banned: Medium-High

---

## Architecture

```
User Transaksi → Kembuk Finance (Next.js)
                      ↓
              Supabase (kf_transactions)
                      ↓
              API: /api/send-notification
                      ↓
         ┌───────────┴───────────┐
         ↓                       ↓
   Telegram Bot            WhatsApp (Baileys)
   (via Telegram API)      (via OpenClaw)
```

---

## Components

### 1. WhatsApp Connection
- **Library**: Baileys (built-in OpenClaw)
- **Device**: Dedicated phone number (bukan nomer utama)
- **Session**: Persistent session dengan QR code auth
- **Location**: `~/.openclaw/devices/` atau folder khusus

### 2. API Route Baru
```
POST /api/notifications/send
{
  "type": "receipt" | "reminder" | "alert",
  "channel": "telegram" | "whatsapp" | "both",
  "data": {
    "transaction_id": "xxx",
    "amount": 50000,
    "category": "Makan",
    "date": "2026-04-10"
  }
}
```

### 3. User Preference Table
```sql
CREATE TABLE kf_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'shared',
  channel TEXT DEFAULT 'telegram', -- 'telegram' | 'whatsapp' | 'both'
  whatsapp_number TEXT,
  telegram_chat_id TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. OpenClaw WhatsApp Config
```json
{
  "channels": {
    "whatsapp": {
      "enabled": true,
      "dmPolicy": "allowlist",
      "allowFrom": ["+6281234567890"], // Nomer owner
      "selfChatMode": true
    }
  }
}
```

---

## Workflow

### Setup Flow
1. Scan QR code WhatsApp ( dedicate nomer)
2. Simpan session
3. Konfigurasi `kf_notification_preferences`
4. Test kirim notifikasi

### Runtime Flow
1. User input transaksi di Kembuk Finance
2. Backend simpan ke Supabase
3. Trigger API `/api/notifications/send`
4. Cek user preference
5. Kirim ke Telegram dan/atau WhatsApp

---

## WhatsApp Message Format

```
🧾 Struk Baru!

━━━━━━━━━━━━━━━━━
📅 10 April 2026, 14:30
━━━━━━━━━━━━━━━━━

💸 Pengeluaran
💰 Rp 50.000

📂 Kategori: Makan
📝 Deskripsi: Lunch di Warung Mang Udin

💡 Tagihan: Cicilan HP (pending)
━━━━━━━━━━━━━━━━━
💼 Saldo: Rp 2.500.000
```

---

## Resiko & Mitigation

| Resiko | Mitigation |
|--------|------------|
| WhatsApp banned | Pakai nomer dedicated, jangan spam |
| Session expire | Auto-reconnect, backup session |
| Rate limit | Delay antar pesan, batch notifikasi |
| Privacy | Nomer tidak di-share, encrypt storage |

---

## Alternative: WhatsApp Business API

Kalau mau lebih aman & resmi:

### Opsi:
1. **Twilio WhatsApp** - ~$0.05/msg, easy setup
2. **MessageBird** - ~$0.04/msg, enterprise grade
3. **Meta Business API** - gratis tapi perlu approval

### Pros:
- ✅ Resmi & stabil
- ✅ Gak ada banned
- ✅ Template messages

### Cons:
- ❌ Butuh verifikasi bisnis
- ❌ Approval dari Meta
- ❌ Limited free tier

---

## Implementation Plan

### Phase 1: Setup WhatsApp OpenClaw
- [ ] Enable WhatsApp channel di OpenClaw
- [ ] Scan QR dengan nomer dedicated
- [ ] Test kirim pesan

### Phase 2: Create API Route
- [ ] `/api/notifications/send`
- [ ] Integrate Baileys/WhatsApp
- [ ] Handle retry & error

### Phase 3: User Preferences
- [ ] Create `kf_notification_preferences` table
- [ ] UI toggle di Kembuk Finance
- [ ] Store WhatsApp number

### Phase 4: Integration
- [ ] Trigger notifikasi dari transaksi
- [ ] Format message sesuai template
- [ ] Test end-to-end

---

## ✅ IMPLEMENTED (2026-04-10)

### Architecture:
```
Kembuk Finance (Vercel)
    ↓ HTTP POST
Cloudflare Tunnel (public URL)
    ↓
WhatsApp Proxy (VPS port 18790)
    ↓ openclaw CLI
OpenClaw Gateway → WhatsApp (Baileys)
```

### Completed:
- [x] WhatsApp OpenClaw channel configured & connected
- [x] CLI-based proxy (`whatsapp-proxy.js`) - calls `openclaw message send`
- [x] Cloudflare tunnel for public access
- [x] Client-side WhatsApp send in transaction flow
- [x] Auto-start on VPS reboot

### Test Result:
```
curl -X POST https://july-recycling-keywords-artificial.trycloudflare.com/send \
  -d '{"target":"+628993320808","message":"Test!"}'
→ {"success":true,"result":{"messageId":"3EB05A4454F78FE32E4502"}}
```

### Files Created:
- `src/app/page.tsx` - WhatsApp send in transaction flow (client-side)
- `.env.example` - Environment variables
- `~/openclaw/whatsapp-proxy.js` - HTTP→CLI proxy (VPS)
- `~/openclaw/start-whatsapp.sh` - Auto-start script
- `PRD_WHATSAPP_INTEGRATION.md` - This document

### How It Works:
1. User adds transaction in Kembuk Finance
2. Receipt generated & sent to Telegram (server-side)
3. Same receipt formatted & sent to WhatsApp (client-side via cloudflare tunnel)
4. Proxy on VPS calls `openclaw message send`
5. OpenClaw sends to WhatsApp via Baileys

### VPS Setup:
```bash
# Auto-start on reboot
@reboot /home/ubuntu/.openclaw/start-whatsapp.sh

# Files location
/home/ubuntu/.openclaw/whatsapp-proxy.js  # HTTP proxy
/home/ubuntu/.openclaw/start-whatsapp.sh   # Startup script
```

### Environment Variables:
```bash
NEXT_PUBLIC_WHATSAPP_PROXY_URL=https://july-recycling-keywords-artificial.trycloudflare.com
NEXT_PUBLIC_WHATSAPP_DEFAULT=+628993320808
```

### Notes:
1. Cloudflare tunnel URL changes on restart (need to update env var)
2. For permanent URL: use Cloudflare account + named tunnel
3. WhatsApp via Baileys = unofficial, risk banned (small if not spam)

### Decisions Made:
1. Using existing number (+628993320808)
2. Using OpenClaw Baileys (unofficial, free)
3. Both Telegram & WhatsApp run in parallel
