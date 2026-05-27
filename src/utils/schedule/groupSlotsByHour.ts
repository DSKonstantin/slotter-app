export function groupSlotsByHour(slots: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const slot of slots) {
    const hour = slot.split(":")[0];
    if (!map.has(hour)) map.set(hour, []);
    map.get(hour)!.push(slot);
  }
  return map;
}
