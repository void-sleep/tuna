import { type NextRequest, NextResponse } from 'next/server';
import {
  createApplicationResult,
  getApplicationResults,
  type CreateApplicationResultInput,
} from '@/lib/supabase/application-results';

/**
 * GET /api/applications/[id]/results
 * Get results for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const results = await getApplicationResults(id, limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching application results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application results' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications/[id]/results
 * Create a new result for an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { result_data } = body as CreateApplicationResultInput;

    if (!result_data) {
      return NextResponse.json(
        { error: 'result_data is required' },
        { status: 400 }
      );
    }

    // Get IP and user agent from request headers
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');

    const result = await createApplicationResult(id, {
      result_data,
      ip_address: ip || undefined,
      user_agent: userAgent || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating application result:', error);
    return NextResponse.json(
      { error: 'Failed to create application result' },
      { status: 500 }
    );
  }
}
