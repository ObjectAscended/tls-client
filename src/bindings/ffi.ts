import {
  ensureLibraryAvailable,
  TLS_LIBRARY_PATH,
} from "../utils/getLibrary.ts";

await ensureLibraryAvailable();

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

type LibrarySymbols = typeof library.symbols;
type LibrarySymbolsAsync = Pick<
  LibrarySymbols,
  "request" | "destroyAll" | "destroySession"
>;
type LibrarySymbolsSync = Pick<
  LibrarySymbols,
  "getCookiesFromSession" | "addCookiesToSession"
>;

type TlsSymbolAsync = LibrarySymbolsAsync[keyof LibrarySymbolsAsync];
type TlsSymbolSync = LibrarySymbolsSync[keyof LibrarySymbolsSync];

export { library };
export type { TlsSymbolAsync, TlsSymbolSync };
