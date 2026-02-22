import { BaseClient, TlsHttpError, TlsLibraryError } from "./base.ts";
import { Session } from "./session.ts";

const globalClient: BaseClient = new BaseClient({
  impersonate: "chrome_146",
  responseType: "json",
  throwOnHttpError: true,
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36",
  },
});

const request: typeof globalClient.request = globalClient.request.bind(
  globalClient,
);
const get: typeof globalClient.get = globalClient.get.bind(globalClient);
const post: typeof globalClient.post = globalClient.post.bind(globalClient);
const put: typeof globalClient.put = globalClient.put.bind(globalClient);
const patch: typeof globalClient.patch = globalClient.patch.bind(globalClient);
const del: typeof globalClient.delete = globalClient.delete.bind(globalClient);
const head: typeof globalClient.head = globalClient.head.bind(globalClient);
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
