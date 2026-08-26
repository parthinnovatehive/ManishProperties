-- ============================================================================
-- EstateElite - Complete Supabase PostgreSQL Schema and Data Migration Script
-- (Fixed Order + FKs + Data)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. CREATE TABLES (ORDERED BY DEPENDENCY)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public."admins" CASCADE;
CREATE TABLE public."admins" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" TEXT DEFAULT 'ADMIN',
    "name" TEXT,
    "phone" TEXT,
    "savedProperties" JSONB DEFAULT '[]'::jsonb,
    "status" TEXT DEFAULT 'active',
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."admins" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on admins" ON public."admins";
CREATE POLICY "Allow public read on admins" ON public."admins" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on admins" ON public."admins";
CREATE POLICY "Allow service role all on admins" ON public."admins" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."users" CASCADE;
CREATE TABLE public."users" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "role" TEXT DEFAULT 'USER',
    "savedProperties" JSONB DEFAULT '[]'::jsonb,
    "status" TEXT DEFAULT 'active',
    "passwordHash" TEXT,
    "agentRatings" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."users" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on users" ON public."users";
CREATE POLICY "Allow public read on users" ON public."users" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on users" ON public."users";
CREATE POLICY "Allow service role all on users" ON public."users" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."cities" CASCADE;
CREATE TABLE public."cities" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "image" TEXT,
    "admin_id" TEXT REFERENCES public."admins"("id") ON DELETE SET NULL,
    "status" TEXT DEFAULT 'active',
    "count" TEXT
);
ALTER TABLE public."cities" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on cities" ON public."cities";
CREATE POLICY "Allow public read on cities" ON public."cities" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on cities" ON public."cities";
CREATE POLICY "Allow service role all on cities" ON public."cities" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."sub_areas" CASCADE;
CREATE TABLE public."sub_areas" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "city_id" TEXT REFERENCES public."cities"("id") ON DELETE CASCADE,
    "status" TEXT DEFAULT 'active',
    "slug" TEXT,
    "agent_ids" JSONB DEFAULT '[]'::jsonb
);
ALTER TABLE public."sub_areas" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on sub_areas" ON public."sub_areas";
CREATE POLICY "Allow public read on sub_areas" ON public."sub_areas" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on sub_areas" ON public."sub_areas";
CREATE POLICY "Allow service role all on sub_areas" ON public."sub_areas" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."agents" CASCADE;
CREATE TABLE public."agents" (
    "id" TEXT PRIMARY KEY,
    "username" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "role" TEXT DEFAULT 'AGENT',
    "name" TEXT,
    "phone" TEXT,
    "status" TEXT DEFAULT 'active',
    "savedProperties" JSONB DEFAULT '[]'::jsonb,
    "sub_area_ids" JSONB DEFAULT '[]'::jsonb,
    "city_id" TEXT REFERENCES public."cities"("id") ON DELETE SET NULL,
    "sub_area_id" TEXT REFERENCES public."sub_areas"("id") ON DELETE SET NULL,
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."agents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on agents" ON public."agents";
CREATE POLICY "Allow public read on agents" ON public."agents" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on agents" ON public."agents";
CREATE POLICY "Allow service role all on agents" ON public."agents" FOR ALL USING (true) WITH CHECK (true);



DROP TABLE IF EXISTS public."sub_area_agents" CASCADE;
CREATE TABLE public."sub_area_agents" (
    "id" TEXT PRIMARY KEY,
    "sub_area_id" TEXT NOT NULL REFERENCES public."sub_areas"("id") ON DELETE CASCADE,
    "agent_id" TEXT NOT NULL REFERENCES public."agents"("id") ON DELETE CASCADE,
    "createdAt" TEXT
);
ALTER TABLE public."sub_area_agents" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on sub_area_agents" ON public."sub_area_agents";
CREATE POLICY "Allow public read on sub_area_agents" ON public."sub_area_agents" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on sub_area_agents" ON public."sub_area_agents";
CREATE POLICY "Allow service role all on sub_area_agents" ON public."sub_area_agents" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."properties" CASCADE;
CREATE TABLE public."properties" (
    "id" TEXT PRIMARY KEY,
    "lister_type" TEXT,
    "lister_id" TEXT,
    "lister_name" TEXT,
    "title" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "price" TEXT,
    "priceNum" NUMERIC,
    "city" TEXT,
    "city_id" TEXT REFERENCES public."cities"("id") ON DELETE SET NULL,
    "sub_area_id" TEXT REFERENCES public."sub_areas"("id") ON DELETE SET NULL,
    "state" TEXT,
    "location" TEXT,
    "fullLocation" TEXT,
    "category" TEXT,
    "type" TEXT,
    "listingType" TEXT,
    "beds" INTEGER,
    "bathrooms" INTEGER,
    "baths" INTEGER,
    "area" NUMERIC,
    "amenities" JSONB DEFAULT '[]'::jsonb,
    "images" JSONB DEFAULT '[]'::jsonb,
    "imgs" JSONB DEFAULT '[]'::jsonb,
    "image" TEXT,
    "img" TEXT,
    "cloudinaryImages" JSONB DEFAULT '[]'::jsonb,
    "coordinates" JSONB DEFAULT '{}'::jsonb,
    "nearbyAmenities" JSONB DEFAULT '[]'::jsonb,
    "builder" TEXT,
    "rating" NUMERIC DEFAULT 0,
    "reviews" INTEGER DEFAULT 0,
    "featured" BOOLEAN DEFAULT FALSE,
    "featuredRequested" BOOLEAN DEFAULT FALSE,
    "requested_for" INTEGER,
    "granted_for" INTEGER,
    "featuredRequestDate" TEXT,
    "featuredPaymentStatus" TEXT,
    "featuredPaymentProof" TEXT,
    "featuredPaymentAmount" NUMERIC,
    "featuredApprovedBy" TEXT,
    "featuredApprovedAt" TEXT,
    "featuredExpiryDate" TEXT,
    "featuredExpired" BOOLEAN DEFAULT FALSE,
    "isNew" BOOLEAN DEFAULT FALSE,
    "status" TEXT DEFAULT 'approved',
    "moderationStatus" TEXT DEFAULT 'approved',
    "views" INTEGER DEFAULT 0,
    "pincode" TEXT,
    "furnishing" TEXT,
    "officeType" TEXT,
    "pantry" TEXT,
    "washrooms" INTEGER,
    "parking" TEXT,
    "powerBackup" TEXT,
    "cabinCount" INTEGER,
    "conferenceRoom" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."properties" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on properties" ON public."properties";
CREATE POLICY "Allow public read on properties" ON public."properties" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on properties" ON public."properties";
CREATE POLICY "Allow service role all on properties" ON public."properties" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."appointments" CASCADE;
CREATE TABLE public."appointments" (
    "id" TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES public."properties"("id") ON DELETE CASCADE,
    "propertyName" TEXT,
    "userId" TEXT REFERENCES public."users"("id") ON DELETE CASCADE,
    "userName" TEXT,
    "agent_id" TEXT REFERENCES public."agents"("id") ON DELETE CASCADE,
    "agentId" TEXT,
    "agentName" TEXT,
    "agentEmail" TEXT,
    "agentPhone" TEXT,
    "date" TEXT,
    "time" TEXT,
    "status" TEXT DEFAULT 'Pending',
    "type" TEXT DEFAULT 'In-Person',
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."appointments" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on appointments" ON public."appointments";
CREATE POLICY "Allow public read on appointments" ON public."appointments" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on appointments" ON public."appointments";
CREATE POLICY "Allow service role all on appointments" ON public."appointments" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."complaints" CASCADE;
CREATE TABLE public."complaints" (
    "id" TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES public."properties"("id") ON DELETE CASCADE,
    "userId" TEXT REFERENCES public."users"("id") ON DELETE CASCADE,
    "subject" TEXT,
    "description" TEXT,
    "status" TEXT DEFAULT 'pending',
    "priority" TEXT DEFAULT 'medium',
    "actionTaken" TEXT,
    "resolutionNotes" TEXT,
    "resolvedAt" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."complaints" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on complaints" ON public."complaints";
CREATE POLICY "Allow public read on complaints" ON public."complaints" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on complaints" ON public."complaints";
CREATE POLICY "Allow service role all on complaints" ON public."complaints" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."enquiries" CASCADE;
CREATE TABLE public."enquiries" (
    "id" TEXT PRIMARY KEY,
    "propertyId" TEXT REFERENCES public."properties"("id") ON DELETE CASCADE,
    "propertyTitle" TEXT,
    "userName" TEXT,
    "userEmail" TEXT,
    "userPhone" TEXT,
    "agentId" TEXT REFERENCES public."agents"("id") ON DELETE CASCADE,
    "agentName" TEXT,
    "agentEmail" TEXT,
    "agentPhone" TEXT,
    "message" TEXT,
    "status" TEXT DEFAULT 'Pending',
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."enquiries" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on enquiries" ON public."enquiries";
CREATE POLICY "Allow public read on enquiries" ON public."enquiries" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on enquiries" ON public."enquiries";
CREATE POLICY "Allow service role all on enquiries" ON public."enquiries" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."leads" CASCADE;
CREATE TABLE public."leads" (
    "id" TEXT PRIMARY KEY,
    "agentId" TEXT REFERENCES public."agents"("id") ON DELETE CASCADE,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "propertyId" TEXT REFERENCES public."properties"("id") ON DELETE SET NULL,
    "status" TEXT DEFAULT 'new',
    "notes" TEXT,
    "createdAt" TEXT,
    "updatedAt" TEXT
);
ALTER TABLE public."leads" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on leads" ON public."leads";
CREATE POLICY "Allow public read on leads" ON public."leads" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on leads" ON public."leads";
CREATE POLICY "Allow service role all on leads" ON public."leads" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."messages" CASCADE;
CREATE TABLE public."messages" (
    "id" TEXT PRIMARY KEY,
    "senderId" TEXT,
    "receiverId" TEXT,
    "content" TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT
);
ALTER TABLE public."messages" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on messages" ON public."messages";
CREATE POLICY "Allow public read on messages" ON public."messages" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on messages" ON public."messages";
CREATE POLICY "Allow service role all on messages" ON public."messages" FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS public."featured_plans" CASCADE;
CREATE TABLE public."featured_plans" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "requested_for" INTEGER,
    "duration" INTEGER,
    "price" NUMERIC,
    "description" TEXT,
    "features" JSONB DEFAULT '[]'::jsonb
);
ALTER TABLE public."featured_plans" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on featured_plans" ON public."featured_plans";
CREATE POLICY "Allow public read on featured_plans" ON public."featured_plans" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on featured_plans" ON public."featured_plans";
CREATE POLICY "Allow service role all on featured_plans" ON public."featured_plans" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."notifications" CASCADE;
CREATE TABLE public."notifications" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT,
    "userType" TEXT,
    "title" TEXT,
    "message" TEXT,
    "type" TEXT,
    "relatedId" TEXT,
    "isRead" BOOLEAN DEFAULT FALSE,
    "actionUrl" TEXT,
    "icon" TEXT,
    "createdAt" TEXT
);
ALTER TABLE public."notifications" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on notifications" ON public."notifications";
CREATE POLICY "Allow public read on notifications" ON public."notifications" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on notifications" ON public."notifications";
CREATE POLICY "Allow service role all on notifications" ON public."notifications" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."testimonials" CASCADE;
CREATE TABLE public."testimonials" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "role" TEXT,
    "rating" NUMERIC DEFAULT 5,
    "content" TEXT,
    "avatar" TEXT
);
ALTER TABLE public."testimonials" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on testimonials" ON public."testimonials";
CREATE POLICY "Allow public read on testimonials" ON public."testimonials" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on testimonials" ON public."testimonials";
CREATE POLICY "Allow service role all on testimonials" ON public."testimonials" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."categories" CASCADE;
CREATE TABLE public."categories" (
    "id" TEXT PRIMARY KEY DEFAULT 'main',
    "data" JSONB NOT NULL
);
ALTER TABLE public."categories" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on categories" ON public."categories";
CREATE POLICY "Allow public read on categories" ON public."categories" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on categories" ON public."categories";
CREATE POLICY "Allow service role all on categories" ON public."categories" FOR ALL USING (true) WITH CHECK (true);


DROP TABLE IF EXISTS public."settings" CASCADE;
CREATE TABLE public."settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'main',
    "data" JSONB NOT NULL
);
ALTER TABLE public."settings" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on settings" ON public."settings";
CREATE POLICY "Allow public read on settings" ON public."settings" FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service role all on settings" ON public."settings";
CREATE POLICY "Allow service role all on settings" ON public."settings" FOR ALL USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------------
-- 2. SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_084516d1225c4d8a9c737c1db856bdba', 'rootadmin', 'rootadmin@estateelite.com', 'scrypt:32768:8:1$Em0i7ZCyQ462N0A8$7d310ac1c4fc34283a695e56a2571b8ff97ea62c465115d86068ad7fbfd823e6d4ce3999551023e4711e7e6833620baba5c56f0cfc43bdd10206dda81e13a63b', 'SUPER_ADMIN', 'Root Admin', NULL, NULL, NULL, NULL, NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_3050ed538b224e49866eeaf51a8423c7', 'xyz@gmail.com', 'xyz@gmail.com', 'scrypt:32768:8:1$Gup2393nFSQNnKCN$0e971d1cb998cde1d57e208964a3928542dfd2c3005214d365f55479fc262e4819e950a92d6f1c69e45d66d55c38fdc08425c54a8164254f2b01c0d55adbce7a', 'ADMIN', 'aniket', '9856233265', '[]'::jsonb, 'active', NULL, '2026-06-05T14:35:46.116639+00:00') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_54aa04b4dcd94ce2bf1e8c9ac6870246', 'test@gmail.com', 'test@gmail.com', 'scrypt:32768:8:1$kimE4zXYvOvyf0lO$a62be89d65454bbd83229064fb3e9c1a52dc6684fee7c62cffcae73ebc9771341ace6b02b27198234ff563dde398587aa021ed537932b58f48b5081fe1364325', 'ADMIN', 'testt', '9168281183', '[]'::jsonb, NULL, NULL, '2026-06-18T16:50:20.655628+00:00') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_d8e4eb35a37d472c87e7a0b55fab8129', 'testadmin@gmail.com', NULL, NULL, 'ADMIN', 'testadmin', '7410852963', NULL, 'inactive', '2026-06-12T09:58:47.660551+00:00', '2026-07-08T17:47:02.687928+00:00') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_d899cfae5d654ae683207edc269aa0dc', 'admin@gmail.com', 'admin@gmail.com', 'scrypt:32768:8:1$nBuPHgzDvlz0rJUp$464a5587cabc77da9a2528c43088fdfbabfb37cfa11b8703b6b80749438f34a95497e5c32e0aa9975e6d27a23c37d674fe0299af18c0ec5161f4cb73ed1208c6', 'ADMIN', 'admin', NULL, NULL, 'active', '2026-06-16T10:20:41.395622+00:00', '2026-06-18T15:57:36.447139+00:00') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_697f4958c4c044318240369fcafd72ee', 'puneadmin@gmail.com', 'puneadmin@gmail.com', 'scrypt:32768:8:1$vIXjHfZtyMujPN7Q$d43c7db1b43caa00b4daab73a68b3ac0d45c92a57c3e22434b95afbeb7265770cd6f47488aff31eb853869d3447c76312be267a8fbcaa5bb71cfbbea0fde446e', 'ADMIN', 'pune admin', '7895632014', NULL, 'active', '2026-06-16T13:31:41.330812+00:00', NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."admins" ("id", "username", "email", "passwordHash", "role", "name", "phone", "savedProperties", "status", "createdAt", "updatedAt") VALUES ('admin_1fe1cdc851a54b008ca8e37edcc7b76d', 'nskadmin@gmail.com', 'nskadmin@gmail.com', 'scrypt:32768:8:1$MLxMWbERFIQ1fM7P$4a376b9140c66d2fc8575ebec80bee4a9b42a1f6a790efa814e5f4394a5fb11bffd9fe519034ef88f8823b79cdd70e10c28a7ef51944061f58b418c1919de318', 'ADMIN', 'nskadmin', NULL, NULL, 'active', '2026-07-08T17:47:44.185369+00:00', NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_nashik', 'Nashik', 'https://ik.imagekit.io/yd29mwkn4/images/uploads/packages/large/32913.jpg', 'admin_1fe1cdc851a54b008ca8e37edcc7b76d', 'active', NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_pune', 'Pune', 'https://static.toiimg.com/img/92863964/Master.jpg', 'admin_697f4958c4c044318240369fcafd72ee', 'active', NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_aurangabad', 'Aurangabad', 'https://t4.ftcdn.net/jpg/01/96/50/87/360_F_196508763_c2Sb6vIcsgmaXCOLMvuprBvaDxvTDkyf.jpg', 'admin_54aa04b4dcd94ce2bf1e8c9ac6870246', 'active', NULL) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_8879f78a7070', 'Phase6 UpdatedCity', 'https://example.com/city.jpg', NULL, 'active', '0') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_ba9b3b449f12', 'Phase6 UpdatedCity', 'https://example.com/city.jpg', NULL, 'active', '0') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_acdc374b9898', 'Phase6 UpdatedCity', 'https://example.com/city.jpg', NULL, 'active', '0') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."cities" ("id", "name", "image", "admin_id", "status", "count") VALUES ('city_d197efe5aa04', 'Phase6 UpdatedCity', 'https://example.com/city.jpg', NULL, 'active', '0') ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_aurangpura', 'Aurangpura', 'city_aurangabad', 'active', 'aurangpura', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_gulmandi', 'Gulmandi', 'city_aurangabad', 'active', 'gulmandi', '["agent_a3b4daf6ec4d46f9a933087740d12f98"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shahganj', 'Shahganj', 'city_aurangabad', 'active', 'shahganj', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_city_chowk', 'City Chowk', 'city_aurangabad', 'active', 'city-chowk', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_buddi_lane', 'Buddi Lane', 'city_aurangabad', 'active', 'buddi-lane', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_juna_bazaar', 'Juna Bazaar', 'city_aurangabad', 'active', 'juna-bazaar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_osmanpura', 'Osmanpura', 'city_aurangabad', 'active', 'osmanpura', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_samarth_nagar', 'Samarth Nagar', 'city_aurangabad', 'active', 'samarth-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kranti_chowk', 'Kranti Chowk', 'city_aurangabad', 'active', 'kranti-chowk', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n1', 'Cidco N-1', 'city_aurangabad', 'active', 'cidco-n-1', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n2', 'Cidco N-2', 'city_aurangabad', 'active', 'cidco-n-2', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n3', 'Cidco N-3', 'city_aurangabad', 'active', 'cidco-n-3', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n4', 'Cidco N-4', 'city_aurangabad', 'active', 'cidco-n-4', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n5', 'Cidco N-5', 'city_aurangabad', 'active', 'cidco-n-5', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n6', 'Cidco N-6', 'city_aurangabad', 'active', 'cidco-n-6', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n7', 'Cidco N-7', 'city_aurangabad', 'active', 'cidco-n-7', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n8', 'Cidco N-8', 'city_aurangabad', 'active', 'cidco-n-8', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n9', 'Cidco N-9', 'city_aurangabad', 'active', 'cidco-n-9', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n10', 'Cidco N-10', 'city_aurangabad', 'active', 'cidco-n-10', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n11', 'Cidco N-11', 'city_aurangabad', 'active', 'cidco-n-11', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco_n12', 'Cidco N-12', 'city_aurangabad', 'active', 'cidco-n-12', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_hudco', 'Hudco', 'city_aurangabad', 'active', 'hudco', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_garkheda', 'Garkheda', 'city_aurangabad', 'active', 'garkheda', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_garkheda_parisar', 'Garkheda Parisar', 'city_aurangabad', 'active', 'garkheda-parisar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ulkanagari', 'Ulkanagari', 'city_aurangabad', 'active', 'ulkanagari', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jawahar_colony', 'Jawahar Colony', 'city_aurangabad', 'active', 'jawahar-colony', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mayur_park', 'Mayur Park', 'city_aurangabad', 'active', 'mayur-park', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shreya_nagar', 'Shreya Nagar', 'city_aurangabad', 'active', 'shreya-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_padampura', 'Padampura', 'city_aurangabad', 'active', 'padampura', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kasliwal_nagar', 'Kasliwal Nagar', 'city_aurangabad', 'active', 'kasliwal-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sutgirni_chowk_area', 'Sutgirni Chowk Area', 'city_aurangabad', 'active', 'sutgirni-chowk-area', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_beed_bypass', 'Beed Bypass', 'city_aurangabad', 'active', 'beed-bypass', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_satara_parisar', 'Satara Parisar', 'city_aurangabad', 'active', 'satara-parisar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_deolai', 'Deolai', 'city_aurangabad', 'active', 'deolai', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_itkheda', 'Itkheda', 'city_aurangabad', 'active', 'itkheda', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bajajnagar', 'Bajajnagar', 'city_aurangabad', 'active', 'bajajnagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_waluj', 'Waluj', 'city_aurangabad', 'active', 'waluj', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_waluj_midc', 'Waluj MIDC', 'city_aurangabad', 'active', 'waluj-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chikalthana', 'Chikalthana', 'city_aurangabad', 'active', 'chikalthana', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chikalthana_midc', 'Chikalthana MIDC', 'city_aurangabad', 'active', 'chikalthana-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_airport_road', 'Airport Road', 'city_aurangabad', 'active', 'airport-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_padegaon', 'Padegaon', 'city_aurangabad', 'active', 'padegaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kanchanwadi', 'Kanchanwadi', 'city_aurangabad', 'active', 'kanchanwadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nakshatrawadi', 'Nakshatrawadi', 'city_aurangabad', 'active', 'nakshatrawadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mitmita', 'Mitmita', 'city_aurangabad', 'active', 'mitmita', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jalna_road', 'Jalna Road', 'city_aurangabad', 'active', 'jalna-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_seven_hills', 'Seven Hills', 'city_aurangabad', 'active', 'seven-hills', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_town_centre', 'Town Centre', 'city_aurangabad', 'active', 'town-centre', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chetak_ghoda_chowk', 'Chetak Ghoda Chowk', 'city_aurangabad', 'active', 'chetak-ghoda-chowk', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nirala_bazar', 'Nirala Bazar', 'city_aurangabad', 'active', 'nirala-bazar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_adalat_road', 'Adalat Road', 'city_aurangabad', 'active', 'adalat-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_railway_station_road', 'Railway Station Road', 'city_aurangabad', 'active', 'railway-station-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_harsul', 'Harsul', 'city_aurangabad', 'active', 'harsul', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mukundwadi', 'Mukundwadi', 'city_aurangabad', 'active', 'mukundwadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shivajinagar', 'Shivajinagar', 'city_aurangabad', 'active', 'shivajinagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_begumpura', 'Begumpura', 'city_aurangabad', 'active', 'begumpura', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_roshan_gate', 'Roshan Gate', 'city_aurangabad', 'active', 'roshan-gate', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bansilal_nagar', 'Bansilal Nagar', 'city_aurangabad', 'active', 'bansilal-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jadhavwadi', 'Jadhavwadi', 'city_aurangabad', 'active', 'jadhavwadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pandharpur', 'Pandharpur', 'city_aurangabad', 'active', 'pandharpur', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pisadevi_road', 'Pisadevi Road', 'city_aurangabad', 'active', 'pisadevi-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_khadkeshwar', 'Khadkeshwar', 'city_aurangabad', 'active', 'khadkeshwar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jyoti_nagar', 'Jyoti Nagar', 'city_aurangabad', 'active', 'jyoti-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sindhi_colony', 'Sindhi Colony', 'city_aurangabad', 'active', 'sindhi-colony', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shendra_midc', 'Shendra MIDC', 'city_aurangabad', 'active', 'shendra-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_five_star_midc', 'Five Star MIDC', 'city_aurangabad', 'active', 'five-star-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bajajnagar_industrial_area', 'Bajajnagar Industrial Area', 'city_aurangabad', 'active', 'bajajnagar-industrial-area', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shendra', 'Shendra', 'city_aurangabad', 'active', 'shendra', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_beed_bypass_road', 'Beed Bypass Road', 'city_aurangabad', 'active', 'beed-bypass-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_deolai_road', 'Deolai Road', 'city_aurangabad', 'active', 'deolai-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jalna_road_corridor', 'Jalna Road Corridor', 'city_aurangabad', 'active', 'jalna-road-corridor', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_college_road', 'College Road', 'city_nashik', 'active', 'college-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_gangapur_road', 'Gangapur Road', 'city_nashik', 'active', 'gangapur-road', '["agent_c33dd88f10b04179a605052c5c979213"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_govind_nagar', 'Govind Nagar', 'city_nashik', 'active', 'govind-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_indira_nagar', 'Indira Nagar', 'city_nashik', 'active', 'indira-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_canada_corner', 'Canada Corner', 'city_nashik', 'active', 'canada-corner', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sharanpur_road', 'Sharanpur Road', 'city_nashik', 'active', 'sharanpur-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_tide_colony', 'Tide Colony', 'city_nashik', 'active', 'tide-colony', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mahatma_nagar', 'Mahatma Nagar', 'city_nashik', 'active', 'mahatma-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_parijat_nagar', 'Parijat Nagar', 'city_nashik', 'active', 'parijat-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ashok_nagar', 'Ashok Nagar', 'city_nashik', 'active', 'ashok-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pathardi_phata', 'Pathardi Phata', 'city_nashik', 'active', 'pathardi-phata', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_makhmalabad', 'Makhmalabad', 'city_nashik', 'active', 'makhmalabad', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_adgaon', 'Adgaon', 'city_nashik', 'active', 'adgaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_panchavati', 'Panchavati', 'city_nashik', 'active', 'panchavati', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_hirawadi', 'Hirawadi', 'city_nashik', 'active', 'hirawadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mhasrul', 'Mhasrul', 'city_nashik', 'active', 'mhasrul', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kamatwade', 'Kamatwade', 'city_nashik', 'active', 'kamatwade', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_rane_nagar', 'Rane Nagar', 'city_nashik', 'active', 'rane-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ambad', 'Ambad', 'city_nashik', 'active', 'ambad', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cidco', 'Cidco', 'city_nashik', 'active', 'cidco', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_anandvalli', 'Anandvalli', 'city_nashik', 'active', 'anandvalli', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_serene_meadows', 'Serene Meadows', 'city_nashik', 'active', 'serene-meadows', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mumbai_naka', 'Mumbai Naka', 'city_nashik', 'active', 'mumbai-naka', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_dwarka', 'Dwarka', 'city_nashik', 'active', 'dwarka', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_cbs_area', 'CBS Area', 'city_nashik', 'active', 'cbs-area', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shalimar', 'Shalimar', 'city_nashik', 'active', 'shalimar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_old_agra_road', 'Old Agra Road', 'city_nashik', 'active', 'old-agra-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_trimbak_road', 'Trimbak Road', 'city_nashik', 'active', 'trimbak-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_satpur_midc', 'Satpur MIDC', 'city_nashik', 'active', 'satpur-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ambad_midc', 'Ambad MIDC', 'city_nashik', 'active', 'ambad-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ojhar_midc', 'Ojhar MIDC', 'city_nashik', 'active', 'ojhar-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sinnar_midc', 'Sinnar MIDC', 'city_nashik', 'active', 'sinnar-midc', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nashik_road', 'Nashik Road', 'city_nashik', 'active', 'nashik-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_jail_road', 'Jail Road', 'city_nashik', 'active', 'jail-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_upnagar', 'Upnagar', 'city_nashik', 'active', 'upnagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_dasak', 'Dasak', 'city_nashik', 'active', 'dasak', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_deolali_camp', 'Deolali Camp', 'city_nashik', 'active', 'deolali-camp', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_deolali_gaon', 'Deolali Gaon', 'city_nashik', 'active', 'deolali-gaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chehedi', 'Chehedi', 'city_nashik', 'active', 'chehedi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_gandharva_nagari', 'Gandharva Nagari', 'city_nashik', 'active', 'gandharva-nagari', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chandshi', 'Chandshi', 'city_nashik', 'active', 'chandshi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_rasbihari_link_road', 'Rasbihari Link Road', 'city_nashik', 'active', 'rasbihari-link-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_gangapur_someshwar_belt', 'Gangapur-Someshwar Belt', 'city_nashik', 'active', 'gangapur-someshwar-belt', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_shivajinagar_pune', 'Shivajinagar', 'city_pune', 'active', 'shivajinagar', '["agent_5797047d805e48caa2c8c018a6ec6905"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_deccan_gymkhana', 'Deccan Gymkhana', 'city_pune', 'active', 'deccan-gymkhana', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_erandwane', 'Erandwane', 'city_pune', 'active', 'erandwane', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sadashiv_peth', 'Sadashiv Peth', 'city_pune', 'active', 'sadashiv-peth', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_narayan_peth', 'Narayan Peth', 'city_pune', 'active', 'narayan-peth', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_budhwar_peth', 'Budhwar Peth', 'city_pune', 'active', 'budhwar-peth', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_rasta_peth', 'Rasta Peth', 'city_pune', 'active', 'rasta-peth', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_camp_pune', 'Camp', 'city_pune', 'active', 'camp', '["agent_1fd42047de774c71abf194d9b68e8d77"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_swargate', 'Swargate', 'city_pune', 'active', 'swargate', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_model_colony', 'Model Colony', 'city_pune', 'active', 'model-colony', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_koregaon_park', 'Koregaon Park', 'city_pune', 'active', 'koregaon-park', '["agent_1fd42047de774c71abf194d9b68e8d77"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kalyani_nagar', 'Kalyani Nagar', 'city_pune', 'active', 'kalyani-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_viman_nagar', 'Viman Nagar', 'city_pune', 'active', 'viman-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_aundh', 'Aundh', 'city_pune', 'active', 'aundh', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_baner', 'Baner', 'city_pune', 'active', 'baner', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bavdhan', 'Bavdhan', 'city_pune', 'active', 'bavdhan', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_prabhat_road', 'Prabhat Road', 'city_pune', 'active', 'prabhat-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bhandarkar_road', 'Bhandarkar Road', 'city_pune', 'active', 'bhandarkar-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nibm_road', 'NIBM Road', 'city_pune', 'active', 'nibm-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_boat_club_road', 'Boat Club Road', 'city_pune', 'active', 'boat-club-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_hinjewadi', 'Hinjewadi', 'city_pune', 'active', 'hinjewadi', '["agent_d83025f4d7d9485f91c99597451e6670"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_wakad', 'Wakad', 'city_pune', 'active', 'wakad', '["agent_d83025f4d7d9485f91c99597451e6670"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_balewadi', 'Balewadi', 'city_pune', 'active', 'balewadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_tathawade', 'Tathawade', 'city_pune', 'active', 'tathawade', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kharadi', 'Kharadi', 'city_pune', 'active', 'kharadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_magarpatta', 'Magarpatta', 'city_pune', 'active', 'magarpatta', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_hadapsar', 'Hadapsar', 'city_pune', 'active', 'hadapsar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pimple_saudagar', 'Pimple Saudagar', 'city_pune', 'active', 'pimple-saudagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pimple_nilakh', 'Pimple Nilakh', 'city_pune', 'active', 'pimple-nilakh', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kothrud', 'Kothrud', 'city_pune', 'active', 'kothrud', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_karve_nagar', 'Karve Nagar', 'city_pune', 'active', 'karve-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bibwewadi', 'Bibwewadi', 'city_pune', 'active', 'bibwewadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sahakar_nagar', 'Sahakar Nagar', 'city_pune', 'active', 'sahakar-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_dhankawadi', 'Dhankawadi', 'city_pune', 'active', 'dhankawadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sinhagad_road', 'Sinhagad Road', 'city_pune', 'active', 'sinhagad-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_anand_nagar', 'Anand Nagar', 'city_pune', 'active', 'anand-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ambegaon', 'Ambegaon', 'city_pune', 'active', 'ambegaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_warje', 'Warje', 'city_pune', 'active', 'warje', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_narhe', 'Narhe', 'city_pune', 'active', 'narhe', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_wagholi', 'Wagholi', 'city_pune', 'active', 'wagholi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_lohegaon', 'Lohegaon', 'city_pune', 'active', 'lohegaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_keshav_nagar', 'Keshav Nagar', 'city_pune', 'active', 'keshav-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mundhwa', 'Mundhwa', 'city_pune', 'active', 'mundhwa', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_magarpatta_city', 'Magarpatta City', 'city_pune', 'active', 'magarpatta-city', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chandan_nagar', 'Chandan Nagar', 'city_pune', 'active', 'chandan-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pashan', 'Pashan', 'city_pune', 'active', 'pashan', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_sus', 'Sus', 'city_pune', 'active', 'sus', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mahalunge', 'Mahalunge', 'city_pune', 'active', 'mahalunge', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bhugaon', 'Bhugaon', 'city_pune', 'active', 'bhugaon', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pirangut', 'Pirangut', 'city_pune', 'active', 'pirangut', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_kondhwa', 'Kondhwa', 'city_pune', 'active', 'kondhwa', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nibm', 'NIBM', 'city_pune', 'active', 'nibm', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_undri', 'Undri', 'city_pune', 'active', 'undri', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_mohammadwadi', 'Mohammadwadi', 'city_pune', 'active', 'mohammadwadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_katraj', 'Katraj', 'city_pune', 'active', 'katraj', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_yerawada', 'Yerawada', 'city_pune', 'active', 'yerawada', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_vishrantwadi', 'Vishrantwadi', 'city_pune', 'active', 'vishrantwadi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_dhanori', 'Dhanori', 'city_pune', 'active', 'dhanori', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_tingre_nagar', 'Tingre Nagar', 'city_pune', 'active', 'tingre-nagar', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_bhosari', 'Bhosari', 'city_pune', 'active', 'bhosari', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_moshi', 'Moshi', 'city_pune', 'active', 'moshi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chakan', 'Chakan', 'city_pune', 'active', 'chakan', '["agent_86f0c3179b3e480d9dd1ecd18b641df6"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_alandi_road', 'Alandi Road', 'city_pune', 'active', 'alandi-road', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pimpri', 'Pimpri', 'city_pune', 'active', 'pimpri', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_chinchwad', 'Chinchwad', 'city_pune', 'active', 'chinchwad', '["agent_5797047d805e48caa2c8c018a6ec6905"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_nigdi', 'Nigdi', 'city_pune', 'active', 'nigdi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_akurdi', 'Akurdi', 'city_pune', 'active', 'akurdi', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_ravet', 'Ravet', 'city_pune', 'active', 'ravet', '[]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_punawale', 'Punawale', 'city_pune', 'active', 'punawale', '["agent_00c21c6507c94c27854572d596e5e9ea"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_pimple_gurav', 'Pimple Gurav', 'city_pune', 'active', 'pimple-gurav', '["agent_bc834dec7699488492888230492c04cc"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_thergaon', 'Thergaon', 'city_pune', 'active', 'thergaon', '["agent_d16ca5421e67441a8af273b5e9792210"]'::jsonb) ON CONFLICT ("id") DO NOTHING;
INSERT INTO public."sub_areas" ("id", "name", "city_id", "status", "slug", "agent_ids") VALUES ('sub_spine_road', 'Spine Road', 'city_pune', 'active', 'spine-road', '["agent_00c21c6507c94c27854572d596e5e9ea", "agent_5797047d805e48caa2c8c018a6ec6905"]'::jsonb) ON CONFLICT ("id") DO NOTHING;