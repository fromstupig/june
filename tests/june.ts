import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { June } from "../target/types/june";

describe("june", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.June as Program<June>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
