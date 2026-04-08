# PRD: Sistem Tabungan Otomatis

## Naming Convention (PENTING!)

| Feature | Nama | Purpose |
|---------|------|---------|
| Sing wes ono | **Tagihan** | Bill/tagihan sing kudu dibayar (Listrik, Wifi, Cicilan) |
| Anu | **Tabungan** | Barang sing pengen dituku (Sepatu, Sandal, Rumah) |

**Rename:** "Target Checklist" → **"Tagihan"**

---

## Overview

Fitur tabungan sing otomatis nampung sisa saldo (income - expense) lan mbagi rata menyang tabungan-target (sepatu, sandal, omah, lsp).

---

## Problem Statement

Sekarang mom kudu input tabungan manual. Perlu sistem otomatis:
1. Sisa saldo (income - expense) otomatis masuk tabungan
2. Tabungan terbagi rata ke target-tabungan sing ono
3. Target-tabungan = barang sing pengen dituku (sepatu, sandal, rumah)

---

## Design

### Database Schema

```sql
-- Tabungan utama (saldo tabungan keseluruhan)
CREATE TABLE kf_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'shared',
  balance DECIMAL(15,2) DEFAULT 0,  -- Saldo tabungan total
  auto_save_percent INTEGER DEFAULT 20,  -- % sisa saldo sing otomatis ke-save (default 20%)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Target tabungan (barang sing pengen dituku)
CREATE TABLE kf_savings_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'shared',
  name TEXT NOT NULL,  -- Nama barang: "Sepatu", "Sandal", "Rumah"
  target_amount DECIMAL(15,2) NOT NULL,  -- Harga barang
  current_amount DECIMAL(15,2) DEFAULT 0,  -- Wes ke-tabung(sepatu 300k, 150k, lsp)
  icon TEXT DEFAULT 'PiggyBank',
  color TEXT DEFAULT '#22c55e',
  priority INTEGER DEFAULT 0,  -- Prioritas (1 = utama, 2 = sekunder, lsp)
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Riwayat tabungan (log transaksi tabungan)
CREATE TABLE kf_savings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'shared',
  type TEXT NOT NULL,  -- 'auto_save', 'manual_add', 'withdraw', 'purchase_complete'
  amount DECIMAL(15,2) NOT NULL,
  balance_before DECIMAL(15,2) NOT NULL,
  balance_after DECIMAL(15,2) NOT NULL,
  target_id UUID REFERENCES kf_savings_targets(id),  -- NULL kalo bukan ke target tertentu
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Auto-Save Logic

```javascript
// Setiap selesai transaksi:
// 1. Hitung sisa saldo: balance = totalIncome - totalExpense
// 2. Hitung auto-save: autoSave = sisa * (auto_save_percent / 100)
// 3. Update kf_savings.balance += autoSave
// 4. Bagi rata ke semua kf_savings_targets sing is_active=true lan is_completed=false
// 5. Create log ing kf_savings_history

// Contoh:
// Income: 1.000.000
// Expense: 700.000
// Sisa: 300.000
// Auto-save (20%): 60.000
// Targets aktif: [Sepatu(300k), Sandal(100k), Rumah(500jt)]
// Bagi rata: 60.000 / 3 = 20.000 per target
```

### UI Flow

```
┌─────────────────────────────────────┐
│  💰 TABUNGAN                        │
├─────────────────────────────────────┤
│  Saldo Utama: Rp 2.500.000         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  [Settings] [Tambah Tabungan]       │
│                                     │
│  ── Tabungan Aktif ──               │
│  ┌─────────────────────────────┐    │
│  │ 👟 Sepatu Nike              │    │
│  │ ████████░░░░░░░░░ 33%     │    │
│  │ Rp 300.000 / Rp 900.000    │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │ 🩴 Sandal                  │    │
│  │ ████████████████░░░░ 80%   │    │
│  │ Rp 80.000 / Rp 100.000     │    │
│  └─────────────────────────────┘    │
│                                     │
│  ── Tabungan Selesai ──             │
│  ┌─────────────────────────────┐    │
│  │ ✅ Rumah (COMPLETED)        │    │
│  └─────────────────────────────┘    │
│                                     │
│  ── Settings ──                    │
│  % Otomatis: [===20%===]          │
│  [Tambah Manual] [Tarik]           │
└─────────────────────────────────────┘
```

---

## API Endpoints

### Savings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings` | Get main savings balance |
| PUT | `/api/savings` | Update auto-save percentage |
| POST | `/api/savings/manual-add` | Add savings manually |
| POST | `/api/savings/withdraw` | Withdraw from savings |

### Savings Targets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings-targets` | Get all targets |
| POST | `/api/savings-targets` | Create new target |
| PUT | `/api/savings-targets/[id]` | Update target |
| DELETE | `/api/savings-targets/[id]` | Delete target |

### History

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/savings-history` | Get savings history |

---

## Implementation Steps

### Phase 1: Database
- [ ] Create tables: `kf_savings`, `kf_savings_targets`, `kf_savings_history`
- [ ] Set up RLS policies
- [ ] Insert default row in `kf_savings` for user 'shared'

### Phase 2: API Routes
- [ ] `/api/savings/route.ts` - GET, PUT
- [ ] `/api/savings-targets/route.ts` - CRUD
- [ ] `/api/savings-history/route.ts` - GET
- [ ] `/api/savings/manual-add/route.ts` - POST
- [ ] `/api/savings/withdraw/route.ts` - POST

### Phase 3: Auto-Save Logic
- [ ] Create trigger function `fn_auto_save_savings()`
- [ ] Call after every transaction insert/update
- [ ] Distribute evenly to active targets

### Phase 4: UI
- [ ] Create new Tab "Tabungan" with auto-save
- [ ] Target cards with progress bars
- [ ] Settings modal (auto-save %)
- [ ] Manual add/withdraw buttons
- [ ] History view

---

## Notes

- Default auto-save: 20% dari sisa
- Target selesai pas `current_amount >= target_amount`
- User iso ngganti % auto-save (0-100%)
- Kalo target wis selesai, saldo ora bakal ke-bagi ke target e

---

## Status

**Proposed** - Mom, согласный kamu tentang desain iki? Wes bener arahnyo?
