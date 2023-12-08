import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { DaoManager } from "../generated/schema";
import { Voting } from "../generated/Voting/Voting";
import { VOTING_CONTRACT_ADDRESS } from "../generated/addresses";

const DAO_MANAGER_ID = "0"; // we treat this as a "singleton"

export function getDaoManagerEntity(): DaoManager {
  const daoManagerEntity = DaoManager.load(DAO_MANAGER_ID);

  if (daoManagerEntity != null) {
    return daoManagerEntity;
  }

  const newDaoManagerEntity = new DaoManager(DAO_MANAGER_ID);
  newDaoManagerEntity.resolutionTypes = [];
  newDaoManagerEntity.contributorsAddresses = [];
  newDaoManagerEntity.managingBoardAddresses = [];
  newDaoManagerEntity.shareholdersAddresses = [];
  newDaoManagerEntity.investorsAddresses = [];
  newDaoManagerEntity.totalVotingPower = BigInt.fromI32(0);

  return newDaoManagerEntity;
}

export function reloadTotalVotingPower(): void {
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
