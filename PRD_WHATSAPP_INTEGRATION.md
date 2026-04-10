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

### Completed:
- [x] WhatsApp OpenClaw channel configured & connected
- [x] API route `/api/whatsapp/send` created
- [x] Receipt format function created
- [x] Integration with transaction flow (sends after Telegram)

### Test Result:
```
Message sent successfully to +628993320808
MessageId: 3EB098420364A6F43571DB
```

### Files Created:
- `src/app/api/whatsapp/send/route.ts` - API endpoint
- `src/lib/whatsapp.ts` - Helper functions
- `PRD_WHATSAPP_INTEGRATION.md` - This document

### How It Works:
1. User adds transaction in Kembuk Finance
2. Receipt generated & sent to Telegram
3. Same receipt formatted & sent to WhatsApp via OpenClaw
4. Both notifications sent automatically

### Configuration:
```bash
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_TOKEN=f1512d8ed36e4ccfb192f8c939b709399167432b23853271
DEFAULT_WHATSAPP_NUMBER=+628993320808
```

### Decisions Made:
1. Using existing number (+628993320808)
2. Using OpenClaw Baileys (unofficial, free)
3. Both Telegram & WhatsApp run in parallel
