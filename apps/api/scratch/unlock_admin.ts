
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin1@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found');
    return;
  }

  const pwsToCheck = ['admin123', 'admin', 'pass123', 'tourist123'];
  console.log(`Checking passwords for ${email}...`);
  
  for (const pw of pwsToCheck) {
    const match = await bcrypt.compare(pw, user.passwordHash);
    console.log(`- "${pw}": ${match ? 'MATCH ✅' : 'mismatch ❌'}`);
  }

  console.log('\nResetting password to "admin123"...');
  const newPasswordHash = await bcrypt.hash('admin123', 12);
  
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: newPasswordHash,
      status: 'ACTIVE',
      failedLoginCount: 0,
      lockedUntil: null
    }
  });
  console.log('User unlocked and password reset to "admin123".');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
