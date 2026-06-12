-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS qr_codes (
  id BIGSERIAL PRIMARY KEY,
  qr_id TEXT UNIQUE NOT NULL,
  original_url TEXT,
  qr_url TEXT,
  short_code TEXT UNIQUE NOT NULL,
  title TEXT,
  total_clicks INTEGER DEFAULT 0,
  payment_type TEXT,
  qr_type TEXT,
  amount REAL,
  paybill_number TEXT,
  till_number TEXT,
  pochi_number TEXT,
  reference TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  qr_id BIGINT REFERENCES qr_codes(id),
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT,
  browser_name TEXT,
  browser_version TEXT,
  os_name TEXT,
  country TEXT,
  city TEXT,
  referer TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION increment_clicks(qr_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE qr_codes
  SET total_clicks = total_clicks + 1
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql;
