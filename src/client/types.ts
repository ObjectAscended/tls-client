import type { ImpersonateProfile, RawRequestInput } from "../bindings/types.ts";

export interface ClientOptions {
  impersonate?: ImpersonateProfile;
  headers?: Record<string, string>;
  body?: unknown | string | Uint8Array;
  cookies?: Record<string, string>;
  timeout?: number;
  followRedirects?: boolean;
  proxy?: string;
  verifyTls?: boolean;
  responseType?: "json" | "text" | "arraybuffer";
  throwOnHttpError?: boolean;
  raw?: ManagedRawOptions;
}

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

export interface TlsResponse {
  status: number;
  headers: Headers;
  data: Record<string, unknown> | string | Uint8Array;
  finalUrl: string;
  cookies: Record<string, string>;
}

export type RequestMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS";
