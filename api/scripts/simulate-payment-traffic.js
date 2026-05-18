const DEFAULT_API_BASE_URL = 'http://localhost:3000/api/v1';

const config = {
  apiBaseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
  token: process.env.TOKEN,
  email: process.env.AUTH_EMAIL,
  password: process.env.AUTH_PASSWORD,
  bookingId: process.env.BOOKING_ID,
  preferenceId: process.env.PREFERENCE_ID || `traffic-${Date.now()}`,
  requests: Number(process.env.REQUESTS || 50),
  concurrency: Number(process.env.CONCURRENCY || 10),
};

function requireValue(value, name) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

async function request(path, options = {}) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const body = await response.text();
  let json = null;
  try {
    json = body ? JSON.parse(body) : null;
  } catch {
    json = body;
  }

  return {
    ok: response.ok,
    status: response.status,
    body: json,
  };
}

async function getToken() {
  if (config.token) return config.token;

  const email = requireValue(config.email, 'AUTH_EMAIL');
  const password = requireValue(config.password, 'AUTH_PASSWORD');
  const response = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok || !response.body?.accessToken) {
    throw new Error(`Login failed with HTTP ${response.status}: ${JSON.stringify(response.body)}`);
  }

  return response.body.accessToken;
}

async function runWorker(workerId, token, results) {
  for (let i = workerId; i < config.requests; i += config.concurrency) {
    const started = performance.now();
    const response = await request('/payments/verify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        external_reference: config.bookingId,
        preference_id: config.preferenceId,
        collection_status: 'approved',
      }),
    });

    results.push({
      status: response.status,
      ok: response.ok,
      ms: performance.now() - started,
      body: response.body,
    });
  }
}

async function main() {
  requireValue(config.bookingId, 'BOOKING_ID');

  const token = await getToken();
  const workers = Math.min(config.concurrency, config.requests);
  const results = [];
  const started = performance.now();

  await Promise.all(
    Array.from({ length: workers }, (_, workerId) => runWorker(workerId, token, results)),
  );

  const elapsedMs = performance.now() - started;
  const latencies = results.map((result) => result.ms).sort((a, b) => a - b);
  const byStatus = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});
  const failures = results.filter((result) => !result.ok);

  const percentile = (p) => {
    if (latencies.length === 0) return 0;
    const index = Math.ceil((p / 100) * latencies.length) - 1;
    return latencies[Math.max(0, Math.min(index, latencies.length - 1))];
  };

  console.log(JSON.stringify({
    apiBaseUrl: config.apiBaseUrl,
    bookingId: config.bookingId,
    requests: config.requests,
    concurrency: workers,
    elapsedMs: Number(elapsedMs.toFixed(1)),
    requestsPerSecond: Number((results.length / (elapsedMs / 1000)).toFixed(2)),
    statusCodes: byStatus,
    latencyMs: {
      p50: Number(percentile(50).toFixed(1)),
      p95: Number(percentile(95).toFixed(1)),
      max: Number((latencies[latencies.length - 1] || 0).toFixed(1)),
    },
    failures: failures.slice(0, 5),
  }, null, 2));

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
