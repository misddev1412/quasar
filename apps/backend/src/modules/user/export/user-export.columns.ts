import { ExportColumnDefinition } from '../../export/entities/data-export-job.entity';

export const USER_EXPORT_COLUMNS: ExportColumnDefinition[] = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
  { key: 'isActive', label: 'Active' },
  { key: 'createdAt', label: 'Created At' },
  { key: 'profile.firstName', label: 'First Name', path: 'profile.firstName' },
  { key: 'profile.lastName', label: 'Last Name', path: 'profile.lastName' },
  { key: 'profile.phoneNumber', label: 'Phone Number', path: 'profile.phoneNumber' },
];
