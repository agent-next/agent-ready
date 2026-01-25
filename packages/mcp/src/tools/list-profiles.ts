/**
 * list_profiles tool
 *
 * Lists available scanning profiles with their descriptions.
 */

import { z } from 'zod';
import { listProfiles, loadProfile, setLocale, isValidLocale, type Locale } from 'agent-ready';

export const listProfilesSchema = z.object({
  lang: z.enum(['en', 'zh']).optional().default('en').describe('Output language'),
});

export type ListProfilesInput = z.infer<typeof listProfilesSchema>;

export async function listProfilesHandler(input: ListProfilesInput): Promise<string> {
  const { lang } = input;

  // Set locale
  if (lang && isValidLocale(lang)) {
    setLocale(lang as Locale);
  }

  try {
    const profileNames = listProfiles();

    const profiles = await Promise.all(
      profileNames.map(async (name) => {
        try {
          const profile = await loadProfile(name);
          return {
            name: profile.name,
            version: profile.version,
            description: profile.description,
            checks_count: profile.checks.length,
            pillars_covered: [...new Set(profile.checks.map((c) => c.pillar))],
            levels_covered: [...new Set(profile.checks.map((c) => c.level))],
          };
        } catch {
          return {
            name,
            error: 'Failed to load profile',
          };
        }
      })
    );

    const response = {
      profiles_count: profiles.length,
      profiles,
    };

    return JSON.stringify(response, null, 2);
  } catch (error) {
    throw new Error(
      `Failed to list profiles: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
