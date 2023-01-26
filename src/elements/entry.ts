import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { Game, allEquipments, Equipment } from "../game";
import { bigNumber } from "../lib/BigNumber";

const renderTopMid = (game: Game) => {
  return html`<div class="top-mid">
    <div class="total-coins">${game.getTotalCoins(true)} 🍪</div>
    <div class="coins-per-second">
      ${game.cps.toScientificString()} cookies/s
    </div>
  </div>`;
};

const renderEquipment = (
  game: Game,
  equipment: Equipment,
  buyCount: number
) => {
  const levels = game.getEquipmentCount(equipment.name);
  const canBuy = game.canBuy(equipment.name, buyCount);
  return html`<div class="equipment-row">
    <div class="equipment-icon">${equipment.icon}</div>
    <div class="equipment-label">
      ${when(
        levels > 0,
        () => html`<div class="equipment-levels">L${levels}</div>`
      )}
      <div class="equipment-name">${equipment.name}</div>
    </div>
    <div class="equipment-cps">
      ${when(
        levels > 0,
        () =>
          html`
            <div>
              +${equipment.cps.multiply(bigNumber(levels)).toScientificString()}
              🍪
            </div>
            <div>cookies/s</div>
          `
      )}
    </div>
    <button
      ?disabled=${!canBuy}
      @click=${() => game.buy(equipment.name, buyCount)}
    >
      <div>Buy ${buyCount}</div>
      <div>
        ${game.getBuyNPrice(equipment.name, buyCount)?.toScientificString()} 🍪
      </div>
    </button>
  </div>`;
};

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("idle-game")
export class IdleGame extends LitElement {
  game = new Game();

  connectedCallback() {
    super.connectedCallback();
    this.game.start();
    this.game.onTick(() => {
      this.requestUpdate();
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.game.stop();
  }

  private onClick() {
    this.game.incr();
  }

  @property()
  buyCount = 1;

  render() {
    return html`
      <div class="root">
        <div @click=${this.onClick} class="background"></div>
        ${renderTopMid(this.game)}
        <div class="equipment-shop">
          <div class="equipment-rows">
            ${repeat(
              allEquipments,
              (e) => e.name,
              (e) => renderEquipment(this.game, e, this.buyCount)
            )}
          </div>
          <div class="buy-count-row">
            <div class="buy-count-row-hint">Number to buy</div>
            ${map([1, 10, 50], (v) => {
              return html`<button
                class="buy-count-button"
                ?active=${v === this.buyCount}
                @click=${() => (this.buyCount = v)}
              >
                ${v}
              </button>`;
            })}
          </div>
        </div>
      </div>
    `;
  }

  static styles = css`
    * {
      transition: all 0.1s ease-in-out;
    }

    .root {
      position: relative;
      width: 100%;
      height: 100%;
      overscroll-behavior: none;
      user-select: none;
      font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
        "Lucida Sans", Arial, sans-serif;
    }

    button {
      font-family: inherit;
    }

    .background {
      position: absolute;
      z-index: 0;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      background-image: url("https://www.bing.com/th?id=OHR.ColleSantaLucia_ROW0255287036_1920x1080.jpg&rf=LaDigue_1920x1080.jpg");
    }

    .background:active {
      background-color: #eee;
    }

    .top-mid {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .total-coins {
      font-size: 24px;
    }

    .coins-per-second {
      font-size: 14px;
    }

    .equipment-shop {
      position: absolute;
      display: flex;
      top: 12px;
      right: 32px;
      bottom: 12px;
      width: 360px;
      flex-direction: column;
      align-items: flex-start;
      border: 12px solid gold;
      background-color: #eee;
    }

    .equipment-rows {
      position: relative;
      overflow-y: auto;
      height: 100%;
      width: 100%;
    }

    .equipment-cps {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }

    .buy-count-row {
      position: sticky;
      bottom: 0;
      display: flex;
      align-items: center;
      background-color: #555;
      width: 100%;
    }

    .buy-count-row-hint {
      color: #eee;
      padding: 0 24px;
      flex: 1;
    }

    button.buy-count-button {
      border: 1px solid #888;
      font-size: 18px;
      width: 48px;
      padding: 8px 0;
      background-color: #aaa;
    }

    button.buy-count-button[active] {
      background-color: #eee;
    }

    .equipment-row {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 8px 16px;
    }

    .equipment-row {
      border-bottom: 1px solid #888;
    }

    .equipment-row button {
      display: flex;
      background: green;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      border: none;
      padding: 8px 16px;
    }

    .equipment-row button:disabled {
      background: #b92a2a;
    }

    .equipment-icon {
      font-size: 64px;
    }

    .equipment-label {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      font-weight: 700;
    }

    .equipment-name {
      text-transform: capitalize;
      font-size: 16px;
    }

    .equipment-levels {
      flex: 1;
      font-size: 20px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "idle-game": IdleGame;
  }
}
