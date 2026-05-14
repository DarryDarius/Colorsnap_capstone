import { ApiError } from '../utils/errors';

const parsePositiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parsePositiveNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const now = () => Date.now();

type CircuitState = 'closed' | 'open' | 'half_open';

type CircuitBreakerOptions = {
  failureThreshold: number;
  successThreshold: number;
  openDurationMs: number;
  rollingWindowMs: number;
  minimumRequests: number;
};

type CircuitEvent = {
  ok: boolean;
  timestamp: number;
};

class CircuitBreaker {
  private state: CircuitState = 'closed';
  private openedAt = 0;
  private halfOpenSuccesses = 0;
  private readonly events: CircuitEvent[] = [];

  constructor(private readonly options: CircuitBreakerOptions) {}

  beforeRequest() {
    if (this.state !== 'open') {
      return;
    }

    if (now() - this.openedAt >= this.options.openDurationMs) {
      this.state = 'half_open';
      this.halfOpenSuccesses = 0;
      return;
    }

    throw new ApiError(
      503,
      'AI_CIRCUIT_OPEN',
      'AI analysis is temporarily degraded because the upstream model service is unstable.'
    );
  }

  recordSuccess() {
    if (this.state === 'half_open') {
      this.halfOpenSuccesses += 1;

      if (this.halfOpenSuccesses >= this.options.successThreshold) {
        this.close();
      }

      return;
    }

    this.recordEvent(true);
  }

  recordFailure() {
    if (this.state === 'half_open') {
      this.open();
      return;
    }

    this.recordEvent(false);
    this.pruneEvents();

    if (this.events.length < this.options.minimumRequests) {
      return;
    }

    const failures = this.events.filter((event) => !event.ok).length;
    const failureRatio = failures / this.events.length;

    if (failureRatio >= this.options.failureThreshold) {
      this.open();
    }
  }

  getStatus() {
    this.pruneEvents();

    return {
      state: this.state,
      recent_requests: this.events.length,
      recent_failures: this.events.filter((event) => !event.ok).length,
      opened_at: this.openedAt ? new Date(this.openedAt).toISOString() : null
    };
  }

  private close() {
    this.state = 'closed';
    this.openedAt = 0;
    this.halfOpenSuccesses = 0;
    this.events.length = 0;
  }

  private open() {
    this.state = 'open';
    this.openedAt = now();
    this.halfOpenSuccesses = 0;
  }

  private recordEvent(ok: boolean) {
    this.events.push({ ok, timestamp: now() });
    this.pruneEvents();
  }

  private pruneEvents() {
    const cutoff = now() - this.options.rollingWindowMs;

    while (this.events[0] && this.events[0].timestamp < cutoff) {
      this.events.shift();
    }
  }
}

class Semaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly maxConcurrent: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      return await task();
    } finally {
      this.release();
    }
  }

  getStatus() {
    return {
      max_concurrent: this.maxConcurrent,
      active: this.active,
      queued: this.queue.length
    };
  }

  private acquire() {
    if (this.active < this.maxConcurrent) {
      this.active += 1;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active += 1;
        resolve();
      });
    });
  }

  private release() {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();

    if (next) {
      next();
    }
  }
}

const openAiSemaphore = new Semaphore(parsePositiveInteger(process.env.AI_OPENAI_MAX_CONCURRENCY, 3));
const openAiCircuitBreaker = new CircuitBreaker({
  failureThreshold: parsePositiveNumber(process.env.AI_CIRCUIT_FAILURE_RATIO, 0.5),
  successThreshold: parsePositiveInteger(process.env.AI_CIRCUIT_HALF_OPEN_SUCCESSES, 2),
  openDurationMs: parsePositiveInteger(process.env.AI_CIRCUIT_OPEN_MS, 60_000),
  rollingWindowMs: parsePositiveInteger(process.env.AI_CIRCUIT_WINDOW_MS, 120_000),
  minimumRequests: parsePositiveInteger(process.env.AI_CIRCUIT_MIN_REQUESTS, 6)
});

export const runOpenAiCall = async <T>(task: () => Promise<T>): Promise<T> => {
  return openAiSemaphore.run(async () => {
    openAiCircuitBreaker.beforeRequest();

    try {
      const result = await task();
      openAiCircuitBreaker.recordSuccess();
      return result;
    } catch (error) {
      openAiCircuitBreaker.recordFailure();
      throw error;
    }
  });
};

export const getAiResilienceStatus = () => ({
  openai_concurrency: openAiSemaphore.getStatus(),
  openai_circuit: openAiCircuitBreaker.getStatus()
});
