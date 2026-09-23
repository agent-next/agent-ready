import { simpleGit, SimpleGit } from 'simple-git';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { config } from '../config.js';

export interface CloneResult {
  path: string;
  cleanup: () => Promise<void>;
}

export class GitService {
  private git: SimpleGit;

  constructor() {
    this.git = simpleGit({
      timeout: {
        block: config.cloneTimeoutMs,
      },
    });
  }

  async cloneRepository(repoUrl: string, branch?: string): Promise<CloneResult> {
    // Validate URL
    const url = new URL(repoUrl);
    if (!config.allowedHosts.includes(url.hostname)) {
      throw new Error(`Only ${config.allowedHosts.join(', ')} repositories are supported`);
    }

    // Create temp directory
    const tempDir = await mkdtemp(path.join(tmpdir(), 'agent-ready-'));

    try {
      // Shallow clone for speed
      const cloneOptions = ['--depth', '1', '--single-branch'];

      if (branch) {
        cloneOptions.push('--branch', branch);
      }

      await this.git.clone(repoUrl, tempDir, cloneOptions);

      return {
        path: tempDir,
        cleanup: async () => {
          await rm(tempDir, { recursive: true, force: true });
        },
      };
    } catch (error) {
      // Cleanup on error
      await rm(tempDir, { recursive: true, force: true });
      throw error;
    }
  }
}
