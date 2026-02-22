/**
 * Type definitions for the public TLS client API.
 *
 * This module defines the options, response structures, and common types
 * used by {@link BaseClient} and {@link Session}.
 *
 * @module
 */

import type { ImpersonateProfile, RawRequestInput } from "../bindings/types.ts";

/**
 * Options for configuring a TLS client request.
 */
export interface ClientOptions {
  /**
   * The browser profile to impersonate.
   * Determines the TLS fingerprint and other low-level client characteristics.
   */
  impersonate?: ImpersonateProfile;

  /** Request headers. */
  headers?: Record<string, string>;

  /**
   * Request body.
   * Can be a JSON-serializable object, a string, or a Uint8Array for binary data.
   */
  body?: unknown | string | Uint8Array;

  /** Cookies to send with the request as a key-value record. */
  cookies?: Record<string, string>;

  /** Request timeout in milliseconds. */
  timeout?: number;

  /** Whether to follow HTTP redirects automatically. */
  followRedirects?: boolean;

  /** Proxy URL (e.g., "http://user:pass@host:port"). */
  proxy?: string;

  /** Whether to verify server TLS certificates. Set to false for insecure requests. */
  verifyTls?: boolean;

  /**
   * Expected response data type.
   * - `json`: Parses the body as a JSON object.
   * - `text`: Returns the body as a UTF-8 string.
   * - `arraybuffer`: Returns the body as a Uint8Array (binary).
   */
  responseType?: "json" | "text" | "arraybuffer";

  /** Whether to throw a {@link TlsHttpError} for status codes >= 400. */
  throwOnHttpError?: boolean;

  /**
   * Raw options passed directly to the underlying Go library.
   * Use this for advanced settings not covered by the standard options.
   */
  raw?: ManagedRawOptions;
}

/**
 * Raw request options from the underlying library that can be managed by the client.
 *
 * This type omits properties that are already handled by high-level {@link ClientOptions}.
 */
export type ManagedRawOptions = Omit<
  RawRequestInput,
  | "requestMethod"
  | "requestUrl"
  | "tlsClientIdentifier"
  | "headers"
  | "body"
  | "timeoutMilliseconds"
  | "timeoutSeconds"
  | "followRedirects"
  | "proxyUrl"
  | "insecureSkipVerify"
>;

/**
 * Represents the response from a TLS client request.
 */
export interface TlsResponse {
  /** The HTTP status code (e.g., 200, 404). */
  status: number;

  /** The response headers. */
  headers: Headers;

  /**
   * The response data, parsed according to the requested `responseType`.
   */
  data: Record<string, unknown> | string | Uint8Array;

  /** The final URL after any redirects have been followed. */
  finalUrl: string;

  /** Cookies received in the response as a key-value record. */
  cookies: Record<string, string>;
}

/**
 * Valid HTTP request methods.
 */
export type RequestMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";
