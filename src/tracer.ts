import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { credentials } from '@grpc/grpc-js';
import * as fs from 'fs';
import * as path from 'path';

// Load TLS certificates
const certsPath = process.env.CERTS_PATH || '/home/kmatuszewski/studia/inz/projekt/certs';

const rootCert = fs.readFileSync(path.join(certsPath, 'ca/ca.crt'));

// For mTLS (optional - comment out if not using client certificates)
const clientCertPath = process.env.CLIENT_CERT_PATH;
const clientKeyPath = process.env.CLIENT_KEY_PATH;
if (!clientCertPath || !clientKeyPath) {
  throw new Error('CLIENT_CERT_PATH and CLIENT_KEY_PATH environment variables must be set for mTLS.');
}
const clientCert = fs.readFileSync(clientCertPath);
const clientKey = fs.readFileSync(clientKeyPath);

// Create TLS credentials
// Option 1: TLS only (server verification)
// const tlsCredentials = credentials.createSsl(rootCert);

// Option 2: mTLS (mutual authentication)
const tlsCredentials = credentials.createSsl(rootCert, clientKey, clientCert);

// Configure trace exporter with TLS
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'https://localhost:4317',
  credentials: tlsCredentials,
});

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'nest-otel',
  [ATTR_SERVICE_VERSION]: '1.0',
});

const spanProcessor = new BatchSpanProcessor(traceExporter, {
  maxQueueSize: 5000,
  maxExportBatchSize: 512,
  scheduledDelayMillis: 300,
});

// Create SDK instance
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
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        ignoreIncomingRequestHook: (req) => {
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
