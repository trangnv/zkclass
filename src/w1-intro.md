# Getting started with circom

[Circom](https://docs.circom.io/getting-started/installation/): Circuit Compiler

## 1. Compilation

`hello_world.circom`: the simple circuit that checks that `c` is the multiplication of `a` and `b`.

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

To compile:

```bash
cd code/week1/circuits
circom hello_world.circom --r1cs --wasm --sym -o hello_world
```

That will generate

- `hello_world.r1cs` contains the constraints of the circuit in binary format, it's like a representation of the circuit.
- `hello_world.sym`
- `hello_world_js` dir contains Wasm code and other files needed to generate the witness.

### R1CS info

To print the R1CS info, run the following command:

```bash
snarkjs r1cs info hello_world/hello_world.r1cs

[INFO]  snarkJS: Curve: bn-128
[INFO]  snarkJS: # of Wires: 4
[INFO]  snarkJS: # of Constraints: 1
[INFO]  snarkJS: # of Private Inputs: 2
[INFO]  snarkJS: # of Public Inputs: 0
[INFO]  snarkJS: # of Labels: 4
[INFO]  snarkJS: # of Outputs: 1
```

## 2. Trusted setup and verification key generation in Groth16

### Phase 1, start a new powers of tau ceremony

```bash
snarkjs powersoftau new bn128 14 pot14_0000.ptau -v
```

The parameter after `new` indicates type of curve you wish to use, in this case `bn128`. At the moment, `bn128` and `bls12-381` are supported.

The parameter `14` indicates the size of the ceremony, in this case is 2^14 = 16384. The maximum value supported here is 28, which means you can use snarkjs to securely generate zk-snark parameters for circuits with up to 2 ^ 28 (≈268 million) constraints.

But you dont usually generate this by yourself. There are a trusted setup ceremonies done by the community and ready to be used, you can find them for example [powersOfTau28_hez_final_10](https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau) or [here](https://storage.googleapis.com/trustedsetup-a86f4.appspot.com/semaphore/semaphore_top_index.html)

### Phase 2

Because Groth16 protocol requires **circuit-specific** setup, after having the `ptau` file, we need to run the phase 2 of the ceremony to generate the `final zkey` file.

- Start new zkey

```bash
snarkjs groth16 setup hello_world/hello_world.r1cs powersOfTau28_hez_final_10.ptau hello_world/circuit_0000.zkey
```

- Contribute to the phase 2 of the ceremony:

```bash
snarkjs zkey contribute hello_world/circuit_0000.zkey hello_world/circuit_final_g16.zkey --name="1st Contributor Name"
```

- Get a verification key in json format

```bash
snarkjs zkey export verificationkey hello_world/circuit_final_g16.zkey hello_world/verification_key_g16.json
```

- To see more information about the zkey file:

```bash
snarkjs zkej hello_world/circuit_final_g16.zkey hello_world/circuit_final_g16.zkey.json
```

## 3. Some restriction on circom circuits

While circom allows writing the constraints that define the arithmetic circuit, all constraints must be quadratic of the form `A*B + C = 0`, where A, B and C are linear combinations of signals.

- Linear expression: an expression where only addition is used. It can also be written using multiplication of variables by constants. E.g. `2*x + 3*y + 2` is allowed, as it is equivalent to `x + x + y + y + y + 2`

- Quadratic expression: it is obtained by allowing a multiplication between two linear expressions and addition of a linear expression: A*B - C, where A, B and C are linear expressions. E.g. `(2*x + 3*y + 2) * (x+y) + 6\*x + y – 2`

- As the result, `c <== a + b` is not a constraint. `d <== a * b * c` is not allowed.

## 4. PLONK vs Groth16

- As oppose to Groth16, PLONK does not require **circuit-specific** trusted setup. Recall in Groth16, we need to run the phase 2 of the ceremony to generate the `final zkey` file, we dont need that in PLONK, we can use the same `universal setup` for all circuits. This is a huge advantage of PLONK over Groth16.

```bash
# Generate the verification key
snarkjs plonk setup hello_world/hello_world.r1cs powersOfTau28_hez_final_10.ptau hello_world/circuit_final_plonk.zkey
# Get a verification key in json format
snarkjs zkey export verificationkey hello_world/circuit_final_plonk.zkey hello_world/verification_key_plonk.json
```

- But there is a tradeoff, **Proof size**

- Run these commands to generate proof in Groth16 and PLONK

```bash
# witness generation
node hello_world/hello_world_js/generate_witness.js hello_world/hello_world_js/hello_world.wasm hello_world/input.json hello_world/witness.wtns

# proof generation groth16
snarkjs groth16 prove hello_world/circuit_final_g16.zkey hello_world/witness.wtns hello_world/proof_g16.json hello_world/public_g16.json

# proof generation plonk
snarkjs plonk prove hello_world/circuit_final_plonk.zkey hello_world/witness.wtns hello_world/proof_plonk.json hello_world/public_plonk.json
```

- **Comparison**: Proof size of Groth16 is 803 bytes, while PLONK is 2 KB.

## 5. Testing circuits

### Verifying with snarkjs CLI

```bash
snarkjs groth16 verify hello_world/verification_key_g16.json hello_world/public_g16.json hello_world/proof_g16.json
[INFO]  snarkJS: OK!

snarkjs plonk verify hello_world/verification_key_plonk.json hello_world/public_plonk.json hello_world/proof_plonk.json
[INFO]  snarkJS: OK!
```

### Verifying with smart contract

The verifier can be a smart contract, so we can use existing framework to test the circuits.

To export the verifier smart contract:

```bash
# groth16
snarkjs zkey export solidityverifier hello_world/circuit_final_g16.zkey ../verifier_contracts/contracts/hello_world_g16.sol
```

Now move to `verifier_contracts` dir and run some unit tests for our verifier/circuits:

```bash
cd ../verifier_contracts
npm install
npx hardhat test
```

### Running time of unit tests

## 6. Circom library

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

Try to walk through the circuit and understand how it works, with `n = 32, in[0] = 2, and in[1] = 3`

- The `assert(n <= 252)` condition is satisfied because n = 32 < 252

- `in[0] + (1<<n) - in[1] = 2 + (1<<32) - 3` = `(2 + 4294967296 - 3)` = `4294967295`
  - `1<<n`: represents a bitwise left shift operation, where 1 is shifted n positions to the left. E.g. 1 << 3 = 1000 in binary
- `component n2b = Num2Bits(33)`
  - n2b.in = 4294967295
  - n2b.out is the 33 bits binary representation of 429496729
- `out <== 1-n2b.out[n];` output of the circuit is the last bit of n2b.out, which is 0 if in[0] < in[1], otherwise 1.

### [circomlib-matrix](https://github.com/socathie/circomlib-matrix) with puzzle
