-- Kembuk Finance - Target Checklist Feature
-- Run this in Supabase SQL Editor

-- 1. Create kf_targets table
CREATE TABLE IF NOT EXISTS kf_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT DEFAULT 'shared',
  name TEXT NOT NULL,
  amount DECIMAL(15,0) NOT NULL,
  due_date TEXT,
  is_recurring BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create kf_target_payments table
CREATE TABLE IF NOT EXISTS kf_target_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID REFERENCES kf_targets(id) ON DELETE CASCADE,
  user_id TEXT DEFAULT 'shared',
  amount DECIMAL(15,0) NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_id UUID REFERENCES kf_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add is_bill flag to categories
ALTER TABLE kf_categories ADD COLUMN IF NOT EXISTS is_bill BOOLEAN DEFAULT false;

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON kf_targets(user_id);
CREATE INDEX IF NOT EXISTS idx_target_payments_target_id ON kf_target_payments(target_id);
CREATE INDEX IF NOT EXISTS idx_target_payments_user_id ON kf_target_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_target_payments_paid_at ON kf_target_payments(paid_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE kf_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kf_target_payments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for kf_targets
CREATE POLICY "kf_targets_select" ON kf_targets
  FOR SELECT USING (user_id = 'shared');

CREATE POLICY "kf_targets_insert" ON kf_targets
  FOR INSERT WITH CHECK (user_id = 'shared');

CREATE POLICY "kf_targets_update" ON kf_targets
  FOR UPDATE USING (user_id = 'shared');

CREATE POLICY "kf_targets_delete" ON kf_targets
  FOR DELETE USING (user_id = 'shared');

-- 7. RLS Policies for kf_target_payments
CREATE POLICY "kf_target_payments_select" ON kf_target_payments
  FOR SELECT USING (user_id = 'shared');

CREATE POLICY "kf_target_payments_insert" ON kf_target_payments
  FOR INSERT WITH CHECK (user_id = 'shared');

CREATE POLICY "kf_target_payments_update" ON kf_target_payments
  FOR UPDATE USING (user_id = 'shared');

CREATE POLICY "kf_target_payments_delete" ON kf_target_payments
  FOR DELETE USING (user_id = 'shared');

-- 8. Insert sample targets
INSERT INTO kf_targets (name, amount, due_date, is_recurring) VALUES
  ('Listrik PLN', 150000, '2026-04-15', true),
  ('Wifi Indihome', 275000, '2026-04-20', true),
  ('Pulsa Kuota', 100000, '2026-04-25', true),
  ('Angsuran Barang', 500000, '2026-04-10', true);

-- 9. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kf_targets_updated_at
  BEFORE UPDATE ON kf_targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
