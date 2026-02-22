const encoder = new TextEncoder();
export function createCString(str: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(str + "\0");
}

export function encodeJsonToCString(
  payload: unknown,
): Uint8Array<ArrayBuffer> | null {
  if (payload === undefined) return null;
  return createCString(JSON.stringify(payload));
}

export function decodeJsonFromPointer<T>(ptr: Deno.PointerValue | null): T {
  if (ptr === null) throw new Error("received null pointer");
  const json = Deno.UnsafePointerView.getCString(ptr);
  return JSON.parse(json) as T;
}
