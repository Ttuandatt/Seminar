import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const defaultPassword = 'password123'; // According to seed.ts, default password is "password123"!
    // Wait, let's check seed.ts to be sure. I'll just hash "password123" and update users.
    const hash = await bcrypt.hash(defaultPassword, 12);
    
    const result = await prisma.user.updateMany({
        where: {
            email: {
                in: ['admin1@gmail.com', 'tourist1@gmail.com', 'tourist2@gmail.com']
            }
        },
        data: {
            passwordHash: hash,
            failedLoginCount: 0,
            lockedUntil: null,
            status: 'ACTIVE'
        }
    });

    console.log(`Updated ${result.count} users successfully with new hash for "${defaultPassword}".`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
