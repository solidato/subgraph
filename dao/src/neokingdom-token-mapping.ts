import { Transfer } from "../generated/NeokingdomToken/NeokingdomToken";
import saveDaoUserData from "./save-dao-user-data";

export function handleTransfer(event: Transfer): void {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  saveDaoUserData(addressFrom, event.block.timestamp);
  saveDaoUserData(addressTo, event.block.timestamp);
}
