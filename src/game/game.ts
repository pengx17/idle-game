import { bigNumber, BigNumber } from "../lib/BigNumber";
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
  {
    name: "helmet",
    baseCost: bigNumber(10000n),
    cps: bigNumber(47n),
  },
  {
    name: "boots",
    baseCost: bigNumber(120000n),
    cps: bigNumber(260n),
  },
  {
    name: "gloves",
    baseCost: bigNumber(1400000n),
    cps: bigNumber(1400n),
  },
];

class Game {
  fps = 60;
  loop = new GameLoop(this.fps);

  // user status that will be saved
  status = {
    equipments: {} as Record<string, number>,
    coins: bigNumber(0n),
  };

  constructor() {
    this.load();
  }

  save = () => {
    localStorage.setItem(
      "game-save",
      JSON.stringify(this.status, (key, value) => {
        if (key === "coins") {
          return value.toString();
        }
        return value;
      })
    );
  };

  load = () => {
    const save = localStorage.getItem("game-save");
    if (save) {
      this.status = JSON.parse(save, (key, value) => {
        if (key === "coins") {
          return bigNumber(value);
        }
        return value;
      });
    }
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
    this.save();
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
    this.status.equipments[name] = existing + n;
    this.save();
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
        if (this.loop.currentTick % 60 === 0) {
          this.save();
        }
      }
    });
    return;
  }
}

export { Game };
