import { BaseClient, TlsHttpError, TlsLibraryError } from "./base.ts";
import { Session } from "./session.ts";

/**
 * The default global client instance pre-configured with a Chrome profile.
 */
const globalClient: BaseClient = new BaseClient({
  impersonate: "chrome_146",
  responseType: "json",
  throwOnHttpError: true,
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  },
});

/** Performs an HTTP request using the global client. */
const request: typeof globalClient.request = globalClient.request.bind(
  globalClient,
);
/** Performs a GET request using the global client. */
const get: typeof globalClient.get = globalClient.get.bind(globalClient);
/** Performs a POST request using the global client. */
const post: typeof globalClient.post = globalClient.post.bind(globalClient);
/** Performs a PUT request using the global client. */
const put: typeof globalClient.put = globalClient.put.bind(globalClient);
/** Performs a PATCH request using the global client. */
const patch: typeof globalClient.patch = globalClient.patch.bind(globalClient);
/** Performs a DELETE request using the global client. */
const del: typeof globalClient.delete = globalClient.delete.bind(globalClient);
/** Performs a HEAD request using the global client. */
const head: typeof globalClient.head = globalClient.head.bind(globalClient);
/** Performs an OPTIONS request using the global client. */
const options: typeof globalClient.options = globalClient.options.bind(
  globalClient,
);

export {
  del as delete,
  get,
  globalClient as defaults,
  head,
  options,
  patch,
  post,
  put,
  request,
  Session,
  TlsHttpError,
  TlsLibraryError,
};
