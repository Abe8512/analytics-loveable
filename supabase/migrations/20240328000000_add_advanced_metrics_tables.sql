-- Loveable Analytics - Advanced Metrics Tables Migration
-- This migration adds tables and functions for the advanced call metrics

-- Create call_metrics_summary table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.call_metrics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  avg_duration INTEGER DEFAULT 0,
  positive_sentiment_count INTEGER DEFAULT 0,
  negative_sentiment_count INTEGER DEFAULT 0,
  neutral_sentiment_count INTEGER DEFAULT 0,
  agent_talk_ratio DECIMAL DEFAULT 0,
  customer_talk_ratio DECIMAL DEFAULT 0,
  objection_handling_score DECIMAL DEFAULT 0,
  trial_close_effectiveness DECIMAL DEFAULT 0,
  sentiment_recovery_rate DECIMAL DEFAULT 0,
  empathy_score DECIMAL DEFAULT 0,
  overall_call_quality_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_metrics_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for call_metrics_summary
CREATE POLICY "Enable read access for all users" ON public.call_metrics_summary
  FOR SELECT USING (true);

-- Add index for date column for faster queries
CREATE INDEX IF NOT EXISTS call_metrics_summary_date_idx ON public.call_metrics_summary (date);

-- Create objection_tracking table
CREATE TABLE IF NOT EXISTS public.objection_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  objection_text TEXT,
  response_text TEXT,
  timestamp INTEGER,
  was_handled BOOLEAN DEFAULT false,
  objection_type TEXT,
  time_to_response INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.objection_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for objection_tracking
CREATE POLICY "Enable read access for all users" ON public.objection_tracking
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS objection_tracking_call_id_idx ON public.objection_tracking (call_id);

-- Create trial_closes table
CREATE TABLE IF NOT EXISTS public.trial_closes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  close_text TEXT,
  prospect_response TEXT,
  sentiment_score DECIMAL,
  was_successful BOOLEAN DEFAULT false,
  timestamp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trial_closes ENABLE ROW LEVEL SECURITY;

-- Create policy for trial_closes
CREATE POLICY "Enable read access for all users" ON public.trial_closes
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS trial_closes_call_id_idx ON public.trial_closes (call_id);

-- Create price_sensitivity table
CREATE TABLE IF NOT EXISTS public.price_sensitivity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  price_mention_text TEXT,
  response_text TEXT,
  sentiment_score DECIMAL,
  timestamp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.price_sensitivity ENABLE ROW LEVEL SECURITY;

-- Create policy for price_sensitivity
CREATE POLICY "Enable read access for all users" ON public.price_sensitivity
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS price_sensitivity_call_id_idx ON public.price_sensitivity (call_id);

-- Create sentiment_transitions table
CREATE TABLE IF NOT EXISTS public.sentiment_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  from_sentiment TEXT,
  to_sentiment TEXT,
  transition_time INTEGER,
  recovery_time INTEGER,
  recovery_success BOOLEAN DEFAULT false,
  transition_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sentiment_transitions ENABLE ROW LEVEL SECURITY;

-- Create policy for sentiment_transitions
CREATE POLICY "Enable read access for all users" ON public.sentiment_transitions
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS sentiment_transitions_call_id_idx ON public.sentiment_transitions (call_id);

-- Create empathy_markers table
CREATE TABLE IF NOT EXISTS public.empathy_markers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  empathy_text TEXT,
  empathy_type TEXT,
  timestamp INTEGER,
  sentiment_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.empathy_markers ENABLE ROW LEVEL SECURITY;

-- Create policy for empathy_markers
CREATE POLICY "Enable read access for all users" ON public.empathy_markers
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS empathy_markers_call_id_idx ON public.empathy_markers (call_id);

-- Create competitor_mentions table
CREATE TABLE IF NOT EXISTS public.competitor_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
  competitor_name TEXT,
  mention_context TEXT,
  was_countered BOOLEAN DEFAULT false,
  counter_argument TEXT,
  timestamp INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.competitor_mentions ENABLE ROW LEVEL SECURITY;

-- Create policy for competitor_mentions
CREATE POLICY "Enable read access for all users" ON public.competitor_mentions
  FOR SELECT USING (true);

-- Create index for call_id for faster queries
CREATE INDEX IF NOT EXISTS competitor_mentions_call_id_idx ON public.competitor_mentions (call_id);

-- Add new columns to calls table for tracking metrics
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS objection_handling_score DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS trial_close_effectiveness DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS price_sensitivity_score DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS sentiment_recovery_score DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS empathy_score DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS competitor_handling_score DECIMAL DEFAULT 0;
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS overall_quality_score DECIMAL DEFAULT 0;

-- Enable realtime for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_metrics_summary;
ALTER PUBLICATION supabase_realtime ADD TABLE public.objection_tracking;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trial_closes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_sensitivity;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sentiment_transitions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.empathy_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.competitor_mentions;

-- 1. Objection Tracking Table
CREATE TABLE IF NOT EXISTS public.objection_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  objection_text TEXT NOT NULL,
  response_text TEXT,
  timestamp NUMERIC,
  was_handled BOOLEAN DEFAULT false,
  objection_type TEXT DEFAULT 'general',
  time_to_response NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Trial Closes Table
CREATE TABLE IF NOT EXISTS public.trial_closes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  close_text TEXT NOT NULL,
  prospect_response TEXT,
  sentiment_score NUMERIC,
  was_successful BOOLEAN DEFAULT false,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Price Sensitivity Table
CREATE TABLE IF NOT EXISTS public.price_sensitivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  price_mention_text TEXT NOT NULL,
  response_text TEXT,
  sentiment_score NUMERIC DEFAULT 0.5,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Sentiment Transitions Table
CREATE TABLE IF NOT EXISTS public.sentiment_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  from_sentiment TEXT NOT NULL,
  to_sentiment TEXT NOT NULL,
  transition_time NUMERIC,
  recovery_time NUMERIC,
  recovery_success BOOLEAN,
  transition_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Empathy Markers Table
CREATE TABLE IF NOT EXISTS public.empathy_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  empathy_text TEXT NOT NULL,
  empathy_type TEXT DEFAULT 'general',
  timestamp NUMERIC,
  sentiment_context TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Competitor Mentions Table
CREATE TABLE IF NOT EXISTS public.competitor_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  mention_context TEXT,
  was_countered BOOLEAN DEFAULT false,
  counter_argument TEXT,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Call Quality Metrics Table
CREATE TABLE IF NOT EXISTS public.call_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id) ON DELETE CASCADE,
  objection_handling_score NUMERIC DEFAULT 0,
  trial_close_score NUMERIC DEFAULT 0,
  price_handling_score NUMERIC DEFAULT 0,
  sentiment_recovery_score NUMERIC DEFAULT 0,
  empathy_score NUMERIC DEFAULT 0,
  competitor_handling_score NUMERIC DEFAULT 0,
  overall_quality_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Update calls table with new columns if they don't exist
DO $$ 
BEGIN
  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'calls' 
                 AND column_name = 'objection_count') THEN
    ALTER TABLE public.calls ADD COLUMN objection_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'calls' 
                 AND column_name = 'trial_closes_count') THEN
    ALTER TABLE public.calls ADD COLUMN trial_closes_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'calls' 
                 AND column_name = 'empathy_markers_count') THEN
    ALTER TABLE public.calls ADD COLUMN empathy_markers_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'calls' 
                 AND column_name = 'sentiment_recovery_score') THEN
    ALTER TABLE public.calls ADD COLUMN sentiment_recovery_score NUMERIC DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.columns 
                 WHERE table_schema = 'public' AND table_name = 'calls' 
                 AND column_name = 'quality_score') THEN
    ALTER TABLE public.calls ADD COLUMN quality_score NUMERIC DEFAULT 0;
  END IF;
END $$;

-- Enable RLS (Row Level Security) on all new tables
ALTER TABLE public.call_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objection_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trial_closes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_sensitivity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentiment_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empathy_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public access to call_metrics_summary" 
  ON public.call_metrics_summary FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to objection_tracking" 
  ON public.objection_tracking FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to trial_closes" 
  ON public.trial_closes FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to price_sensitivity" 
  ON public.price_sensitivity FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to sentiment_transitions" 
  ON public.sentiment_transitions FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to empathy_markers" 
  ON public.empathy_markers FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to competitor_mentions" 
  ON public.competitor_mentions FOR ALL TO anon USING (true);
  
CREATE POLICY "Allow public access to call_quality_metrics" 
  ON public.call_quality_metrics FOR ALL TO anon USING (true);

-- Create indices for performance
CREATE INDEX IF NOT EXISTS call_metrics_summary_report_date_idx ON public.call_metrics_summary (report_date);
CREATE INDEX IF NOT EXISTS objection_tracking_call_id_idx ON public.objection_tracking (call_id);
CREATE INDEX IF NOT EXISTS objection_tracking_was_handled_idx ON public.objection_tracking (was_handled);
CREATE INDEX IF NOT EXISTS objection_tracking_objection_type_idx ON public.objection_tracking (objection_type);
CREATE INDEX IF NOT EXISTS trial_closes_call_id_idx ON public.trial_closes (call_id);
CREATE INDEX IF NOT EXISTS trial_closes_was_successful_idx ON public.trial_closes (was_successful);
CREATE INDEX IF NOT EXISTS price_sensitivity_call_id_idx ON public.price_sensitivity (call_id);
CREATE INDEX IF NOT EXISTS price_sensitivity_sentiment_score_idx ON public.price_sensitivity (sentiment_score);
CREATE INDEX IF NOT EXISTS sentiment_transitions_call_id_idx ON public.sentiment_transitions (call_id);
CREATE INDEX IF NOT EXISTS sentiment_transitions_recovery_success_idx ON public.sentiment_transitions (recovery_success);
CREATE INDEX IF NOT EXISTS empathy_markers_call_id_idx ON public.empathy_markers (call_id);
CREATE INDEX IF NOT EXISTS empathy_markers_empathy_type_idx ON public.empathy_markers (empathy_type);
CREATE INDEX IF NOT EXISTS competitor_mentions_call_id_idx ON public.competitor_mentions (call_id);
CREATE INDEX IF NOT EXISTS competitor_mentions_competitor_name_idx ON public.competitor_mentions (competitor_name);
CREATE INDEX IF NOT EXISTS competitor_mentions_was_countered_idx ON public.competitor_mentions (was_countered);
CREATE INDEX IF NOT EXISTS call_quality_metrics_call_id_idx ON public.call_quality_metrics (call_id);

-- Set up realtime for all tables
BEGIN;
  -- Add tables to Supabase realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE objection_tracking;
  ALTER PUBLICATION supabase_realtime ADD TABLE trial_closes;
  ALTER PUBLICATION supabase_realtime ADD TABLE price_sensitivity;
  ALTER PUBLICATION supabase_realtime ADD TABLE sentiment_transitions;
  ALTER PUBLICATION supabase_realtime ADD TABLE empathy_markers;
  ALTER PUBLICATION supabase_realtime ADD TABLE competitor_mentions;
  ALTER PUBLICATION supabase_realtime ADD TABLE call_quality_metrics;
  ALTER PUBLICATION supabase_realtime ADD TABLE call_metrics_summary;
  
  -- Set REPLICA IDENTITY to FULL for all tables to ensure all columns are included in change events
  ALTER TABLE objection_tracking REPLICA IDENTITY FULL;
  ALTER TABLE trial_closes REPLICA IDENTITY FULL;
  ALTER TABLE price_sensitivity REPLICA IDENTITY FULL;
  ALTER TABLE sentiment_transitions REPLICA IDENTITY FULL;
  ALTER TABLE empathy_markers REPLICA IDENTITY FULL;
  ALTER TABLE competitor_mentions REPLICA IDENTITY FULL;
  ALTER TABLE call_quality_metrics REPLICA IDENTITY FULL;
  ALTER TABLE call_metrics_summary REPLICA IDENTITY FULL;
COMMIT; 