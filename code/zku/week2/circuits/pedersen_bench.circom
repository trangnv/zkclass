include "../node_modules/circomlib/circuits/pedersen.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template PedersenBench(){
    signal input PreImage;
    component n2b = Num2Bits_strict();
    n2b.in <== PreImage;
    component pedersen = Pedersen(254);
    pedersen.in <== n2b.out;
}
component main {public[PreImage]} = PedersenBench();