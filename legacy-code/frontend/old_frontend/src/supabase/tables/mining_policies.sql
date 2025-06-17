
-- Mining Sessions RLS policies
CREATE POLICY "Users can view their own mining sessions" 
ON mining_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining sessions" 
ON mining_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining sessions" 
ON mining_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Mining Status History RLS policies
CREATE POLICY "Users can view their own mining status history" 
ON mining_status_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining status history" 
ON mining_status_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- User Achievements RLS policies
CREATE POLICY "Users can view their own achievements" 
ON user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
ON user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Mining Stats RLS policies
CREATE POLICY "Users can view their own mining stats" 
ON mining_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining stats" 
ON mining_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining stats" 
ON mining_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
