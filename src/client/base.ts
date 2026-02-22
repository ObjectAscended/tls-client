/**
 * Core client implementation for the TLS client.
 *
 * This module provides the {@link BaseClient} class, which serves as the foundation
 * for all HTTP requests. It also defines custom error classes for better error handling.
 *
 * @module
 */

import { deepMerge } from "@std/collections/deep-merge";

import { request as tlsRequest } from "../core/bridge.ts";
import { buildRawRequest, formatResponse } from "../utils/normalization.ts";

import type { ClientOptions, RequestMethod, TlsResponse } from "./types.ts";

/**
 * Base client providing the core request logic.
 *
 * It can be used directly or as a base for specialized clients like {@link Session}.
 * It handles option merging, request normalization, and response formatting.
 */
class BaseClient {
  /**
   * Creates a new BaseClient instance.
   *
   * @param defaultOptions Default options applied to all requests.
   * @param id Optional identifier, used for session-based requests.
   */
  constructor(
    public defaultOptions: ClientOptions = {},
    public id?: string,
  ) {}

  /**
   * Executes an HTTP request with the given method and URL.
   *
   * @param method The HTTP method to use (e.g., "GET", "POST").
   * @param url The URL to request.
   * @param opts Request-specific options that override defaults.
   * @returns A promise that resolves to the {@link TlsResponse}.
   * @throws {TlsLibraryError} If the underlying Go library returns an error (status 0).
   * @throws {TlsHttpError} If `throwOnHttpError` is true and the response status is >= 400.
   */
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

  /**
   * Performs a GET request.
   *
   * @param url The URL to request.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  get(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("GET", url, opts);
  }

  /**
   * Performs a HEAD request.
   *
   * @param url The URL to request.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  head(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("HEAD", url, opts);
  }

  /**
   * Performs a POST request.
   *
   * @param url The URL to request.
   * @param data The request body data.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  post(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("POST", url, { body: data, ...opts });
  }

  /**
   * Performs a PUT request.
   *
   * @param url The URL to request.
   * @param data The request body data.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  put(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("PUT", url, { body: data, ...opts });
  }

  /**
   * Performs a PATCH request.
   *
   * @param url The URL to request.
   * @param data The request body data.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  patch(
    url: string,
    data: unknown,
    opts: ClientOptions = {},
  ): Promise<TlsResponse> {
    return this.request("PATCH", url, { body: data, ...opts });
  }

  /**
   * Performs a DELETE request.
   *
   * @param url The URL to request.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  delete(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("DELETE", url, opts);
  }

  /**
   * Performs an OPTIONS request.
   *
   * @param url The URL to request.
   * @param opts Optional request options.
   * @returns A promise that resolves to the {@link TlsResponse}.
   */
  options(url: string, opts: ClientOptions = {}): Promise<TlsResponse> {
    return this.request("OPTIONS", url, opts);
  }
}

/**
 * Error thrown when the underlying Go library returns an error (status 0).
 *
 * This usually indicates a problem with the FFI call, library loading,
 * or an internal panic in the Go library.
 */
class TlsLibraryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TlsLibraryError";
  }
}

/**
 * Error thrown when an HTTP request fails (status >= 400) and `throwOnHttpError` is enabled.
 *
 * It contains the full {@link TlsResponse} for further inspection.
 */
class TlsHttpError extends Error {
  /**
   * @param message Error message.
   * @param response The full response object that triggered the error.
   */
  constructor(message: string, public response: TlsResponse) {
    super(message);
    this.name = "TlsHttpError";
  }
}

export { BaseClient, TlsHttpError, TlsLibraryError };
