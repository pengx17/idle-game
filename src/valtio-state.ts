import { proxy, subscribe } from "valtio/vanilla";
import type { ReactiveController, ReactiveControllerHost } from "lit";

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
class StateController<State extends Record<string, any>>
  implements ReactiveController
{
  private unsubscribe: () => void;

  constructor(private host: ReactiveControllerHost, public state: State) {
    this.unsubscribe = subscribe(state, () => this.host.requestUpdate());
    this.host.addController(this);
  }

  hostConnected() {
    this.host.requestUpdate();
  }

  hostDisconnected() {
    this.unsubscribe();
  }
}

/**
 * Syntactic sugar for only returning the state of the StateController
 */
function useState<State extends Record<string, any>>(
  host: ReactiveControllerHost,
  state: State
) {
  return new StateController(host, state).state;
}

export { proxy as defineState, StateController, useState };
