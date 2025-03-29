-- Add functions for advanced metrics calculations
-- Loveable Analytics - 2024-03-28

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
  total_calls INTEGER;
  total_duration INTEGER;
  avg_duration_val INTEGER;
  positive_count INTEGER;
  negative_count INTEGER;
  neutral_count INTEGER;
  avg_agent_talk_ratio DECIMAL;
  avg_customer_talk_ratio DECIMAL;
  avg_objection_score DECIMAL;
  avg_trial_close_score DECIMAL;
  avg_sentiment_recovery DECIMAL;
  avg_empathy DECIMAL;
  avg_quality_score DECIMAL;
BEGIN
  -- Calculate metrics for the given date
  SELECT 
    COUNT(*),
    SUM(duration),
    AVG(duration)::INTEGER,
    COUNT(*) FILTER (WHERE sentiment_customer >= 0.7),
    COUNT(*) FILTER (WHERE sentiment_customer <= 0.3),
    COUNT(*) FILTER (WHERE sentiment_customer > 0.3 AND sentiment_customer < 0.7),
    AVG(talk_ratio_agent),
    AVG(talk_ratio_customer),
    AVG(objection_handling_score),
    AVG(trial_close_effectiveness),
    AVG(sentiment_recovery_score),
    AVG(empathy_score),
    AVG(overall_quality_score)
  INTO
    total_calls,
    total_duration,
    avg_duration_val,
    positive_count,
    negative_count,
    neutral_count,
    avg_agent_talk_ratio,
    avg_customer_talk_ratio,
    avg_objection_score,
    avg_trial_close_score,
    avg_sentiment_recovery,
    avg_empathy,
    avg_quality_score
  FROM public.calls
  WHERE DATE(created_at) = summary_date;
  
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
    created_at,
    updated_at
  ) VALUES (
    summary_date,
    COALESCE(total_calls, 0),
    COALESCE(total_duration, 0),
    COALESCE(avg_duration_val, 0),
    COALESCE(positive_count, 0),
    COALESCE(negative_count, 0),
    COALESCE(neutral_count, 0),
    COALESCE(avg_agent_talk_ratio, 0),
    COALESCE(avg_customer_talk_ratio, 0),
    COALESCE(avg_objection_score, 0),
    COALESCE(avg_trial_close_score, 0),
    COALESCE(avg_sentiment_recovery, 0),
    COALESCE(avg_empathy, 0),
    COALESCE(avg_quality_score, 0),
    now(),
    now()
  )
  ON CONFLICT (date) DO UPDATE SET
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
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Add a trigger to update metrics when a call is added or updated
CREATE OR REPLACE FUNCTION update_metrics_on_call_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate scores for the call
  PERFORM calculate_call_quality_score(NEW.id);
  
  -- Update the daily summary
  PERFORM update_call_metrics_summary(DATE(NEW.created_at));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS call_metrics_update_trigger ON public.calls;
CREATE TRIGGER call_metrics_update_trigger
AFTER INSERT OR UPDATE ON public.calls
FOR EACH ROW EXECUTE PROCEDURE update_metrics_on_call_change();

-- Grant execute permissions for functions
GRANT EXECUTE ON FUNCTION calculate_objection_handling_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_trial_close_effectiveness TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_sentiment_recovery_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_empathy_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_competitor_handling_score TO anon, authenticated;
GRANT EXECUTE ON FUNCTION calculate_call_quality_score TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_call_metrics_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_metrics_on_call_change TO anon, authenticated; 