-- Add gender_preference column to profiles table
ALTER TABLE profiles 
ADD COLUMN gender_preference TEXT CHECK (gender_preference IN ('men', 'women', 'everyone'));