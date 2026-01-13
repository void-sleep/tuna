import { createClient } from "./server";

export type ApplicationType = 'coin' | 'wheel' | 'counter' | 'math_flash' | 'agree_question';

export interface Application {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: ApplicationType;
  config: Record<string, unknown>; // App-level settings only (theme, animation, etc), NOT data items
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationInput {
  title: string;
  description?: string;
  type: ApplicationType;
  config?: Record<string, unknown>; // Optional app-level settings
}

export interface UpdateApplicationInput {
  title?: string;
  description?: string;
  config?: Record<string, unknown>;
}

/**
 * Get all applications for the current user
 */
export async function getApplications(): Promise<Application[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch applications: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single application by ID
 */
export async function getApplication(id: string): Promise<Application | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch application: ${error.message}`);
  }

  return data;
}

/**
 * Create a new application
 */
export async function createApplication(input: CreateApplicationInput): Promise<Application> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userData.user.id,
      title: input.title,
      description: input.description || null,
      type: input.type,
      config: input.config || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create application: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing application
 */
export async function updateApplication(
  id: string,
  input: UpdateApplicationInput
): Promise<Application> {
  const supabase = await createClient();

  const updateData: Partial<Application> = {};
  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.config !== undefined) updateData.config = input.config;

  const { data, error } = await supabase
    .from('applications')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update application: ${error.message}`);
  }

  return data;
}

/**
 * Delete an application
 */
export async function deleteApplication(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete application: ${error.message}`);
  }
}
