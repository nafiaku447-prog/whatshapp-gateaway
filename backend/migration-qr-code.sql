-- Migration: Add qr_code column to devices table if not exists
ALTER TABLE devices ADD COLUMN IF NOT EXISTS qr_code TEXT;
