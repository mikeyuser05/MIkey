# Diff Details

Date : 2026-08-23 08:48:54

Directory c:\\Users\\HP\\Downloads\\NO-EXCUSE\\Dashboard\\Current Build\\src

Total : 63 files,  -10140 codes, 0 comments, -49 blanks, all -10189 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [.github/workflows/ci.yml](/.github/workflows/ci.yml) | YAML | -25 | 0 | -9 | -34 |
| [.prettierrc.json](/.prettierrc.json) | JSON | -11 | 0 | -1 | -12 |
| [README.md](/README.md) | Markdown | -133 | 0 | -24 | -157 |
| [build\_project.py](/build_project.py) | Python | -271 | -38 | -35 | -344 |
| [check\_files.py](/check_files.py) | Python | -9 | 0 | -1 | -10 |
| [docs/API\_REFERENCE.md](/docs/API_REFERENCE.md) | Markdown | -22 | 0 | -6 | -28 |
| [docs/ARCHITECTURE.md](/docs/ARCHITECTURE.md) | Markdown | -20 | 0 | -4 | -24 |
| [docs/DEVELOPMENT\_GUIDE.md](/docs/DEVELOPMENT_GUIDE.md) | Markdown | -23 | 0 | -9 | -32 |
| [eslint.config.js](/eslint.config.js) | JavaScript | -31 | 0 | -2 | -33 |
| [firebase.json](/firebase.json) | JSON | -16 | 0 | -1 | -17 |
| [functions/package-lock.json](/functions/package-lock.json) | JSON | -2,097 | 0 | -1 | -2,098 |
| [functions/package.json](/functions/package.json) | JSON | -23 | 0 | 0 | -23 |
| [functions/src/providers/voiceProvider.ts](/functions/src/providers/voiceProvider.ts) | TypeScript | -95 | 0 | -13 | -108 |
| [functions/src/server.ts](/functions/src/server.ts) | TypeScript | -37 | -4 | -7 | -48 |
| [functions/src/services/callStatusNormalizer.ts](/functions/src/services/callStatusNormalizer.ts) | TypeScript | -18 | 0 | -3 | -21 |
| [functions/src/services/emergencyCallService.ts](/functions/src/services/emergencyCallService.ts) | TypeScript | -83 | -5 | -15 | -103 |
| [functions/src/services/twimlGenerator.ts](/functions/src/services/twimlGenerator.ts) | TypeScript | -24 | 0 | -5 | -29 |
| [functions/src/types/voice.ts](/functions/src/types/voice.ts) | TypeScript | -43 | 0 | -6 | -49 |
| [functions/src/webhooks/twilioWebhook.ts](/functions/src/webhooks/twilioWebhook.ts) | TypeScript | -4 | 0 | -2 | -6 |
| [functions/tsconfig.json](/functions/tsconfig.json) | JSON with Comments | -14 | 0 | 0 | -14 |
| [get\_paths.py](/get_paths.py) | Python | -14 | -4 | -6 | -24 |
| [index.html](/index.html) | HTML | -18 | 0 | -1 | -19 |
| [package-lock.json](/package-lock.json) | JSON | -7,536 | 0 | -1 | -7,537 |
| [package.json](/package.json) | JSON | -57 | 0 | -1 | -58 |
| [postcss.config.js](/postcss.config.js) | JavaScript | -6 | 0 | -1 | -7 |
| [public/favicon.svg](/public/favicon.svg) | XML | -4 | 0 | -1 | -5 |
| [public/manifest.json](/public/manifest.json) | JSON | -17 | 0 | -1 | -18 |
| [public/sw.js](/public/sw.js) | JavaScript | -53 | 0 | -5 | -58 |
| [src/components/Layout/AppLayout.tsx](/src/components/Layout/AppLayout.tsx) | TypeScript JSX | -5 | 3 | 3 | 1 |
| [src/components/Layout/Navbar.tsx](/src/components/Layout/Navbar.tsx) | TypeScript JSX | -10 | 2 | 1 | -7 |
| [src/components/Layout/Sidebar.tsx](/src/components/Layout/Sidebar.tsx) | TypeScript JSX | 1 | 2 | -3 | 0 |
| [src/components/PR11TriageHub.tsx](/src/components/PR11TriageHub.tsx) | TypeScript JSX | 9 | -3 | -1 | 5 |
| [src/components/Settings.tsx](/src/components/Settings.tsx) | TypeScript JSX | 64 | 2 | 7 | 73 |
| [src/components/common/SystemHealthWidget.tsx](/src/components/common/SystemHealthWidget.tsx) | TypeScript JSX | 71 | 7 | 9 | 87 |
| [src/components/profile/PatientProfileCard.tsx](/src/components/profile/PatientProfileCard.tsx) | TypeScript JSX | 65 | 2 | 4 | 71 |
| [src/context/ThemeContext.tsx](/src/context/ThemeContext.tsx) | TypeScript JSX | 9 | 3 | 4 | 16 |
| [src/hooks/useValidatedTelemetry.ts](/src/hooks/useValidatedTelemetry.ts) | TypeScript | 13 | 0 | 4 | 17 |
| [src/index.css](/src/index.css) | PostCSS | 13 | 1 | 3 | 17 |
| [src/pages/Analytics/AnalyticsPage.tsx](/src/pages/Analytics/AnalyticsPage.tsx) | TypeScript JSX | 109 | 6 | 4 | 119 |
| [src/pages/Settings.tsx](/src/pages/Settings.tsx) | TypeScript JSX | 64 | 2 | 7 | 73 |
| [src/pages/Settings/Settings.tsx](/src/pages/Settings/Settings.tsx) | TypeScript JSX | 64 | 2 | 7 | 73 |
| [src/pages/Settings/index.tsx](/src/pages/Settings/index.tsx) | TypeScript JSX | 64 | 2 | 7 | 73 |
| [src/services/analyticsEngine.ts](/src/services/analyticsEngine.ts) | TypeScript | 63 | 8 | 9 | 80 |
| [src/services/auditLogger.ts](/src/services/auditLogger.ts) | TypeScript | -17 | -3 | -1 | -21 |
| [src/services/intelligenceReport.ts](/src/services/intelligenceReport.ts) | TypeScript | 55 | 4 | 8 | 67 |
| [src/services/patientProfileStore.ts](/src/services/patientProfileStore.ts) | TypeScript | 38 | 0 | 7 | 45 |
| [src/services/productionHardening.ts](/src/services/productionHardening.ts) | TypeScript | 39 | 2 | 8 | 49 |
| [src/services/systemHealthService.ts](/src/services/systemHealthService.ts) | TypeScript | 32 | 0 | 4 | 36 |
| [src/services/telemetryBuffer.ts](/src/services/telemetryBuffer.ts) | TypeScript | 39 | 5 | 11 | 55 |
| [src/services/telemetryExport.ts](/src/services/telemetryExport.ts) | TypeScript | 41 | 0 | 7 | 48 |
| [src/services/telemetryValidator.ts](/src/services/telemetryValidator.ts) | TypeScript | 37 | 2 | 9 | 48 |
| [src/types/location.ts](/src/types/location.ts) | TypeScript | 28 | 1 | 5 | 34 |
| [src/types/pr36Patient.ts](/src/types/pr36Patient.ts) | TypeScript | 17 | 0 | 1 | 18 |
| [src/types/telemetry.ts](/src/types/telemetry.ts) | TypeScript | 25 | 0 | 3 | 28 |
| [src/types/theme.types.ts](/src/types/theme.types.ts) | TypeScript | 3 | 1 | 0 | 4 |
| [tailwind.config.js](/tailwind.config.js) | JavaScript | -96 | 0 | -1 | -97 |
| [tailwind.config.ts](/tailwind.config.ts) | TypeScript | -95 | 0 | -3 | -98 |
| [tsconfig.app.json](/tsconfig.app.json) | JSON | -45 | 0 | -3 | -48 |
| [tsconfig.json](/tsconfig.json) | JSON with Comments | -4 | 0 | -1 | -5 |
| [tsconfig.node.json](/tsconfig.node.json) | JSON | -18 | 0 | -3 | -21 |
| [vercel.json](/vercel.json) | JSON | -23 | 0 | -1 | -24 |
| [vite.config.js](/vite.config.js) | JavaScript | -43 | 0 | -1 | -44 |
| [vite.config.ts](/vite.config.ts) | TypeScript | -43 | 0 | -2 | -45 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details