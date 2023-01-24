import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { GameLoop } from "./game-loop";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("my-element")
export class MyElement extends LitElement {
  gameloop = new GameLoop(10);

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  loop = 0;

  @property()
  get styles() {
    return { color: this.gameloop.running ? "red" : "green" };
  }

  connectedCallback() {
    console.log('connected')
    super.connectedCallback();
    this.gameloop.signal.on(e => {
      if (e === "tick") {
        console.log('tick')
        this.loop ++
      } else {
        this.requestUpdate();
      }
    })
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.gameloop.stop();
    this.gameloop.signal.dispose();
  }

  _onClick() {
    if (this.gameloop.running) {
      this.gameloop.stop();
    } else {
      this.gameloop.start();
    }
    this.requestUpdate();
  }

  render() {
    return html`
      <button style=${styleMap(this.styles)} @click=${this._onClick}>
        loop is ${this.loop}
      </button>
    `;
  }

  static styles = css``;
}

declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
