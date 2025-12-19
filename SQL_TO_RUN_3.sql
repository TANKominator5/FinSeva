-- Drop redundant columns from profiles table
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "net_salary";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "income_from_other_sources";
ALTER TABLE "public"."profiles" DROP COLUMN IF EXISTS "income_from_house_property";
