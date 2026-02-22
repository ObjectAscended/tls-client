/**
 * Session management for the TLS client.
 *
 * This module provides the {@link Session} class, which maintains persistent
 * connections and a cookie jar across multiple requests.
 *
 * @module
 */

import { BaseClient } from "./base.ts";
import {
  addCookiesToSession,
  destroySession,
  getCookiesFromSession,
} from "../core/bridge.ts";

import type { ClientOptions } from "./types.ts";
import type { RawCookie, RequestCookieInput } from "../bindings/types.ts";

/**
 * Registry used to automatically clean up sessions when they are garbage collected.
 */
const registry = new FinalizationRegistry(async (sessionId: string) => {
  const result = await destroySession({ sessionId });
  if (!result.success) {
    console.error(`failed to destroy session: ${sessionId}`);
  }
});

/**
 * A session-based client that maintains cookies and persistent connections.
 *
 * Sessions are automatically cleaned up using `FinalizationRegistry` when they
 * are garbage collected, or they can be explicitly destroyed using {@link destroy}
 * or the `[Symbol.asyncDispose]` pattern.
 *
 * @example
 * ```ts
 * using session = new Session({ impersonate: "chrome_131" });
 * const response = await session.get("https://example.com");
 * console.log(session.getCookies("https://example.com"));
 * ```
 */
export class Session extends BaseClient {
  /** The unique identifier for this session. */
  declare id: string;

  /** Whether the session has been destroyed and resources released. */
  destroyed: boolean = false;

  /**
   * Creates a new Session.
   *
   * @param options Default options for all requests made within this session.
   * @param sessionId Optional explicit session ID. Defaults to a random UUID.
   */
  constructor(
    options: ClientOptions = {},
    sessionId: string = crypto.randomUUID(),
  ) {
    super(options, sessionId);
    registry.register(this, sessionId, this);
  }

  /**
   * Retrieves all cookies for a specific URL from the session's cookie jar.
   *
   * @param url The URL to get cookies for.
   * @returns An array of {@link RawCookie} objects or null if no cookies are found.
   */
  getCookies(url: string): RawCookie[] | null {
    return getCookiesFromSession({ sessionId: this.id, url }).cookies;
  }

  /**
   * Adds cookies to the session's cookie jar for a specific URL.
   *
   * @param url The URL associated with the cookies.
   * @param cookies The list of {@link RequestCookieInput} objects to add.
   * @returns The updated list of cookies for the URL.
   */
  setCookies(
    url: string,
    cookies: RequestCookieInput[],
  ): RawCookie[] | null {
    return addCookiesToSession({ sessionId: this.id, url, cookies }).cookies;
  }

  /**
   * Explicitly destroys the session and releases associated resources in the Go library.
   * Supports the `using` keyword for automatic cleanup.
   */
  [Symbol.asyncDispose] = this.destroy;

  /**
   * Explicitly destroys the session.
   *
   * This removes the session from the Go library's internal registry and
   * unregisters it from the `FinalizationRegistry`.
   *
   * @throws {Error} If the session fails to destroy.
   */
  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    registry.unregister(this);
    const result = await destroySession({ sessionId: this.id });
    if (!result.success) {
      throw new Error(`failed to destroy session: ${this.id}`);
    }
  }
}
