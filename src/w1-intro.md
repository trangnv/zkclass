# Week 1

## `hello_world.circom`

The simple circuit that checks that `c` is the multiplication of `a` and `b`.

```js
pragma circom 2.0.0;

/*This circuit template checks that c is the multiplication of a and b.*/

template Multiplier2 () {

   // Declaration of signals.
   signal input a;
   signal input b;
   signal output c;

   // Constraints.
   c <== a * b;
}

component main = Multiplier2();
```

### Compilation

#### R1CS info

### Trusted setup in Groth16

### Verification key

The above steps haven't done anything with proof generation.

## `Multiplier3.circom`

An important restriction on circom circuits:

```js

```
