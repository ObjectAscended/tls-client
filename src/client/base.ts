import { deepMerge } from "@std/collections/deep-merge";

import { request as tlsRequest } from "../core/bridge.ts";
import { buildRawRequest, formatResponse } from "../utils/normalization.ts";

import type { ClientOptions, RequestMethod, TlsResponse } from "./types.ts";

class BaseClient {
  constructor(
    public defaultOptions: ClientOptions = {},
    public id?: string,
  ) {}

  async request(
    method: RequestMethod,
    url: string,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    const combinedOpts: ClientOptions = deepMerge(
      structuredClone(this.defaultOptions) as Record<string, unknown>,
      opts as Record<string, unknown>,
    );

    if (
      this.id && combinedOpts.raw?.sessionId == undefined
    ) {
      if (combinedOpts.raw === undefined) combinedOpts.raw = {};
      combinedOpts.raw.sessionId = this.id;
    }

    const rawRequest = buildRawRequest(method, url, combinedOpts);
    const response = await tlsRequest(rawRequest);
    if (response.status === 0) {
      throw new TlsLibraryError(response.body);
    }

    const formattedResponse = formatResponse(response, combinedOpts);
    if (combinedOpts.throwOnHttpError && response.status >= 400) {
      const err = new TlsHttpError(
        `request failed with status: ${response.status}`,
        formattedResponse,
      );
      throw err;
    }

    return formattedResponse;
  }

  get(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("GET", url, opts);
  }

  head(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("HEAD", url, opts);
  }

  post(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("POST", url, { body: data, ...opts });
  }

  put(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("PUT", url, { body: data, ...opts });
  }

  patch(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("PATCH", url, { body: data, ...opts });
  }

  delete(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("DELETE", url, opts);
  }

  options(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("OPTIONS", url, opts);
  }
}

class TlsLibraryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TlsLibraryError";
  }
}

class TlsHttpError extends Error {
  constructor(message: string, public response: TlsResponse) {
    super(message);
    this.name = "TlsHttpError";
  }
}

export { BaseClient, TlsHttpError, TlsLibraryError };
