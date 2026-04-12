import {
  resolveFrontendRuntimeConfig,
  type FrontendRuntimeConfig,
} from './stacksConfig';

export function getFrontendRuntimeConfig(env: ImportMetaEnv = import.meta.env): FrontendRuntimeConfig {
  return resolveFrontendRuntimeConfig(env);
}
