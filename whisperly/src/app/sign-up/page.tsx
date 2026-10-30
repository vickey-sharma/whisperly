'use client';

import { useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SignUpPage() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'verification'>('details');
  const [message, setMessage] = useState('');

  async function submitDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get('username') ?? '').trim();
    const emailAddress = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    const { error } = await signUp.password({ username, emailAddress, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    const verification = await signUp.verifications.sendEmailCode();
    if (verification.error) {
      setMessage(verification.error.message);
      return;
    }

    setStep('verification');
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get('code') ?? '').trim();
    const verification = await signUp.verifications.verifyEmailCode({ code });
    if (verification.error) {
      setMessage(verification.error.message);
      return;
    }

    const finalized = await signUp.finalize();
    if (finalized.error) {
      setMessage(finalized.error.message);
      return;
    }

    const response = await fetch('/api/sign-up', { method: 'POST' });
    const result = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(result.message ?? 'Could not create your profile.');
      return;
    }

    router.push('/');
  }

  async function resendCode() {
    setMessage('');
    const { error } = await signUp.verifications.sendEmailCode();
    if (error) setMessage(error.message);
    else setMessage('A new verification code has been sent.');
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>

      {step === 'details' ? (
        <form onSubmit={submitDetails} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Username
            <input className="rounded border p-2" name="username" autoComplete="username" minLength={2} maxLength={20} required />
          </label>
          <label className="flex flex-col gap-1">
            Email
            <input className="rounded border p-2" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="flex flex-col gap-1">
            Password
            <input className="rounded border p-2" name="password" type="password" autoComplete="new-password" minLength={6} required />
          </label>
          <button className="rounded bg-black p-2 text-white disabled:opacity-50" disabled={fetchStatus === 'fetching'}>
            Send verification code
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <p>Enter the code Clerk sent to your email.</p>
          <form onSubmit={verifyEmail} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              Verification code
              <input className="rounded border p-2" name="code" inputMode="numeric" autoComplete="one-time-code" required />
            </label>
            <button className="rounded bg-black p-2 text-white disabled:opacity-50" disabled={fetchStatus === 'fetching'}>
              Verify email
            </button>
          </form>
          <button className="self-start underline disabled:opacity-50" onClick={resendCode} disabled={fetchStatus === 'fetching'}>
            Resend code
          </button>
        </div>
      )}

      {message && <p role="alert">{message}</p>}
      <p>
        Already have an account? <Link className="underline" href="/sign-in">Sign in</Link>
      </p>
    </main>
  );
}
