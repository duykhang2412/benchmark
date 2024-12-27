import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { get as lodashGet, has as lodashHas, merge, set } from 'lodash';
import { resolve } from 'path';

function loadFromEnv(
  env: Record<string, string | undefined>,
  { delimiter = '__' } = {},
): Record<string, string> {
  return Object.entries(process.env).reduce((acc, [key, value]) => {
    set(acc, key.toLowerCase().replace(delimiter, '.'), value);
    return acc;
  }, {});
}

function loadFromYaml(env = 'development'): Record<string, unknown> {
  const configFile = `env.${env}.yaml`;
  const configPath = resolve(process.cwd(), configFile);

  return yaml.load(readFileSync(configPath, 'utf8')) as Record<string, unknown>;
}

export function loadConfiguration(): Record<string, unknown> {
  const fromYaml = loadFromYaml(process.env.NODE_ENV);
  const fromProcess = loadFromEnv(process.env);

  return merge(fromYaml, fromProcess);
}

export class ConfigService {
  internalConfig: Record<string, any>;
  constructor(internalConfig: Record<string, any>) {
    this.internalConfig = internalConfig;
  }

  get<T>(propertyPath: string, defaultValueOrOptions?: T): T {
    const isHasProperty = lodashHas(this.internalConfig, propertyPath);

    if (isHasProperty) {
      return lodashGet(this.internalConfig, propertyPath);
    } else {
      if (defaultValueOrOptions) {
        return defaultValueOrOptions;
      }
    }

    return undefined as T;
  }

  getOrThrow<T>(propertyPath: string, defaultValueOrOptions?: T): T {
    const value = this.get(propertyPath, defaultValueOrOptions);

    if (value === undefined) {
      throw new TypeError(`Configuration key "${propertyPath}" does not exist`);
    }

    return value;
  }
}

export const CONFIG_INSTANCE = new ConfigService(loadConfiguration());
