/**
 * Serialization utilities for FFI communication.
 *
 * This module provides functions for converting between JavaScript strings/objects
 * and the C-style strings (null-terminated buffers) expected by the Go library.
 *
 * @module
 */

const encoder = new TextEncoder();

/**
 * Creates a null-terminated Uint8Array from a string.
 *
 * @param str The string to encode.
 * @returns A Uint8Array containing the UTF-8 encoded string with a null terminator.
 */
export function createCString(str: string): Uint8Array<ArrayBuffer> {
  return encoder.encode(str + "\0");
}

/**
 * Serializes an object to a JSON string and encodes it as a null-terminated C-string.
 *
 * @param payload The object or value to serialize.
 * @returns A null-terminated Uint8Array or null if the payload is undefined.
 */
export function encodeJsonToCString(
  payload: unknown,
): Uint8Array<ArrayBuffer> | null {
  if (payload === undefined) return null;
  return createCString(JSON.stringify(payload));
}

/**
 * Decodes a JSON object from a native pointer to a C-string.
 *
 * @template T The expected type of the decoded object.
 * @param ptr The native pointer to the null-terminated C-string.
 * @returns The parsed JSON object of type T.
 * @throws {Error} If the pointer is null.
 */
export function decodeJsonFromPointer<T>(ptr: Deno.PointerValue | null): T {
  if (ptr === null) throw new Error("received null pointer");
  const json = Deno.UnsafePointerView.getCString(ptr);
  return JSON.parse(json) as T;
}
