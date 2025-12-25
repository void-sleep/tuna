import { createClient } from './server';

export interface ApplicationItem {
  id: string;
  application_id: string;
  text: string;
  icon: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicationItemInput {
  text: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  position?: number;
  is_active?: boolean;
}

export interface UpdateApplicationItemInput {
  text?: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  position?: number;
  is_active?: boolean;
}

/**
 * Get all items for an application
 */
export async function getApplicationItems(
  applicationId: string
): Promise<ApplicationItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('application_items')
    .select('*')
    .eq('application_id', applicationId)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching application items:', error);
    throw new Error('Failed to fetch application items');
  }

  return data || [];
}

/**
 * Get a single item by ID
 */
export async function getApplicationItem(
  itemId: string
): Promise<ApplicationItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('application_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching application item:', error);
    throw new Error('Failed to fetch application item');
  }

  return data;
}

/**
 * Create a new application item
 */
export async function createApplicationItem(
  applicationId: string,
  input: CreateApplicationItemInput
): Promise<ApplicationItem> {
  const supabase = await createClient();

  // If position not provided, get the max position and add 1
  let position = input.position;
  if (position === undefined) {
    const { data: items } = await supabase
      .from('application_items')
      .select('position')
      .eq('application_id', applicationId)
      .order('position', { ascending: false })
      .limit(1);

    position = items && items.length > 0 ? items[0].position + 1 : 0;
  }

  const { data, error } = await supabase
    .from('application_items')
    .insert({
      application_id: applicationId,
      text: input.text,
      icon: input.icon || null,
      description: input.description || null,
      metadata: input.metadata || {},
      position,
      is_active: input.is_active !== undefined ? input.is_active : true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating application item:', error);
    throw new Error('Failed to create application item');
  }

  return data;
}

/**
 * Update an application item
 */
export async function updateApplicationItem(
  itemId: string,
  input: UpdateApplicationItemInput
): Promise<ApplicationItem> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {};
  if (input.text !== undefined) updateData.text = input.text;
  if (input.icon !== undefined) updateData.icon = input.icon;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.metadata !== undefined) updateData.metadata = input.metadata;
  if (input.position !== undefined) updateData.position = input.position;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const { data, error } = await supabase
    .from('application_items')
    .update(updateData)
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating application item:', error);
    throw new Error('Failed to update application item');
  }

  return data;
}

/**
 * Delete an application item (soft delete by setting is_active to false)
 */
export async function deleteApplicationItem(itemId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('application_items')
    .update({ is_active: false })
    .eq('id', itemId);

  if (error) {
    console.error('Error deleting application item:', error);
    throw new Error('Failed to delete application item');
  }
}

/**
 * Hard delete an application item
 */
export async function hardDeleteApplicationItem(itemId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('application_items')
    .delete()
    .eq('id', itemId);

  if (error) {
    console.error('Error hard deleting application item:', error);
    throw new Error('Failed to hard delete application item');
  }
}

/**
 * Reorder application items
 */
export async function reorderApplicationItems(
  applicationId: string,
  itemPositions: Record<string, number>
): Promise<void> {
  const supabase = await createClient();

  // Update each item's position
  const updates = Object.entries(itemPositions).map(([itemId, position]) =>
    supabase
      .from('application_items')
      .update({ position })
      .eq('id', itemId)
      .eq('application_id', applicationId)
  );

  const results = await Promise.all(updates);

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    console.error('Error reordering application items:', errors);
    throw new Error('Failed to reorder application items');
  }
}

/**
 * Bulk create application items
 */
export async function bulkCreateApplicationItems(
  applicationId: string,
  items: CreateApplicationItemInput[]
): Promise<ApplicationItem[]> {
  const supabase = await createClient();

  const itemsWithPosition = items.map((item, index) => ({
    application_id: applicationId,
    // user_id 由数据库自动填充 DEFAULT auth.uid()
    text: item.text,
    icon: item.icon || null,
    description: item.description || null,
    metadata: item.metadata || {},
    position: item.position !== undefined ? item.position : index,
    is_active: item.is_active !== undefined ? item.is_active : true,
  }));

  const { data, error } = await supabase
    .from('application_items')
    .insert(itemsWithPosition)
    .select();

  if (error) {
    console.error('Error bulk creating application items:', error);
    throw new Error('Failed to bulk create application items');
  }

  return data || [];
}
