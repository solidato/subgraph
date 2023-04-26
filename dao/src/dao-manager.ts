import { DaoManager } from "../generated/schema";

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

  return newDaoManagerEntity;
}
