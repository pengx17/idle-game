import type { ReactiveController, ReactiveControllerHost } from "lit";
import { Signal } from "./signal";

/**
 * https://github.com/Julien-R44/lit-valtio-state/blob/main/src/index.ts
 *
 * Simple state management system based on Lit Controllers
 * and Valtio ( proxy based store )
 *
 * Usage ( in Lit Element Class context ) :
 *
 * ```ts
 * sc = new StateController(this, defineState({ count: 10, text: 'hello' }))
 * ```
 */
class StateController<T, S extends Signal<T>> implements ReactiveController {
  private unsubscribe: () => void;

  constructor(private host: ReactiveControllerHost, public signal: S) {
    const { dispose } = signal.on(() => this.host.requestUpdate());
    this.unsubscribe = dispose;
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
  }

  hostDisconnected() {
    this.unsubscribe();
  }
}

export { StateController };
