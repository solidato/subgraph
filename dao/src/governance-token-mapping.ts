import { Address } from "@graphprotocol/graph-ts";
import {
  Transfer,
  VestingSet,
} from "../generated/GovernanceToken/GovernanceToken";
import { getDaoManagerEntity } from "./dao-manager";
import { getDaoUser } from "./dao-user";

export function handleTransfer(event: Transfer): void {
  const fromHexString = event.params.from.toHexString();
  const toHexString = event.params.to.toHexString();
  const value = event.params.value;

  if (event.params.from != Address.zero()) {
    const daoManagerEntity = getDaoManagerEntity();
    const fromDaoUser = getDaoUser(fromHexString);
    fromDaoUser.totalBalance = fromDaoUser.totalBalance.minus(value);
    fromDaoUser.address = event.params.from;

    // if from address is contributor, we should remove value from their unlocked temp balance
    if (daoManagerEntity.contributorsAddresses.includes(event.params.from)) {
      fromDaoUser.unlockedTempBalance = fromDaoUser.unlockedTempBalance.minus(
        value
      );
    }

    fromDaoUser.save();
  }

  const toDaoUser = getDaoUser(toHexString);
  toDaoUser.totalBalance = toDaoUser.totalBalance.plus(value);
  toDaoUser.address = event.params.to;
  toDaoUser.save();
}

export function handleVestingSet(event: VestingSet): void {
  const toHexString = event.params.to.toHexString();

  const toDaoUser = getDaoUser(toHexString);

  toDaoUser.vestingBalance = event.params.amount;
  toDaoUser.save();
}
