import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    !process.env.GOOGLE_CLIENT_ID.includes("placeholder")
  );

  return NextResponse.json({
    configured,
    defaultEmail: "mettglobalinc@gmail.com",
  });
}
