/**
 * Bridge between the high-level client and the low-level FFI bindings.
 *
 * This module manages the serialization of JSON payloads to C-strings,
 * execution of native functions, and cleanup of native memory returned by Go.
 *
 * @module
 */

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

/**
 * Executes an asynchronous FFI symbol.
 *
 * @template T The expected type of the JSON response from Go.
 * @param symbol The FFI symbol to execute.
 * @param payload The payload to serialize and pass to Go.
 * @returns A promise resolving to the parsed JSON response.
 */
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

/**
 * Executes a synchronous FFI symbol.
 *
 * @template T The expected type of the JSON response from Go.
 * @param symbol The FFI symbol to execute.
 * @param payload The payload to serialize and pass to Go.
 * @returns The parsed JSON response.
 */
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

/**
 * Performs a raw HTTP request via the native library.
 */
function request(payload: RawRequestInput): Promise<RawResponse> {
  return executeInternalAsync<RawResponse>(
    library.symbols.request,
    payload,
  );
}

/**
 * Retrieves cookies from a session via the native library.
 */
function getCookiesFromSession(
  payload: RawGetCookiesFromSessionInput,
): RawCookiesFromSessionOutput {
  return executeInternalSync<RawCookiesFromSessionOutput>(
    library.symbols.getCookiesFromSession,
    payload,
  );
}

/**
 * Adds cookies to a session via the native library.
 */
function addCookiesToSession(
  payload: RawAddCookiesToSessionInput,
): RawCookiesFromSessionOutput {
  return executeInternalSync<RawCookiesFromSessionOutput>(
    library.symbols.addCookiesToSession,
    payload,
  );
}

/**
 * Manually releases memory in the Go library for a specific response ID.
 */
function freeMemory(id: string): void {
  const encodedId = createCString(id);
  library.symbols.freeMemory(encodedId);
}

/**
 * Destroys all sessions in the native library.
 */
async function destroyAll(): Promise<RawDestroyOutput> {
  return await executeInternalAsync<RawDestroyOutput>(
    library.symbols.destroyAll,
  );
}

/**
 * Destroys a specific session in the native library.
 */
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
