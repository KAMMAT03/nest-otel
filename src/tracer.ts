import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';

// Configure trace exporter - use console for development debugging
const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    'http://localhost:4318/v1/traces',
  headers: {},
});
const debugExporter = new ConsoleSpanExporter();

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'nest-otel',
  [ATTR_SERVICE_VERSION]: '1.0',
});

const spanProcessor = new BatchSpanProcessor(
  // new OTLPTraceExporter({
  //   url: 'http://localhost:4318/v1/traces',
  // }),
  traceExporter,
  {
    maxQueueSize: 5000,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 300,
  },
);

// Create SDK instance with comprehensive configuration
const sdk = new NodeSDK({
  resource,
  traceExporter,
  spanProcessor,
  instrumentations: [
    new HttpInstrumentation({
      requireParentforOutgoingSpans: false,
    }),

    new NestInstrumentation(),
    getNodeAutoInstrumentations({
      // Disable instrumentations that might cause issues
      '@opentelemetry/instrumentation-fs': { enabled: false },
      // Configure HTTP instrumentation for better trace context
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
          // Ignore health check endpoints
          return (
            req.url?.includes('/health') ||
            req.url?.includes('/metrics') ||
            false
          );
        },
      },
    }),
  ],
});

export default sdk;
