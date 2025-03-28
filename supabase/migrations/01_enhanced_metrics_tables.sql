-- Create call_metrics_summary table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.call_metrics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE DEFAULT CURRENT_DATE,
  total_calls INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  avg_duration DOUBLE PRECISION DEFAULT 0,
  positive_sentiment_count INTEGER DEFAULT 0,
  neutral_sentiment_count INTEGER DEFAULT 0,
  negative_sentiment_count INTEGER DEFAULT 0,
  avg_sentiment NUMERIC DEFAULT 0.5,
  agent_talk_ratio NUMERIC DEFAULT 50,
  customer_talk_ratio NUMERIC DEFAULT 50,
  performance_score NUMERIC DEFAULT 70,
  conversion_rate NUMERIC DEFAULT 0,
  top_keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on call_metrics_summary
ALTER TABLE public.call_metrics_summary ENABLE ROW LEVEL SECURITY;

-- Create policy for call_metrics_summary (matching existing table policies)
CREATE POLICY IF NOT EXISTS "Allow public access to call_metrics_summary" 
  ON public.call_metrics_summary 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for call_metrics_summary
CREATE INDEX IF NOT EXISTS call_metrics_summary_report_date_idx ON public.call_metrics_summary (report_date);

-- 1. Objection Tracking Table
CREATE TABLE IF NOT EXISTS public.objection_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  objection_text TEXT NOT NULL,
  response_text TEXT,
  timestamp NUMERIC,
  was_handled BOOLEAN DEFAULT false,
  objection_type TEXT DEFAULT 'general',
  time_to_response NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on objection_tracking
ALTER TABLE public.objection_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy for objection_tracking
CREATE POLICY IF NOT EXISTS "Allow public access to objection_tracking" 
  ON public.objection_tracking 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for objection_tracking
CREATE INDEX IF NOT EXISTS objection_tracking_call_id_idx ON public.objection_tracking (call_id);
CREATE INDEX IF NOT EXISTS objection_tracking_was_handled_idx ON public.objection_tracking (was_handled);
CREATE INDEX IF NOT EXISTS objection_tracking_objection_type_idx ON public.objection_tracking (objection_type);

-- 2. Trial Closes Table
CREATE TABLE IF NOT EXISTS public.trial_closes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  close_text TEXT NOT NULL,
  prospect_response TEXT,
  sentiment_score NUMERIC,
  was_successful BOOLEAN DEFAULT false,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on trial_closes
ALTER TABLE public.trial_closes ENABLE ROW LEVEL SECURITY;

-- Create policy for trial_closes
CREATE POLICY IF NOT EXISTS "Allow public access to trial_closes" 
  ON public.trial_closes 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for trial_closes
CREATE INDEX IF NOT EXISTS trial_closes_call_id_idx ON public.trial_closes (call_id);
CREATE INDEX IF NOT EXISTS trial_closes_was_successful_idx ON public.trial_closes (was_successful);

-- 3. Price Sensitivity Table
CREATE TABLE IF NOT EXISTS public.price_sensitivity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  price_mention_text TEXT NOT NULL,
  response_text TEXT,
  sentiment_score NUMERIC DEFAULT 0.5,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on price_sensitivity
ALTER TABLE public.price_sensitivity ENABLE ROW LEVEL SECURITY;

-- Create policy for price_sensitivity
CREATE POLICY IF NOT EXISTS "Allow public access to price_sensitivity" 
  ON public.price_sensitivity 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for price_sensitivity
CREATE INDEX IF NOT EXISTS price_sensitivity_call_id_idx ON public.price_sensitivity (call_id);
CREATE INDEX IF NOT EXISTS price_sensitivity_sentiment_score_idx ON public.price_sensitivity (sentiment_score);

-- 4. Sentiment Transitions Table
CREATE TABLE IF NOT EXISTS public.sentiment_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  from_sentiment TEXT NOT NULL,
  to_sentiment TEXT NOT NULL,
  transition_time NUMERIC,
  recovery_time NUMERIC,
  recovery_success BOOLEAN,
  transition_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on sentiment_transitions
ALTER TABLE public.sentiment_transitions ENABLE ROW LEVEL SECURITY;

-- Create policy for sentiment_transitions
CREATE POLICY IF NOT EXISTS "Allow public access to sentiment_transitions" 
  ON public.sentiment_transitions 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for sentiment_transitions
CREATE INDEX IF NOT EXISTS sentiment_transitions_call_id_idx ON public.sentiment_transitions (call_id);
CREATE INDEX IF NOT EXISTS sentiment_transitions_recovery_success_idx ON public.sentiment_transitions (recovery_success);

-- 5. Empathy Markers Table
CREATE TABLE IF NOT EXISTS public.empathy_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  empathy_text TEXT NOT NULL,
  empathy_type TEXT DEFAULT 'general',
  timestamp NUMERIC,
  sentiment_context TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on empathy_markers
ALTER TABLE public.empathy_markers ENABLE ROW LEVEL SECURITY;

-- Create policy for empathy_markers
CREATE POLICY IF NOT EXISTS "Allow public access to empathy_markers" 
  ON public.empathy_markers 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for empathy_markers
CREATE INDEX IF NOT EXISTS empathy_markers_call_id_idx ON public.empathy_markers (call_id);
CREATE INDEX IF NOT EXISTS empathy_markers_empathy_type_idx ON public.empathy_markers (empathy_type);

-- 6. Competitor Mentions Table
CREATE TABLE IF NOT EXISTS public.competitor_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
  competitor_name TEXT NOT NULL,
  mention_context TEXT,
  was_countered BOOLEAN DEFAULT false,
  counter_argument TEXT,
  timestamp NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on competitor_mentions
ALTER TABLE public.competitor_mentions ENABLE ROW LEVEL SECURITY;

-- Create policy for competitor_mentions
CREATE POLICY IF NOT EXISTS "Allow public access to competitor_mentions" 
  ON public.competitor_mentions 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for competitor_mentions
CREATE INDEX IF NOT EXISTS competitor_mentions_call_id_idx ON public.competitor_mentions (call_id);
CREATE INDEX IF NOT EXISTS competitor_mentions_competitor_name_idx ON public.competitor_mentions (competitor_name);
CREATE INDEX IF NOT EXISTS competitor_mentions_was_countered_idx ON public.competitor_mentions (was_countered);

-- 7. Call Quality Metrics Table
CREATE TABLE IF NOT EXISTS public.call_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES public.calls(id),
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

-- Enable RLS on call_quality_metrics
ALTER TABLE public.call_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for call_quality_metrics
CREATE POLICY IF NOT EXISTS "Allow public access to call_quality_metrics" 
  ON public.call_quality_metrics 
  FOR ALL 
  TO anon
  USING (true);

-- Create indices for call_quality_metrics
CREATE INDEX IF NOT EXISTS call_quality_metrics_call_id_idx ON public.call_quality_metrics (call_id);

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