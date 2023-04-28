import { Address } from "@graphprotocol/graph-ts";
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

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  const addressToHex = event.params.to.toHexString();
  const addressFromHex = event.params.from.toHexString();

  const votingContract = Voting.bind(
    Address.fromString(VOTING_CONTRACT_ADDRESS)
  );

  const internalMarketContract = InternalMarket.bind(
    Address.fromString(INTERNAL_MARKET_CONTRACT_ADDRESS)
  );

  const governanceTokenContract = GovernanceToken.bind(
    Address.fromString(GOVERNANCE_TOKEN_CONTRACT_ADDRESS)
  );

  if (addressFrom != Address.zero()) {
    const daoUserFrom = getDaoUser(addressFromHex);
    daoUserFrom.address = addressFrom;
    daoUserFrom.votingPower = votingContract.getVotingPower(addressFrom);
    const governanceWithdrawableTempBalance = internalMarketContract.withdrawableBalanceOf(
      addressFrom
    );
    const governanceOfferedTempBalance = internalMarketContract.offeredBalanceOf(
      addressFrom
    );
    daoUserFrom.governanceWithdrawableTempBalance = governanceWithdrawableTempBalance;
    daoUserFrom.governanceOfferedTempBalance = governanceOfferedTempBalance;
    daoUserFrom.governanceVaultedBalance = governanceWithdrawableTempBalance.plus(
      governanceOfferedTempBalance
    );
    daoUserFrom.governanceBalance = governanceTokenContract.balanceOf(
      addressFrom
    );

    daoUserFrom.save();
  }

  if (addressTo != Address.zero()) {
    const daoUserTo = getDaoUser(addressToHex);
    daoUserTo.address = addressTo;
    daoUserTo.votingPower = votingContract.getVotingPower(addressTo);
    const governanceWithdrawableTempBalance = internalMarketContract.withdrawableBalanceOf(
      addressTo
    );
    const governanceOfferedTempBalance = internalMarketContract.offeredBalanceOf(
      addressTo
    );
    daoUserTo.governanceWithdrawableTempBalance = governanceWithdrawableTempBalance;
    daoUserTo.governanceOfferedTempBalance = governanceOfferedTempBalance;
    daoUserTo.governanceVaultedBalance = governanceWithdrawableTempBalance.plus(
      governanceOfferedTempBalance
    );
    daoUserTo.governanceBalance = governanceTokenContract.balanceOf(addressTo);

    daoUserTo.save();
  }
}

export function handleVestingSet(event: VestingSet): void {
  const toHexString = event.params.to.toHexString();

  const toDaoUser = getDaoUser(toHexString);

  toDaoUser.governanceVestingBalance = event.params.amount;
  toDaoUser.save();
}
