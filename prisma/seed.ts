import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, ProjectScope } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Pass@123';

const projectNames = [
  'Smart Inverter 3HP Wall-Mounted Unit',
  'VRF Central Climate Control System',
  'Heavy Duty Commercial Chiller 50RT',
  'Residential Split AC 1.5HP R32',
  'Industrial Refrigeration Unit',
  'Ducted Air Handling Unit 15kW',
  'Variable Speed Drive Controller',
  'Solar Hybrid AC System',
  'Commercial Ice Maker Unit',
  'Precision Air Conditioner 5kW',
  'Scroll Compressor Module',
  'Heat Pump Water Heater System',
  'Cassette Type AC 2.5HP',
  'Floor Standing Cabinet Unit',
  'Telecom Shelter Cooling System',
  'Medical Grade AC 3kW',
  'Data Center Row Cooling',
  'Marine Air Conditioning Unit',
  'Railway Climate Control System',
  'Cold Storage Evaporator Unit',
  'Package AC 10HP Rooftop',
  'Split Type Inverter 2HP',
  'Multi-Split VRF 8HP',
  'Mini VRF 4HP Heat Recovery',
  'Centrifugal Chiller 200RT',
  'Absorption Chiller System',
  'Screw Compressor Unit 75kW',
  'Reciprocating Compressor Pack',
  'High Efficiency Scroll Compressor Unit',
  'Variable Frequency Drive Controller',
];

const locations = [
  'Mumbai, Maharashtra',
  'Delhi NCR',
  'Bangalore, Karnataka',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Kolkata, West Bengal',
  'Surat, Gujarat',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
  'Nagpur, Maharashtra',
  'Coimbatore, Tamil Nadu',
  'Kochi, Kerala',
  'Indore, Madhya Pradesh',
];

const complianceList = [
  'IS 1391 Part 2: 2021',
  'IEC 60335-1:2020',
  'IEC 61800-9-1:2017',
  'AHRI 550/590 Standard',
  'Eurovent Certification',
  'BEE Star Rating 2023',
  'EMO Guidelines 2022',
  'IEC 61800-2:2015',
  'ISO 9001:2015',
];

const refrigerants = ['R-32', 'R-410A', 'R-290', 'R-454B', 'R-1234yf', 'R-744 (CO2)'];

const statusRemarks: Record<string, string[]> = {
  NOT_STARTED: [
    'Awaiting resource allocation.',
    'Pending management approval.',
    'Waiting for component availability.',
    'Scheduled for next review cycle.',
  ],
  ONGOING: [
    'Testing currently in progress.',
    'Reliability validation under execution.',
    'Data collection phase ongoing.',
    'Component evaluation in progress.',
  ],
  COMPLETED: [
    'Reliability testing completed successfully.',
    'Validation approved by engineering team.',
    'All checkpoints passed.',
    'Project completed and documented.',
  ],
  ON_HOLD: [
    'Awaiting vendor feedback.',
    'Material procurement delayed.',
    'Customer inputs pending.',
    'Testing paused due to dependency.',
  ],
  DROPPED: [
    'Request cancelled by stakeholder.',
    'Duplicate reliability request.',
    'Scope no longer required.',
    'Project discontinued.',
  ],
};

const picNames = [
  'Rajesh Kumar', 'Priya Sharma', 'Anil Verma', 'Sunita Patel', 'Vikram Singh',
  'Meera Joshi', 'Suresh Nair', 'Kavita Reddy', 'Arun Bose', 'Deepa Iyer',
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

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

  const admin = await prisma.user.findFirst({ where: { email: 'ameysamant@bluestarindia.com' } });
  const employee = await prisma.user.findFirst({ where: { email: 'lakshyagupta@bluestarindia.com' } });
  if (!admin || !employee) throw new Error('Seed users not found');

  const racCategory = await prisma.category.upsert({
    where: { code: 'RAC' },
    update: { name: 'RAC', description: 'Room Air Conditioners' },
    create: { name: 'RAC', code: 'RAC', description: 'Room Air Conditioners' }
  });

  const cagCategory = await prisma.category.upsert({
    where: { code: 'CAG' },
    update: { name: 'CAG', description: 'Commercial and Industrial Air Conditioning' },
    create: { name: 'CAG', code: 'CAG', description: 'Commercial and Industrial Air Conditioning' }
  });

  const hpSubcategory = await prisma.subcategory.upsert({
    where: { code: 'HP' },
    update: { categoryId: racCategory.id, name: 'HP', description: 'Heat Pump' },
    create: { categoryId: racCategory.id, name: 'HP', code: 'HP', description: 'Heat Pump' }
  });

  const sricitySubcategory = await prisma.subcategory.upsert({
    where: { code: 'SRICITY' },
    update: { categoryId: racCategory.id, name: 'SRICITY', description: 'Smart Inverter Technology' },
    create: { categoryId: racCategory.id, name: 'SRICITY', code: 'SRICITY', description: 'Smart Inverter Technology' }
  });

  const vrfSubcategory = await prisma.subcategory.upsert({
    where: { code: 'VRF' },
    update: { categoryId: cagCategory.id, name: 'VRF', description: 'Variable Refrigerant Flow' },
    create: { categoryId: cagCategory.id, name: 'VRF', code: 'VRF', description: 'Variable Refrigerant Flow' }
  });

  const ductedSubcategory = await prisma.subcategory.upsert({
    where: { code: 'DUCTED' },
    update: { categoryId: cagCategory.id, name: 'DUCTED', description: 'Ducted Air Systems' },
    create: { categoryId: cagCategory.id, name: 'DUCTED', code: 'DUCTED', description: 'Ducted Air Systems' }
  });

  const ibgSubcategory = await prisma.subcategory.upsert({
    where: { code: 'IBG' },
    update: { categoryId: cagCategory.id, name: 'IBG', description: 'Industrial Batch Galleria' },
    create: { categoryId: cagCategory.id, name: 'IBG', code: 'IBG', description: 'Industrial Batch Galleria' }
  });

  const chillersSubcategory = await prisma.subcategory.upsert({
    where: { code: 'CHILLERS' },
    update: { categoryId: cagCategory.id, name: 'CHILLERS', description: 'Chiller Systems' },
    create: { categoryId: cagCategory.id, name: 'CHILLERS', code: 'CHILLERS', description: 'Chiller Systems' }
  });

  const statuses = [
    { code: 'NOT_STARTED', displayName: 'Not Started', color: '#6B7280', isSystem: true },
    { code: 'ONGOING', displayName: 'Ongoing', color: '#3B82F6', isSystem: true },
    { code: 'COMPLETED', displayName: 'Completed', color: '#22C55E', isSystem: true },
    { code: 'ON_HOLD', displayName: 'On Hold', color: '#F59E0B', isSystem: true },
    { code: 'DROPPED', displayName: 'Dropped', color: '#EF4444', isSystem: true },
  ];

  const createdStatuses: Record<string, string> = {};
  for (const status of statuses) {
    const s = await prisma.statusMaster.upsert({
      where: { code: status.code },
      update: { displayName: status.displayName, color: status.color, isSystem: status.isSystem },
      create: { code: status.code, displayName: status.displayName, color: status.color, isSystem: status.isSystem }
    });
    createdStatuses[status.code] = s.id;
  }

  const subcategoryMap = [
    { sub: hpSubcategory, typeCodes: ['ODU', 'IDU'] },
    { sub: sricitySubcategory, typeCodes: ['ODU', 'IDU', 'DRIVE'] },
    { sub: vrfSubcategory, typeCodes: ['ODU', 'IDU', 'DRIVE', 'COMPONENT'] },
    { sub: ductedSubcategory, typeCodes: ['ODU', 'IDU'] },
    { sub: ibgSubcategory, typeCodes: ['ODU', 'IDU'] },
    { sub: chillersSubcategory, typeCodes: ['ODU', 'IDU'] },
  ];

  const subcategories = [];
  for (const item of subcategoryMap) {
    const types = [];
    for (const typeCode of item.typeCodes) {
      const type = await prisma.type.upsert({
        where: { subcategoryId_code: { subcategoryId: item.sub.id, code: typeCode } },
        update: { name: typeCode, description: `${typeCode} for ${item.sub.code}` },
        create: { subcategoryId: item.sub.id, name: typeCode, code: typeCode, description: `${typeCode} for ${item.sub.code}` }
      });
      types.push(type);
    }
    subcategories.push({ sub: item.sub, types });
  }

  const scopes = Object.values(ProjectScope);

  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
  const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, 31);

  await prisma.project.deleteMany({});

  const createdProjects = [];
  for (let i = 0; i < 30; i++) {
    const subcategoryData = randomElement(subcategories);
    const type = randomElement(subcategoryData.types);
    const statusCode = randomElement(Object.keys(createdStatuses));
    const statusId = createdStatuses[statusCode];
    const scope = Math.random() > 0.3 ? randomElement(scopes) : null;

    const startDate = randomDate(twoYearsAgo, new Date(now.getFullYear(), now.getMonth() - 3, 1));
    const durationDays = randomInt(30, 540);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const hasSampleDate = Math.random() > 0.4;
    const sampleSubmissionDate = hasSampleDate
      ? new Date(startDate.getTime() + randomInt(15, 90) * 24 * 60 * 60 * 1000)
      : null;

    const hasMassProdDate = statusCode === 'COMPLETED' && Math.random() > 0.5;
    const massProductionDate = hasMassProdDate
      ? new Date(endDate.getTime() + randomInt(30, 180) * 24 * 60 * 60 * 1000)
      : null;

    const projectData = {
      name: projectNames[i % projectNames.length] + (i >= projectNames.length ? ` v${Math.floor(i / projectNames.length) + 1}` : ''),
      categoryId: subcategoryData.sub.categoryId,
      subcategoryId: subcategoryData.sub.id,
      typeId: type.id,
      statusId,
      statusRemark: randomElement(statusRemarks[statusCode]),
      startDate,
      endDate,
      location: randomElement(locations),
      partName: `PN-${String(1000 + i).padStart(5, '0')}-REV${randomElement(['A', 'B', 'C', 'D'])}`,
      modelName: `BL-${subcategoryData.sub.code}-${randomInt(100, 999)}${type.code === 'ODU' ? 'O' : type.code === 'IDU' ? 'I' : type.code === 'DRIVE' ? 'D' : 'C'}`,
      projectPIC: randomElement(picNames),
      projectScope: scope,
      applicableCompliance: randomElement(complianceList),
      sampleSubmissionDate,
      massProductionDate,
      partSampleCount: randomInt(2, 50),
      productSampleCount: randomInt(5, 200),
      projectPriorityScale: String(randomInt(1, 5)),
      operatingVoltageRange: `${randomInt(180, 260)}V-${randomInt(380, 480)}V`,
      ambientOperatingRange: `${randomInt(-10, 0)}°C to ${randomInt(43, 55)}°C`,
      iduHardwareVersion: `HW.v${randomInt(1, 5)}.${randomInt(0, 9)}`,
      oduHardwareVersion: `HW.v${randomInt(1, 5)}.${randomInt(0, 9)}`,
      iduFirmwareVersion: `FW.r${randomInt(100, 999)}.${randomInt(0, 9)}`,
      oduFirmwareVersion: `FW.r${randomInt(100, 999)}.${randomInt(0, 9)}`,
      partNumberAndMake: `MAKE-${randomElement(['BL', 'COPELAND', 'DANFOSS', 'EMERSON', 'HITACHI', 'MITSUBISHI'])}-${randomInt(10000, 99999)}`,
      technicalDataSheetReference: `TDS-${subcategoryData.sub.code}${type.code}-${String(i + 1).padStart(4, '0')}-2024`,
      maximumPipingLength: `${randomInt(15, 75)}m`,
      maximumCommunicationWireLength: `${randomInt(100, 1000)}m`,
      oduFanMotorDetails: `${randomInt(1, 4)}x ${randomInt(25, 100)}W BLDC fan`,
      iduFanMotorDetails: `${randomInt(1, 2)}x ${randomInt(10, 50)}W cross-flow fan`,
      compressorDetails: `${randomElement(['Scroll', 'Rotary', 'Screw', 'Centrifugal'])} ${randomElement(['Single', 'Dual', 'Tandem'])} ${randomInt(1, 8)}HP`,
      refrigerantName: randomElement(refrigerants),
      refrigerantQuantity: `${randomInt(0, 5)}.${randomInt(0, 9)}kg`,
      createdBy: Math.random() > 0.4 ? admin.id : employee.id,
    };

    const project = await prisma.project.create({ data: projectData });
    createdProjects.push(project);

    await prisma.projectStatusHistory.create({
      data: {
        projectId: project.id,
        statusId,
        remark: 'Project created',
        changedBy: projectData.createdBy,
      }
    });
  }

  console.log(`Seed completed: ${createdProjects.length} projects created`);
  console.log('ADMIN:', users[0].email, '/', DEFAULT_PASSWORD);
  console.log('EMPLOYEE:', users[1].email, '/', DEFAULT_PASSWORD);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });