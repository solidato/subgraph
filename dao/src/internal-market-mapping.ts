import { log } from "@graphprotocol/graph-ts";
import { DaoUser, Offer } from "../generated/schema";
import {
  OfferCreated,
  OfferMatched,
} from "../generated/InternalMarket/InternalMarket";

export function handleOfferCreated(event: OfferCreated): void {
  const fromHexString = event.params.from.toHexString();
  const id = event.params.id.toHexString();
  const offerId = id + "-" + fromHexString;

  const offerEntity = new Offer(offerId);

  offerEntity.from = event.params.from;
  offerEntity.amount = event.params.amount;
  // todo once contracts will update we will have `expiredAt` as param.
  // right now `createdAt` is the actual expiration date (PR done in the contracts)
  offerEntity.expirationTimestamp = event.params.createdAt;
  offerEntity.createTimestamp = event.block.timestamp;

  offerEntity.save();
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

  const fromDaoUser = DaoUser.load(fromHexString) || new DaoUser(fromHexString);

  if (fromDaoUser) {
    fromDaoUser.unlockedTempBalance = fromDaoUser.unlockedTempBalance.plus(
      event.params.amount
    );

    fromDaoUser.save();
  }
}
