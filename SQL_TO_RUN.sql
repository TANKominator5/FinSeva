-- Run this SQL in your Supabase Dashboard SQL Editor to add the missing columns

ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "first_name" text;
ALTER TABLE "public"."profiles" ADD COLUMN IF NOT EXISTS "last_name" text;

-- Optional: Add a check constraint or default value if needed
-- ALTER TABLE "public"."profiles" ALTER COLUMN "first_name" SET DEFAULT '';
-- ALTER TABLE "public"."profiles" ALTER COLUMN "last_name" SET DEFAULT '';
