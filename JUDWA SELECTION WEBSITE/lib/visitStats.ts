import 'server-only';
import { supabaseServer } from './supabase';

export interface VisitStats {
  views: number;
  visitors: number;
}

const PAGE_SIZE = 1000; // Supabase returns at most 1000 rows per request
const MAX_PAGES = 50;

/** Page views and unique visitors since `fromIso`. Returns zeros if migration 006 hasn't been run yet. */
export async function getVisitStats(fromIso: string): Promise<VisitStats> {
  const { count, error } = await supabaseServer
    .from('site_visits')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', fromIso);
  if (error) {
    console.error('Could not read site visits (has migration 006 been run?):', error.message);
    return { views: 0, visitors: 0 };
  }

  const visitors = new Set<string>();
  for (let page = 0; page < MAX_PAGES; page++) {
    const { data, error: pageError } = await supabaseServer
      .from('site_visits')
      .select('visitor_id')
      .gte('created_at', fromIso)
      .order('id')
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (pageError || !data) break;
    data.forEach(v => visitors.add(v.visitor_id));
    if (data.length < PAGE_SIZE) break;
  }
  return { views: count ?? 0, visitors: visitors.size };
}
