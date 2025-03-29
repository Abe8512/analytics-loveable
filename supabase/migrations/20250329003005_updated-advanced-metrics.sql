-- Loveable Analytics - Advanced Metrics Migration
-- This migration adds tables and functions for the advanced call metrics analysis

-------------
-- TABLES
-------------

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-------------
-- FUNCTIONS
-------------

-- Function to calculate objection handling metrics
CREATE OR REPLACE FUNCTION calculate_objection_handling_metrics(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total INT;
  handled INT;
  score DECIMAL;
BEGIN
  -- Count total objections
  SELECT COUNT(*) INTO total FROM public.objection_tracking WHERE call_id = calculate_objection_handling_metrics.call_id;
  
  -- If no objections, return default score
  IF total = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count handled objections
  SELECT COUNT(*) INTO handled FROM public.objection_tracking 
  WHERE call_id = calculate_objection_handling_metrics.call_id AND was_handled = true;
  
  -- Calculate score (percentage of objections handled)
  score := (handled::DECIMAL / total) * 100;
  
  -- Update call record
  UPDATE public.calls SET objection_handling_score = score 
  WHERE id = calculate_objection_handling_metrics.call_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trial close effectiveness
CREATE OR REPLACE FUNCTION calculate_trial_close_effectiveness(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total INT;
  successful INT;
  score DECIMAL;
BEGIN
  -- Count total trial closes
  SELECT COUNT(*) INTO total FROM public.trial_closes WHERE call_id = calculate_trial_close_effectiveness.call_id;
  
  -- If no trial closes, return default score
  IF total = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count successful trial closes
  SELECT COUNT(*) INTO successful FROM public.trial_closes 
  WHERE call_id = calculate_trial_close_effectiveness.call_id AND was_successful = true;
  
  -- Calculate score (percentage of successful trial closes)
  score := (successful::DECIMAL / total) * 100;
  
  -- Update call record
  UPDATE public.calls SET trial_close_effectiveness = score 
  WHERE id = calculate_trial_close_effectiveness.call_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate sentiment recovery metrics
CREATE OR REPLACE FUNCTION calculate_sentiment_recovery_metrics(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_negative INT;
  recoveries INT;
  score DECIMAL;
BEGIN
  -- Count total negative sentiment transitions
  SELECT COUNT(*) INTO total_negative FROM public.sentiment_transitions 
  WHERE call_id = calculate_sentiment_recovery_metrics.call_id AND from_sentiment = 'negative';
  
  -- If no negative transitions, return default score
  IF total_negative = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count successful recoveries from negative
  SELECT COUNT(*) INTO recoveries FROM public.sentiment_transitions 
  WHERE call_id = calculate_sentiment_recovery_metrics.call_id 
    AND from_sentiment = 'negative' 
    AND recovery_success = true;
  
  -- Calculate score (percentage of successful recoveries)
  score := (recoveries::DECIMAL / total_negative) * 100;
  
  -- Update call record
  UPDATE public.calls SET sentiment_recovery_score = score 
  WHERE id = calculate_sentiment_recovery_metrics.call_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate empathy metrics
CREATE OR REPLACE FUNCTION calculate_empathy_metrics(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  empathy_count INT;
  call_duration INT;
  score DECIMAL;
BEGIN
  -- Count empathy markers
  SELECT COUNT(*) INTO empathy_count FROM public.empathy_markers 
  WHERE call_id = calculate_empathy_metrics.call_id;
  
  -- Get call duration
  SELECT duration INTO call_duration FROM public.calls 
  WHERE id = calculate_empathy_metrics.call_id;
  
  -- If no duration, return default score
  IF call_duration = 0 OR call_duration IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Calculate score (empathy markers per minute, scaled to 0-100)
  -- Formula: (markers / (duration in seconds / 60)) * 20 (scaling factor)
  -- This gives approximately 100 points for 5 empathy markers per minute
  score := (empathy_count::DECIMAL / (call_duration / 60)) * 20;
  
  -- Cap at 100
  IF score > 100 THEN
    score := 100;
  END IF;
  
  -- Update call record
  UPDATE public.calls SET empathy_score = score 
  WHERE id = calculate_empathy_metrics.call_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate competitor handling score
CREATE OR REPLACE FUNCTION calculate_competitor_handling_score(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total INT;
  countered INT;
  score DECIMAL;
BEGIN
  -- Count total competitor mentions
  SELECT COUNT(*) INTO total FROM public.competitor_mentions 
  WHERE call_id = calculate_competitor_handling_score.call_id;
  
  -- If no mentions, return default score
  IF total = 0 THEN
    RETURN 0;
  END IF;
  
  -- Count effectively countered mentions
  SELECT COUNT(*) INTO countered FROM public.competitor_mentions 
  WHERE call_id = calculate_competitor_handling_score.call_id AND was_countered = true;
  
  -- Calculate score (percentage of effectively countered mentions)
  score := (countered::DECIMAL / total) * 100;
  
  -- Update call record
  UPDATE public.calls SET competitor_handling_score = score 
  WHERE id = calculate_competitor_handling_score.call_id;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate overall call quality score
CREATE OR REPLACE FUNCTION calculate_call_quality_score(call_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  objection_score DECIMAL;
  trial_close_score DECIMAL;
  sentiment_score DECIMAL;
  empathy_score DECIMAL;
  competitor_score DECIMAL;
  sentiment_agent DECIMAL;
  sentiment_customer DECIMAL;
  talk_ratio_agent DECIMAL;
  overall_score DECIMAL;
BEGIN
  -- Calculate component scores
  objection_score := calculate_objection_handling_metrics(call_id);
  trial_close_score := calculate_trial_close_effectiveness(call_id);
  sentiment_score := calculate_sentiment_recovery_metrics(call_id);
  empathy_score := calculate_empathy_metrics(call_id);
  competitor_score := calculate_competitor_handling_score(call_id);
  
  -- Get existing call metrics
  SELECT 
    c.sentiment_agent, 
    c.sentiment_customer,
    c.talk_ratio_agent
  INTO 
    sentiment_agent, 
    sentiment_customer,
    talk_ratio_agent
  FROM public.calls c
  WHERE c.id = calculate_call_quality_score.call_id;
  
  -- Calculate weighted average for overall score
  -- Weights: 
  -- 20% objection handling
  -- 20% trial close effectiveness
  -- 15% sentiment recovery
  -- 15% empathy score
  -- 10% competitor handling
  -- 10% agent sentiment
  -- 5% customer sentiment
  -- 5% talk ratio (balanced near 50/50)
  
  -- Convert sentiment from 0-1 scale to 0-100
  sentiment_agent := sentiment_agent * 100;
  sentiment_customer := sentiment_customer * 100;
  
  -- Calculate talk ratio balance (0-100 score)
  -- Perfect balance is 50/50, score decreases as it deviates
  -- Formula gives 100 at 50%, and decreases by 5 points for each % deviation
  talk_ratio_agent := 100 - (ABS(talk_ratio_agent - 50) * 5);
  IF talk_ratio_agent < 0 THEN
    talk_ratio_agent := 0;
  END IF;
  
  -- Calculate weighted score
  overall_score := (
    (objection_score * 0.20) +
    (trial_close_score * 0.20) +
    (sentiment_score * 0.15) +
    (empathy_score * 0.15) +
    (competitor_score * 0.10) +
    (sentiment_agent * 0.10) +
    (sentiment_customer * 0.05) +
    (talk_ratio_agent * 0.05)
  );
  
  -- Update call record
  UPDATE public.calls SET overall_quality_score = overall_score 
  WHERE id = calculate_call_quality_score.call_id;
  
  RETURN overall_score;
END;
$$ LANGUAGE plpgsql;

-- Function to update call_metrics_summary for a given date
CREATE OR REPLACE FUNCTION update_call_metrics_summary(summary_date DATE)
RETURNS VOID AS $$
DECLARE
  total_calls INT;
  total_duration INT;
  avg_duration INT;
  positive_count INT;
  negative_count INT;
  neutral_count INT;
  agent_talk_ratio DECIMAL;
  customer_talk_ratio DECIMAL;
  objection_score DECIMAL;
  trial_close_score DECIMAL;
  sentiment_score DECIMAL;
  empathy_score DECIMAL;
  quality_score DECIMAL;
BEGIN
  -- Calculate aggregates from calls for the given date
  SELECT 
    COUNT(*), 
    COALESCE(SUM(duration), 0),
    CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(duration), 0) / COUNT(*) ELSE 0 END,
    COUNT(*) FILTER (WHERE sentiment_customer > 0.6),
    COUNT(*) FILTER (WHERE sentiment_customer < 0.4),
    COUNT(*) FILTER (WHERE sentiment_customer BETWEEN 0.4 AND 0.6),
    AVG(talk_ratio_agent),
    AVG(1 - talk_ratio_agent),
    AVG(objection_handling_score),
    AVG(trial_close_effectiveness),
    AVG(sentiment_recovery_score),
    AVG(empathy_score),
    AVG(overall_quality_score)
  INTO
    total_calls,
    total_duration,
    avg_duration,
    positive_count,
    negative_count,
    neutral_count,
    agent_talk_ratio,
    customer_talk_ratio,
    objection_score,
    trial_close_score,
    sentiment_score,
    empathy_score,
    quality_score
  FROM public.calls
  WHERE DATE(created_at) = summary_date;

  -- Ensure we got some data
  IF total_calls IS NULL THEN
    total_calls := 0;
  END IF;
  
  -- Insert or update summary record
  INSERT INTO public.call_metrics_summary (
    date,
    total_calls,
    total_duration,
    avg_duration,
    positive_sentiment_count,
    negative_sentiment_count,
    neutral_sentiment_count,
    agent_talk_ratio,
    customer_talk_ratio,
    objection_handling_score,
    trial_close_effectiveness,
    sentiment_recovery_rate,
    empathy_score,
    overall_call_quality_score,
    updated_at
  ) VALUES (
    summary_date,
    total_calls,
    total_duration,
    avg_duration,
    positive_count,
    negative_count,
    neutral_count,
    agent_talk_ratio,
    customer_talk_ratio,
    objection_score,
    trial_close_score,
    sentiment_score,
    empathy_score,
    quality_score,
    now()
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_calls = EXCLUDED.total_calls,
    total_duration = EXCLUDED.total_duration,
    avg_duration = EXCLUDED.avg_duration,
    positive_sentiment_count = EXCLUDED.positive_sentiment_count,
    negative_sentiment_count = EXCLUDED.negative_sentiment_count,
    neutral_sentiment_count = EXCLUDED.neutral_sentiment_count,
    agent_talk_ratio = EXCLUDED.agent_talk_ratio,
    customer_talk_ratio = EXCLUDED.customer_talk_ratio,
    objection_handling_score = EXCLUDED.objection_handling_score,
    trial_close_effectiveness = EXCLUDED.trial_close_effectiveness,
    sentiment_recovery_rate = EXCLUDED.sentiment_recovery_rate,
    empathy_score = EXCLUDED.empathy_score,
    overall_call_quality_score = EXCLUDED.overall_call_quality_score,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update metrics whenever a call is added or updated
CREATE OR REPLACE FUNCTION update_metrics_on_call_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the metrics calculation function for the relevant call
  PERFORM calculate_call_quality_score(NEW.id);
  
  -- Update the metrics summary for the call's date
  PERFORM update_call_metrics_summary(DATE(NEW.created_at));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the calls table
CREATE TRIGGER call_metrics_update_trigger
AFTER INSERT OR UPDATE ON public.calls
FOR EACH ROW EXECUTE PROCEDURE update_metrics_on_call_change();

-- Grant execute permissions for the functions
GRANT EXECUTE ON FUNCTION calculate_objection_handling_metrics(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_trial_close_effectiveness(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_sentiment_recovery_metrics(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_empathy_metrics(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_competitor_handling_score(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_call_quality_score(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_call_metrics_summary(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_metrics_on_call_change() TO anon, authenticated;
