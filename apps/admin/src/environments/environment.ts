// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `project.json`.

import { getConfiguredApiUrl } from '../utils/apiConfig';

export const environment = {
  production: false,
  apiUrl: getConfiguredApiUrl(),
  appName: 'Quasar Admin',
  version: '1.0.0',
  port: process.env.PORT || 4200
};
