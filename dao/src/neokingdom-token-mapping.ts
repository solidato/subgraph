import { Address, log } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/NeokingdomToken/NeokingdomToken";
import saveDaoUserData from "./save-dao-user-data";
import { TokenMinting } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  saveDaoUserData(addressFrom, event.block);
  saveDaoUserData(addressTo, event.block);

  if (event.params.from == Address.zero()) {
    const blockHash = event.block.hash.toHexString();

    // we should also create a new TokenMinting entity with:
    const tokenMinting =
      TokenMinting.load(blockHash) || new TokenMinting(blockHash);

    if (!tokenMinting) {
      log.critical("TokenMinting entity {} is null", [blockHash]);
      return;
    }

    if (!tokenMinting.amount) {
      tokenMinting.amount = [];
    }

    tokenMinting.amount = tokenMinting.amount.concat([event.params.value]);
    tokenMinting.mintedTimestamp = event.block.timestamp;

    tokenMinting.save();
  }
}
