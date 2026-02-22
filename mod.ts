/**
 * # tls-client
 *
 * A Deno wrapper for the [bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) library,
 * providing advanced HTTP client capabilities with support for TLS fingerprint impersonation.
 *
 * @example
 * ```ts
 * import { tlsClient } from "./mod.ts";
 *
 * const response = await tlsClient.get("https://www.google.com", {
 *   impersonate: "chrome_131",
 * });
 *
 * console.log(response.status);
 * console.log(response.data);
 * ```
 *
 * @module
 */

export * as tlsClient from "./src/client/index.ts";
export * from "./src/utils/getLibrary.ts";
