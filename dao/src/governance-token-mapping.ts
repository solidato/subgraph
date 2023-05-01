import { Address, log } from "@graphprotocol/graph-ts";
import {
  GovernanceToken,
  Transfer,
  VestingSet,
} from "../generated/GovernanceToken/GovernanceToken";
import { getDaoUser } from "./dao-user";
import { Voting } from "../generated/Voting/Voting";
import {
  GOVERNANCE_TOKEN_CONTRACT_ADDRESS,
  INTERNAL_MARKET_CONTRACT_ADDRESS,
  VOTING_CONTRACT_ADDRESS,
} from "../generated/addresses";
import { InternalMarket } from "../generated/InternalMarket/InternalMarket";
import { Offer } from "../generated/schema";
import { getDaoManagerEntity } from "./dao-manager";

const saveDaoUserData = (
  votingContract: Voting,
  internalMarketContract: InternalMarket,
  governanceTokenContract: GovernanceToken,
  event: Transfer,
  userAddress: Address
): void => {
  log.info("Save dao user data for address {}", [userAddress.toHexString()]);
  if (userAddress != Address.zero()) {
    const daoUser = getDaoUser(userAddress.toHexString());
    daoUser.address = userAddress;
    daoUser.votingPower = votingContract.getVotingPower(userAddress);
    const governanceWithdrawableTempBalance = internalMarketContract.withdrawableBalanceOf(
      userAddress
    );
    const governanceOfferedTempBalance = internalMarketContract.offeredBalanceOf(
      userAddress
    );
    daoUser.governanceWithdrawableTempBalance = governanceWithdrawableTempBalance;
    log.info("governanceWithdrawableTempBalance {}", [
      governanceWithdrawableTempBalance.toHexString(),
    ]);
    daoUser.governanceOfferedTempBalance = governanceOfferedTempBalance;
    daoUser.governanceVaultedBalance = governanceWithdrawableTempBalance.plus(
      governanceOfferedTempBalance
    );
    daoUser.governanceBalance = governanceTokenContract.balanceOf(userAddress);
    daoUser.governanceVestingBalance = governanceTokenContract.vestingBalanceOf(
      userAddress
    );
    const newActiveOffers: string[] = [];
    for (let index = 0; index < daoUser.activeOffers.length; index++) {
      const offerId = daoUser.activeOffers[index];
      const offer = Offer.load(offerId);
      if (offer && offer.expirationTimestamp >= event.block.timestamp) {
        log.info(
          "offer non expired {} offer expiration {} event block timestamp {}",
          [
            offerId,
            offer.expirationTimestamp.toString(),
            event.block.timestamp.toString(),
          ]
        );
        newActiveOffers.push(offer.id);
      }
      if (offer && offer.expirationTimestamp < event.block.timestamp) {
        log.info(
          "offer expired {} offer expiration {} event block timestamp {}",
          [
            offerId,
            offer.expirationTimestamp.toString(),
            event.block.timestamp.toString(),
          ]
        );
        offer.expiredOnTransfer = true;
        offer.save();
      }
    }
    daoUser.activeOffers = newActiveOffers;
    daoUser.save();
  }
};

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );

  const internalMarketContract = InternalMarket.bind(
    Address.fromString(INTERNAL_MARKET_CONTRACT_ADDRESS)
  );

  const governanceTokenContract = GovernanceToken.bind(
    Address.fromString(GOVERNANCE_TOKEN_CONTRACT_ADDRESS)
  );

  saveDaoUserData(
    votingContract,
    internalMarketContract,
    governanceTokenContract,
    event,
    addressFrom
  );

  saveDaoUserData(
    votingContract,
    internalMarketContract,
    governanceTokenContract,
    event,
    addressTo
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
