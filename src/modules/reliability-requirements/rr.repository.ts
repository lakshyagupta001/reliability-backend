import { prisma } from '../../prisma/prisma.client';

export class ReliabilityRequirementRepository {
  protected readonly db = prisma.reliabilityRequirementForm;
}

export const reliabilityRequirementRepository = new ReliabilityRequirementRepository();
