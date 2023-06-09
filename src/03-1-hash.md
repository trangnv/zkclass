# Hash functions benchmarking

_Some hash functions are more SNARK friendly than others, but_

- [Implementations](https://github.com/trangnv/zkclass/tree/main/code/zku/week2/circuits) of hash functions written in circom, including: keccak, mimc, pedersen, poseidon, sha256.

|                  | keccak | sha256 | pedersen | mimc | poseidon |
| ---------------- | ------ | ------ | -------- | ---- | -------- |
| # of constraints | 151357 | 29891  | 964      | 660  | 213      |
