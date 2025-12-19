-- Add missing columns to profiles table
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "net_salary" numeric;
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "income_from_other_sources" numeric;
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "income_from_house_property" numeric;
