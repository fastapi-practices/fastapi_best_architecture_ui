import mitt from 'mitt';

type Events = {
  rowClick: number;
};

export const emitter = mitt<Events>();
