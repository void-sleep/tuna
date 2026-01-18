import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type UpdateFamilyMemberInput,
} from "@/lib/supabase/family-tree";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await getFamilyMember(id);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching family member:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family member' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: UpdateFamilyMemberInput = await request.json();
    const member = await updateFamilyMember(id, body);

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json(
      { error: 'Failed to update family member' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteFamilyMember(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json(
      { error: 'Failed to delete family member' },
      { status: 500 }
    );
  }
}
