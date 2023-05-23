export class ConcurrencyBarrier {
  #pool: Array<() => void> = [];
  #cursor = 0;

  #processing = 0;

  #endPr: Promise<void>;
  #endResolve: () => void;

  constructor(private readonly concurrency: number) {
    this.#endPr = new Promise((resolve) => (this.#endResolve = resolve));
  }

  wait() {
    if (++this.#processing <= this.concurrency) {
      return Promise.resolve();
    }

    if (this.#pool.length > 1000) {
      this.#pool.splice(0, this.#cursor);
      this.#cursor = 0;
    }

    return new Promise<void>((res) => {
      this.#pool.push(res);
    });
  }

  release() {
    if (this.#processing <= 0) {
      throw new Error('Nothing to release');
    }
    if (--this.#processing === 0) {
      this.#endResolve();
    } else if (this.#pool.length > this.#cursor) {
      this.#pool[this.#cursor++]();
    }
  }

  finish() {
    return this.#endPr;
  }
}

// const barrier = new ConcurrencyBarrier(4);
// barrier.finish().then(() => console.log('OPA'));
// function* gen(size = 100) {
//   for (let index = 0; index < size; index++) {
//     yield index;
//   }
// }

// (async () => {
//   for await (const val of gen(50)) {
//     await barrier.wait();

//     new Promise<void>((res) =>
//       setTimeout(() => {
//         console.log('PROCESS', val);
//         res();
//       }, 1000),
//     ).then(() => barrier.release());
//   }
//   console.log('FINISHED');
// })();
