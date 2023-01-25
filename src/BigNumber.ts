import { assert } from "./assert";

export class BigNumber {
  private constructor(
    private readonly value: bigint,
    /**
     * The scale is the number of digits after the decimal point.
     */
    private readonly scale: number
  ) {}

  static fromString(str: string, scale = 16): BigNumber {
    const [int, frac] = str.split(".");
    let value = BigInt(int) * BigInt(10 ** scale);
    if (frac) {
      value += BigInt(frac.slice(0, scale).padEnd(scale, "0"));
    }
    return new BigNumber(value, scale);
  }

  private get multiplier(): bigint {
    return BigInt(10 ** this.scale);
  }

  multiply(other: BigNumber): BigNumber {
    assert(this.scale === other.scale, "scale mismatch");
    return new BigNumber(
      (this.value * other.value) / this.multiplier,
      this.scale
    );
  }

  divide(other: BigNumber): BigNumber {
    assert(this.scale === other.scale, "scale mismatch");
    return new BigNumber(
      (this.value * this.multiplier) / other.value,
      this.scale
    );
  }

  add(other: BigNumber): BigNumber {
    assert(this.scale === other.scale, "scale mismatch");
    return new BigNumber(this.value + other.value, this.scale);
  }

  subtract(other: BigNumber): BigNumber {
    assert(this.scale === other.scale, "scale mismatch");
    return new BigNumber(this.value - other.value, this.scale);
  }

  lte(other: BigNumber): boolean {
    assert(this.scale === other.scale, "scale mismatch");
    return this.value <= other.value;
  }

  gte(other: BigNumber): boolean {
    assert(this.scale === other.scale, "scale mismatch");
    return this.value >= other.value;
  }

  toString(): string {
    const str = this.value.toString();
    const len = str.length;
    if (len <= this.scale) {
      const pad = "0".repeat(this.scale - len);
      const decimal = `${pad}${str}`;
      return `0.${decimal.slice(0, 2)}`;
    }
    const before = str.slice(0, len - this.scale);
    const after = str.slice(before.length, before.length + 2);
    return `${before}.${after}`;
  }

  toScientificString(): string {
    if (this.value <= this.multiplier * 1000n) {
      return this.toString();
    }
    const int = this.value / this.multiplier;
    const str = int.toString();
    const e = str.length - 1;
    const frac = str.slice(1);
    return `${str[0]}.${frac}e${e}`;
  }
}

export function bigNumber(v: number | bigint | string): BigNumber {
  return BigNumber.fromString(v.toString());
}

if (import.meta.vitest) {
  const { it, expect, describe } = import.meta.vitest;

  describe("BigNumber", () => {
    it("toString", () => {
      expect(bigNumber("0.01").toString()).toBe("0.01");
      expect(bigNumber(12345n).toString()).toBe("12345.00");
    });

    it("decimal", () => {
      expect(bigNumber("12345").toString()).toBe("12345.00");
      expect(bigNumber("12345.6").toString()).toBe("12345.60");
      expect(bigNumber("12345.6789").toString()).toBe("12345.67");
    });

    it("should multiply", () => {
      expect(bigNumber(123n).multiply(bigNumber(4n)).toString()).toBe("492.00");
      expect(bigNumber(123n).multiply(bigNumber(123n)).toString()).toBe(
        "15129.00"
      );
    });

    it("should divide", () => {
      expect(bigNumber(123123123n).divide(bigNumber(2n)).toString()).toBe(
        "61561561.00"
      );
    });

    it("should add", () => {
      expect(bigNumber(1n).add(bigNumber(2n)).toString()).toBe("3.00");
    });

    it("should subtract", () => {
      expect(bigNumber(2n).subtract(bigNumber(1n)).toString()).toBe("1.00");
    });

    it("should convert to scientific string", () => {
      expect(bigNumber(123n).toScientificString()).toBe("123.00");
      expect(bigNumber(1234n).toScientificString()).toBe("1.234e3");
    });
  });
}
