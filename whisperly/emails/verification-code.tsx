import {
  Font,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

/**
 * Editable React Email source for the verification email design.
 * Clerk's dashboard does not execute TSX; use verification-code.html there.
 */
export default function VerificationEmail({
  username,
  otp,
}: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Verification Code</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Here&apos;s your verification code: {otp}</Preview>
      <Section
        style={{
          margin: 0,
          padding: '40px 16px',
          backgroundColor: '#f4f5f7',
          color: '#171717',
          fontFamily: 'Arial, Helvetica, sans-serif',
        }}
      >
        <Row>
          <Heading as="h2">Hello {username},</Heading>
        </Row>
        <Row>
          <Text>
            Thank you for registering. Please use the following verification
            code to complete your registration:
          </Text>
        </Row>
        <Row>
          <Text
            style={{
              display: 'inline-block',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              backgroundColor: '#fafafa',
              padding: '18px 28px',
              color: '#18181b',
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '8px',
            }}
          >
            {otp}
          </Text>
        </Row>
        <Row>
          <Text>
            For your security, do not share this code with anyone. If you did
            not request this code, please ignore this email.
          </Text>
        </Row>
      </Section>
    </Html>
  );
}
