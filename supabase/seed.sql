-- Loveable Analytics - Seed Data for Testing
-- This seed file will populate the database with sample data for the advanced metrics

-- Create test calls if they don't exist (for relationship references)
INSERT INTO public.calls (id, user_id, duration, sentiment_agent, sentiment_customer, talk_ratio_agent, talk_ratio_customer, key_phrases, created_at)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'test-agent-1', 480, 0.72, 0.65, 55, 45, ARRAY['pricing', 'features', 'competition'], now() - interval '3 days'),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'test-agent-1', 320, 0.48, 0.39, 62, 38, ARRAY['pricing', 'objections', 'features'], now() - interval '2 days'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'test-agent-2', 610, 0.81, 0.73, 48, 52, ARRAY['onboarding', 'features', 'pricing'], now() - interval '1 day'),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'test-agent-2', 540, 0.59, 0.61, 52, 48, ARRAY['support', 'pricing', 'features'], now())
ON CONFLICT (id) DO NOTHING;

-- Populate objection_tracking
INSERT INTO public.objection_tracking (call_id, objection_text, response_text, timestamp, was_handled, objection_type, time_to_response)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'I think your product is too expensive', 'Let me show you the ROI calculation', 120, true, 'pricing', 5),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'We already use a competitor solution', 'Let me show you our unique advantages', 240, true, 'competition', 8),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'I need to discuss with my team first', 'I understand, would it help if I joined that call?', 450, false, 'decision', 4),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'The pricing is outside our budget', 'We do offer flexible payment options', 150, true, 'pricing', 7),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'I don''t see how this fits our workflow', 'Actually, let me show you some examples', 210, false, 'fit', 12),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'We need this to integrate with our CRM', 'We have native integrations with all major CRMs', 180, true, 'technical', 3),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'The onboarding looks complicated', 'We provide dedicated support during implementation', 90, true, 'implementation', 5),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'We need to think about it more', 'Perhaps I can send you some success stories', 320, false, 'decision', 10)
ON CONFLICT DO NOTHING;

-- Populate trial_closes
INSERT INTO public.trial_closes (call_id, close_text, prospect_response, sentiment_score, was_successful, timestamp)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'Does that sound like what you''re looking for?', 'Yes, that would work for us', 0.85, true, 180),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'Would you like to move forward with implementation?', 'I need to discuss this with my manager first', 0.4, false, 400),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'How does that sound so far?', 'I''m liking what I hear', 0.75, true, 120),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'Would you be ready to start next week?', 'Let me check our timeline', 0.5, false, 280),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'Does this solve your main concern?', 'Absolutely, that''s exactly what we need', 0.9, true, 350),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'Shall we prepare the paperwork?', 'Yes, please send it over', 0.95, true, 580),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'Is this approach making sense?', 'I''m still not sure', 0.3, false, 200),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'Would a 30-day trial help you decide?', 'That would be very helpful', 0.8, true, 480)
ON CONFLICT DO NOTHING;

-- Populate price_sensitivity
INSERT INTO public.price_sensitivity (call_id, price_mention_text, response_text, sentiment_score, timestamp)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'Our monthly plan is $499', 'That''s quite expensive', 0.3, 100),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'We also offer an annual plan at $399/month', 'That's better, but still high', 0.4, 130),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'The enterprise plan is $1299', 'That's outside our budget', 0.2, 200),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'We can offer a 15% discount', 'That helps, but we need more', 0.5, 220),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'The starter plan is just $199', 'That sounds very reasonable', 0.85, 150),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'Additional seats are $49 each', 'That's perfect for our team size', 0.9, 170),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'Implementation fee is $2500', 'I wasn't expecting that cost', 0.25, 250),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'We can waive that with a 2-year commitment', 'That's much more attractive', 0.75, 280)
ON CONFLICT DO NOTHING;

-- Populate sentiment_transitions
INSERT INTO public.sentiment_transitions (call_id, from_sentiment, to_sentiment, transition_time, recovery_time, recovery_success, transition_text)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'negative', 'positive', 105, 30, true, 'I was concerned about price but the ROI makes sense'),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'neutral', 'positive', 245, 25, true, 'The features you described are exactly what we need'),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'negative', 'neutral', 160, 40, true, 'The payment options make it more manageable'),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'neutral', 'negative', 220, 60, false, 'I still don't see how this fits our workflow'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'neutral', 'positive', 185, 20, true, 'The integrations are perfect for our needs'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'positive', 'positive', 300, 0, true, 'Your solution exceeds our expectations'),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'negative', 'neutral', 100, 35, true, 'The implementation support helps address my concerns'),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'neutral', 'negative', 330, 50, false, 'We still need to think about the overall cost')
ON CONFLICT DO NOTHING;

-- Populate empathy_markers
INSERT INTO public.empathy_markers (call_id, empathy_text, empathy_type, timestamp, sentiment_context)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'I understand your concerns about the price', 'understanding', 110, 'negative'),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'I can see why that would be important to your team', 'acknowledgment', 260, 'neutral'),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'That sounds like a challenging situation', 'recognition', 380, 'negative'),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'I appreciate you sharing those concerns with me', 'gratitude', 170, 'negative'),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'That makes a lot of sense from your perspective', 'validation', 240, 'neutral'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'I hear what you're saying about integration needs', 'listening', 190, 'neutral'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'You're right to prioritize team adoption', 'affirmation', 410, 'positive'),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'I'm excited that this resonates with your goals', 'connection', 520, 'positive'),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'I understand your hesitation about implementation', 'understanding', 95, 'negative'),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'It makes sense to evaluate all options carefully', 'validation', 340, 'neutral')
ON CONFLICT DO NOTHING;

-- Populate competitor_mentions
INSERT INTO public.competitor_mentions (call_id, competitor_name, mention_context, was_countered, counter_argument, timestamp)
VALUES
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'CompetitorX', 'We currently use CompetitorX for this', true, 'Unlike CompetitorX, we offer seamless integration', 230),
  ('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a', 'CompetitorY', 'CompetitorY offered us a lower price', true, 'Our ROI is actually better than CompetitorY', 310),
  ('ddb4e352-a4b1-4c45-86da-35c299ca24cd', 'CompetitorZ', 'CompetitorZ has this feature built-in', false, null, 180),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'CompetitorX', 'I saw CompetitorX at a conference', true, 'Our solution has 30% better performance than CompetitorX', 270),
  ('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c', 'CompetitorY', 'A colleague recommended CompetitorY', true, 'CompetitorY lacks our advanced analytics features', 390),
  ('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda', 'CompetitorZ', 'CompetitorZ is used by our partner', false, null, 420)
ON CONFLICT DO NOTHING;

-- Calculate and populate call_quality_metrics by running our new functions
SELECT calculate_call_quality_score('fdb13aff-87f0-4db1-b9c8-7219ec9f1f0a');
SELECT calculate_call_quality_score('ddb4e352-a4b1-4c45-86da-35c299ca24cd');
SELECT calculate_call_quality_score('c3b8d0f1-c6c5-4ba1-a9b3-c28fa6f1e44c');
SELECT calculate_call_quality_score('b0a7c8d2-ecab-43f1-994c-3f83a24e1cda');

-- Generate metrics summaries for the last few days
SELECT update_call_metrics_summary(CURRENT_DATE - INTERVAL '3 days');
SELECT update_call_metrics_summary(CURRENT_DATE - INTERVAL '2 days');
SELECT update_call_metrics_summary(CURRENT_DATE - INTERVAL '1 day');
SELECT update_call_metrics_summary(CURRENT_DATE); 