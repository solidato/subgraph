import { Address, log } from "@graphprotocol/graph-ts";
import { Offer, OfferMatch } from "../generated/schema";
import {
  OfferCreated,
  OfferMatched,
} from "../generated/InternalMarket/InternalMarket";
import { getDaoUser } from "./dao-user";
import saveDaoUserData from "./save-dao-user-data";

export function handleOfferCreated(event: OfferCreated): void {
  const fromHexString = event.params.from.toHexString();
  const id = event.params.id.toHexString();
  const offerId = id + "-" + fromHexString;

  const offerEntity = new Offer(offerId);

  offerEntity.from = event.params.from;
  offerEntity.amount = event.params.amount;
  offerEntity.expirationTimestamp = event.params.expiredAt;
  offerEntity.createTimestamp = event.block.timestamp;
  offerEntity.expiredOnTransfer = false;

  offerEntity.save();

  const daoUser = getDaoUser(fromHexString);
  daoUser.activeOffers = daoUser.activeOffers.concat([offerEntity.id]);
  daoUser.save();
}

export function handleOfferMatched(event: OfferMatched): void {
  const fromHexString = event.params.from.toHexString();
  const id = event.params.id.toHexString();
  const offerId = id + "-" + fromHexString;

  const offerEntity = Offer.load(offerId);

  if (!offerEntity) {
    log.error("Offer {} not found", [offerId]);
    return;
  }
  
  offerEntity.amount = offerEntity.amount.minus(event.params.amount);
  
  offerEntity.save();
  
  // save dao user to refresh all the balances
  saveDaoUserData(Address.fromBytes(offerEntity.from), event.block);
}
