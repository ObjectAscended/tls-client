/**
 * Foreign Function Interface (FFI) bindings for the native TLS client library.
 *
 * This module handles the loading of the shared library and defines the
 * low-level symbols exported by the Go library.
 *
 * @module
 */

import {
  ensureLibraryAvailable,
  TLS_LIBRARY_PATH,
} from "../utils/getLibrary.ts";

// Ensure the library binary is downloaded and available before attempting to open it.
await ensureLibraryAvailable();

/**
 * The opened native library instance.
 */
const library = Deno.dlopen(TLS_LIBRARY_PATH, {
  request: {
    parameters: ["buffer"],
    result: "pointer",
    nonblocking: true,
  },
  getCookiesFromSession: {
    parameters: ["buffer"],
    result: "pointer",
  },
  addCookiesToSession: {
    parameters: ["buffer"],
    result: "pointer",
  },
  freeMemory: {
    parameters: ["buffer"],
    result: "void",
  },
  destroyAll: {
    parameters: [],
    result: "pointer",
    nonblocking: true,
  },
  destroySession: {
    parameters: ["buffer"],
    result: "pointer",
    nonblocking: true,
  },
});

/** All symbols exported by the library. */
type LibrarySymbols = typeof library.symbols;

/** Async symbols exported by the library. */
type LibrarySymbolsAsync = Pick<
  LibrarySymbols,
  "request" | "destroyAll" | "destroySession"
>;

/** Sync symbols exported by the library. */
type LibrarySymbolsSync = Pick<
  LibrarySymbols,
  "getCookiesFromSession" | "addCookiesToSession"
>;

/** Represents an asynchronous symbol from the native library. */
type TlsSymbolAsync = LibrarySymbolsAsync[keyof LibrarySymbolsAsync];

/** Represents a synchronous symbol from the native library. */
type TlsSymbolSync = LibrarySymbolsSync[keyof LibrarySymbolsSync];

export { library };
export type { TlsSymbolAsync, TlsSymbolSync };
