import assert from "node:assert/strict";
import test from "node:test";

import {
  createTelemetryClient,
  getDefaultTelemetry,
  initDefaultTelemetry,
  resetDefaultTelemetryForTests,
  resolveTelemetryConfig,
} from "../src/telemetry.js";

// Local-only fork: the telemetry HTTP transport is removed, so these tests pin the
// contract that telemetry is unconditionally disabled and no client ever performs I/O.

test("telemetry config always resolves disabled", () => {
  assert.deepEqual(resolveTelemetryConfig(), { enabled: false, host: "", websiteID: "" });
  assert.deepEqual(
    resolveTelemetryConfig({
      env: {
        LAVISH_AXI_UMAMI_HOST: "https://env.example",
        LAVISH_AXI_UMAMI_WEBSITE_ID: "env-id",
      },
      buildHost: "https://build.example",
      buildWebsiteID: "build-id",
    }),
    { enabled: false, host: "", websiteID: "" },
  );
});

test("createTelemetryClient returns a noop client even for an enabled-looking config", () => {
  let fetchCalls = 0;
  const client = createTelemetryClient({
    enabled: true,
    host: "https://a.example.com",
    websiteID: "site-1",
    app: "lavish-axi",
    version: "1.2.3",
    fetch: async () => {
      fetchCalls += 1;
      return new Response(null, { status: 200 });
    },
  });

  client.track("command", { command: "poll", status: "success" });
  client.pageview("/poll", { command: "poll" });
  assert.equal(fetchCalls, 0);
});

test("noop client keeps the track/pageview/close API surface and never throws", async () => {
  const client = createTelemetryClient();

  assert.doesNotThrow(() => client.track("command", {}));
  assert.doesNotThrow(() => client.pageview("/home"));
  await assert.doesNotReject(() => client.close(500));
});

test("initDefaultTelemetry yields the shared noop client", async () => {
  resetDefaultTelemetryForTests();
  const client = initDefaultTelemetry({
    app: "lavish-axi",
    version: "1.2.3",
    platform: "darwin",
    arch: "arm64",
  });

  assert.equal(getDefaultTelemetry(), client);
  assert.doesNotThrow(() => client.track("command", { command: "open", status: "success" }));
  await assert.doesNotReject(() => client.close(1000));
  resetDefaultTelemetryForTests();
});
