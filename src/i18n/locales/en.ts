/**
 * English translations
 */

import type { Translations } from '../types.js';

const translations: Translations = {
  pillars: {
    docs: 'Documentation',
    style: 'Style & Validation',
    build: 'Build System',
    test: 'Testing',
    security: 'Security',
    observability: 'Debugging & Observability',
    env: 'Development Environment',
    task_discovery: 'Task Discovery',
    product: 'Product & Experimentation',
    agent_config: 'Agent Configuration',
    code_quality: 'Code Quality',
  },

  levels: {
    L1: 'Functional',
    L2: 'Documented',
    L3: 'Standardized',
    L4: 'Optimized',
    L5: 'Autonomous',
    none: 'Not Achieved',
  },

  priorities: {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  },

  cli: {
    scanning: 'Scanning: {path}',
    profile: 'Profile: {profile}',
    error: 'Error: {message}',
    pathNotFound: 'Path does not exist: {path}',
    invalidLevel: 'Invalid level: {level}',
    validLevels: 'Valid levels: L1, L2, L3, L4, L5',
    invalidOutput: 'Invalid output format: {format}',
    validOutputs: 'Valid formats: json, markdown, both',
    scanFailed: 'Scan failed:',
    jsonOutput: 'JSON output: {path}',
  },

  output: {
    title: 'Agent Readiness Report',
    repository: 'Repository:',
    commit: 'Commit:',
    profileLabel: 'Profile:',
    time: 'Time:',
    level: 'Level: {level}',
    score: 'Score: {score}%',
    notAchieved: 'Not Achieved',
    progressTo: 'Progress to {level}:',
    pillarSummary: 'Pillar Summary',
    levelBreakdown: 'Level Breakdown',
    actionItems: 'Action Items',
    monorepoApps: 'Monorepo Apps',
    andMore: '... and {count} more (use --verbose to see all)',
    checks: '{passed}/{total} checks',
    required: '{passed}/{total} required',
    errorLabel: 'ERROR',
  },

  checks: {
    fileNotFound: 'File not found: {path}',
    fileExists: 'File exists: {path}',
    patternMatched: 'Pattern matched {count} files',
    noMatches: 'No files match pattern: {pattern}',
    workflowEventFound: 'Workflow event "{event}" found',
    workflowEventNotFound: 'No workflow with event "{event}" found',
    actionFound: 'GitHub Action "{action}" found',
    actionNotFound: 'GitHub Action "{action}" not found',
    buildCommandFound: 'Build command "{command}" found',
    noBuildCommand: 'No build command detected',
    logFrameworkFound: 'Logging framework "{framework}" found',
    noLogFramework: 'No logging framework detected',
    dependencyFound: 'Dependency "{package}" found',
    noDependency: 'Required dependency not found',
    anyOfPassed: '{count} of {total} sub-checks passed',
    anyOfFailed: 'None of the sub-checks passed',
  },

  init: {
    dryRunHeader: 'Dry Run - Files that would be created:',
    wouldCreate: 'Would create: {path}',
    creatingFile: 'Creating: {path}',
    fileCreated: 'Created: {path}',
    fileSkipped: 'Skipped (exists): {path}',
    fileOverwritten: 'Overwritten: {path}',
    noTemplates: 'No templates found for specified criteria',
    initComplete: 'Initialization complete',
    filesCreated: '{count} files created',
    filesSkipped: '{count} files skipped',
  },
};

export default translations;
