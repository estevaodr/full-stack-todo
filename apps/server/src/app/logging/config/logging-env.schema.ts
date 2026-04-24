import * as Joi from 'joi';

/** Joi fragment for NODE_ENV / LOG_FORMAT / LOG_LEVEL — shared by AppModule and tests. */
export const loggingEnvSchemaFragment = {
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  LOG_FORMAT: Joi.string()
    .trim()
    .allow('')
    .default('auto')
    .custom((val: unknown, helpers: Joi.CustomHelpers) => {
      const raw = String(val ?? '').trim();
      if (raw === '') return 'auto';
      const lower = raw.toLowerCase();
      if (!['json', 'pretty', 'auto'].includes(lower)) {
        return helpers.error('any.invalid');
      }
      return lower;
    }),
  LOG_LEVEL: Joi.string()
    .trim()
    .lowercase()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .default('info'),
};
