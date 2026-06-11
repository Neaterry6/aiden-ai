export interface RuntimeConfig {
  vision: boolean;

  audio: boolean;

  groups: boolean;

  dms: boolean;

  toolCreation: boolean;

  selfImprovement: boolean;
}

export const config: RuntimeConfig = {
  vision: true,

  audio: true,

  groups: true,

  dms: true,

  toolCreation: false,

  selfImprovement: false,
};

export default config;
