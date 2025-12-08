/**
 * General status enumeration
 * Can be used for any entity that needs basic status tracking
 */
export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Task status enumeration
 * For tracking task/job progress
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

/**
 * Request status enumeration
 * For tracking API requests, form submissions, etc.
 */
export enum RequestStatus {
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

/**
 * Priority enumeration
 * For prioritizing tasks, tickets, etc.
 */
export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

/**
 * Approval status enumeration
 * For workflows requiring approval
 */
export enum ApprovalStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_CHANGES = 'requires_changes',
  CANCELLED = 'cancelled'
}

/**
 * Record state enumeration
 * For tracking record lifecycle
 */
export enum RecordState {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  RESTORED = 'restored',
  LOCKED = 'locked',
  UNLOCKED = 'unlocked'
} 