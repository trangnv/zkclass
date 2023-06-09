pragma circom 2.0.0;
include "node_modules/circomlib/circuits/sha256/sha256.circom";
include "node_modules/circomlib/circuits/bitify.circom";

template Sha256Bench(){
    signal input PreImage;
    component n2b = Num2Bits_strict();
    n2b.in <== PreImage;
    component sha256 = Sha256(254);
    sha256.in <== n2b.out;
}
component main {public[PreImage]} = Sha256Bench();