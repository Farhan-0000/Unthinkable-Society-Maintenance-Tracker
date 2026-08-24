import { Role, ComplaintStatus, Priority } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../src/utils/prisma';

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Setup Global Settings
  await prisma.setting.upsert({
    where: { key: 'OVERDUE_THRESHOLD' },
    update: {},
    create: {
      id: 'GLOBAL',
      key: 'OVERDUE_THRESHOLD',
      value: '7',
    },
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@society.com' },
    update: {},
    create: {
      email: 'admin@society.com',
      name: 'System Administrator',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const resident1 = await prisma.user.upsert({
    where: { email: 'resident1@society.com' },
    update: {},
    create: {
      email: 'resident1@society.com',
      name: 'Alice Johnson (Apt 101)',
      passwordHash,
      role: Role.RESIDENT,
    },
  });

  const resident2 = await prisma.user.upsert({
    where: { email: 'resident2@society.com' },
    update: {},
    create: {
      email: 'resident2@society.com',
      name: 'Bob Smith (Apt 205)',
      passwordHash,
      role: Role.RESIDENT,
    },
  });

  // 3. Create Notices
  await prisma.notice.createMany({
    data: [
      {
        title: 'Quarterly Maintenance Schedule',
        content: 'Please be advised that quarterly maintenance will take place next week. Water supply might be interrupted between 10 AM and 2 PM on Tuesday.\n\nThank you for your cooperation.',
        isImportant: true,
        createdById: admin.id,
      },
      {
        title: 'New Gym Equipment Installed',
        content: 'We have successfully installed two new treadmills in the community gym. Please ensure you wipe down the equipment after use.',
        isImportant: false,
        createdById: admin.id,
      },
      {
        title: 'Upcoming Resident Association Meeting',
        content: 'The monthly association meeting will be held this Friday at 7 PM in the main hall. All residents are welcome to attend.',
        isImportant: false,
        createdById: admin.id,
      },
    ],
  });

  // 4. Create Complaints (Spanning multiple months for analytics)
  const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Security', 'Other'];
  
  // Helper to generate dates spanning back a few months
  const randomPastDate = (maxDaysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
    return d;
  };

  const complaintsData = [
    { residentId: resident1.id, cat: 'Plumbing', p: Priority.HIGH, s: ComplaintStatus.OPEN, desc: 'Major pipe leak in the kitchen sink. Water is flooding the floor.', daysAgo: 2 },
    { residentId: resident1.id, cat: 'Electrical', p: Priority.MEDIUM, s: ComplaintStatus.IN_PROGRESS, desc: 'Hallway light is flickering constantly.', daysAgo: 8 }, // Overdue!
    { residentId: resident2.id, cat: 'Cleaning', p: Priority.LOW, s: ComplaintStatus.OPEN, desc: 'The lobby area needs a thorough vacuuming.', daysAgo: 1 },
    { residentId: resident2.id, cat: 'Security', p: Priority.HIGH, s: ComplaintStatus.RESOLVED, desc: 'Main gate access card is not working.', daysAgo: 45 },
    { residentId: resident1.id, cat: 'Carpentry', p: Priority.MEDIUM, s: ComplaintStatus.RESOLVED, desc: 'Wardrobe door hinges are broken.', daysAgo: 30 },
    { residentId: resident1.id, cat: 'Plumbing', p: Priority.MEDIUM, s: ComplaintStatus.RESOLVED, desc: 'Slow drainage in the guest bathroom.', daysAgo: 60 },
    { residentId: resident2.id, cat: 'Electrical', p: Priority.HIGH, s: ComplaintStatus.IN_PROGRESS, desc: 'Power outlet in the living room sparked and stopped working.', daysAgo: 3 },
    { residentId: resident2.id, cat: 'Other', p: Priority.LOW, s: ComplaintStatus.OPEN, desc: 'Noise complaint regarding construction work at night.', daysAgo: 10 }, // Overdue!
    { residentId: resident1.id, cat: 'Cleaning', p: Priority.MEDIUM, s: ComplaintStatus.RESOLVED, desc: 'Garbage chute on floor 1 is jammed.', daysAgo: 15 },
    { residentId: resident2.id, cat: 'Plumbing', p: Priority.LOW, s: ComplaintStatus.RESOLVED, desc: 'Slight drip from the showerhead.', daysAgo: 90 },
  ];

  for (const c of complaintsData) {
    const createdDate = randomPastDate(c.daysAgo);
    
    const complaint = await prisma.complaint.create({
      data: {
        residentId: c.residentId,
        category: c.cat,
        description: c.desc,
        priority: c.p,
        status: c.s,
        createdAt: createdDate,
        updatedAt: createdDate,
      },
    });

    // If resolved, create a fake history trail
    if (c.s === ComplaintStatus.RESOLVED) {
      await prisma.complaintHistory.createMany({
        data: [
          {
            complaintId: complaint.id,
            actorId: admin.id,
            actorRole: Role.ADMIN,
            previousStatus: ComplaintStatus.OPEN,
            newStatus: ComplaintStatus.IN_PROGRESS,
            note: 'Maintenance staff dispatched.',
            timestamp: new Date(createdDate.getTime() + 86400000), // 1 day later
          },
          {
            complaintId: complaint.id,
            actorId: admin.id,
            actorRole: Role.ADMIN,
            previousStatus: ComplaintStatus.IN_PROGRESS,
            newStatus: ComplaintStatus.RESOLVED,
            note: 'Issue fixed successfully.',
            timestamp: new Date(createdDate.getTime() + (86400000 * 2)), // 2 days later
          }
        ]
      });
    }
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
