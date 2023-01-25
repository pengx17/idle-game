import { bigNumber, BigNumber } from "./BigNumber";
import { GameLoop } from "./game-loop";

interface Equipment {
  name: string;
  baseCost: BigNumber;
  cps: BigNumber;
}

export const allEquipments: Equipment[] = [
  {
    name: "sword",
    baseCost: bigNumber(6n),
    cps: bigNumber("0.1"),
  },
  {
    name: "shield",
    baseCost: bigNumber(50n),
    cps: bigNumber(1n),
  },
  {
    name: "armor",
    baseCost: bigNumber(750n),
    cps: bigNumber(8n),
  },
];

class Game {
  fps = 60;
  loop = new GameLoop(this.fps);

  status = {
    equipments: {} as Record<string, number>,
    coins: bigNumber(0n),
  };

  get equipments() {
    return this.status.equipments;
  }

  // computed 10x coins per second
  get cps() {
    // todo: cache it or compute when equipments change
    return Object.entries(this.equipments).reduce((accum, [name, num]) => {
      const equipment = allEquipments.find((e) => e.name === name);
      if (equipment) {
        return accum.add(equipment.cps.multiply(bigNumber(num)));
      }
      return accum;
    }, bigNumber(0n));
  }

  // coins per tick
  get cpt() {
    return this.cps.divide(bigNumber(this.fps));
  }

  getTotalCoins(scientific = false) {
    return scientific
      ? this.status.coins.toScientificString()
      : this.status.coins.toString();
  }

  start = () => {
    this.loop.start();
    this.onTick(() => {
      this.status.coins = this.status.coins.add(this.cpt);
    });
  };

  stop = () => {
    this.loop.stop();
  };

  incr = () => {
    this.status.coins = this.status.coins.add(
      this.cps.lte(bigNumber(1n)) ? bigNumber(1n) : this.cps
    );
  };

  running = () => {
    return this.loop.running;
  };

  getEquipmentCount(name: string) {
    return this.status.equipments[name] ?? 0;
  }

  getEquipmentPrice(name: string, existing = this.getEquipmentCount(name)) {
    const equipment = allEquipments.find((e) => e.name === name);
    if (!equipment) {
      return;
    }
    return equipment.baseCost.multiply(bigNumber(1.15 ** existing));
  }

  canBuy(name: string, n = 1) {
    const price = this.getBuyNPrice(name, n);
    return price ? this.status.coins.gte(price) : false;
  }

  buy(name: string, n = 1) {
    const price = this.getBuyNPrice(name, n);
    if (!this.canBuy(name) || !price) {
      return;
    }
    this.status.coins = this.status.coins.subtract(price);
    const existing = this.status.equipments[name] ?? 0;
    this.status.equipments[name] = existing + 1;
  }

  getBuyNPrice(name: string, n: number) {
    let totalPrice = bigNumber(0);
    for (let i = 0; i < n; i++) {
      const price = this.getEquipmentPrice(
        name,
        i + this.getEquipmentCount(name)
      );
      if (!price) {
        break;
      }
      totalPrice = totalPrice.add(price);
    }
    return totalPrice;
  }

  onTick(cb: () => void) {
    this.loop.signal.on((e) => {
      if (e === "tick") {
        cb();
      }
    });
    return;
  }
}

export { Game };
