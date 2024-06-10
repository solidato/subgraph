import {
  Bytes,
  ipfs,
  json,
  log,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

import {
  Resolution,
  ResolutionVoter,
  ResolutionType,
} from "../generated/schema";
import {
  ResolutionManager__resolutionsResult,
  ResolutionManager__getExecutionDetailsResult,
} from "../generated/ResolutionManager/ResolutionManager";
import { Voting } from "../generated/Voting/Voting";
import {
  ResolutionManager,
  ResolutionApproved,
  ResolutionCreated,
  ResolutionUpdated,
  ResolutionVoted,
  ResolutionTypeCreated,
} from "../generated/ResolutionManager/ResolutionManager";
import { getDaoManagerEntity } from "./dao-manager";
import { VOTING_CONTRACT_ADDRESS } from "../generated/addresses";
import {
  ResolutionExecuted,
  ResolutionRejected,
} from "../generated/ResolutionManager/ResolutionManager";

const setValuesFromResolutionContract = (
  resolutionEntity: Resolution,
  blockChainResolution: ResolutionManager__resolutionsResult,
  executionDetails: ResolutionManager__getExecutionDetailsResult
): void => {
  let ipfsDataURI = blockChainResolution.getDataURI();

  const resolutionTypeEntity = ResolutionType.load(
    blockChainResolution.getResolutionTypeId().toString()
  ) as ResolutionType;

  resolutionEntity.resolutionType = resolutionTypeEntity.id;
  resolutionEntity.yesVotesTotal = blockChainResolution.getYesVotesTotal();
  resolutionEntity.isNegative = blockChainResolution.getIsNegative();
  resolutionEntity.hash = blockChainResolution.getDataURI();
  resolutionEntity.addressedContributor = blockChainResolution.getAddressedContributor();
  resolutionEntity.snapshotId = blockChainResolution.getSnapshotId();

  const executionTo: Bytes[] = [];
  for (let index = 0; index < executionDetails.value0.length; index++) {
    // this is needed as you can't assign an Address[] to a Bytes[] directly, you need to first create Bytes[]
    const current = executionDetails.value0[index];
    executionTo.push(current);
  }
  resolutionEntity.executionTo = executionTo;
  resolutionEntity.executionData = executionDetails.value1;

  resolutionEntity.save();
};

export function handleResolutionApproved(event: ResolutionApproved): void {
  log.info("Getting resolutionManager blockchain contract from address {}", [
    event.address.toHexString(),
  ]);
  const resolutionManager = ResolutionManager.bind(event.address);
  const resolutionIdStringified = event.params.resolutionId.toString();
  const resolutionEntity = Resolution.load(resolutionIdStringified);

  const voting = Voting.bind(Address.fromString(VOTING_CONTRACT_ADDRESS));

  if (resolutionEntity) {
    const daoManagerEntity = getDaoManagerEntity();
    const possibleVotersIds: string[] = [];
    const blockChainResolution = resolutionManager.resolutions(
      event.params.resolutionId
    );

    resolutionEntity.approveTimestamp = blockChainResolution.getApproveTimestamp();
    resolutionEntity.approveBy = event.transaction.from;
    resolutionEntity.snapshotId = blockChainResolution.getSnapshotId();
    resolutionEntity.hasQuorum = resolutionEntity.isNegative;
    resolutionEntity.totalVotingPower = voting.getTotalVotingPowerAt(
      resolutionEntity.snapshotId
    );

    // todo remember to pay attention whenever we will implement the distrust vote

    for (
      let index = 0;
      index < daoManagerEntity.contributorsAddresses.length;
      index++
    ) {
      const voterAddress = daoManagerEntity.contributorsAddresses[index];
      log.info("Calling get voter vote for resolution {} and voter {}", [
        event.params.resolutionId.toString(),
        voterAddress.toHexString(),
      ]);

      const resolutionVoter = new ResolutionVoter(
        resolutionIdStringified + "-" + voterAddress.toHexString()
      );

      resolutionVoter.votingPower = voting.getVotingPowerAt(
        Address.fromString(voterAddress.toHex()),
        resolutionEntity.snapshotId
      );
      resolutionVoter.address = voterAddress;
      resolutionVoter.hasVoted = false;
      resolutionVoter.hasVotedYes = false;
      const maybeDelegated = voting.try_getDelegateAt(
        Address.fromString(voterAddress.toHex()),
        resolutionEntity.snapshotId
      );
      log.info("Try get delegated at with address {} and snapshotId {}", [
        voterAddress.toHexString(),
        resolutionEntity.snapshotId.toHexString(),
      ]);
      if (!maybeDelegated.reverted) {
        const delegatedAddress = maybeDelegated.value;
        resolutionVoter.delegated = delegatedAddress;
      } else {
        log.warning("Tried getVoterVote for address {} but failed", [
          voterAddress.toHexString(),
        ]);
        resolutionVoter.delegated = voterAddress;
      }
      resolutionVoter.save();
      possibleVotersIds.push(resolutionVoter.id);
    }

    // we also need to add the other shareholders and investors to the resolution voters
    // so they will be displayed in the resolution page and pdf
    const otherResolutionShareholders = daoManagerEntity.shareholdersAddresses.concat(
      daoManagerEntity.investorsAddresses
    );

    for (let index = 0; index < otherResolutionShareholders.length; index++) {
      const shareholderAddress = otherResolutionShareholders[index];
      const resolutionVoter = new ResolutionVoter(
        resolutionIdStringified + "-" + shareholderAddress.toHexString()
      );

      resolutionVoter.votingPower = BigInt.fromI32(0);
      resolutionVoter.address = shareholderAddress;
      resolutionVoter.hasVoted = false;
      resolutionVoter.hasVotedYes = false;
      resolutionVoter.delegated = shareholderAddress;
      resolutionVoter.save();
      possibleVotersIds.push(resolutionVoter.id);
    }

    if (possibleVotersIds.length > 0) {
      resolutionEntity.voters = possibleVotersIds;
    }

    resolutionEntity.save();
    return;
  }

  log.error("Trying to approve non-existing resolution {}", [
    resolutionIdStringified,
  ]);
}

export function handleResolutionCreated(event: ResolutionCreated): void {
  const resolutionManager = ResolutionManager.bind(event.address);
  const resolutionIdStringified = event.params.resolutionId.toString();
  const resolutionEntity = new Resolution(resolutionIdStringified);

  const blockChainResolution = resolutionManager.resolutions(
    event.params.resolutionId
  );
  log.info("Resolution created ID {}", [event.params.resolutionId.toString()]);

  if (blockChainResolution) {
    resolutionEntity.createTimestamp = event.block.timestamp;
    resolutionEntity.createBy = event.transaction.from;
    log.info("Resolution created by {}", [
      event.transaction.from.toHexString(),
    ]);

    setValuesFromResolutionContract(
      resolutionEntity,
      blockChainResolution,
      resolutionManager.getExecutionDetails(event.params.resolutionId)
    );
    return;
  }
  log.error("No blockchain resolution found {}", [resolutionIdStringified]);
}

export function handleResolutionUpdated(event: ResolutionUpdated): void {
  const resolutionManager = ResolutionManager.bind(event.address);
  const resolutionIdStringified = event.params.resolutionId.toString();
  const resolutionEntity = Resolution.load(resolutionIdStringified);

  if (resolutionEntity) {
    resolutionEntity.updateTimestamp = event.block.timestamp;
    resolutionEntity.updateBy = event.transaction.from;

    setValuesFromResolutionContract(
      resolutionEntity,
      resolutionManager.resolutions(event.params.resolutionId),
      resolutionManager.getExecutionDetails(event.params.resolutionId)
    );
    return;
  }

  log.error("Trying to update non-existing resolution {}", [
    resolutionIdStringified,
  ]);
}

export function handleResolutionExecuted(event: ResolutionExecuted): void {
  const resolutionManager = ResolutionManager.bind(event.address);
  const resolutionIdStringified = event.params.resolutionId.toString();
  const resolutionEntity = Resolution.load(resolutionIdStringified);

  if (resolutionEntity) {
    const blockChainResolution = resolutionManager.resolutions(
      event.params.resolutionId
    );
    resolutionEntity.executionTimestamp = blockChainResolution.value7;
    resolutionEntity.save();
    return;
  }

  log.error("Trying to set executed to a non-existing resolution {}", [
    resolutionIdStringified,
  ]);
}

export function handleResolutionVoted(event: ResolutionVoted): void {
  const resolutionManager = ResolutionManager.bind(event.address);
  const resolutionId = event.params.resolutionId;
  const voterAddress = event.params.from;

  const resolutionIdStringified = resolutionId.toString();
  const resolutionVoterId =
    resolutionIdStringified + "-" + voterAddress.toHexString();

  const resolutionEntity = Resolution.load(resolutionIdStringified);
  const snapshotId = resolutionEntity
    ? resolutionEntity.snapshotId
    : BigInt.fromI32(0);

  if (resolutionEntity) {
    resolutionEntity.hasQuorum = resolutionManager.getResolutionResult(
      resolutionId
    );
    resolutionEntity.save();
  }

  const resolutionVoter = ResolutionVoter.load(resolutionVoterId);
  if (resolutionVoter) {
    resolutionVoter.hasVoted = true;
    resolutionVoter.hasVotedYes = event.params.isYes;
  }

  const voting = Voting.bind(Address.fromString(VOTING_CONTRACT_ADDRESS));

  const maybeDelegated = voting.try_getDelegateAt(voterAddress, snapshotId);

  if (!maybeDelegated.reverted) {
    const delegatedAddress = maybeDelegated.value;
    log.info(
      "DelegatedAddress: {}, VoterAddress: {}, Resolution Id: {}, Snapshot Id: {}",
      [
        delegatedAddress.toHexString(),
        voterAddress.toHexString(),
        resolutionIdStringified,
        snapshotId.toString(),
      ]
    );

    if (delegatedAddress != voterAddress) {
      const resultForVoter = resolutionManager.try_getVoterVote(
        resolutionId,
        voterAddress
      );
      if (!resultForVoter.reverted && resolutionVoter) {
        resolutionVoter.votingPower = resultForVoter.value.getVotingPower();
      }

      const resultForDelegated = resolutionManager.try_getVoterVote(
        resolutionId,
        delegatedAddress
      );
      const resolutionVoterDelegated = ResolutionVoter.load(
        resolutionIdStringified + "-" + delegatedAddress.toHexString()
      );
      if (!resultForDelegated.reverted && resolutionVoterDelegated) {
        resolutionVoterDelegated.votingPower = resultForDelegated.value.getVotingPower();
        resolutionVoterDelegated.save();
      }
    }
  }

  if (resolutionVoter) {
    // if a resolution voter has voted, reset its delegated address
    resolutionVoter.delegated = voterAddress;
    resolutionVoter.save();
  }
}

export function handleResolutionRejected(event: ResolutionRejected): void {
  const resolutionIdStringified = event.params.resolutionId.toString();
  const resolutionEntity = Resolution.load(resolutionIdStringified);

  if (resolutionEntity) {
    resolutionEntity.rejectTimestamp = event.block.timestamp;
    resolutionEntity.rejectBy = event.transaction.from;

    resolutionEntity.save();
    return;
  }

  log.error("Trying to reject non-existing resolution {}", [
    resolutionIdStringified,
  ]);
}

export function handleResolutionTypeCreated(
  event: ResolutionTypeCreated
): void {
  const daoManagerEntity = getDaoManagerEntity();
  if (daoManagerEntity) {
    const newResolutionTypeEntity = new ResolutionType(
      event.params.typeIndex.toString()
    );

    const resolutionManager = ResolutionManager.bind(event.address);

    const resolutionType = resolutionManager.resolutionTypes(
      event.params.typeIndex
    );

    newResolutionTypeEntity.name = resolutionType.getName();
    newResolutionTypeEntity.quorum = resolutionType.getQuorum();
    newResolutionTypeEntity.noticePeriod = resolutionType.getNoticePeriod();
    newResolutionTypeEntity.votingPeriod = resolutionType.getVotingPeriod();
    newResolutionTypeEntity.canBeNegative = resolutionType.getCanBeNegative();

    daoManagerEntity.resolutionTypes = daoManagerEntity.resolutionTypes.concat([
      newResolutionTypeEntity.id,
    ]);

    daoManagerEntity.save();
    newResolutionTypeEntity.save();
  }
}
