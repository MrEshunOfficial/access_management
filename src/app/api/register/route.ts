// src/app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/dbconfigue/dbConfigue";
import { User } from "@/app/models/auth/authModel";

interface MongoError extends Error {
  code?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Will be hashed by the pre-save hook
    });

    // Save user
    await user.save();

    // Send verification email
    // await sendEmail({ email, emailType: EmailType.VERIFY, userId: user._id });

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    // Type guard to check if 'error' has a 'code' property
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as MongoError).code === 11000
    ) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
