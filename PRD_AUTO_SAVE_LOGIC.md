# PRD: Auto-Save Logic untuk Tabungan

## 📋 Overview

Fitur auto-save sing automatically nambahin saldo tabungan lan mbagi rata ke target-tabungan setiap selesai transaksi.

---

## 🎯 Goal

Setiap selesai transaksi (income/expense), sistem automatically:
1. Hitung sisa saldo: `income - expense`
2. Hitung auto-save: `sisa × (auto_save_percent / 100)`
3. Update `kf_savings.balance`
4. Update `kf_savings_targets.current_amount` (bagi rata)
5. Create log ing `kf_savings_history`

---

## 📊 Logic Flow

```
┌─────────────────────────────────────────────────────┐
│  USER COMPLETES TRANSACTION                         │
│                                                     │
│  ┌─────────────────────────────────────────────┐  │
│  │ 1. Calculate Balance                         │  │
│  │    totalIncome - totalExpense = sisa         │  │
│  │    Contoh: 1.000.000 - 700.000 = 300.000     │  │
│  └─────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 2. Calculate Auto-Save                       │  │
│  │    sisa × (auto_save_percent / 100)          │  │
│  │    Contoh: 300.000 × (20 / 100) = 60.000    │  │
│  └─────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 3. Update Savings Balance                    │  │
│  │    kf_savings.balance += 60.000             │  │
│  └─────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 4. Distribute to Active Targets             │  │
│  │    amount_per_target = 60.000 / 3           │  │
│  │    Sepatu: current += 20.000                │  │
│  │    Sandal: current += 20.000               │  │
│  │    HP Gaming: current += 20.000             │  │
│  └─────────────────────────────────────────────┘  │
│                       ↓                             │
│  ┌─────────────────────────────────────────────┐  │
│  │ 5. Create History Log                       │  │
│  │    type: 'auto_save'                        │  │
│  │    amount: 60.000                           │  │
│  │    target_id: NULL (ke semua)               │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Changes

### Update `kf_savings` table (already exists)
```sql
-- Add helper column for tracking last calculation
ALTER TABLE kf_savings ADD COLUMN IF NOT EXISTS last_total_income DECIMAL(15,2) DEFAULT 0;
ALTER TABLE kf_savings ADD COLUMN IF NOT EXISTS last_total_expense DECIMAL(15,2) DEFAULT 0;
```

### New Function: `fn_calculate_auto_save()`
```sql
CREATE OR REPLACE FUNCTION fn_calculate_auto_save()
RETURNS void AS $$
DECLARE
  v_total_income DECIMAL(15,2);
  v_total_expense DECIMAL(15,2);
  v_sisa DECIMAL(15,2);
  v_auto_save DECIMAL(15,2);
  v_auto_save_percent INTEGER;
  v_active_targets INTEGER;
  v_amount_per_target DECIMAL(15,2);
  v_balance_before DECIMAL(15,2);
  v_savings_id UUID;
BEGIN
  -- Get totals from transactions
  SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)
  INTO v_total_income, v_total_expense
  FROM kf_transactions
  WHERE user_id = 'shared';

  -- Check if totals changed
  SELECT id, balance, auto_save_percent, last_total_income, last_total_expense
  INTO v_savings_id, v_balance_before, v_auto_save_percent, v_sisa, v_auto_save
  FROM kf_savings
  WHERE user_id = 'shared';

  -- Only run if totals changed
  IF v_total_income != v_sisa OR v_total_expense != v_auto_save THEN
    -- Calculate
    v_sisa = v_total_income - v_total_expense;
    v_auto_save = v_sisa * (v_auto_save_percent / 100.0);
    
    -- Update savings
    UPDATE kf_savings
    SET balance = v_auto_save,
        last_total_income = v_total_income,
        last_total_expense = v_total_expense,
        updated_at = NOW()
    WHERE user_id = 'shared';

    -- Count active targets
    SELECT COUNT(*) INTO v_active_targets
    FROM kf_savings_targets
    WHERE user_id = 'shared'
      AND is_active = true
      AND is_completed = false;

    IF v_active_targets > 0 AND v_auto_save > 0 THEN
      v_amount_per_target = v_auto_save / v_active_targets;
      
      -- Update each active target
      UPDATE kf_savings_targets
      SET current_amount = current_amount + v_amount_per_target,
          updated_at = NOW()
      WHERE user_id = 'shared'
        AND is_active = true
        AND is_completed = false;

      -- Create history log
      INSERT INTO kf_savings_history (user_id, type, amount, balance_before, balance_after, description)
      VALUES ('shared', 'auto_save', v_auto_save, v_balance_before, v_auto_save,
              'Auto-save dari ' || v_active_targets || ' target aktif');
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔧 Implementation Steps

### Step 1: Database
- [ ] Add columns `last_total_income`, `last_total_expense` to `kf_savings`
- [ ] Create function `fn_calculate_auto_save()`

### Step 2: API Endpoint (optional - for manual trigger)
- [ ] Create `/api/savings/calculate` - POST endpoint

### Step 3: Frontend Integration
- [ ] Call auto-save after transaction insert/update/delete
- [ ] Show toast notification when auto-save happens

### Step 4: Edge Cases
- [ ] What if `auto_save_percent = 0`? → Skip auto-save
- [ ] What if no active targets? → Still save to main balance
- [ ] What if `current_amount >= target_amount`? → Mark as completed

---

## ⚠️ Considerations

1. **Performance**: Function runs on every transaction. Consider caching or running via cron job every hour instead.

2. **Alternative: Cron Job Approach**:
   ```javascript
   // Run every hour via cron
   // Calculate totals from transactions
   // Compare with last calculation
   // If changed, run auto-save logic
   ```

3. **Race Condition**: Multiple simultaneous transactions might cause issues. Consider using database transactions with row locking.

---

## 📁 Files to Modify

| File | Change |
|------|--------|
| Supabase DB | Add columns, create function |
| `/api/savings/calculate/route.ts` | Optional manual trigger |
| `page.tsx` | Call after transaction CRUD |

---

## ✅ Deliverables

- [ ] Database function created
- [ ] Auto-save triggers on transaction change
- [ ] Savings balance updates correctly
- [ ] Target progress bars update
- [ ] History log created

---

## Status

**Proposed** - Perlu konfirmasi sebelum eksekusi.
