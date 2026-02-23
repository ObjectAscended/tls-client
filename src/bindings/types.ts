/**
 * Raw type definitions for the native TLS client library.
 *
 * This module contains interfaces that match the JSON structure expected
 * and returned by the bogdanfinn/tls-client Go library.
 *
 * @module
 */

export interface RawRequestInput {
  certificatePinningHosts?: Record<string, string[]>;
  customTlsClient?: RawCustomTlsClient;
  transportOptions?: RawTransportOptions;
  headers?: Record<string, string>;
  defaultHeaders?: Record<string, string[]>;
  connectHeaders?: Record<string, string[]>;
  localAddress?: string;
  serverNameOverwrite?: string;
  proxyUrl?: string;
  requestBody?: string;
  requestHostOverride?: string;
  sessionId?: string;
  streamOutputBlockSize?: number;
  streamOutputEOFSymbol?: string;
  streamOutputPath?: string;
  requestMethod: string;
  requestUrl: string;
  tlsClientIdentifier?: ImpersonateProfile;
  headerOrder?: string[];
  requestCookies?: RequestCookieInput[];
  timeoutMilliseconds?: number;
  timeoutSeconds?: number;
  catchPanics?: boolean;
  followRedirects?: boolean;
  forceHttp1?: boolean;
  disableHttp3?: boolean;
  withProtocolRacing?: boolean;
  insecureSkipVerify?: boolean;
  isByteRequest?: boolean;
  isByteResponse?: boolean;
  isRotatingProxy?: boolean;
  disableIPV6?: boolean;
  disableIPV4?: boolean;
  withDebug?: boolean;
  withCustomCookieJar?: boolean;
  withoutCookieJar?: boolean;
  withRandomTLSExtensionOrder?: boolean;
  euckrResponse?: boolean;
}

export interface RawResponse {
  cookies: Record<string, string>;
  headers: Record<string, string[]>;
  id: string;
  body: string;
  sessionId?: string;
  target: string;
  usedProtocol: string;
  status: number;
}

export type RequestCookieInput =
  & Partial<RawCookie>
  & Pick<RawCookie, "name" | "value">;

export interface RawCookie {
  expires: number;
  domain: string;
  name: string;
  path: string;
  value: string;
  maxAge: number;
  secure: boolean;
  httpOnly: boolean;
}

export interface RawGetCookiesFromSessionInput {
  sessionId: string;
  url: string;
}

export interface RawCookiesFromSessionOutput {
  id: string;
  cookies: RawCookie[] | null;
}

export interface RawAddCookiesToSessionInput {
  sessionId: string;
  url: string;
  cookies: RequestCookieInput[];
}

export interface RawDestroySessionInput {
  sessionId: string;
}

export interface RawDestroyOutput {
  id: string;
  success: boolean;
}

export interface RawTransportOptions {
  idleConnTimeout?: number;
  maxIdleConns?: number;
  maxIdleConnsPerHost?: number;
  maxConnsPerHost?: number;
  maxResponseHeaderBytes?: number;
  writeBufferSize?: number;
  readBufferSize?: number;
  disableKeepAlives?: boolean;
  disableCompression?: boolean;
}

export interface RawCustomTlsClient {
  h2Settings?: Partial<Record<H2SettingKey, number>>;
  h2SettingsOrder?: H2SettingKey[];
  h3Settings?: Partial<Record<H3SettingKey, number>>;
  h3SettingsOrder?: H3SettingKey[];
  h3PseudoHeaderOrder?: string[];
  headerPriority?: RawPriorityParam;
  certCompressionAlgos?: CertCompressionAlgorithm[];
  ja3String?: string;
  keyShareCurves?: KeyShareCurve[];
  alpnProtocols?: string[];
  alpsProtocols?: string[];
  ECHCandidatePayloads?: number[];
  ECHCandidateCipherSuites?: RawCandidateCipherSuite[];
  priorityFrames?: RawPriorityFrames[];
  pseudoHeaderOrder?: string[];
  supportedDelegatedCredentialsAlgorithms?: SignatureAlgorithm[];
  supportedSignatureAlgorithms?: SignatureAlgorithm[];
  supportedVersions?: SupportedTlsVersion[];
  connectionFlow?: number;
  recordSizeLimit?: number;
  streamId?: number;
  h3PriorityParam?: number;
  h3SendGreaseFrames?: boolean;
  allowHttp?: boolean;
}

export interface RawCandidateCipherSuite {
  kdfId: KdfId;
  aeadId: AeadId;
}

export interface RawPriorityFrames {
  priorityParam: RawPriorityParam;
  streamID: number;
}

export interface RawPriorityParam {
  streamDep: number;
  exclusive: boolean;
  weight: number;
}

export type ChromeProfile =
  | "chrome_103"
  | "chrome_104"
  | "chrome_105"
  | "chrome_106"
  | "chrome_107"
  | "chrome_108"
  | "chrome_109"
  | "chrome_110"
  | "chrome_111"
  | "chrome_112"
  | "chrome_116_PSK"
  | "chrome_116_PSK_PQ"
  | "chrome_117"
  | "chrome_120"
  | "chrome_124"
  | "chrome_130_PSK"
  | "chrome_131"
  | "chrome_131_PSK"
  | "chrome_133"
  | "chrome_133_PSK"
  | "chrome_144"
  | "chrome_144_PSK"
  | "chrome_146"
  | "chrome_146_PSK";

export type SafariProfile =
  | "safari_15_6_1"
  | "safari_16_0"
  | "safari_ipad_15_6"
  | "safari_ios_15_5"
  | "safari_ios_15_6"
  | "safari_ios_16_0"
  | "safari_ios_17_0"
  | "safari_ios_18_0"
  | "safari_ios_18_5"
  | "safari_ios_26_0";

export type FirefoxProfile =
  | "firefox_102"
  | "firefox_104"
  | "firefox_105"
  | "firefox_106"
  | "firefox_108"
  | "firefox_110"
  | "firefox_117"
  | "firefox_120"
  | "firefox_123"
  | "firefox_132"
  | "firefox_133"
  | "firefox_135"
  | "firefox_146_PSK"
  | "firefox_147"
  | "firefox_147_PSK";

export type MiscProfile =
  | "opera_89"
  | "opera_90"
  | "opera_91"
  | "zalando_android_mobile"
  | "zalando_ios_mobile"
  | "nike_ios_mobile"
  | "nike_android_mobile"
  | "cloudscraper"
  | "mms_ios"
  | "mms_ios_1"
  | "mms_ios_2"
  | "mms_ios_3"
  | "mesh_ios"
  | "mesh_ios_1"
  | "mesh_ios_2"
  | "mesh_android"
  | "mesh_android_1"
  | "mesh_android_2"
  | "confirmed_ios"
  | "confirmed_android"
  | "okhttp4_android_7"
  | "okhttp4_android_8"
  | "okhttp4_android_9"
  | "okhttp4_android_10"
  | "okhttp4_android_11"
  | "okhttp4_android_12"
  | "okhttp4_android_13";

export type ImpersonateProfile =
  | ChromeProfile
  | SafariProfile
  | FirefoxProfile
  | MiscProfile;

export type H2SettingKey =
  | "HEADER_TABLE_SIZE"
  | "ENABLE_PUSH"
  | "MAX_CONCURRENT_STREAMS"
  | "INITIAL_WINDOW_SIZE"
  | "MAX_FRAME_SIZE"
  | "MAX_HEADER_LIST_SIZE"
  | "UNKNOWN_SETTING_7"
  | "UNKNOWN_SETTING_8"
  | "UNKNOWN_SETTING_9";

export type H3SettingKey =
  | "QPACK_MAX_TABLE_CAPACITY"
  | "MAX_FIELD_SECTION_SIZE"
  | "QPACK_BLOCKED_STREAMS"
  | "H3_DATAGRAM";

export type SupportedTlsVersion =
  | "GREASE"
  | "1.3"
  | "1.2"
  | "1.1"
  | "1.0";

export type SignatureAlgorithm =
  | "PKCS1WithSHA256"
  | "PKCS1WithSHA384"
  | "PKCS1WithSHA512"
  | "PSSWithSHA256"
  | "PSSWithSHA384"
  | "PSSWithSHA512"
  | "ECDSAWithP256AndSHA256"
  | "ECDSAWithP384AndSHA384"
  | "ECDSAWithP521AndSHA512"
  | "PKCS1WithSHA1"
  | "ECDSAWithSHA1"
  | "Ed25519"
  | "SHA224_RSA"
  | "SHA224_ECDSA";

export type KdfId =
  | "HKDF_SHA256"
  | "HKDF_SHA384"
  | "HKDF_SHA512";

export type AeadId =
  | "AEAD_AES_128_GCM"
  | "AEAD_AES_256_GCM"
  | "AEAD_CHACHA20_POLY1305";

export type KeyShareCurve =
  | "GREASE"
  | "P256"
  | "P384"
  | "P521"
  | "X25519"
  | "P256Kyber768"
  | "X25519Kyber512D"
  | "X25519Kyber768"
  | "X25519Kyber768Old"
  | "X25519MLKEM768";

export type CertCompressionAlgorithm =
  | "zlib"
  | "brotli"
  | "zstd";
