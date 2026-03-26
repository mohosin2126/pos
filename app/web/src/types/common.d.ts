declare module "locomotive-scroll" {
  export interface ILocomotiveScrollOptions {
    el?: HTMLElement;
    smooth?: boolean;
    [key: string]: any;
  }

  export default class LocomotiveScroll {
    constructor(options?: ILocomotiveScrollOptions);
    destroy(): void;
    update(): void;
    start(): void;
    stop(): void;
  }
}
