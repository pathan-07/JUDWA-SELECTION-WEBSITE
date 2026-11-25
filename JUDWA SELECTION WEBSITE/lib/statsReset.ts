import 'server-only';
import { getContent, setContent } from './siteContent';

/** Dashboard/analytics count only orders and visits after this time (null = all time). Orders themselves are kept. */
export async function getStatsResetAt(): Promise<string | null> {
  const stored = await getContent<{ at?: string }>('stats_reset').catch(() => null);
  return typeof stored?.at === 'string' ? stored.at : null;
}

export async function resetStatsNow() {
  await setContent('stats_reset', { at: new Date().toISOString() });
}

/** The later of two ISO timestamps (null is ignored). */
export const laterOf = (iso: string, resetAt: string | null) =>
  resetAt && new Date(resetAt).getTime() > new Date(iso).getTime() ? resetAt : iso;
