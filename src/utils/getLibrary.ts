/**
 * Utility for managing the native library binary.
 *
 * This module handles architecture detection, versioning, and automatic
 * downloading of the required shared library from GitHub releases.
 *
 * @module
 */

import { join } from "@std/path";
import { exists } from "@std/fs";

/** The version of the underlying bogdanfinn/tls-client library. */
const TLS_CLIENT_VERSION = "1.14.0";

const os = Deno.build.os;
const arch = Deno.build.arch;

let goArch = "";
if (arch === "x86_64") {
  goArch = "amd64";
} else if (arch === "aarch64") {
  goArch = "arm64";
} else {
  throw new Error(`unsupported architecture: ${arch}`);
}

let extension = "";
if (os === "windows") {
  extension = "dll";
} else if (os === "darwin") {
  extension = "dylib";
} else if (os === "linux") {
  extension = "so";
} else {
  throw new Error(`unsupported OS: ${os}`);
}

/** The filename of the native library based on the current platform. */
const TLS_LIBRARY_NAME: string =
  `tls-client-xgo-${TLS_CLIENT_VERSION}-${os}-${goArch}.${extension}`;

/** The directory where the native library will be cached. */
const cacheDir = join(Deno.cwd(), ".tls-client");

/** The full path to the native library binary. */
const TLS_LIBRARY_PATH: string = Deno.env.get("TLS_LIBRARY_PATH") ??
  join(cacheDir, TLS_LIBRARY_NAME);

/**
 * Checks if the native library is already present on disk.
 */
async function isLibraryAvailable(): Promise<boolean> {
  if (await exists(TLS_LIBRARY_PATH)) {
    return true;
  }
  return false;
}

/**
 * Downloads the native library from GitHub releases.
 *
 * @throws {Error} If the download fails or the response is invalid.
 */
async function downloadLibrary(): Promise<void> {
  await Deno.mkdir(cacheDir, { recursive: true });

  const releaseUrl =
    `https://github.com/bogdanfinn/tls-client/releases/download/v${TLS_CLIENT_VERSION}/${TLS_LIBRARY_NAME}`;
  const response = await fetch(releaseUrl);
  if (!response.ok || !response.body) {
    throw new Error(`failed to download library: ${response.status}`);
  }

  const output = await Deno.open(TLS_LIBRARY_PATH, {
    write: true,
    truncate: true,
    create: true,
  });
  await response.body.pipeTo(output.writable);
}

/**
 * Ensures the native library is available, downloading it if necessary.
 */
async function ensureLibraryAvailable(): Promise<void> {
  if (!(await isLibraryAvailable())) {
    await downloadLibrary();
  }
}

export {
  downloadLibrary,
  ensureLibraryAvailable,
  isLibraryAvailable,
  TLS_CLIENT_VERSION,
  TLS_LIBRARY_NAME,
  TLS_LIBRARY_PATH,
};
