import { BaseClient } from "./base.ts";
import {
  addCookiesToSession,
  destroySession,
  getCookiesFromSession,
} from "../core/bridge.ts";

import type { ClientOptions } from "./types.ts";
import type { RawCookie, RequestCookieInput } from "../bindings/types.ts";

const registry = new FinalizationRegistry(async (sessionId: string) => {
  const result = await destroySession({ sessionId });
  if (!result.success) {
    console.error(`failed to destroy session: ${sessionId}`);
  }
});

export class Session extends BaseClient {
  declare id: string;
  destroyed: boolean = false;

  constructor(
    options: ClientOptions = {},
    sessionId: string = crypto.randomUUID(),
  ) {
    super(options, sessionId);
    registry.register(this, sessionId, this);
  }

  getCookies(url: string): RawCookie[] | null {
    return getCookiesFromSession({ sessionId: this.id, url }).cookies;
  }

  setCookies(
    url: string,
    cookies: RequestCookieInput[],
  ): RawCookie[] | null {
    return addCookiesToSession({ sessionId: this.id, url, cookies }).cookies;
  }

  [Symbol.asyncDispose] = this.destroy;

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
