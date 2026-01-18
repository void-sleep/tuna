import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFamilyRelation } from "@/lib/supabase/family-tree";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteFamilyRelation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting family relation:', error);
    return NextResponse.json(
      { error: 'Failed to delete family relation' },
      { status: 500 }
    );
  }
}
