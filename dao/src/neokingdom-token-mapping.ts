import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/NeokingdomToken/NeokingdomToken";
import saveDaoUserData from "./save-dao-user-data";
import { TokenMinting } from "../generated/schema";

export function getTokenMinting(id: string): TokenMinting {
  const loadedTokenMinting = TokenMinting.load(id);
  if (loadedTokenMinting) {
    return loadedTokenMinting;
  }

  const newTokenMinting = new TokenMinting(id);
  newTokenMinting.amounts = [];
  newTokenMinting.mintedTimestamp = BigInt.fromI32(0);

  return newTokenMinting;
}

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  saveDaoUserData(addressFrom, event.block);
  saveDaoUserData(addressTo, event.block);

  if (event.params.from == Address.zero()) {
    const blockHash = event.block.hash.toHexString();

    const tokenMinting = getTokenMinting(blockHash);

    tokenMinting.amounts = tokenMinting.amounts.concat([event.params.value]);
    tokenMinting.mintedTimestamp = event.block.timestamp;

    tokenMinting.save();
  }
}
