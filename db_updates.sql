-- FoodBuddy Addon Features - Database Schema Updates

-- 1. Dietary Preferences & Allergies
-- Add columns to the existing users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dietary_pref text DEFAULT 'None',
ADD COLUMN IF NOT EXISTS allergies text;

-- 2. Nutritional Information for Menu Items
-- Add columns to the existing weekly_menu table
ALTER TABLE public.weekly_menu 
ADD COLUMN IF NOT EXISTS calories integer,
ADD COLUMN IF NOT EXISTS protein integer,
ADD COLUMN IF NOT EXISTS carbs integer,
ADD COLUMN IF NOT EXISTS fat integer,
ADD COLUMN IF NOT EXISTS fiber integer;

-- 3. Food Waste Tracking Dashboard
-- Create the food_waste table
CREATE TABLE IF NOT EXISTS public.food_waste (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date date NOT NULL,
  meal text NOT NULL,
  waste_kg numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Guest Meal Booking
-- Create the guest_bookings table
CREATE TABLE IF NOT EXISTS public.guest_bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_email text NOT NULL,
  date date NOT NULL,
  meal text NOT NULL,
  guest_name text NOT NULL,
  status text DEFAULT 'Pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Add RLS policies if Row Level Security is enabled
-- (e.g. users can only see their own guest bookings, managers can see all)

-- 5. Lost and Found Portal
-- Create the lost_and_found table
CREATE TABLE IF NOT EXISTS public.lost_and_found (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- 'Lost' or 'Found'
  item_name text NOT NULL,
  description text,
  reported_by text NOT NULL,
  date date NOT NULL,
  status text DEFAULT 'Open'::text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Security Hardening (Row Level Security)
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_waste ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_and_found ENABLE ROW LEVEL SECURITY;

-- Base Policy: Allow anyone with a valid login to READ non-sensitive data
CREATE POLICY "Allow authenticated read access on menu" ON public.weekly_menu FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on waste" ON public.food_waste FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read access on lost items" ON public.lost_and_found FOR SELECT TO authenticated USING (true);

-- User Policies: Users can read and update their OWN data
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Students can read own bookings" ON public.guest_bookings FOR SELECT TO authenticated USING (student_email = auth.jwt() ->> 'email');
CREATE POLICY "Students can insert own bookings" ON public.guest_bookings FOR INSERT TO authenticated WITH CHECK (student_email = auth.jwt() ->> 'email');

-- Manager Policies: Managers have full access (assuming role = 'manager' in users table)
-- Note: These policies use a subquery to verify the user's role based on their auth email.
CREATE POLICY "Managers full access on menu" ON public.weekly_menu FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
CREATE POLICY "Managers full access on users" ON public.users FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
CREATE POLICY "Managers full access on attendance" ON public.attendance FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
CREATE POLICY "Managers full access on waste" ON public.food_waste FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
CREATE POLICY "Managers full access on bookings" ON public.guest_bookings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
CREATE POLICY "Managers full access on lost items" ON public.lost_and_found FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.users WHERE email = auth.jwt() ->> 'email' AND role = 'manager'));
