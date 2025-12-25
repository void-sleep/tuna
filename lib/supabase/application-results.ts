import { createClient } from './server';

export interface ApplicationResult {
  id: string;
  application_id: string;
  result_data: Record<string, unknown>;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface CreateApplicationResultInput {
  result_data: Record<string, unknown>;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ApplicationStats {
  total_runs: number;
  most_selected_item_id: string | null;
  most_selected_count: number;
  selection_distribution: Record<string, number>;
  recent_results: ApplicationResult[];
}

/**
 * Create a new application result
 */
export async function createApplicationResult(
  applicationId: string,
  input: CreateApplicationResultInput
): Promise<ApplicationResult> {
  const supabase = await createClient();

  // Build insert object, only include fields that are provided
  // Let database default handle user_id via auth.uid()
  const insertData: Record<string, unknown> = {
    application_id: applicationId,
    result_data: input.result_data,
  };

  if (input.user_id) {
    insertData.user_id = input.user_id;
  }
  if (input.ip_address) {
    insertData.ip_address = input.ip_address;
  }
  if (input.user_agent) {
    insertData.user_agent = input.user_agent;
  }

  const { data, error } = await supabase
    .from('application_results')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Error creating application result:', error);
    throw new Error('Failed to create application result');
  }

  return data;
}

/**
 * Get recent results for an application
 */
export async function getApplicationResults(
  applicationId: string,
  limit: number = 10
): Promise<ApplicationResult[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('application_results')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching application results:', error);
    throw new Error('Failed to fetch application results');
  }

  return data || [];
}

/**
 * Get a single result by ID
 */
export async function getApplicationResult(
  resultId: string
): Promise<ApplicationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('application_results')
    .select('*')
    .eq('id', resultId)
    .single();

  if (error) {
    console.error('Error fetching application result:', error);
    throw new Error('Failed to fetch application result');
  }

  return data;
}

/**
 * Delete a result
 */
export async function deleteApplicationResult(resultId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('application_results')
    .delete()
    .eq('id', resultId);

  if (error) {
    console.error('Error deleting application result:', error);
    throw new Error('Failed to delete application result');
  }
}

/**
 * Get statistics for an application
 */
export async function getApplicationStats(
  applicationId: string,
  daysBack: number = 30
): Promise<ApplicationStats> {
  const supabase = await createClient();

  // Get results from the last N days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data: results, error } = await supabase
    .from('application_results')
    .select('*')
    .eq('application_id', applicationId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching application stats:', error);
    throw new Error('Failed to fetch application stats');
  }

  if (!results || results.length === 0) {
    return {
      total_runs: 0,
      most_selected_item_id: null,
      most_selected_count: 0,
      selection_distribution: {},
      recent_results: [],
    };
  }

  // Calculate selection distribution
  const selectionCounts: Record<string, number> = {};

  for (const result of results) {
    const selectedItemId = result.result_data.selected_item_id as string;
    if (selectedItemId) {
      selectionCounts[selectedItemId] = (selectionCounts[selectedItemId] || 0) + 1;
    }
  }

  // Find most selected item
  let mostSelectedItemId: string | null = null;
  let mostSelectedCount = 0;

  for (const [itemId, count] of Object.entries(selectionCounts)) {
    if (count > mostSelectedCount) {
      mostSelectedItemId = itemId;
      mostSelectedCount = count;
    }
  }

  return {
    total_runs: results.length,
    most_selected_item_id: mostSelectedItemId,
    most_selected_count: mostSelectedCount,
    selection_distribution: selectionCounts,
    recent_results: results.slice(0, 10),
  };
}

/**
 * Get results count for an application
 */
export async function getApplicationResultsCount(
  applicationId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('application_results')
    .select('*', { count: 'exact', head: true })
    .eq('application_id', applicationId);

  if (error) {
    console.error('Error counting application results:', error);
    throw new Error('Failed to count application results');
  }

  return count || 0;
}

/**
 * Delete all results for an application
 */
export async function deleteAllApplicationResults(
  applicationId: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('application_results')
    .delete()
    .eq('application_id', applicationId);

  if (error) {
    console.error('Error deleting all application results:', error);
    throw new Error('Failed to delete all application results');
  }
}

/**
 * Get results grouped by date
 */
export async function getResultsByDate(
  applicationId: string,
  daysBack: number = 30
): Promise<Record<string, number>> {
  const supabase = await createClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const { data: results, error } = await supabase
    .from('application_results')
    .select('created_at')
    .eq('application_id', applicationId)
    .gte('created_at', startDate.toISOString());

  if (error) {
    console.error('Error fetching results by date:', error);
    throw new Error('Failed to fetch results by date');
  }

  if (!results || results.length === 0) {
    return {};
  }

  // Group by date (YYYY-MM-DD)
  const dateGroups: Record<string, number> = {};

  for (const result of results) {
    const date = new Date(result.created_at).toISOString().split('T')[0];
    dateGroups[date] = (dateGroups[date] || 0) + 1;
  }

  return dateGroups;
}
