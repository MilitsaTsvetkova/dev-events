import connectDB from "../../../../lib/mongodb";
import { Event } from "../../../../database";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { slug } = await params;

    if (!slug || typeof slug !== "string" || slug.trim() === "") {
      return NextResponse.json(
        { message: "Invalid or missing slug parameter" },
        { status: 400 }
      );
    }
    const sanitizedSlug = slug.trim().toLowerCase();

    const event = await Event.findOne({ slug: sanitizedSlug }).lean();
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
