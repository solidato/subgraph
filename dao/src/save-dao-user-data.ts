import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { GovernanceToken } from "../generated/GovernanceToken/GovernanceToken";
import { InternalMarket } from "../generated/InternalMarket/InternalMarket";
import { Voting } from "../generated/Voting/Voting";
import { getDaoUser } from "./dao-user";
import { Offer } from "../generated/schema";
import {
  GOVERNANCE_TOKEN_CONTRACT_ADDRESS,
  INTERNAL_MARKET_CONTRACT_ADDRESS,
  NEOKINGDOM_TOKEN_CONTRACT_ADDRESS,
  VOTING_CONTRACT_ADDRESS,
} from "../generated/addresses";

const BLOCK_NUMBER_TO_SKIP = BigInt.fromI32(13343844);

const saveDaoUserData = (userAddress: Address, block: ethereum.Block): void => {
  const blockTimestamp = block.timestamp;
  const blockNumber = block.number;

  // We're skipping block 13343844 because the withdrawableBalanceOf function returns
  // an error, so we need to wait for the expiration of the offer.
  // See https://github.com/NeokingdomDAO/contracts/issues/67 for more info
  if (blockNumber === BLOCK_NUMBER_TO_SKIP) {
    log.info("Skipping because blockNumber is {}", [blockNumber.toHexString()]);
    return;
  }

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );

  const internalMarketContract = InternalMarket.bind(
    Address.fromString(INTERNAL_MARKET_CONTRACT_ADDRESS)
  );

  const governanceTokenContract = GovernanceToken.bind(
    Address.fromString(GOVERNANCE_TOKEN_CONTRACT_ADDRESS)
  );

  const neokingdomTokenContract = GovernanceToken.bind(
    Address.fromString(NEOKINGDOM_TOKEN_CONTRACT_ADDRESS)
  );

  log.info("Save dao user data for address {}", [userAddress.toHexString()]);
  if (userAddress != Address.zero()) {
    const daoUser = getDaoUser(userAddress.toHexString());
    daoUser.address = userAddress;
    daoUser.neokigdomTokenBalance = neokingdomTokenContract.balanceOf(
      userAddress
    );
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
      if (offer && offer.expirationTimestamp >= blockTimestamp) {
        log.info(
          "offer non expired {} offer expiration {} event block timestamp {}",
          [
            offerId,
            offer.expirationTimestamp.toString(),
            blockTimestamp.toString(),
          ]
        );
        newActiveOffers.push(offer.id);
      }
      if (offer && offer.expirationTimestamp < blockTimestamp) {
        log.info(
          "offer expired {} offer expiration {} event block timestamp {}",
          [
            offerId,
            offer.expirationTimestamp.toString(),
            blockTimestamp.toString(),
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

export default saveDaoUserData;
