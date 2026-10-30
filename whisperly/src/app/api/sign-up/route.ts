import { auth, clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/src/lib/dbConnect';
import UserModel from '@/src/model/User';
import { usernameValidation } from '@/src/schemas/signUpSchema';

export async function POST() {
  await dbConnect();

  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: 'Unauthorized',
        },
        { status: 401 },
      );
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const primaryEmail = clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId,
    );

    if (!primaryEmail || primaryEmail.verification?.status !== 'verified') {
      return Response.json(
        {
          success: false,
          message: 'Verify your email before continuing.',
        },
        { status: 403 },
      );
    }

    const username = clerkUser.username;
    const usernameResult = usernameValidation.safeParse(username);
    if (!usernameResult.success || !username) {
      return Response.json(
        {
          success: false,
          message: 'A valid username is required.',
        },
        { status: 400 },
      );
    }

    const existingVerifiedUserByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    const existingUserByEmail = await UserModel.findOne({
      email: primaryEmail.emailAddress,
    });

    if (
      existingVerifiedUserByUsername &&
      existingVerifiedUserByUsername.email !== primaryEmail.emailAddress
    ) {
      return Response.json(
        {
          success: false,
          message: 'Username is already taken',
        },
        { status: 400 },
      );
    }

    if (existingUserByEmail) {
      if (existingUserByEmail.clerkId === userId) {
        return Response.json(
          {
            success: true,
            message: 'User profile is ready.',
          },
          { status: 200 },
        );
      }

      if (existingUserByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 },
        );
      }

      if (existingUserByEmail.clerkId) {
        return Response.json(
          {
            success: false,
            message: 'User already exists with this email',
          },
          { status: 400 },
        );
      }

      existingUserByEmail.clerkId = userId;
      existingUserByEmail.username = username;
      existingUserByEmail.isVerified = true;
      await existingUserByEmail.save();
    } else {
      const newUser = new UserModel({
        clerkId: userId,
        username,
        email: primaryEmail.emailAddress,
        isVerified: true,
        isAcceptingMessages: true,
        messages: [],
      });

      await newUser.save();
    }

    return Response.json(
      {
        success: true,
        message: 'User profile created.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 },
    );
  }
}
