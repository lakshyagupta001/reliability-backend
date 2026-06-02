import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Pass@123';

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  const users = [
    {
      email: 'ameysamant@bluestarindia.com',
      firstName: 'Amey',
      lastName: 'Samant',
      role: UserRole.ADMIN
    },
    {
      email: 'lakshyagupta@bluestarindia.com',
      firstName: 'Lakshya',
      lastName: 'Gupta',
      role: UserRole.EMPLOYEE
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        password: passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true
      },
      create: {
        email: user.email,
        password: passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true
      }
    });
  }

  console.log('Seed completed successfully.');
  console.log('ADMIN:', users[0].email);
  console.log('EMPLOYEE:', users[1].email);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
