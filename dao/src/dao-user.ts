import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoUser } from "../generated/schema";

export function getDaoUser(fromHexString: string): DaoUser {
  const loadedDaoUser = DaoUser.load(fromHexString);
  if (loadedDaoUser) {
    return loadedDaoUser;
  }

  const newDaoUser = new DaoUser(fromHexString);
  newDaoUser.address = Bytes.empty();

  newDaoUser.governanceBalance = BigInt.fromI32(0);
  newDaoUser.governanceOfferedTempBalance = BigInt.fromI32(0);
  newDaoUser.governanceWithdrawableTempBalance = BigInt.fromI32(0);
  newDaoUser.governanceVaultedBalance = BigInt.fromI32(0);
  newDaoUser.governanceVestingBalance = BigInt.fromI32(0);
  newDaoUser.neokigdomTokenBalance = BigInt.fromI32(0);
  newDaoUser.shareholderRegistryBalance = BigInt.fromI32(0);
  newDaoUser.votingPower = BigInt.fromI32(0);
  newDaoUser.activeOffers = [];

  return newDaoUser;
}
