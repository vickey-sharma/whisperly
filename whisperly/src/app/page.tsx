import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Whisperly</h1>
      <SignedOut>
        <div className="flex gap-4">
          <Link className="rounded bg-black px-4 py-2 text-white" href="/sign-up">Create account</Link>
          <Link className="rounded border px-4 py-2" href="/sign-in">Sign in</Link>
        </div>
      </SignedOut>
      <SignedIn>
        <p>You are signed in.</p>
        <UserButton />
      </SignedIn>
    </main>
  );
}
