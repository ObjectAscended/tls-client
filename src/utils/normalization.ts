import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import { deepMerge } from "@std/collections/deep-merge";

import type {
  ClientOptions,
  RequestMethod,
  TlsResponse,
} from "../client/types.ts";
import type {
  RawRequestInput,
  RawResponse,
  RequestCookieInput,
} from "../bindings/types.ts";

export function buildRawRequest(
  method: RequestMethod,
  url: string,
  opts: ClientOptions,
): RawRequestInput {
  const headers = { ...opts.headers };
  let requestBody: string | undefined = undefined;
  let isByteRequest = false;
  const isByteResponse = opts.responseType === "arraybuffer";
  let formattedCookies: RequestCookieInput[] | undefined = undefined;

  if (opts.body instanceof Uint8Array) {
    requestBody = encodeBase64(opts.body);
    isByteRequest = true;
    if (headers["content-type"] === undefined) {
      headers["content-type"] = "application/octet-stream";
    }
  } else if (typeof opts.body === "object") {
    requestBody = JSON.stringify(opts.body);
    if (headers["content-type"] === undefined) {
      headers["content-type"] = "application/json";
    }
  } else if (opts.body) {
    requestBody = String(opts.body);
  }

  if (opts.cookies) {
    formattedCookies = Object.entries(opts.cookies).map(([name, value]) => ({
      name,
      value,
    }));
  }

  return deepMerge({
    requestMethod: method.toUpperCase(),
    requestUrl: url,
    tlsClientIdentifier: opts.impersonate,
    headers,
    requestBody,
    requestCookies: formattedCookies,
    timeoutMilliseconds: opts.timeout,
    followRedirects: opts.followRedirects,
    proxyUrl: opts.proxy,
    insecureSkipVerify: opts.verifyTls === false,
    isByteRequest,
    isByteResponse,
  }, opts.raw ?? {});
}

export function formatResponse(
  response: RawResponse,
  options: ClientOptions,
): TlsResponse {
  const headers = new Headers();
  for (const [key, values] of Object.entries(response.headers)) {
    for (const value of values) {
      headers.append(key, value);
    }
  }

  let finalData: Record<string, unknown> | string | Uint8Array = response.body;
  if (options.responseType === "arraybuffer") {
    // const rawBase64 = response.body.replace(/^data:.*?base64,/, "");
    const rawBase64 = response.body.slice(response.body.indexOf("base64,") + 7);
    finalData = decodeBase64(rawBase64);
  } else if (options.responseType === "json") {
    try {
      finalData = JSON.parse(response.body);
      // deno-lint-ignore no-empty
    } catch {}
  }

  return {
    status: response.status,
    headers: headers,
    data: finalData,
    finalUrl: response.target,
    cookies: response.cookies,
  };
}
