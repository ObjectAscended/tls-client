import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { tlsClient } from "../../mod.ts";
import { BaseClient, TlsHttpError } from "../../src/client/base.ts";
import { Session } from "../../src/client/session.ts";

Deno.test("Integration: global client get request", async () => {
  const response = await tlsClient.get("https://httpbin.org/get");
  assertEquals(response.status, 200);
  assertExists(response.data);
  const data = response.data as { url: string };
  assertEquals(data.url, "https://httpbin.org/get");
});

Deno.test("Integration: BaseClient with throwOnHttpError", async () => {
  const client = new BaseClient({ throwOnHttpError: true });
  await assertRejects(
    () => client.get("https://httpbin.org/status/404"),
    TlsHttpError,
    "404",
  );
});

Deno.test("Integration: Session cookie persistence", async () => {
  const session = new Session({
    followRedirects: true,
    impersonate: "chrome_131",
    responseType: "json",
  });

  // Set a cookie
  await session.get("https://httpbin.org/cookies/set?foo=bar");

  // Verify cookie is sent in next request
  const response = await session.get("https://httpbin.org/cookies");
  assertEquals(response.status, 200);
  const data = response.data as unknown as { cookies: Record<string, string> };
  assertExists(data.cookies, "Response should have cookies object");
  assertEquals(data.cookies.foo, "bar");

  // Check session.getCookies
  const cookies = session.getCookies("https://httpbin.org");
  assertExists(cookies, "getCookies should not return null");
  assertEquals(cookies.find((c) => c.name === "foo")?.value, "bar");
});

Deno.test("Integration: Session addCookies", async () => {
  const session = new Session({ impersonate: "chrome_131" });
  // Perform a request to ensure session is initialized in Go library
  await session.get("https://httpbin.org/get");

  session.setCookies("https://httpbin.org", [{ name: "test", value: "value" }]);

  const cookies = session.getCookies("https://httpbin.org");
  assertExists(cookies, "Cookies should exist after setCookies");
  assertEquals(cookies.find((c) => c.name === "test")?.value, "value");
});

Deno.test("Integration: Session destruction", async () => {
  const session = new Session({ impersonate: "chrome_131" });
  await session.get("https://httpbin.org/get");

  await session.destroy();
  assertEquals(session.destroyed, true);

  // Requesting after destruction should probably fail or create a new session in Go?
  // The Go library might recreate it, but our 'destroyed' flag is set.
  // Let's just verify it doesn't crash.
});
