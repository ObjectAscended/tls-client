import { join } from "@std/path";
import { exists } from "@std/fs";

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

const TLS_LIBRARY_NAME =
  `tls-client-xgo-${TLS_CLIENT_VERSION}-${os}-${goArch}.${extension}`;

const cacheDir = join(Deno.cwd(), ".tls-client");
const TLS_LIBRARY_PATH = Deno.env.get("TLS_LIBRARY_PATH") ??
  join(cacheDir, TLS_LIBRARY_NAME);

async function isLibraryAvailable(): Promise<boolean> {
  if (await exists(TLS_LIBRARY_PATH)) {
    return true;
  }
  return false;
}

async function downloadLibrary(): Promise<void> {
  await Deno.mkdir(cacheDir, { recursive: true });

  const releaseUrl =
    `https://github.com/bogdanfinn/tls-client/releases/download/v${TLS_CLIENT_VERSION}/${TLS_LIBRARY_NAME}`;
  const response = await fetch(releaseUrl);
  if (!response.ok || !response.body) {
    throw new Error(`failed to download library: ${response.status}`);
  }

  const output = await Deno.open(TLS_LIBRARY_PATH, {
    create: true,
    append: true,
  });
  await response.body.pipeTo(output.writable);
}

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
