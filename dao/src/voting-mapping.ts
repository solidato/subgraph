import { DelegateChanged, Voting } from "../generated/Voting/Voting";
import { DelegationUser } from "../generated/schema";
import { Address, log } from "@graphprotocol/graph-ts";
import saveDaoUserData from "./save-dao-user-data";
import { VOTING_CONTRACT_ADDRESS } from "../generated/addresses";
import { getDaoManagerEntity } from "./dao-manager";

export function handleDelegateChanged(event: DelegateChanged): void {
  const delegatorHexString = event.params.delegator.toHexString();
  const newDelegateHexString = event.params.newDelegate.toHexString();

  log.info("VOTING handleDelegateChanged, delegator {}, newDelegate {}", [
    delegatorHexString,
    newDelegateHexString,
  ]);

  const currentDelegator =
    DelegationUser.load(delegatorHexString) ||
    new DelegationUser(delegatorHexString);

  if (currentDelegator) {
    currentDelegator.address = event.params.delegator;
    currentDelegator.delegated = event.params.newDelegate;
    currentDelegator.save();
  }

  saveDaoUserData(event.params.delegator, event.block);

  // if the delegator is delegating to someone else, we need to update the
  // new delegate's data as well
  if (event.params.delegator != event.params.newDelegate) {
    saveDaoUserData(event.params.newDelegate, event.block);
  }

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );
  const daoManagerEntity = getDaoManagerEntity();
  const maybeTotalVotingPower = votingContract.try_getTotalVotingPower();
  if (!maybeTotalVotingPower.reverted) {
    daoManagerEntity.totalVotingPower = maybeTotalVotingPower.value;
    daoManagerEntity.save();
  } else {
    log.critical("unable to get voting power", []);
  }
}
