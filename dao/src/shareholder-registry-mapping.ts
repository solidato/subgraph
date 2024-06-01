import {
  ShareholderRegistry,
  StatusChanged,
  Transfer,
} from "../generated/ShareholderRegistry/ShareholderRegistry";
import { log, Bytes, Address } from "@graphprotocol/graph-ts";
import { getDaoManagerEntity, reloadTotalVotingPower } from "./dao-manager";
import { getDaoUser } from "./dao-user";
import { Voting } from "../generated/Voting/Voting";
import {
  SHAREHOLDER_REGISTRY_CONTRACT_ADDRESS,
  VOTING_CONTRACT_ADDRESS,
} from "../generated/addresses";

// todo ask Nicola/Alberto if we can have a mapping in the contract (or these strings will be like this "forever")

const CONTRIBUTOR_STATUS =
  "0x84d5b933b93417199db826f5da9d5b1189791cb2dfd61240824c7e46b055f03d";
const MANAGING_BOARD_STATUS =
  "0x1417f6a224499a6e3918f776fd5ff7d6d29c2d693d9862a904be8a74faad51f1";
// not used for now
const INVESTOR_STATUS =
  "0x14480ae0991a8fe24c1733177e7d71ec79d1f142a7f0e5971a3b930e17759817";
const SHAREHOLDER_STATUS =
  "0x307a5ff72e442b798b18d109baae15fe48b6d3690fd14c03015a2f47dd89e2f1";

function getStatusNameFromHexString(hexString: string): string {
  if (hexString == MANAGING_BOARD_STATUS) {
    return "MANAGING_BOARD";
  }
  if (hexString == CONTRIBUTOR_STATUS) {
    return "CONTRIBUTOR";
  }
  if (hexString == INVESTOR_STATUS) {
    return "INVESTOR";
  }
  if (hexString == SHAREHOLDER_STATUS) {
    return "SHAREHOLDER";
  }
  return "UNKNOWN_TYPE: " + hexString;
}

function getNewAddressesWithoutAddress(
  daoManagerEntityList: Bytes[],
  toRemove: Bytes
): Bytes[] {
  const newAddresses: Bytes[] = [];
  for (let index = 0; index < daoManagerEntityList.length; index++) {
    const currentAddress = daoManagerEntityList[index];
    if (currentAddress != toRemove) {
      newAddresses.push(currentAddress);
    }
  }
  return newAddresses;
}

export function handleStatusChanged(event: StatusChanged): void {
  const address = event.params.account;
  const addressHexString = address.toHexString();
  const daoManagerEntity = getDaoManagerEntity();

  const previousHexString = event.params.previous.toHexString();
  const currentHexString = event.params.current.toHexString();

  log.info(
    "SHAREHOLDER_REGISTRY handleStatusChanged, address {}, previous {}, current {}",
    [
      addressHexString,
      getStatusNameFromHexString(previousHexString),
      getStatusNameFromHexString(currentHexString),
    ]
  );

  const daoUser = getDaoUser(addressHexString);

  daoUser.address = address;
  daoUser.save();

  // remove the address from the "previous" list/s
  if (previousHexString == MANAGING_BOARD_STATUS) {
    const newManagingBoardAddresses = getNewAddressesWithoutAddress(
      daoManagerEntity.managingBoardAddresses,
      address
    );
    daoManagerEntity.managingBoardAddresses = newManagingBoardAddresses;
    const newContributorsAddresses = getNewAddressesWithoutAddress(
      daoManagerEntity.contributorsAddresses,
      address
    );
    daoManagerEntity.contributorsAddresses = newContributorsAddresses;
  }

  if (previousHexString == CONTRIBUTOR_STATUS) {
    const newContributorsAddresses = getNewAddressesWithoutAddress(
      daoManagerEntity.contributorsAddresses,
      address
    );
    daoManagerEntity.contributorsAddresses = newContributorsAddresses;
  }

  if (previousHexString == INVESTOR_STATUS) {
    const newInvestorsAddresses = getNewAddressesWithoutAddress(
      daoManagerEntity.investorsAddresses,
      address
    );
    daoManagerEntity.investorsAddresses = newInvestorsAddresses;
  }

  if (previousHexString == SHAREHOLDER_STATUS) {
    const newShareholdersAddresses = getNewAddressesWithoutAddress(
      daoManagerEntity.shareholdersAddresses,
      address
    );
    daoManagerEntity.shareholdersAddresses = newShareholdersAddresses;
  }

  // add the address to the "current" list/s
  if (currentHexString == MANAGING_BOARD_STATUS) {
    daoManagerEntity.managingBoardAddresses = daoManagerEntity.managingBoardAddresses.concat(
      [address]
    );
    daoManagerEntity.contributorsAddresses = daoManagerEntity.contributorsAddresses.concat(
      [address]
    );
  }

  if (currentHexString == CONTRIBUTOR_STATUS) {
    daoManagerEntity.contributorsAddresses = daoManagerEntity.contributorsAddresses.concat(
      [address]
    );
  }

  if (currentHexString == INVESTOR_STATUS) {
    daoManagerEntity.investorsAddresses = daoManagerEntity.investorsAddresses.concat(
      [address]
    );
  }

  if (currentHexString == SHAREHOLDER_STATUS) {
    daoManagerEntity.shareholdersAddresses = daoManagerEntity.shareholdersAddresses.concat(
      [address]
    );
  }

  reloadTotalVotingPower();
  daoManagerEntity.save();
  return;
}

export function handleTransfer(event: Transfer): void {
  const addressFrom = event.params.from;
  const addressTo = event.params.to;

  const addressFromHex = event.params.from.toHexString();
  const addressToHex = event.params.to.toHexString();

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );
  const shareholderRegistryContract = ShareholderRegistry.bind(
    Address.fromString(SHAREHOLDER_REGISTRY_CONTRACT_ADDRESS)
  );

  if (addressFrom != Address.zero()) {
    const daoUserFrom = getDaoUser(addressFromHex);
    const maybeVotingPower = votingContract.try_getVotingPower(addressFrom);

    if (!maybeVotingPower.reverted) {
      daoUserFrom.votingPower = maybeVotingPower.value;
      const maybeShareholderRegistryBalance = shareholderRegistryContract.try_balanceOf(
        addressFrom
      );

      log.info(
        "SHAREHOLDER_REGISTRY_S try setting shares for from address {}",
        [addressFrom.toHexString()]
      );
      if (!maybeShareholderRegistryBalance.reverted) {
        log.info(
          "SHAREHOLDER_REGISTRY_S setting shares, addressFrom {}, new value {}",
          [
            addressFrom.toHexString(),
            maybeShareholderRegistryBalance.value.toString(),
          ]
        );

        daoUserFrom.shareholderRegistryBalance =
          maybeShareholderRegistryBalance.value;
      }
      daoUserFrom.save();
    }
  }

  if (addressTo != Address.zero()) {
    const daoUserTo = getDaoUser(addressToHex);
    const maybeVotingPower = votingContract.try_getVotingPower(addressTo);
    if (!maybeVotingPower.reverted) {
      daoUserTo.votingPower = maybeVotingPower.value;
      const maybeShareholderRegistryBalance = shareholderRegistryContract.try_balanceOf(
        addressTo
      );

      log.info("SHAREHOLDER_REGISTRY_S try setting shares for to address {}", [
        addressTo.toHexString(),
      ]);

      if (!maybeShareholderRegistryBalance.reverted) {
        log.info(
          "SHAREHOLDER_REGISTRY_S setting shares, addressTo {}, new value {}",
          [
            addressTo.toHexString(),
            maybeShareholderRegistryBalance.value.toString(),
          ]
        );
        daoUserTo.shareholderRegistryBalance =
          maybeShareholderRegistryBalance.value;
      } else {
        log.error("FAILED", []);
      }
      daoUserTo.save();
    }
  }

  reloadTotalVotingPower();
}
