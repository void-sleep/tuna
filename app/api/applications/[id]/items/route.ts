import { type NextRequest, NextResponse } from 'next/server';
import {
  getApplicationItems,
  bulkCreateApplicationItems,
  type CreateApplicationItemInput,
} from '@/lib/supabase/application-items';
import { getApplication } from '@/lib/supabase/applications';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/applications/[id]/items
 * Get all items for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify application exists and user has access
    await getApplication(id);

    const items = await getApplicationItems(id);

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching application items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application items' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications/[id]/items
 * Create or replace items for an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('POST /api/applications/[id]/items - ID:', id);

    // Verify application exists and user has access
    const app = await getApplication(id);
    console.log('Application found:', app?.id, app?.type);

    const body = await request.json();
    const { items } = body as { items: CreateApplicationItemInput[] };

    console.log('Items to save:', items);

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Delete existing items first (hard delete to avoid duplicates)
    console.log('Fetching existing items...');
    const existingItems = await getApplicationItems(id);
    console.log('Found existing items:', existingItems.length);

    if (existingItems.length > 0) {
      console.log('Hard deleting existing items...');
      const supabase = await createClient();
      const { error: deleteError } = await supabase
        .from('application_items')
        .delete()
        .eq('application_id', id)
        .eq('is_active', true);  // 只删除活跃的记录

      if (deleteError) {
        console.error('Error deleting items:', deleteError);
        throw new Error('Failed to delete existing items');
      }
      console.log('Existing items deleted');
    }

    // Create new items
    console.log('Creating new items...');
    const createdItems = await bulkCreateApplicationItems(id, items);
    console.log('Created items:', createdItems.length);

    return NextResponse.json(createdItems);
  } catch (error) {
    console.error('Error creating application items:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      {
        error: 'Failed to create application items',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
