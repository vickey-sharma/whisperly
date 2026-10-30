import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User';
import { usernameValidation } from '@/src/schemas/signUpSchema';

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    );

    if (!primaryEmail || primaryEmail.verification?.status !== 'verified') {
      return NextResponse.json(
        { message: 'Verify your email before continuing.' },
        { status: 403 },
      );
    }

    const usernameResult = usernameValidation.safeParse(clerkUser.username);
    if (!usernameResult.success || !clerkUser.username) {
      return NextResponse.json(
        { message: 'A valid username is required.' },
        { status: 400 },
      );
    }

    await dbConnect();

    const existingUser = await UserModel.findOne({ clerkId: userId });
    if (existingUser) {
      return NextResponse.json({ message: 'User profile is ready.' });
    }

    const conflictingUser = await UserModel.findOne({
      $or: [
        { email: primaryEmail.emailAddress },
        { username: clerkUser.username },
      ],
    });

    if (conflictingUser) {
      return NextResponse.json(
        { message: 'Email or username is already in use.' },
        { status: 409 },
      );
    }

    await UserModel.create({
      clerkId: userId,
      username: clerkUser.username,
      email: primaryEmail.emailAddress,
      isVerified: true,
    });

    return NextResponse.json({ message: 'User profile created.' }, { status: 201 });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        { message: 'Email or username is already in use.' },
        { status: 409 },
      );
    }

    console.error('Signup profile sync failed:', error);
    return NextResponse.json(
      { message: 'Could not finish signup.' },
      { status: 500 },
    );
  }
}
