import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { DaoUser } from "../generated/schema";

export function getDaoUser(fromHexString: string): DaoUser {
  const loadedDaoUser = DaoUser.load(fromHexString);
  if (loadedDaoUser) {
    return loadedDaoUser;
  }

  const newDaoUser = new DaoUser(fromHexString);
  newDaoUser.address = Bytes.empty();
  newDaoUser.totalBalance = BigInt.fromI32(0);
  newDaoUser.vestingBalance = BigInt.fromI32(0);
  newDaoUser.unlockedTempBalance = BigInt.fromI32(0);

  return newDaoUser;
}
