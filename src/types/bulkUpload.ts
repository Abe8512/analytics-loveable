
/**
 * Interface for bulk upload filter options
 */
export interface BulkUploadFilter {
  force?: boolean;
  includeProcessed?: boolean;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
}
