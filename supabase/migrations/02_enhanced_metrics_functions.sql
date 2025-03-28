-- Function to calculate objection handling metrics for a call
CREATE OR REPLACE FUNCTION public.calculate_objection_handling_metrics(call_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_objections INTEGER;
  handled_objections INTEGER;
  objection_score NUMERIC DEFAULT 0;
BEGIN
  -- Get total objections for the call
  SELECT COUNT(*) INTO total_objections
  FROM public.objection_tracking
  WHERE objection_tracking.call_id = calculate_objection_handling_metrics.call_id;
  
  -- Get handled objections for the call
  SELECT COUNT(*) INTO handled_objections
  FROM public.objection_tracking
  WHERE objection_tracking.call_id = calculate_objection_handling_metrics.call_id
  AND was_handled = true;
  
  -- Calculate score (0-1)
  IF total_objections > 0 THEN
    objection_score := handled_objections::NUMERIC / total_objections::NUMERIC;
  ELSE
    objection_score := 1; -- Perfect score if no objections (could be 0 or NULL instead)
  END IF;
  
  -- Update the call
  UPDATE public.calls
  SET objection_count = total_objections
  WHERE id = calculate_objection_handling_metrics.call_id;
  
  RETURN objection_score;
END;
$$;

-- Function to calculate trial close effectiveness
CREATE OR REPLACE FUNCTION public.calculate_trial_close_metrics(call_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_closes INTEGER;
  successful_closes INTEGER;
  close_score NUMERIC DEFAULT 0;
BEGIN
  -- Get total trial closes for the call
  SELECT COUNT(*) INTO total_closes
  FROM public.trial_closes
  WHERE trial_closes.call_id = calculate_trial_close_metrics.call_id;
  
  -- Get successful trial closes for the call
  SELECT COUNT(*) INTO successful_closes
  FROM public.trial_closes
  WHERE trial_closes.call_id = calculate_trial_close_metrics.call_id
  AND was_successful = true;
  
  -- Calculate score (0-1)
  IF total_closes > 0 THEN
    close_score := successful_closes::NUMERIC / total_closes::NUMERIC;
  ELSE
    close_score := 0; -- No closes attempted
  END IF;
  
  -- Update the call
  UPDATE public.calls
  SET trial_closes_count = total_closes
  WHERE id = calculate_trial_close_metrics.call_id;
  
  RETURN close_score;
END;
$$;

-- Function to calculate sentiment recovery metrics
CREATE OR REPLACE FUNCTION public.calculate_sentiment_recovery_metrics(call_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  negative_moments INTEGER;
  recovered_moments INTEGER;
  recovery_score NUMERIC DEFAULT 0;
BEGIN
  -- Get total negative moments
  SELECT COUNT(*) INTO negative_moments
  FROM public.sentiment_transitions
  WHERE sentiment_transitions.call_id = calculate_sentiment_recovery_metrics.call_id
  AND from_sentiment = 'negative';
  
  -- Get successfully recovered moments
  SELECT COUNT(*) INTO recovered_moments
  FROM public.sentiment_transitions
  WHERE sentiment_transitions.call_id = calculate_sentiment_recovery_metrics.call_id
  AND from_sentiment = 'negative'
  AND recovery_success = true;
  
  -- Calculate score (0-1)
  IF negative_moments > 0 THEN
    recovery_score := recovered_moments::NUMERIC / negative_moments::NUMERIC;
  ELSE
    recovery_score := 1; -- No negative moments to recover from
  END IF;
  
  -- Update the call
  UPDATE public.calls
  SET sentiment_recovery_score = recovery_score
  WHERE id = calculate_sentiment_recovery_metrics.call_id;
  
  RETURN recovery_score;
END;
$$;

-- Function to calculate empathy metrics
CREATE OR REPLACE FUNCTION public.calculate_empathy_metrics(call_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  empathy_count INTEGER;
  call_duration INTEGER;
  empathy_score NUMERIC DEFAULT 0;
BEGIN
  -- Get empathy marker count
  SELECT COUNT(*) INTO empathy_count
  FROM public.empathy_markers
  WHERE empathy_markers.call_id = calculate_empathy_metrics.call_id;
  
  -- Get call duration
  SELECT duration INTO call_duration
  FROM public.calls
  WHERE id = calculate_empathy_metrics.call_id;
  
  -- Calculate score based on frequency per minute
  -- Assuming 2 markers per minute is excellent
  IF call_duration > 0 THEN
    empathy_score := LEAST(1, (empathy_count::NUMERIC / (call_duration::NUMERIC / 60)) / 2);
  ELSE
    empathy_score := 0;
  END IF;
  
  -- Update the call
  UPDATE public.calls
  SET empathy_markers_count = empathy_count
  WHERE id = calculate_empathy_metrics.call_id;
  
  RETURN empathy_score;
END;
$$;

-- Function to calculate overall call quality score
CREATE OR REPLACE FUNCTION public.calculate_call_quality_score(call_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  objection_score NUMERIC;
  trial_close_score NUMERIC;
  sentiment_recovery_score NUMERIC;
  empathy_score NUMERIC;
  competitor_score NUMERIC DEFAULT 0;
  price_handling_score NUMERIC DEFAULT 0;
  overall_score NUMERIC;
  quality_metrics_id UUID;
BEGIN
  -- Calculate individual scores
  objection_score := calculate_objection_handling_metrics(call_id);
  trial_close_score := calculate_trial_close_metrics(call_id);
  sentiment_recovery_score := calculate_sentiment_recovery_metrics(call_id);
  empathy_score := calculate_empathy_metrics(call_id);
  
  -- Calculate competitor handling score
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 1  -- No competitor mentions is good
      ELSE COUNT(CASE WHEN was_countered THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC
    END INTO competitor_score
  FROM public.competitor_mentions
  WHERE competitor_mentions.call_id = calculate_call_quality_score.call_id;
  
  -- Calculate price sensitivity handling score
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0.5  -- No price mentions is neutral
      ELSE AVG(sentiment_score)
    END INTO price_handling_score
  FROM public.price_sensitivity
  WHERE price_sensitivity.call_id = calculate_call_quality_score.call_id;
  
  -- Calculate overall score (weighted average)
  overall_score := (
    objection_score * 0.25 +
    trial_close_score * 0.2 +
    sentiment_recovery_score * 0.15 +
    empathy_score * 0.15 +
    competitor_score * 0.15 +
    price_handling_score * 0.1
  ) * 100; -- Convert to 0-100 scale
  
  -- Store individual scores in call_quality_metrics
  SELECT id INTO quality_metrics_id 
  FROM public.call_quality_metrics
  WHERE call_id = calculate_call_quality_score.call_id;
  
  IF quality_metrics_id IS NULL THEN
    -- Create new record
    INSERT INTO public.call_quality_metrics (
      call_id,
      objection_handling_score,
      trial_close_score,
      price_handling_score,
      sentiment_recovery_score,
      empathy_score,
      competitor_handling_score,
      overall_quality_score
    ) VALUES (
      call_id,
      objection_score * 100,
      trial_close_score * 100,
      price_handling_score * 100,
      sentiment_recovery_score * 100,
      empathy_score * 100,
      competitor_score * 100,
      overall_score
    );
  ELSE
    -- Update existing record
    UPDATE public.call_quality_metrics
    SET 
      objection_handling_score = objection_score * 100,
      trial_close_score = trial_close_score * 100,
      price_handling_score = price_handling_score * 100,
      sentiment_recovery_score = sentiment_recovery_score * 100,
      empathy_score = empathy_score * 100,
      competitor_handling_score = competitor_score * 100,
      overall_quality_score = overall_score,
      updated_at = now()
    WHERE id = quality_metrics_id;
  END IF;
  
  -- Update the main call record
  UPDATE public.calls
  SET quality_score = overall_score
  WHERE id = calculate_call_quality_score.call_id;
  
  RETURN overall_score;
END;
$$;

-- Function to update call metrics summary with new metrics
CREATE OR REPLACE FUNCTION public.update_call_metrics_summary(report_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metrics_id UUID;
  total_calls INTEGER;
  total_duration INTEGER;
  avg_duration NUMERIC;
  positive_count INTEGER;
  neutral_count INTEGER;
  negative_count INTEGER;
  avg_sentiment NUMERIC;
  agent_ratio NUMERIC;
  customer_ratio NUMERIC;
  performance_score NUMERIC;
  conversion_rate NUMERIC;
BEGIN
  -- Get metrics from calls table for the given date
  SELECT 
    COUNT(*),
    COALESCE(SUM(duration), 0),
    COALESCE(AVG(duration), 0),
    COUNT(CASE WHEN sentiment_agent > 0.66 THEN 1 END),
    COUNT(CASE WHEN sentiment_agent BETWEEN 0.33 AND 0.66 THEN 1 END),
    COUNT(CASE WHEN sentiment_agent < 0.33 THEN 1 END),
    COALESCE(AVG(sentiment_agent), 0.5),
    COALESCE(AVG(talk_ratio_agent), 50),
    COALESCE(AVG(talk_ratio_customer), 50),
    COALESCE(AVG(quality_score), 70),
    -- Conversion rate could be calculated here if we had conversion data
    0.3 -- Default placeholder conversion rate
  INTO
    total_calls,
    total_duration,
    avg_duration,
    positive_count,
    neutral_count,
    negative_count,
    avg_sentiment,
    agent_ratio,
    customer_ratio,
    performance_score,
    conversion_rate
  FROM public.calls
  WHERE DATE(created_at) = report_date;
  
  -- Check if we have an existing record for this date
  SELECT id INTO metrics_id
  FROM public.call_metrics_summary
  WHERE call_metrics_summary.report_date = update_call_metrics_summary.report_date;
  
  IF metrics_id IS NULL THEN
    -- Create new metrics record
    INSERT INTO public.call_metrics_summary (
      report_date,
      total_calls,
      total_duration,
      avg_duration,
      positive_sentiment_count,
      neutral_sentiment_count,
      negative_sentiment_count,
      avg_sentiment,
      agent_talk_ratio,
      customer_talk_ratio,
      performance_score,
      conversion_rate
    ) VALUES (
      report_date,
      total_calls,
      total_duration,
      avg_duration,
      positive_count,
      neutral_count,
      negative_count,
      avg_sentiment,
      agent_ratio,
      customer_ratio,
      performance_score,
      conversion_rate
    );
  ELSE
    -- Update existing metrics record
    UPDATE public.call_metrics_summary
    SET 
      total_calls = update_call_metrics_summary.total_calls,
      total_duration = update_call_metrics_summary.total_duration,
      avg_duration = update_call_metrics_summary.avg_duration,
      positive_sentiment_count = update_call_metrics_summary.positive_count,
      neutral_sentiment_count = update_call_metrics_summary.neutral_count,
      negative_sentiment_count = update_call_metrics_summary.negative_count,
      avg_sentiment = update_call_metrics_summary.avg_sentiment,
      agent_talk_ratio = update_call_metrics_summary.agent_ratio,
      customer_talk_ratio = update_call_metrics_summary.customer_ratio,
      performance_score = update_call_metrics_summary.performance_score,
      conversion_rate = update_call_metrics_summary.conversion_rate,
      updated_at = now()
    WHERE id = metrics_id;
  END IF;
END;
$$;

-- Create trigger to update metrics whenever a call is added or updated
CREATE OR REPLACE FUNCTION public.update_metrics_on_call_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Calculate quality score for the call
  PERFORM calculate_call_quality_score(NEW.id);
  
  -- Update metrics summary for the day
  PERFORM update_call_metrics_summary(DATE(NEW.created_at));
  
  RETURN NEW;
END;
$$;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS update_metrics_on_call_change_trigger ON public.calls;

CREATE TRIGGER update_metrics_on_call_change_trigger
AFTER INSERT OR UPDATE ON public.calls
FOR EACH ROW
EXECUTE FUNCTION public.update_metrics_on_call_change();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.calculate_objection_handling_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_trial_close_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_sentiment_recovery_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_empathy_metrics TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_call_quality_score TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_call_metrics_summary TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_metrics_on_call_change TO anon, authenticated; 