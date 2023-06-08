# Circom libraries

## Circomlib

### LessThan

```js
pragma circom 2.0.0;
include "bitify.circom";

template LessThan(n) {
    assert(n <= 252);
    signal input in[2];
    signal output out;

    component n2b = Num2Bits(n+1);

    n2b.in <== in[0]+ (1<<n) - in[1];

    out <== 1-n2b.out[n];
}
```

Walk through the circuit and understand how it works, with `n = 32, in[0] = 2, and in[1] = 3`

- The `assert(n <= 252)` condition is satisfied because n = 32 < 252

- `in[0] + (1<<n) - in[1] = 2 + (1<<32) - 3` = `(2 + 4294967296 - 3)` = `4294967295`
  - `1<<n`: represents a bitwise left shift operation, where 1 is shifted n positions to the left. E.g. 1 << 3 = 1000 in binary
- `component n2b = Num2Bits(33)`
  - n2b.in = 4294967295
  - n2b.out is the 33 bits binary representation of 429496729
- `out <== 1-n2b.out[n];` output of the circuit is the last bit of n2b.out, which is 0 if in[0] < in[1], otherwise 1.

## [circomlib-matrix](https://github.com/socathie/circomlib-matrix) with puzzle
