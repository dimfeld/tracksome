import { page } from '$app/stores';

export function titleSegment(stuff: Record<string, any>, segment: string) {
  return [...(stuff.title || []), segment];
}
