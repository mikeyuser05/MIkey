# HPO V2 - Developer & Setup Guide

## Getting Started

### Prerequisites
- Node.js: v18.x or higher
- Package Manager: npm or pnpm
- Python: 3.9+

### Installation
npm install

### Running Locally
npm run dev

Dashboard will launch on http://localhost:5173.

## Running System Test Suites

Execute full PR validation tests:
npx ts-node src/tests/run_all_pr21_tests.ts

## Pull Request Roadmap
- PR16: Offline Sync Monitor & Working Dashboard Base
- PR17: Deployment & CI/CD Pipelines
- PR18: Backend Telemetry Improvements
- PR19: Security & Auth Hardening
- PR20: Performance & Memoization
- PR21: System-Wide Test Suites
- PR22: Comprehensive Documentation (Current)
- PR23: Production Release
