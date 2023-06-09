pragma circom 2.0.0;
include "node_modules/circomlib/circuits/bitify.circom";
include "keccak/keccak.circom";

template KeccakBench(){
    signal input PreImage;
    signal output Hash;
    component n2b = Num2Bits_strict();
    n2b.in <== PreImage;
    component keccak = Keccak(254,1);
    keccak.in <== n2b.out;
    Hash <== keccak.out[0];
}
component main {public[PreImage]} = KeccakBench();