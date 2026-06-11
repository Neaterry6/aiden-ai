export interface RuntimeState {
  startedAt: number;

  ready: boolean;

  maintenance: boolean;

  activeProvider: string;

  activeModel: string;
}

export const runtime: RuntimeState = {
  startedAt: Date.now(),

  ready: false,

  maintenance: false,

  activeProvider: "",

  activeModel: "",
};

export default runtime;
