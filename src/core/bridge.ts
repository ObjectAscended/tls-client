import { library } from "../bindings/ffi.ts";
import {
  createCString,
  decodeJsonFromPointer,
  encodeJsonToCString,
} from "../utils/serializers.ts";

import type {
  RawAddCookiesToSessionInput,
  RawCookiesFromSessionOutput,
  RawDestroyOutput,
  RawDestroySessionInput,
  RawGetCookiesFromSessionInput,
  RawRequestInput,
  RawResponse,
} from "../bindings/types.ts";
import type { TlsSymbolAsync, TlsSymbolSync } from "../bindings/ffi.ts";

async function executeInternalAsync<T extends { id: string }>(
  symbol: TlsSymbolAsync,
  payload?: unknown,
): Promise<T> {
  const encodedPayload = encodeJsonToCString(payload);
  const encodedResponse = await symbol(encodedPayload);
  const response = decodeJsonFromPointer<T>(encodedResponse);
  const encodedId = createCString(response.id);
  library.symbols.freeMemory(encodedId);
  return response;
}

function executeInternalSync<T extends { id: string }>(
  symbol: TlsSymbolSync,
  payload?: unknown,
): T {
  const encodedPayload = encodeJsonToCString(payload);
  const encodedResponse = symbol(encodedPayload);
  const response = decodeJsonFromPointer<T>(encodedResponse);
  const encodedId = createCString(response.id);
  library.symbols.freeMemory(encodedId);
  return response;
}

function request(payload: RawRequestInput): Promise<RawResponse> {
  return executeInternalAsync<RawResponse>(
    library.symbols.request,
    payload,
  );
}

function getCookiesFromSession(
  payload: RawGetCookiesFromSessionInput,
): RawCookiesFromSessionOutput {
  return executeInternalSync<RawCookiesFromSessionOutput>(
    library.symbols.getCookiesFromSession,
    payload,
  );
}

function addCookiesToSession(
  payload: RawAddCookiesToSessionInput,
): RawCookiesFromSessionOutput {
  return executeInternalSync<RawCookiesFromSessionOutput>(
    library.symbols.addCookiesToSession,
    payload,
  );
}

function freeMemory(id: string): void {
  const encodedId = createCString(id);
  library.symbols.freeMemory(encodedId);
}

async function destroyAll(): Promise<RawDestroyOutput> {
  return await executeInternalAsync<RawDestroyOutput>(
    library.symbols.destroyAll,
  );
}

async function destroySession(
  payload: RawDestroySessionInput,
): Promise<RawDestroyOutput> {
  return await executeInternalAsync<RawDestroyOutput>(
    library.symbols.destroySession,
    payload,
  );
}

export {
  addCookiesToSession,
  destroyAll,
  destroySession,
  freeMemory,
  getCookiesFromSession,
  request,
};
