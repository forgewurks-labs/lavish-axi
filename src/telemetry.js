// Local-only fork: the telemetry HTTP transport has been removed entirely. No usage
// data ever leaves the machine. The exported API surface (resolveTelemetryConfig,
// createTelemetryClient, initDefaultTelemetry, getDefaultTelemetry, track/pageview/close)
// is preserved so callers in cli.js need no changes, but every client is a noop and
// telemetry is unconditionally disabled.

export function resolveTelemetryConfig(_input = undefined) {
  return { enabled: false, host: "", websiteID: "" };
}

export function createTelemetryClient(_config = undefined) {
  return new NoopTelemetryClient();
}

let defaultClient = null;

export function initDefaultTelemetry(_init = undefined) {
  defaultClient = new NoopTelemetryClient();
  return defaultClient;
}

export function getDefaultTelemetry() {
  return defaultClient || new NoopTelemetryClient();
}

export function resetDefaultTelemetryForTests() {
  defaultClient = null;
}

class NoopTelemetryClient {
  track(_name = undefined, _fields = undefined) {}

  pageview(_path = undefined, _fields = undefined) {}

  async close(_timeoutMs = undefined) {}
}
