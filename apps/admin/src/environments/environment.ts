// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `project.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Quasar Admin',
  version: '1.0.0',
  port: process.env.PORT || 4200
};