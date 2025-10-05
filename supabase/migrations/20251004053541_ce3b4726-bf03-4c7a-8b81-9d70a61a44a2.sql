-- Ensure required extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  default_currency TEXT DEFAULT 'BRL',
  theme_preference TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create user_investments table
CREATE TABLE public.user_investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker TEXT NOT NULL,
  company_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  purchase_price DECIMAL NOT NULL,
  purchase_date DATE NOT NULL,
  dividend_frequency TEXT, -- 'monthly', 'quarterly', 'semiannual', 'annual'
  dividend_amount DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

-- User investments policies
CREATE POLICY "Users can view own investments"
  ON public.user_investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON public.user_investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON public.user_investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON public.user_investments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_investments_updated_at
  BEFORE UPDATE ON public.user_investments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();