import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Game, allEquipments } from "./game";

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

  render() {
    return html`
      <div class="root">
        <div class="click-container box" @click=${this.onClick}>
          <div class="total-coins">Coins: ${this.game.getTotalCoins(true)}</div>
          <div class="total-coins">(CPS: ${this.game.cps})</div>
        </div>
        <div class="equipment-shop box">
          ${allEquipments.map((equipment) => {
            const num = this.game.getEquipmentCount(equipment.name);
            const canBuy = this.game.canBuy(equipment.name);
            const canBuy10 = this.game.canBuy(equipment.name, 10);
            const label =
              num > 0 ? `${equipment.name}(${num})` : `${equipment.name}`;
            return html`
              <div class="equipment-row">
                ${label}:
                <button
                  ?disabled=${!canBuy}
                  @click=${() => this.game.buy(equipment.name, 1)}
                >
                  x1
                  (${this.game
                    .getEquipmentPrice(equipment.name)
                    ?.toScientificString()})
                </button>
                <button
                  ?disabled=${!canBuy10}
                  @click=${() => this.game.buy(equipment.name, 10)}
                >
                  x10
                  (${this.game
                    .getBuyNPrice(equipment.name, 10)
                    ?.toScientificString()})
                </button>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  static styles = css`
    .root {
      display: flex;
      gap: 4px;
      user-select: none;
    }

    .box {
      width: 300px;
      height: 300px;
      background-color: #eee;
      padding: 10px;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid transparent;
    }

    .click-container {
      border: 1px solid #ccc;
    }

    .click-container:active {
      background-color: #ccc;
    }

    .total-coins {
      font-size: 24px;
      pointer-events: none;
    }

    .equipment-shop {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .equipment-row {
      display: flex;
      gap: 4px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "idle-game": IdleGame;
  }
}
