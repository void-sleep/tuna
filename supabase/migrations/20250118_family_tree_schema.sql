-- Family Tree Schema for "Ta是谁" application
-- This migration creates tables for family members, relations, and kinship terms
-- Each family_tree application has its own independent data (isolated by application_id)

-- Avatar types enum
CREATE TYPE avatar_type AS ENUM (
  'elder_male',
  'elder_female',
  'adult_male',
  'adult_female',
  'youth_male',
  'youth_female',
  'child'
);

-- Gender enum
CREATE TYPE gender_type AS ENUM ('male', 'female');

-- Family Members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  real_name TEXT,
  gender gender_type NOT NULL,
  birth_date DATE,
  avatar_type avatar_type NOT NULL DEFAULT 'adult_male',
  avatar_url TEXT,
  notes TEXT,
  is_self BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure each application has at most one "self" member
CREATE UNIQUE INDEX idx_family_members_self_per_app
ON family_members(user_id, application_id)
WHERE is_self = TRUE;

-- Index for user and application queries
CREATE INDEX idx_family_members_user ON family_members(user_id);
CREATE INDEX idx_family_members_app ON family_members(application_id);

-- Family Relations table
CREATE TABLE family_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate relations per application
  CONSTRAINT unique_relation_per_app UNIQUE (user_id, application_id, from_member_id, to_member_id, relation_type),
  -- Prevent self-relations
  CONSTRAINT no_self_relation CHECK (from_member_id != to_member_id)
);

-- Index for relation queries
CREATE INDEX idx_family_relations_user ON family_relations(user_id);
CREATE INDEX idx_family_relations_app ON family_relations(application_id);
CREATE INDEX idx_family_relations_from ON family_relations(from_member_id);
CREATE INDEX idx_family_relations_to ON family_relations(to_member_id);

-- Enable RLS on family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_members (check user and application ownership)
CREATE POLICY family_members_select ON family_members
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_members_insert ON family_members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_members_update ON family_members
  FOR UPDATE USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_members_delete ON family_members
  FOR DELETE USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

-- Enable RLS on family_relations
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;

-- RLS policies for family_relations (check user and application ownership)
CREATE POLICY family_relations_select ON family_relations
  FOR SELECT USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_relations_insert ON family_relations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_relations_update ON family_relations
  FOR UPDATE USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

CREATE POLICY family_relations_delete ON family_relations
  FOR DELETE USING (
    auth.uid() = user_id
    AND (
      application_id IS NULL
      OR application_id IN (SELECT id FROM applications WHERE user_id = auth.uid())
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_family_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_members_updated_at();
