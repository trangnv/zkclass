pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/mimcsponge.circom"

template MiMCBench(){
    signal input PreImage;
    signal output out;
    component mimcSecret = MiMCSponge(1, 220, 1);
    mimcSecret.ins[0] <== PreImage;
    mimcSecret.k <== 0;
    out <== mimcSecret.outs[0];
}
component main {public[PreImage]} = Sha256Bench();