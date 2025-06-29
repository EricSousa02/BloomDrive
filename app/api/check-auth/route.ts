import { getCurrentUser } from "@/lib/actions/user.actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    return NextResponse.json({
      isAuthenticated: !!user,
      user: user || null
    });
  } catch (error) {
    return NextResponse.json({
      isAuthenticated: false,
      user: null
    });
  }
}
