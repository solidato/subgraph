import { Address, log } from "@graphprotocol/graph-ts";
import {
  Transfer,
  VestingSet,
} from "../generated/GovernanceToken/GovernanceToken";
import { getDaoUser } from "./dao-user";

import { getDaoManagerEntity } from "./dao-manager";
import saveDaoUserData from "./save-dao-user-data";
import { VOTING_CONTRACT_ADDRESS } from "../generated/addresses";
import { Voting } from "../generated/Voting/Voting";

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

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );

  const daoManagerEntity = getDaoManagerEntity();
  daoManagerEntity.totalVotingPower = votingContract.getTotalVotingPower();
  daoManagerEntity.save();
}

export function handleVestingSet(event: VestingSet): void {
  const toHexString = event.params.to.toHexString();

  const toDaoUser = getDaoUser(toHexString);

  toDaoUser.governanceVestingBalance = event.params.amount;
  toDaoUser.save();
}
