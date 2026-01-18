import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getFamilyTreeData } from "@/lib/supabase/family-tree";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId') || undefined;

    const treeData = await getFamilyTreeData(applicationId);
    return NextResponse.json(treeData);
  } catch (error) {
    console.error('Error fetching family tree data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch family tree data' },
      { status: 500 }
    );
  }
}
