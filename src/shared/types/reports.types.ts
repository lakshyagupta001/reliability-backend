export type ReportType = 'PART_REPORT' | 'SUMMARY_REPORT' | 'TEST_LIST';

export type ReportStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'GENERATED'
  | 'PENDING_REVIEW'
  | 'REVIEWED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REVIEW_REJECTED'
  | 'APPROVAL_REJECTED';
