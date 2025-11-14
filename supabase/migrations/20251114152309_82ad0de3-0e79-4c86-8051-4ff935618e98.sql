-- Add age range and distance preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN age_min INTEGER DEFAULT 18,
ADD COLUMN age_max INTEGER DEFAULT 75,
ADD COLUMN max_distance INTEGER DEFAULT 50,
ADD COLUMN city TEXT,
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC;

-- Add check constraints
ALTER TABLE public.profiles
ADD CONSTRAINT age_min_check CHECK (age_min >= 18 AND age_min <= 75),
ADD CONSTRAINT age_max_check CHECK (age_max >= 18 AND age_max <= 75 AND age_max >= age_min),
ADD CONSTRAINT max_distance_check CHECK (max_distance >= 1 AND max_distance <= 500);