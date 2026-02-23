# @asc/tls-client

A powerful [Deno](https://deno.land/) HTTP client wrapper for the
highly-regarded
[bogdanfinn/tls-client](https://github.com/bogdanfinn/tls-client) Go library.

This library allows you to perform HTTP requests while impersonating the TLS
fingerprints and HTTP/2 settings of various real-world browsers (Chrome, Safari,
Firefox, iOS/Android apps). This is incredibly useful for bypassing strict
anti-bot protections (like Cloudflare, Akamai, Datadome, etc.) that analyze TLS
client hello messages.

## Features

- 🎭 **TLS Fingerprint Impersonation:** Spoof popular browsers (e.g.,
  `chrome_131`, `safari_ios_18_0`, `firefox_135`).
- 📦 **Zero-Config Setup:** Automatically downloads and caches the necessary
  native Go shared library (`.so`, `.dll`, `.dylib`) for your OS and
  architecture.
- 🍪 **Session Management:** Built-in `tlsClient.Session` class with persistent
  cookies and connection pooling, supporting Deno's explicit resource management
  (`using` keyword).
- 🛠️ **Customizable:** Deep control over raw TLS settings, key shares, cipher
  suites, and ALPN protocols for advanced users.
- 🔄 **TypeScript Native:** Fully typed options, request payloads, and
  responses.

## Installation

This package is published on [JSR](https://jsr.io/@asc/tls-client). Import it directly into
your Deno project:

```typescript
import { tlsClient } from "jsr:@asc/tls-client";
```

### Required Permissions

Because this library uses Foreign Function Interfaces (FFI) to communicate with
the native Go library, specific Deno permissions are required.

**1. On the first run (Automatic Download):** By default, the client needs to
download and cache the native binary for your system into a `.tls-client/`
directory. This requires broader permissions:

```bash
deno run --allow-ffi --allow-net --allow-read --allow-write --allow-env your_script.ts
```

**2. On subsequent runs:** Once the library is cached, you can safely lock down
the permissions to only what is strictly necessary:

```bash
deno run --allow-ffi --allow-env='TLS_LIBRARY_PATH' --allow-read='./.tls-client/' your_script.ts
```

**3. Manual Download (Alternative):** If you prefer not to grant network/write
permissions to download the library automatically, you can manually download the
appropriate shared library from the `bogdanfinn/tls-client` releases and specify
its location using the `TLS_LIBRARY_PATH` environment variable:

```bash
TLS_LIBRARY_PATH=/absolute/path/to/library.so deno run --allow-ffi --allow-env='TLS_LIBRARY_PATH' --allow-read='/absolute/path/to/library.so' your_script.ts
```

### Pre-downloading the Library

If you want to download the native library ahead of time (for example, during a CI/CD build step or Docker image creation) without running your full application, you can execute the following command:

```bash
deno eval "import { ensureLibraryAvailable } from 'jsr:@asc/tls-client'; await ensureLibraryAvailable();"
```

## Quick Start

You can use the default global client, which comes pre-configured to impersonate
Chrome 146 and parse JSON responses.

```typescript
import { tlsClient } from "jsr:@asc/tls-client";

// The default client mimics Chrome 146
const response = await tlsClient.get("https://tls.peet.ws/api/all", {
  impersonate: "chrome_131", // Override specific request
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.7033.149 Safari/537.36",
  },
});

console.log(response.data);
```

### Response Types

You can request different response formats using the `responseType` option:

```typescript
// JSON (default)
const jsonRes = await tlsClient.get("https://httpbin.org/json", {
  responseType: "json",
});

// Text / HTML
const htmlRes = await tlsClient.get("https://httpbin.org/html", {
  responseType: "text",
});

// Binary / ArrayBuffer
const imageRes = await tlsClient.get("https://httpbin.org/image", {
  responseType: "arraybuffer",
});
```

## Advanced Usage

### Sessions (Persistent Cookies)

If you need to maintain state, cookies, or persistent connection parameters
across multiple requests, use the `tlsClient.Session` class. It implements
`[Symbol.asyncDispose]`, meaning you can use the `using` keyword to
automatically clean up resources in the Go library when the session goes out of
scope.

```typescript
import { tlsClient } from "jsr:@asc/tls-client";

// 'await using' ensures the session is destroyed in the native library after execution
await using session = new tlsClient.Session({
  impersonate: "chrome_103",
  followRedirects: true,
});

// Cookies set by the server will be saved automatically
const setCookies = await session.get(
  "https://httpbin.org/cookies/set/key/value",
);
console.log(setCookies.data);

// The session will send the saved cookies on subsequent requests
const getHeaders = await session.get("https://httpbin.org/headers");
console.log(getHeaders.data);

// You can also manually inspect or add cookies
const cookies = session.getCookies("https://httpbin.org/");
console.log(cookies);
```

_Note: If you don't use `await using`, the session will be cleaned up
automatically when it is garbage collected via Deno's `FinalizationRegistry`,
but explicit cleanup is recommended for lower memory overhead._

### Custom Client Instances

If you want a reusable client with specific defaults (without using sessions),
use `tlsClient.defaults` or instantiate your own base client, though the primary
way to maintain unique client configurations is via `Session`.

### Custom TLS Configuration

For the ultimate control, you can override the raw settings passed to the
underlying `bogdanfinn/tls-client`.

```typescript
import { tlsClient } from "jsr:@asc/tls-client";

tlsClient.defaults.defaultOptions.impersonate = undefined;
tlsClient.defaults.defaultOptions.raw = {
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
    ja3String:
      "771,4866-4865-4867-49196-49195-52393-49200-49199-52392-255,11-13-51-43-16-0-35-5-23-10-45,29-23-24-4588,0",
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
};

const response = await tlsClient.get("https://tls.peet.ws/api/all");
console.log(response.data);
```
