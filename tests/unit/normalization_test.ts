import { assertEquals, assertExists } from "@std/assert";
import { encodeBase64 } from "@std/encoding/base64";
import {
  buildRawRequest,
  formatResponse,
} from "../../src/utils/normalization.ts";
import type { ClientOptions } from "../../src/client/types.ts";
import type { RawResponse } from "../../src/bindings/types.ts";

Deno.test("buildRawRequest - should correctly set method and URL", () => {
  const result = buildRawRequest("GET", "https://example.com", {});
  assertEquals(result.requestMethod, "GET");
  assertEquals(result.requestUrl, "https://example.com");
});

Deno.test("buildRawRequest - should handle JSON body and set content-type", () => {
  const body = { hello: "world" };
  const result = buildRawRequest("POST", "https://example.com", { body });

  assertEquals(result.requestBody, JSON.stringify(body));
  assertEquals(result.headers?.["content-type"], "application/json");
});

Deno.test("buildRawRequest - should handle Uint8Array body and set content-type", () => {
  const body = new TextEncoder().encode("binary data");
  const result = buildRawRequest("POST", "https://example.com", { body });

  assertEquals(result.requestBody, encodeBase64(body));
  assertEquals(result.isByteRequest, true);
  assertEquals(result.headers?.["content-type"], "application/octet-stream");
});

Deno.test("buildRawRequest - should format cookies", () => {
  const cookies = { session: "123", pref: "dark" };
  const result = buildRawRequest("GET", "https://example.com", { cookies });

  assertExists(result.requestCookies);
  assertEquals(result.requestCookies.length, 2);
  assertEquals(
    result.requestCookies.find((c) => c.name === "session")?.value,
    "123",
  );
});

Deno.test("buildRawRequest - should merge raw options", () => {
  const opts: ClientOptions = {
    raw: {
      forceHttp1: true,
      sessionId: "my-session",
    },
  };
  const result = buildRawRequest("GET", "https://example.com", opts);

  assertEquals(result.forceHttp1, true);
  assertEquals(result.sessionId, "my-session");
});

Deno.test("formatResponse - should parse JSON response", () => {
  const rawResponse: RawResponse = {
    status: 200,
    body: JSON.stringify({ success: true }),
    headers: { "Content-Type": ["application/json"] },
    cookies: {},
    id: "test-id",
    target: "https://example.com",
    usedProtocol: "http/1.1",
  };

  const result = formatResponse(rawResponse, { responseType: "json" });
  assertEquals(result.status, 200);
  assertEquals(result.data, { success: true });
  assertExists(result.headers.get("content-type"));
});

Deno.test("formatResponse - should handle arraybuffer responseType", () => {
  const data = "binary data";
  const base64 = encodeBase64(new TextEncoder().encode(data));
  const rawResponse: RawResponse = {
    status: 200,
    body: `data:application/octet-stream;base64,${base64}`,
    headers: {},
    cookies: {},
    id: "test-id",
    target: "https://example.com",
    usedProtocol: "http/1.1",
  };

  const result = formatResponse(rawResponse, { responseType: "arraybuffer" });
  assertEquals(new TextDecoder().decode(result.data as Uint8Array), data);
});
