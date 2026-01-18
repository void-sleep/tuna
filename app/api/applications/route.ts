import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createApplication, type CreateApplicationInput } from "@/lib/supabase/applications";
import { createFamilyMember } from "@/lib/supabase/family-tree";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch applications
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateApplicationInput = await request.json();

    // Validate request body
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Create application (without default items)
    const application = await createApplication(body);

    // For family_tree applications, automatically create a default "我" member
    if (body.type === 'family_tree') {
      try {
        await createFamilyMember({
          nickname: '我',
          gender: 'male',
          avatar_type: 'adult_male',
          is_self: true,
          application_id: application.id,
        });
      } catch (memberError) {
        console.error('Error creating default self member:', memberError);
        // Don't fail the application creation if member creation fails
      }
    }

    // Revalidate the apps page cache
    revalidatePath('/apps');

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    );
  }
}
