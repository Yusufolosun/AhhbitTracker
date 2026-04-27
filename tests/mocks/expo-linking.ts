export function createURL(path: string): string {
  return `ahhbittracker://${path}`;
}

export function parse(url: string): { scheme: string; queryParams: Record<string, string> } {
  const parsed = new URL(url);
  return {
    scheme: parsed.protocol.replace(':', ''),
    queryParams: Object.fromEntries(parsed.searchParams.entries()),
  };
}

export async function openURL(_url: string): Promise<void> {
  return;
}

export async function getInitialURL(): Promise<string | null> {
  return null;
}

export function addEventListener(_event: string, _handler: (event: { url: string }) => void) {
  return {
    remove: () => undefined,
  };
}
