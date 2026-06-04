import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, ProjectCategory, ProjectSubcategory, ProjectType, ProjectStatus, ProjectScope } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Pass@123';

const categories: ProjectCategory[] = [ProjectCategory.RAC, ProjectCategory.CAG];
const subcategories: Record<ProjectCategory, ProjectSubcategory[]> = {
  [ProjectCategory.RAC]: [ProjectSubcategory.HP, ProjectSubcategory.SRICITY],
  [ProjectCategory.CAG]: [ProjectSubcategory.VRF, ProjectSubcategory.DUCTED, ProjectSubcategory.IBG, ProjectSubcategory.CHILLERS],
};
const types: ProjectType[] = [ProjectType.ODU, ProjectType.IDU, ProjectType.DRIVE, ProjectType.COMPONENT];
const statuses = Object.values(ProjectStatus);
const scopes = Object.values(ProjectScope);

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

  const now = new Date();
  const twoYearsAgo = new Date(now.getFullYear() - 2, 0, 1);
  const sixMonthsLater = new Date(now.getFullYear(), now.getMonth() + 6, 31);

  await prisma.project.deleteMany({});

  const createdProjects = [];
  for (let i = 0; i < 30; i++) {
    const category = randomElement(categories);
    const subcategory = randomElement(subcategories[category]);
    const type = randomElement(types);
    const status = randomElement(statuses);
    const scope = Math.random() > 0.3 ? randomElement(scopes) : null;

    const startDate = randomDate(twoYearsAgo, new Date(now.getFullYear(), now.getMonth() - 3, 1));
    const durationDays = randomInt(30, 540);
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const hasSampleDate = Math.random() > 0.4;
    const sampleSubmissionDate = hasSampleDate
      ? new Date(startDate.getTime() + randomInt(15, 90) * 24 * 60 * 60 * 1000)
      : null;

    const hasMassProdDate = status === ProjectStatus.COMPLETED && Math.random() > 0.5;
    const massProductionDate = hasMassProdDate
      ? new Date(endDate.getTime() + randomInt(30, 180) * 24 * 60 * 60 * 1000)
      : null;

    const projectData = {
      name: projectNames[i % projectNames.length] + (i >= projectNames.length ? ` v${Math.floor(i / projectNames.length) + 1}` : ''),
      category,
      subcategory,
      type,
      status,
      startDate,
      endDate,
      location: randomElement(locations),
      partName: `PN-${String(1000 + i).padStart(5, '0')}-REV${randomElement(['A', 'B', 'C', 'D'])}`,
      modelName: `BL-${category}-${subcategory}-${randomInt(100, 999)}${type === 'ODU' ? 'O' : type === 'IDU' ? 'I' : type === 'DRIVE' ? 'D' : 'C'}`,
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
      technicalDataSheetReference: `TDS-${category}${subcategory}-${String(i + 1).padStart(4, '0')}-2024`,
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
  }

  const docTypes: Array<'DESIGN_DOCUMENT' | 'HARDWARE_EVALUATION_REPORT' | 'LOGIC_EVALUATION_REPORT' | 'CHANGE_POINT_DOCUMENT'> = [
    'DESIGN_DOCUMENT', 'HARDWARE_EVALUATION_REPORT', 'LOGIC_EVALUATION_REPORT', 'CHANGE_POINT_DOCUMENT'
  ];

  for (const project of createdProjects) {
    const docCount = randomInt(0, 3);
    for (let d = 0; d < docCount; d++) {
      await prisma.projectDocument.create({
        data: {
          projectId: project.id,
          documentType: randomElement(docTypes),
          fileName: `Doc-${project.id.slice(0, 8)}-${d + 1}.pdf`,
          fileUrl: `/uploads/${project.id}/${d + 1}.pdf`,
          fileSize: randomInt(50000, 5000000),
          mimeType: 'application/pdf',
          uploadedBy: project.createdBy,
        }
      });
    }

    if (project.status === ProjectStatus.COMPLETED && Math.random() > 0.5) {
      await prisma.generatedReport.create({
        data: {
          projectId: project.id,
          reportName: `Reliability Report - ${project.name}`,
          reportType: randomElement(['Performance', 'Stress Test', 'Lifetime', 'Compliance']),
          storagePath: `/reports/${project.id}/report.pdf`,
          fileFormat: 'PDF',
          fileSize: randomInt(100000, 2000000),
          status: 'COMPLETED',
          generatedBy: project.createdBy,
          generatedAt: new Date(project.endDate.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000),
          metadata: { version: '1.0', pages: randomInt(5, 40) },
        }
      });
    }
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
