/**
 * Email Provider Utility
 * Replicates Project/EmailProvider.java from the original Java application.
 * In a production Next.js environment, this can be hooked into Resend, SendGrid, or Nodemailer.
 */

export interface EmailNotification {
  to: string;
  donorName: string;
  donorId: number | string;
}

export async function sendWelcomeEmail({ to, donorName, donorId }: EmailNotification): Promise<{ success: boolean; message: string }> {
  console.log(`[EmailProvider] Sending Welcome Email...`);
  console.log(`To: ${to}`);
  console.log(`Subject: Welcome to the Blood Bank Family!`);
  console.log(
    `Message:\nDear ${donorName},\n\nThank you for registering as a donor.\nYour Unique Donor ID is: ${donorId}\n\nTogether we save lives!\n- Blood Bank Management System`
  );

  // Simulate network dispatch delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: `Welcome email sent successfully to ${to}`,
  };
}
