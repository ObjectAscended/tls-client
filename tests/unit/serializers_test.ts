import { assertEquals } from "@std/assert";
import {
  createCString,
  encodeJsonToCString,
} from "../../src/utils/serializers.ts";

Deno.test("createCString - should append null terminator", () => {
  const input = "hello";
  const result = createCString(input);

  // "hello" is 5 bytes + 1 null terminator = 6
  assertEquals(result.length, 6);
  assertEquals(result[5], 0);

  const decoder = new TextDecoder();
  assertEquals(decoder.decode(result.slice(0, 5)), "hello");
});

Deno.test("encodeJsonToCString - should serialize object and append null terminator", () => {
  const input = { foo: "bar" };
  const result = encodeJsonToCString(input);

  const expectedJson = JSON.stringify(input);
  const decoder = new TextDecoder();

  if (result === null) {
    throw new Error("Result should not be null");
  }

  assertEquals(result[result.length - 1], 0);
  assertEquals(decoder.decode(result.slice(0, -1)), expectedJson);
});

Deno.test("encodeJsonToCString - should return null for undefined", () => {
  const result = encodeJsonToCString(undefined);
  assertEquals(result, null);
});
