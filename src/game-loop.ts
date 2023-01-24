import { Signal } from "./signal";

type GameLoopEvent = "start" | "tick" | "stop";

// from https://github.com/sergiss/game-loop.js
export class GameLoop {
  stepTime: number;
  accum: number = 0;
  startTime: number = 0;
  signal = new Signal<GameLoopEvent>();
  running = false;

  constructor(fps = 60) {
    this.stepTime = 1 / fps; // set step time from fps
  }

  start = () => {
    if (!this.running) {
      // if is stopped
      this.running = true; // set running
      this.accum = 0; // clear accumulated time
      this.startTime = performance.now(); // clear start time
      this.signal.emit("start"); // emit start event
      requestAnimationFrame(this.step); // start loop
    }
  };

  stop = () => {
    this.running = false; // set stopped
    this.signal.emit("stop"); // emit stop event
  };

  step = () => {
    if (this.running) {
      // check if is running
      const time = performance.now(); // get current time
      const diff = time - this.startTime; // compute time of previous step
      requestAnimationFrame(this.step); // request next step
      this.startTime = time; // set start time
      this.accum += diff / 1000; // accumulate time
      // iterate as long as the accumulated time is greater than step time
      while (this.accum >= this.stepTime) {
        this.accum -= this.stepTime; // decrease accumulated time
        this.signal.emit("tick"); // emit tick event
      }
    }
  };
}
