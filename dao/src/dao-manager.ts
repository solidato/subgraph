import { DaoManager } from "../generated/schema";

const DAO_MANAGER_ID = "0"; // we treat this as a "singleton"

export function getDaoManagerEntity(): DaoManager {
  const daoManagerEntity =
    DaoManager.load(DAO_MANAGER_ID) || new DaoManager(DAO_MANAGER_ID);

  return daoManagerEntity as DaoManager;
}
