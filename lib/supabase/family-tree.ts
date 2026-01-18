import { createClient } from "./server";

export type AvatarType =
  | 'elder_male'
  | 'elder_female'
  | 'adult_male'
  | 'adult_female'
  | 'youth_male'
  | 'youth_female'
  | 'child';

export type GenderType = 'male' | 'female';

// Relation type is a string for flexibility (can add new types without schema changes)
export type RelationType = string;

// Known relation types for UI display
export const KNOWN_RELATION_TYPES = [
  'father',
  'mother',
  'son',
  'daughter',
  'spouse',
  'elder_brother',
  'younger_brother',
  'elder_sister',
  'younger_sister',
] as const;

export interface FamilyMember {
  id: string;
  user_id: string;
  application_id: string | null;
  nickname: string;
  real_name: string | null;
  gender: GenderType;
  birth_date: string | null;
  avatar_type: AvatarType;
  avatar_url: string | null;
  notes: string | null;
  is_self: boolean;
  created_at: string;
  updated_at: string;
}

export interface FamilyRelation {
  id: string;
  user_id: string;
  application_id: string | null;
  from_member_id: string;
  to_member_id: string;
  relation_type: RelationType;
  created_at: string;
}

export interface CreateFamilyMemberInput {
  nickname: string;
  real_name?: string;
  gender: GenderType;
  birth_date?: string;
  avatar_type?: AvatarType;
  avatar_url?: string;
  notes?: string;
  is_self?: boolean;
  application_id?: string;
}

export interface UpdateFamilyMemberInput {
  nickname?: string;
  real_name?: string;
  gender?: GenderType;
  birth_date?: string;
  avatar_type?: AvatarType;
  avatar_url?: string;
  notes?: string;
}

export interface CreateFamilyRelationInput {
  from_member_id: string;
  to_member_id: string;
  relation_type: RelationType;
  application_id?: string;
}

// Family member with relations for graph display
export interface FamilyMemberWithRelations extends FamilyMember {
  relations_from: FamilyRelation[];
  relations_to: FamilyRelation[];
}

/**
 * Get all family members for the current user, filtered by application
 */
export async function getFamilyMembers(applicationId?: string): Promise<FamilyMember[]> {
  const supabase = await createClient();

  let query = supabase
    .from('family_members')
    .select('*');

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  } else {
    query = query.is('application_id', null);
  }

  const { data, error } = await query
    .order('is_self', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch family members: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single family member by ID
 */
export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('family_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch family member: ${error.message}`);
  }

  return data;
}

/**
 * Get the "self" member for the current user in a specific application
 */
export async function getSelfMember(applicationId?: string): Promise<FamilyMember | null> {
  const supabase = await createClient();

  let query = supabase
    .from('family_members')
    .select('*')
    .eq('is_self', true);

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  } else {
    query = query.is('application_id', null);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch self member: ${error.message}`);
  }

  return data;
}

/**
 * Create a new family member
 */
export async function createFamilyMember(input: CreateFamilyMemberInput): Promise<FamilyMember> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  // Determine default avatar type based on gender
  const defaultAvatarType: AvatarType = input.gender === 'male' ? 'adult_male' : 'adult_female';

  const { data, error } = await supabase
    .from('family_members')
    .insert({
      user_id: userData.user.id,
      application_id: input.application_id || null,
      nickname: input.nickname,
      real_name: input.real_name || null,
      gender: input.gender,
      birth_date: input.birth_date || null,
      avatar_type: input.avatar_type || defaultAvatarType,
      avatar_url: input.avatar_url || null,
      notes: input.notes || null,
      is_self: input.is_self || false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create family member: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing family member
 */
export async function updateFamilyMember(
  id: string,
  input: UpdateFamilyMemberInput
): Promise<FamilyMember> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('family_members')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update family member: ${error.message}`);
  }

  return data;
}

/**
 * Delete a family member
 */
export async function deleteFamilyMember(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete family member: ${error.message}`);
  }
}

/**
 * Get all relations for the current user, filtered by application
 */
export async function getFamilyRelations(applicationId?: string): Promise<FamilyRelation[]> {
  const supabase = await createClient();

  let query = supabase
    .from('family_relations')
    .select('*');

  if (applicationId) {
    query = query.eq('application_id', applicationId);
  } else {
    query = query.is('application_id', null);
  }

  const { data, error } = await query
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch family relations: ${error.message}`);
  }

  return data || [];
}

/**
 * Create a new family relation
 */
export async function createFamilyRelation(input: CreateFamilyRelationInput): Promise<FamilyRelation> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('family_relations')
    .insert({
      user_id: userData.user.id,
      application_id: input.application_id || null,
      from_member_id: input.from_member_id,
      to_member_id: input.to_member_id,
      relation_type: input.relation_type,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create family relation: ${error.message}`);
  }

  return data;
}

/**
 * Delete a family relation
 */
export async function deleteFamilyRelation(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('family_relations')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete family relation: ${error.message}`);
  }
}

/**
 * Get all family data for graph display, filtered by application
 */
export async function getFamilyTreeData(applicationId?: string): Promise<{
  members: FamilyMember[];
  relations: FamilyRelation[];
}> {
  const [members, relations] = await Promise.all([
    getFamilyMembers(applicationId),
    getFamilyRelations(applicationId),
  ]);

  return { members, relations };
}
