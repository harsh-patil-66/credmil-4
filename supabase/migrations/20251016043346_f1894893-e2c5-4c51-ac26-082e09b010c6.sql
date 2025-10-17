-- Create table to store training dataset
CREATE TABLE IF NOT EXISTS public.credit_risk_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  age INTEGER,
  employment_status TEXT,
  employment_duration INTEGER,
  industry_sector TEXT,
  education_level TEXT,
  marital_status TEXT,
  housing_status TEXT,
  years_at_residence INTEGER,
  number_of_dependents INTEGER,
  city_region TEXT,
  annual_income NUMERIC,
  total_debt NUMERIC,
  debt_to_income_ratio NUMERIC,
  loan_to_income_ratio NUMERIC,
  credit_score INTEGER,
  credit_history_length INTEGER,
  number_of_existing_loans INTEGER,
  total_credit_limit NUMERIC,
  credit_utilization_rate NUMERIC,
  savings_account_balance NUMERIC,
  checking_account_balance NUMERIC,
  total_assets NUMERIC,
  net_worth NUMERIC,
  number_of_late_payments INTEGER,
  worst_delinquency_status INTEGER,
  months_since_last_delinquency INTEGER,
  number_of_credit_inquiries INTEGER,
  number_of_open_credit_lines INTEGER,
  number_of_derogatory_records INTEGER,
  bankruptcy_flag BOOLEAN,
  credit_mix TEXT,
  loan_amount_requested NUMERIC,
  loan_term_months INTEGER,
  loan_purpose TEXT,
  payment_to_income_ratio NUMERIC,
  collateral_type TEXT,
  collateral_value NUMERIC,
  transaction_amount NUMERIC,
  transaction_frequency INTEGER,
  transaction_location TEXT,
  days_since_last_transaction INTEGER,
  avg_probability_of_default NUMERIC,
  avg_risk_weighted_assets NUMERIC,
  dpd_trigger_count INTEGER,
  bankruptcy_trigger_flag BOOLEAN,
  cash_flow_volatility NUMERIC,
  seasonal_spending_pattern TEXT,
  custom_risk_score INTEGER,
  credit_risk_score NUMERIC,
  default_flag BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_risk_data ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo purposes
CREATE POLICY "Public read access" ON public.credit_risk_data
  FOR SELECT USING (true);

-- Create table to store model metadata and parameters
CREATE TABLE IF NOT EXISTS public.trained_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name TEXT NOT NULL,
  model_type TEXT NOT NULL,
  feature_names TEXT[],
  feature_stats JSONB, -- stores mean/std for each feature
  model_coefficients JSONB,
  model_intercept NUMERIC,
  accuracy NUMERIC,
  precision_score NUMERIC,
  recall NUMERIC,
  f1_score NUMERIC,
  auc_score NUMERIC,
  training_date TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.trained_models ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read trained models" ON public.trained_models
  FOR SELECT USING (true);

-- Allow public insert for training
CREATE POLICY "Public insert trained models" ON public.trained_models
  FOR INSERT WITH CHECK (true);

-- Allow public update to set active model
CREATE POLICY "Public update trained models" ON public.trained_models
  FOR UPDATE USING (true);

-- Create table to store feature statistics for imputation
CREATE TABLE IF NOT EXISTS public.feature_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT UNIQUE NOT NULL,
  mean_value NUMERIC,
  median_value NUMERIC,
  mode_value TEXT,
  std_dev NUMERIC,
  min_value NUMERIC,
  max_value NUMERIC,
  data_type TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_statistics ENABLE ROW LEVEL SECURITY;

-- Allow public access
CREATE POLICY "Public read feature stats" ON public.feature_statistics
  FOR SELECT USING (true);

CREATE POLICY "Public upsert feature stats" ON public.feature_statistics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update feature stats" ON public.feature_statistics
  FOR UPDATE USING (true);