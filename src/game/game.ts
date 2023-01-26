import { bigNumber, BigNumber } from "../lib/BigNumber";
import { GameLoop } from "./game-loop";

export interface Equipment {
  name: string;
  baseCost: BigNumber;
  cps: BigNumber;
  icon: string;
}

export const allEquipments: Equipment[] = [
  {
    name: "sword",
    baseCost: bigNumber(6n),
    cps: bigNumber("0.1"),
    icon: "⚔️",
  },
  {
    name: "shield",
    baseCost: bigNumber(50n),
    cps: bigNumber(1n),
    icon: "🛡️",
  },
  {
    name: "armor",
    baseCost: bigNumber(750n),
    cps: bigNumber(8n),
    icon: "👕",
  },
  {
    name: "helmet",
    baseCost: bigNumber(16000n),
    cps: bigNumber(47n),
    icon: "👒",
  },
  {
    name: "boots",
    baseCost: bigNumber(120000n),
    cps: bigNumber(500n),
    icon: "👢",
  },
  {
    name: "ring",
    baseCost: bigNumber(1200000n),
    cps: bigNumber(4000n),
    icon: "💍",
  },
  {
    name: "dagger",
    baseCost: bigNumber(14000000n),
    cps: bigNumber(35000n),
    icon: "🗡️",
  },
  {
    name: "axe",
    baseCost: bigNumber(580000000n),
    cps: bigNumber(16000n),
    icon: "🪓",
  },
  {
    name: "magic stuff",
    baseCost: bigNumber(5400000000n),
    cps: bigNumber(1020000),
    icon: "🪄",
  },
  {
    name: "bow",
    baseCost: bigNumber(330000000000n),
    cps: bigNumber(29600000),
    icon: "🏹",
  }
];

class Game {
  fps = 30;
  loop = new GameLoop(this.fps);

  // user status that will be saved
  status = {
    equipments: {} as Record<string, number>,
    coins: bigNumber(0n),
    timestamp: Date.now(),
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
      if (this.status.timestamp) {
        const timediff = Date.now() - this.status.timestamp;
        // add offline coins
        this.status.coins = this.status.coins.add(
          bigNumber(timediff).multiply(this.cps).divide(bigNumber(1000))
        );
      }
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
    return equipment.baseCost.multiply(bigNumber(1.5 ** existing));
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
        this.status.timestamp = Date.now();
        if (this.loop.currentTick % 60 === 0) {
          this.save();
        }
      }
    });
    return;
  }
}

export { Game };
