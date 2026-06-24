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

async function upsertMasterData(
  name: string,
  level: 'CATEGORY' | 'SUBCATEGORY' | 'TYPE',
  parentId?: string,
) {
  const existing = await prisma.masterData.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      level,
      parentId: parentId ?? null,
    },
  });

  if (existing) {
    return prisma.masterData.update({
      where: { id: existing.id },
      data: { isActive: true },
    });
  }

  return prisma.masterData.create({
    data: { name, level, parentId: parentId ?? null, isActive: true },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ============================================================================
  // 1. Seed Users
  // ============================================================================
  const users = [
    { email: 'lakshyagupta@bluestarindia.com', firstName: 'Lakshya', lastName: 'Gupta', role: UserRole.EMPLOYEE },
    { email: 'yashojha@bluestarindia.com', firstName: 'Yash', lastName: 'Ojha', role: UserRole.EMPLOYEE },
    { email: 'rishabhtiwari@bluestarindia.com', firstName: 'Rishabh', lastName: 'Tiwari', role: UserRole.TEAM_LEAD },
    { email: 'viveksingh@bluestarindia.com', firstName: 'Vivek', lastName: 'Singh', role: UserRole.TEAM_LEAD },
    { email: 'ameysamant@bluestarindia.com', firstName: 'Amey', lastName: 'Samant', role: UserRole.MANAGER },
    { email: 'varunbhatt@bluestarindia.com', firstName: 'Varun', lastName: 'Bhatt', role: UserRole.MANAGER },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { password: passwordHash, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: true },
      create: { email: user.email, password: passwordHash, firstName: user.firstName, lastName: user.lastName, role: user.role, isActive: true },
    });
  }

  const dbUsers = await prisma.user.findMany();
  if (dbUsers.length === 0) throw new Error('Seed users not found');

  // ============================================================================
  // 2. Seed Master Data Hierarchy (NEW: CPAG / CAG / CRBG)
  //
  // NOTE: The old hierarchy (RAC, CAG with old subcategories) is replaced here.
  // This is LOCAL DEVELOPMENT DATA ONLY. No production data is affected.
  // ============================================================================

  // CPAG → RAD → HP
  // CPAG → RAD → SRICITY
  const cpag = await upsertMasterData('CPAG', 'CATEGORY');
  const rad = await upsertMasterData('RAD', 'SUBCATEGORY', cpag.id);
  const hp = await upsertMasterData('HP', 'TYPE', rad.id);
  const sricity = await upsertMasterData('SRICITY', 'TYPE', rad.id);

  // CAG → IBGCAG → ATW
  // CAG → IBGCAG → DUCTED
  // CAG → VRF         (leaf is SubCategory — no types)
  // CAG → CHILLERS     (leaf is SubCategory — no types)
  const cag = await upsertMasterData('CAG', 'CATEGORY');
  const ibgcag = await upsertMasterData('IBGCAG', 'SUBCATEGORY', cag.id);
  await upsertMasterData('ATW', 'TYPE', ibgcag.id);
  await upsertMasterData('DUCTED', 'TYPE', ibgcag.id);
  const vrf = await upsertMasterData('VRF', 'SUBCATEGORY', cag.id);
  const chillers = await upsertMasterData('CHILLERS', 'SUBCATEGORY', cag.id);

  // CRBG → CSD
  // CRBG → WATER COOLER
  // CRBG → DEEP FREEZER
  const crbg = await upsertMasterData('CRBG', 'CATEGORY');
  const csd = await upsertMasterData('CSD', 'SUBCATEGORY', crbg.id);
  const waterCooler = await upsertMasterData('WATER COOLER', 'SUBCATEGORY', crbg.id);
  const deepFreezer = await upsertMasterData('DEEP FREEZER', 'SUBCATEGORY', crbg.id);

  console.log('Master data hierarchy seeded:');
  console.log('  CPAG → RAD → HP, SRICITY');
  console.log('  CAG → IBGCAG → ATW, DUCTED');
  console.log('  CAG → VRF');
  console.log('  CAG → CHILLERS');
  console.log('  CRBG → CSD, WATER COOLER, DEEP FREEZER');

  // ============================================================================
  // 3. Seed Status Master
  // ============================================================================
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
      create: { code: status.code, displayName: status.displayName, color: status.color, isSystem: status.isSystem },
    });
    createdStatuses[status.code] = s.id;
  }

  // ============================================================================
  // 4. Seed 30 Projects
  //
  // All projects are assigned to CPAG → RAD → HP as the default hierarchy node.
  // This is local seed/development data only — no meaningful hierarchy mapping
  // is preserved from the old structure.
  // ============================================================================

  // Leaf node combinations available:
  // 3-level: categoryId=CPAG, subcategoryId=RAD, typeId=HP or SRICITY
  // 3-level: categoryId=CAG,  subcategoryId=IBGCAG, typeId=ATW or DUCTED
  // 2-level: categoryId=CAG,  subcategoryId=VRF,    typeId=null
  // 2-level: categoryId=CAG,  subcategoryId=CHILLERS, typeId=null
  // 2-level: categoryId=CRBG, subcategoryId=CSD,    typeId=null
  // 2-level: categoryId=CRBG, subcategoryId=WATER COOLER, typeId=null
  // 2-level: categoryId=CRBG, subcategoryId=DEEP FREEZER, typeId=null

  const atw = await prisma.masterData.findFirst({ where: { name: 'ATW', level: 'TYPE' } });
  const ducted = await prisma.masterData.findFirst({ where: { name: 'DUCTED', level: 'TYPE' } });

  const hierarchyOptions = [
    { categoryId: cpag.id, subcategoryId: rad.id, typeId: hp.id, label: 'CPAG/RAD/HP' },
    { categoryId: cpag.id, subcategoryId: rad.id, typeId: sricity.id, label: 'CPAG/RAD/SRICITY' },
    { categoryId: cag.id, subcategoryId: ibgcag.id, typeId: atw?.id || null, label: 'CAG/IBGCAG/ATW' },
    { categoryId: cag.id, subcategoryId: ibgcag.id, typeId: ducted?.id || null, label: 'CAG/IBGCAG/DUCTED' },
    { categoryId: cag.id, subcategoryId: vrf.id, typeId: null, label: 'CAG/VRF' },
    { categoryId: cag.id, subcategoryId: chillers.id, typeId: null, label: 'CAG/CHILLERS' },
    { categoryId: crbg.id, subcategoryId: csd.id, typeId: null, label: 'CRBG/CSD' },
    { categoryId: crbg.id, subcategoryId: waterCooler.id, typeId: null, label: 'CRBG/WATER COOLER' },
    { categoryId: crbg.id, subcategoryId: deepFreezer.id, typeId: null, label: 'CRBG/DEEP FREEZER' },
  ];

  const scopes = Object.values(ProjectScope);
  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);

  await prisma.project.deleteMany({});

  const createdProjects = [];
  for (let i = 0; i < 30; i++) {
    const hierarchy = randomElement(hierarchyOptions);
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
      categoryId: hierarchy.categoryId,
      subcategoryId: hierarchy.subcategoryId,
      typeId: hierarchy.typeId,
      statusId,
      statusRemark: randomElement(statusRemarks[statusCode]),
      startDate,
      endDate,
      location: randomElement(locations),
      partName: `PN-${String(1000 + i).padStart(5, '0')}-REV${randomElement(['A', 'B', 'C', 'D'])}`,
      modelName: `BL-${hierarchy.label.replace(/\//g, '-')}-${randomInt(100, 999)}`,
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
      technicalDataSheetReference: `TDS-${hierarchy.label.replace(/\//g, '-')}-${String(i + 1).padStart(4, '0')}-2024`,
      maximumPipingLength: `${randomInt(15, 75)}m`,
      maximumCommunicationWireLength: `${randomInt(100, 1000)}m`,
      oduFanMotorDetails: `${randomInt(1, 4)}x ${randomInt(25, 100)}W BLDC fan`,
      iduFanMotorDetails: `${randomInt(1, 2)}x ${randomInt(10, 50)}W cross-flow fan`,
      compressorDetails: `${randomElement(['Scroll', 'Rotary', 'Screw', 'Centrifugal'])} ${randomElement(['Single', 'Dual', 'Tandem'])} ${randomInt(1, 8)}HP`,
      refrigerantName: randomElement(refrigerants),
      refrigerantQuantity: `${randomInt(0, 5)}.${randomInt(0, 9)}kg`,
      createdBy: randomElement(dbUsers).id,
    };

    const project = await prisma.project.create({ data: projectData });
    createdProjects.push(project);

    await prisma.projectStatusHistory.create({
      data: {
        projectId: project.id,
        statusId,
        remark: 'Project created',
        changedBy: projectData.createdBy,
      },
    });
  }

  console.log(`\nSeed completed: ${createdProjects.length} projects created`);
  for (const user of users) {
    console.log(`${user.role}: ${user.email} / ${DEFAULT_PASSWORD}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });