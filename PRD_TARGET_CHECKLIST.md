# Kembuk Finance - Target Checklist Feature
## Product Requirements Document (PRD)

---

## 1. Overview

Menambahkan fitur **Target Checklist** - daftar pengeluaran tetap yang harus dibayar secara berkala. Fitur ini menggantikan peran kategori dalam modal transaksi.

---

## 2. Problem Statement

Saat ini:
- Kategori transaksi tidak terhubung dengan target spesifik
- User sulit tracking pengeluaran tetap (listrik, wifi, cicilan, dll)
- Tidak ada sistem reminder untuk pengeluaran wajib

---

## 3. Proposed Solution

### 3.1 New Page: Target Checklist

Halaman baru di tab "Target" yang menampilkan:
- **Daftar target** dengan nama, jumlah, dan status
- **Checkbox** untuk menandai sudah dibayar/belum
- **Progress** menunjukkan berapa target sudah selesai
- **Total** yang harus dibayar bulan ini

### 3.2 Database Schema

```sql
-- Table: kf_targets
CREATE TABLE kf_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'shared',
  name TEXT NOT NULL,           -- Contoh: "Listrik PLN", "Wifi Indihome"
  amount DECIMAL(15,0) NOT NULL,  -- Contoh: 150000
  due_date TEXT,                -- Tanggal jatuh tempo: "2026-04-15"
  is_recurring BOOLEAN DEFAULT true,  -- Berulang tiap bulan?
  category_id UUID REFERENCES kf_categories(id),  -- Link ke kategori
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: kf_target_payments
CREATE TABLE kf_target_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES kf_targets(id) ON DELETE CASCADE,
  user_id TEXT DEFAULT 'shared',
  amount DECIMAL(15,0) NOT NULL,
  paid_at TIMESTAMP DEFAULT NOW(),
  transaction_id UUID REFERENCES kf_transactions(id),  -- Link ke transaksi
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table: kf_categories (existing, add is_bill flag)
ALTER TABLE kf_categories ADD COLUMN is_bill BOOLEAN DEFAULT false;
```

### 3.3 UI/UX Flow

#### Halaman Target Checklist:
```
┌─────────────────────────────────────┐
│  🎯 TARGET CHECKLIST                │
├─────────────────────────────────────┤
│  April 2026          [22%] 5/12    │
│  ████████░░░░░░░░░░░░░░░░░░░░░    │
├─────────────────────────────────────┤
│  ☑ Listrik PLN        Rp 150.000   │
│  ☑ Wifi Indihome      Rp 275.000   │
│  ☐ Cicilan Motor      Rp 1.200.000 │
│  ☐ Angsuran Barang    Rp 500.000   │
│  ☐ Pulsa Kuota        Rp 100.000   │
├─────────────────────────────────────┤
│  TOTAL BULAN INI                   │
│  Rp 2.325.000                      │
├─────────────────────────────────────┤
│  [+ Tambah Target]  [📊 Statistik]  │
└─────────────────────────────────────┘
```

#### Modal Add Transaction (Updated):
```
┌─────────────────────────────────────┐
│  TAMBAH TRANSAKSI              [X] │
├─────────────────────────────────────┤
│  Tipe: [Masuk] [Keluar]            │
├─────────────────────────────────────┤
│  Target:                             │
│  ┌─────────────────────────────┐    │
│  │ ☑ Listrik PLN              │    │
│  │ ☑ Wifi Indihome            │    │
│  │ ☐ Cicilan Motor            │    │
│  │ ☐ Angsuran Barang          │    │
│  └─────────────────────────────┘    │
│  Atau ketik target baru...          │
├─────────────────────────────────────┤
│  Jumlah: Rp [________]              │
│  Tanggal: [2026-04-08]            │
├─────────────────────────────────────┤
│  [         SIMPAN TRANSAKSI      ]  │
└─────────────────────────────────────┘
```

### 3.4 User Flow

1. **Minggu awal bulan**: User melihat semua target di checklist
2. **Saat ada pengeluaran**: User buka "Tambah Transaksi"
   - Pilih target dari multiselect
   - Jumlah auto-fill dari target (bisa di-edit)
3. **Setelah bayar**: Target otomatis tercentang
4. **Bulan baru**: Semua target reset ke unchecked

### 3.5 Key Features

#### Target Management:
- CRUD target (Create, Read, Update, Delete)
- Tandai sebagai recurring/bulanan
- Set tanggal jatuh tempo
- Filter: Semua / Aktif / Selesai

#### Transaction Integration:
- Multiselect target saat add transaction
- Auto-fill amount dari target
- Link transaction ke target
- Update status otomatis saat transaction created

#### Dashboard:
- Total target bulan ini
- Progress (X/Y target selesai)
- Alert untuk target yang jatuh tempo

---

## 4. Technical Implementation

### 4.1 API Endpoints

```
GET    /api/targets              - List all targets
POST   /api/targets             - Create target
PUT    /api/targets/[id]        - Update target
DELETE /api/targets/[id]        - Delete target
GET    /api/targets/[id]/payments - Get payments for target

GET    /api/target-payments      - Get payments for current month
POST   /api/target-payments      - Mark target as paid (creates transaction)
DELETE /api/target-payments/[id] - Unmark target as paid
```

### 4.2 Data Flow

```
User pays bill
    ↓
Create Transaction + Target Payment
    ↓
Update target status (paid/unpaid)
    ↓
Recalculate dashboard stats
```

### 4.3 Migration Steps

1. Create new tables
2. Add `is_bill` column to categories
3. Update UI components
4. Add API routes
5. Test integration

---

## 5. Acceptance Criteria

- [ ] User bisa CRUD target
- [ ] User bisa multi-select target saat add transaction
- [ ] Transaction otomatis link ke target
- [ ] Checklist status update otomatis
- [ ] Progress bar akurat
- [ ] Data tersimpan di Supabase
- [ ] Responsive mobile design

---

## 6. Out of Scope (v1)

- Recurring automation (auto-create transactions)
- Push notifications
- Target categories/folders
- Export/Import data
- Multiple currencies

---

## 7. Timeline

| Phase | Task | Estimated Time |
|-------|------|---------------|
| 1 | Database migration + API | 30 min |
| 2 | Target CRUD UI | 45 min |
| 3 | Transaction modal update | 30 min |
| 4 | Checklist integration | 30 min |
| 5 | Testing + Bug fix | 30 min |

**Total: ~3 hours**

---

## 8. Priority

**HIGH** - Core feature untuk tracking pengeluaran tetap

---

*Created by: Ndrogrok*
*Date: 2026-04-08*
