import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getFamilyMembers,
  createFamilyMember,
  type CreateFamilyMemberInput,
} from "@/lib/supabase/family-tree";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId') || undefined;

    const members = await getFamilyMembers(applicationId);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateFamilyMemberInput & { applicationId?: string } = await request.json();

    if (!body.nickname || !body.gender) {
      return NextResponse.json(
        { error: 'Nickname and gender are required' },
        { status: 400 }
      );
    }

    // Map applicationId to application_id for the database
    const input: CreateFamilyMemberInput = {
      ...body,
      application_id: body.applicationId || body.application_id,
    };

    const member = await createFamilyMember(input);
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json(
      { error: 'Failed to create family member' },
      { status: 500 }
    );
  }
}
