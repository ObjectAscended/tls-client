import { assertEquals } from "@std/assert";
import { BaseClient } from "../../src/client/base.ts";

Deno.test("Integration: custom TLS client configuration", async () => {
  const ja3String =
    "771,4866-4865-4867-49196-49195-52393-49200-49199-52392-255,11-13-51-43-16-0-35-5-23-10-45,29-23-24-4588,0";

  const client = new BaseClient({
    responseType: "json",
    raw: {
      customTlsClient: {
        supportedSignatureAlgorithms: [
          "ECDSAWithP384AndSHA384",
          "ECDSAWithP256AndSHA256",
          "ECDSAWithP521AndSHA512",
          "Ed25519",
          "PSSWithSHA512",
          "PSSWithSHA384",
          "PSSWithSHA256",
          "PKCS1WithSHA512",
          "PKCS1WithSHA384",
          "PKCS1WithSHA256",
        ],
        supportedVersions: [
          "1.3",
          "1.2",
        ],
        alpnProtocols: ["h2", "http/1.1"],
        keyShareCurves: [
          "X25519",
          "P256",
          "P384",
          "X25519MLKEM768",
        ],
        ja3String: ja3String,
        h2Settings: {
          "ENABLE_PUSH": 0,
          "INITIAL_WINDOW_SIZE": 2097152,
          "MAX_FRAME_SIZE": 16384,
          "MAX_HEADER_LIST_SIZE": 16384,
        },
        h2SettingsOrder: [
          "ENABLE_PUSH",
          "INITIAL_WINDOW_SIZE",
          "MAX_FRAME_SIZE",
          "MAX_HEADER_LIST_SIZE",
        ],
        connectionFlow: 5177345,
        pseudoHeaderOrder: [
          ":method",
          ":scheme",
          ":authority",
          ":path",
        ],
      },
    },
  });

  const response = await client.get("https://tls.peet.ws/api/all");
  assertEquals((response.data as { tls: { ja3: string } }).tls.ja3, ja3String);
});
