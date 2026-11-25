// Storefront page-view tracker: sends each page view to /api/track (stored in the database)
const VISITOR_KEY = 'judwa_visitor_id';

function visitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function trackPageView() {
  if (typeof window === 'undefined' || window.location.pathname.startsWith('/admin')) return;
  try {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorId: visitorId(), path: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // localStorage unavailable (private browsing) — skip tracking silently
  }
}
