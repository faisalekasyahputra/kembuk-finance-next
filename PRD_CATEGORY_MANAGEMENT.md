# PRD: Hybrid Category Management System

## Overview

Sistem pengelolaan kategori hybrid untuk Kembuk Finance - memungkinkan user menambah kategori baru langsung dari modal transaksi (inline) sekaligus fitur lengkap di Settings page.

---

## Goals

1. User bisa tambah kategori baru **tanpa keluar** dari flow transaksi
2. User bisa edit, hapus, atur icon & warna di **Settings**
3. Kategori terpisah berdasarkan **tipe** (income/expense)
4. Default categories untuk user baru

---

## Current State

### Existing Table: `kf_categories`
```sql
id          UUID PRIMARY KEY
name        TEXT           -- Nama English (e.g., "Food")
name_id     TEXT           -- Nama Indonesia (e.g., "Makanan")
icon        TEXT           -- Lucide icon name (e.g., "Utensils")
color       TEXT           -- Hex color (e.g., "#EF4444")
group_type  TEXT           -- 'expense' | 'income'
budget      DECIMAL        -- Budget bulanan (opsional)
created_at  TIMESTAMP
```

### Current Categories (Sample):
| Name | Name_ID | Icon | Color | Type |
|------|---------|------|-------|------|
| Bensin | Bensin | Fuel | #6366F1 | expense |
| Makanan | Makanan | Utensils | #22C55E | expense |
| Gaji | Gaji | Wallet | #3B82F6 | income |
| ... | ... | ... | ... | ... |

---

## Design

### 1. Inline Add (Quick Add)

**Location:** Di dalam modal transaksi, saat pilih kategori

**Flow:**
```
Pilih Kategori → [Gak ada yang cocok] → + Tambah Kategori Baru
                                                    ↓
                                            Modal Quick Add
                                                    ↓
                                            Nama, Icon, Warna
                                                    ↓
                                              ✓ Simpan
                                                    ↓
                                        Kategori langsung terpilih
```

**UI Quick Add Modal:**
```
┌─────────────────────────────────┐
│  ✕                              │
│                                 │
│  ➕ Kategori Baru               │
│                                 │
│  Nama Kategori                  │
│  ┌───────────────────────────┐  │
│  │ e.g., "Parkiran"          │  │
│  └───────────────────────────┘  │
│                                 │
│  Tipe                           │
│  ┌─────────┐ ┌─────────┐       │
│  │ ◉ Peng  │ │ ○ Pend  │       │
│  └─────────┘ └─────────┘       │
│                                 │
│  Icon                           │
│  🏠 🚗 🍔 👕 💊 🎮 📱 ...     │
│                                 │
│  Warna                          │
│  🔴 🟠 🟡 🟢 🔵 🟣 ⚫          │
│                                 │
│  ┌───────────────────────────┐  │
│  │        💾 Simpan         │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Icon Options:**
- Lucide icons yang umum dipakai
- Pre-selected berdasarkan nama (e.g., "Makanan" → Utensils)

**Color Options:**
- Pre-defined palette yang catchy
- Color picker untuk advanced

---

### 2. Category Management Page

**Location:** Settings → Kelola Kategori

**UI:**
```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ Settings                                           │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │  📁 Kelola Kategori                             │    │
│  │                                                 │    │
│  │  🔵 Pengeluaran           [+ Tambah]            │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │ 🏠 Rumah         [✏️] [🗑️]              │  │    │
│  │  │ 🚗 Transportasi  [✏️] [🗑️]              │  │    │
│  │  │ 🍔 Makanan       [✏️] [🗑️]              │  │    │
│  │  │ ...                                     │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  │                                                 │    │
│  │  🟢 Pemasukan         [+ Tambah]               │    │
│  │  ┌─────────────────────────────────────────┐  │    │
│  │  │ 💼 Gaji         [✏️] [🗑️]              │  │    │
│  │  │ 🎁 Bonus       [✏️] [🗑️]              │  │    │
│  │  │ ...                                     │  │    │
│  │  └─────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**CRUD Operations:**
- **Create:** Full form (nama, icon, warna, budget)
- **Read:** List dengan search & filter
- **Update:** Edit semua field
- **Delete:** Soft delete / confirm dialog

---

## API Design

### POST /api/categories (Create)
```json
// Request
{
  "name": "Parkiran",
  "name_id": "Parkiran",
  "icon": "Car",
  "color": "#6366F1",
  "group_type": "expense"
}

// Response
{
  "category": { "id": "...", "name": "...", ... }
}
```

### GET /api/categories
```json
// Response
{
  "categories": [
    { "id": "...", "name": "...", "group_type": "expense", ... },
    { "id": "...", "name": "...", "group_type": "income", ... }
  ]
}
```

### PUT /api/categories/[id]
```json
// Request
{
  "name": "Parkiran Updated",
  "icon": "Car",
  "color": "#EF4444"
}
```

### DELETE /api/categories/[id]
```json
// Response
{
  "success": true
}
```

---

## Database Changes

### Add new fields (optional, if needed):
```sql
ALTER TABLE kf_categories ADD COLUMN IF NOT EXISTS user_id TEXT DEFAULT 'shared';
ALTER TABLE kf_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE kf_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
```

### RLS Policy:
```sql
CREATE POLICY "kf_categories_select" ON kf_categories
  FOR SELECT USING (user_id = 'shared');

CREATE POLICY "kf_categories_insert" ON kf_categories
  FOR INSERT WITH CHECK (user_id = 'shared');

CREATE POLICY "kf_categories_update" ON kf_categories
  FOR UPDATE USING (user_id = 'shared');

CREATE POLICY "kf_categories_delete" ON kf_categories
  FOR DELETE USING (user_id = 'shared');
```

---

## Implementation Plan

### Phase 1: API Routes
- [x] GET `/api/categories` - List all categories
- [x] POST `/api/categories` - Create category
- [x] PUT `/api/categories/[id]` - Update category
- [x] DELETE `/api/categories/[id]` - Delete category

### Phase 2: Inline Add UI
- [ ] Add "Tambah Kategori" button in category selector
- [ ] Quick Add modal with name, icon picker, color picker
- [ ] Save and auto-select new category

### Phase 3: Category Management Page
- [ ] Settings page with category list
- [ ] Full CRUD operations
- [ ] Search & filter functionality

### Phase 4: Polish
- [ ] Icon picker component
- [ ] Color picker component
- [ ] Validation (duplicate name check)
- [ ] Toast notifications

---

## Component List

| Component | Location | Description |
|-----------|----------|-------------|
| `CategorySelector` | Transaction Modal | Dropdown dengan search |
| `QuickAddCategory` | Inline Modal | Form simpel tambah kategori |
| `IconPicker` | Shared | Grid icon picker |
| `ColorPicker` | Shared | Color palette + picker |
| `CategoryList` | Settings Page | List dengan edit/delete |
| `CategoryForm` | Settings Page | Full form |

---

## Icon Options

Pre-defined icons untuk category:
```javascript
const CATEGORY_ICONS = [
  'Home', 'Car', 'Utensils', 'Shirt', 'Heart',
  'Pill', 'Gamepad2', 'Smartphone', 'Laptop', 'Book',
  'Plane', 'Hotel', 'ShoppingBag', 'Gift', 'Wallet',
  'Briefcase', 'GraduationCap', 'Baby', 'Coffee', 'Music',
  'Film', 'BookOpen', 'Dumbbell', 'Scissors', 'Sparkles',
  'Zap', 'Wifi', 'Phone', 'Camera', 'Printer',
  'Wrench', 'Fuel', 'Building', 'Store', 'Package'
]
```

---

## Color Palette

Pre-defined colors untuk category:
```javascript
const CATEGORY_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#000000', // Black
]
```

---

## User Flow Examples

### Flow 1: Quick Add (Inline)
1. User buka modal transaksi
2. Pilih kategori → gak ada yang cocok
3. Klik "+ Tambah Kategori Baru"
4. Isi nama "Parkiran", pilih icon 🚗, warna 🔵
5. Klik Simpan
6. Kategori "Parkiran" otomatis terpilih
7. Lanjut transaksi seperti biasa

### Flow 2: Full Management (Settings)
1. User ke Settings → Kelola Kategori
2. Lihat list semua kategori
3. Edit "Makanan" → ubah icon ke 🍔
4. Hapus kategori yang gak dipakai
5. Atur urutan dengan drag-drop (future)

---

## Future Enhancements

1. **Budget per Kategori** - Set budget bulanan per kategori
2. **Category Analytics** - Statistik spending per kategori
3. **Recurring Categories** - Kategori untuk recurring expenses
4. **Import/Export** - Backup & restore categories
5. **Icon Upload** - Custom icon upload

---

## Status

- [ ] Draft
- [x] Approved by Faisal
- [ ] In Progress
- [ ] Completed

---

## Questions

1. Icon picker - fixed list atau search?
2. Boleh hapus kategori yang udah punya transaksi?
3. Mau ada budget per kategori?
