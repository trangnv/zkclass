const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);
const Fr = new F1Field(exports.p);

describe("HelloWorld", function () {
  this.timeout(100000000);
  let Verifier;
  let verifier;

  beforeEach(async function () {
    Verifier = await ethers.getContractFactory("HelloWorldVerifier");
    verifier = await Verifier.deploy();
    await verifier.deployed();
  });

  it("1. Circuit should multiply two numbers correctly", async function () {
    const circuit = await wasm_tester("../circuits/hello_world.circom");

    const INPUT = {
      a: 2,
      b: 33,
    };

    const witness = await circuit.calculateWitness(INPUT, true);

    console.log(witness);

    assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)));
    assert(Fr.eq(Fr.e(witness[1]), Fr.e(66)));
  });

  it("2. Should return true for correct Groth16 proof", async function () {
    /*
    INPUTS:
        - { a: "2", b: "3" } & wasm filepath are for witness calculation
        - zkey filepath & witness are for proof generation
    */
    const { proof, publicSignals } = await groth16.fullProve(
      { a: "2", b: "3" },
      "../circuits/hello_world/hello_world_js/hello_world.wasm",
      "../circuits/hello_world/circuit_final_g16.zkey"
    );

    console.log("2x3 =", publicSignals[0]);

    const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

    const argv = calldata
      .replace(/["[\]\s]/g, "")
      .split(",")
      .map((x) => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [
      [argv[2], argv[3]],
      [argv[4], argv[5]],
    ];
    const c = [argv[6], argv[7]];
    const Input = argv.slice(8);

    expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
  });
  it("3. Should return false for invalid proof", async function () {
    let a = [0, 0];
    let b = [
      [0, 0],
      [0, 0],
    ];
    let c = [0, 0];
    let d = [0];
    expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
  });
});
