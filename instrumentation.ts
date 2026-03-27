import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { logs } from '@opentelemetry/api-logs'
import { resourceFromAttributes } from '@opentelemetry/resources'

// Helper to determine if we are in the build phase
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.CI === 'true';

// We export the provider but only configure processors if we are not in the build phase
// This prevents the build from hanging due to active background log processors
export const loggerProvider = new LoggerProvider({
  resource: resourceFromAttributes({ 'service.name': 'justanotherpanel' }),
  processors: isBuild ? [] : [
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: 'https://eu.i.posthog.com/i/v1/logs',
        headers: {
          Authorization: 'Bearer phc_7NyfE4swy1vFN1JI9TJyQTTQ1EhLFHjmhRwscwXpXWd',
          'Content-Type': 'application/json',
        },
      })
    ),
  ],
})

export function register() {
  // Only set the global provider if we are in the nodejs runtime and not building
  if (process.env.NEXT_RUNTIME === 'nodejs' && !isBuild) {
    logs.setGlobalLoggerProvider(loggerProvider)
  }
}
