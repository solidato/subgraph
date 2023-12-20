import { Address, log } from "@graphprotocol/graph-ts";
import {
  DepositStarted,
  Settled,
  Transfer,
  VestingSet,
} from "../generated/GovernanceToken/GovernanceToken";
import { getDaoUser } from "./dao-user";

import { getDaoManagerEntity, reloadTotalVotingPower } from "./dao-manager";
import saveDaoUserData from "./save-dao-user-data";
import { VOTING_CONTRACT_ADDRESS } from "../generated/addresses";
import { Voting } from "../generated/Voting/Voting";
import { Deposit } from "../generated/schema";

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;
  const value = event.params.value;

  log.info("handleTransfer called addressFrom: {}, addressTo: {}, value: {}", [
    addressFrom.toHexString(),
    addressTo.toHexString(),
    value.toString(),
  ]);

  saveDaoUserData(addressFrom, event.block);

  saveDaoUserData(addressTo, event.block);

  reloadTotalVotingPower();
}

export function handleVestingSet(event: VestingSet): void {
  const toHexString = event.params.to.toHexString();

  const toDaoUser = getDaoUser(toHexString);

  toDaoUser.governanceVestingBalance = event.params.amount;
  toDaoUser.save();
}

export function handleDepositStarted(event: DepositStarted): void {
  const from = event.params.from;
  const amount = event.params.amount;
  const settlementTimestamp = event.params.settlementTimestamp;
  const id = event.params.index;

  const depositId = from.toHexString() + "-" + id.toHexString();
  const deposit = new Deposit(depositId);

  deposit.from = from;
  deposit.amount = amount;
  deposit.settlementTimestamp = settlementTimestamp;
  deposit.createTimestamp = event.block.timestamp;
  deposit.settled = false;
  deposit.save();
}

export function handleDepositSettled(event: Settled): void {
  const from = event.params.from;
  const id = event.params.index;

  const depositId = from.toHexString() + "-" + id.toHexString();
  const deposit = Deposit.load(depositId);

  if (!deposit) {
    log.error("Deposit {} not found", [depositId]);
    return;
  }

  deposit.settleTimestamp = event.block.timestamp;
  deposit.settled = true;
  deposit.save();
}
