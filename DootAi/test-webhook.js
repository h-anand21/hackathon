import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- PREPARING MOCK WEBHOOK ---');

  // Find a user from the database to link the email to
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found in the database. Please sign in via the app first.');
    process.exit(1);
  }

  console.log(`Sending mock email to user: ${user.email} (${user.id})`);

  const mockPayload = {
    isMock: true,
    emailAddress: user.email,
    entityId: 'mock_msg_' + Math.random().toString(36).substring(2, 10),
    subject: '🍱 Lunch Meeting: Discussing Japanese Sketchbook Project',
    sender: 'Sora Tanaka <sora@doot.ai>',
    snippet: 'Hey! Let\'s discuss the final hand-drawn UI style over some delicious bento tomorrow.',
    body: 'Hi, I would love to meet you tomorrow at 1:00 PM in the park to review our design system. I will bring the bento boxes. Let me know if you are free!',
    accountId: 'mock-account-id'
  };

  try {
    const response = await fetch('http://localhost:3000/api/corsair/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockPayload),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Body:', JSON.stringify(data, null, 2));
    console.log('--- MOCK WEBHOOK SENT SUCCESSFULLY ---');
  } catch (error) {
    console.error('Error sending mock webhook:', error);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
