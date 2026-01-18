import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getFamilyRelations,
  createFamilyRelation,
  type CreateFamilyRelationInput,
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

    const relations = await getFamilyRelations(applicationId);
    return NextResponse.json(relations);
  } catch (error) {
    console.error('Error fetching family relations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family relations' },
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

    const body: CreateFamilyRelationInput & { applicationId?: string } = await request.json();

    if (!body.from_member_id || !body.to_member_id || !body.relation_type) {
      return NextResponse.json(
        { error: 'from_member_id, to_member_id, and relation_type are required' },
        { status: 400 }
      );
    }

    // Map applicationId to application_id for the database
    const input: CreateFamilyRelationInput = {
      ...body,
      application_id: body.applicationId || body.application_id,
    };

    const relation = await createFamilyRelation(input);
    return NextResponse.json(relation, { status: 201 });
  } catch (error) {
    console.error('Error creating family relation:', error);
    return NextResponse.json(
      { error: 'Failed to create family relation' },
      { status: 500 }
    );
  }
}
