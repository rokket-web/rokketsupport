import type { SupportRequestGroup, SupportRequestSummary } from "@/lib/supportRequests";

export interface RemoveGroupItemResult {
  groups: SupportRequestGroup[];
  item: SupportRequestSummary | null;
}

export function removeGroupItem(
  groups: SupportRequestGroup[],
  id: string
): RemoveGroupItemResult {
  let item: SupportRequestSummary | null = null;
  const next = groups
    .map((group) => {
      const found = group.items.find((i) => i.id === id);
      if (found) item = found;
      return { ...group, items: group.items.filter((i) => i.id !== id) };
    })
    .filter((group) => group.items.length > 0);
  return { groups: next, item };
}

export function addGroupItem(
  groups: SupportRequestGroup[],
  item: SupportRequestSummary
): SupportRequestGroup[] {
  const existingIndex = groups.findIndex((g) => g.clientId === item.clientId);
  if (existingIndex === -1) {
    return [...groups, { clientId: item.clientId, clientName: item.clientName, items: [item] }];
  }
  return groups.map((g, idx) =>
    idx === existingIndex ? { ...g, items: [item, ...g.items] } : g
  );
}

export function updateGroupItem(
  groups: SupportRequestGroup[],
  id: string,
  changes: Partial<SupportRequestSummary>
): SupportRequestGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
  }));
}
