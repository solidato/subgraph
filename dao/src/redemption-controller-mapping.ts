import { Redemption, RedemptionHistory } from "../generated/schema";
import { RedemptionCreated, RedemptionUpdated } from "../generated/RedemptionController/RedemptionController";

export function handleRedemptionCreated(event: RedemptionCreated): void {
  const index = event.params.index.toString();
  const from = event.params.account;
  const redemption = new Redemption(index + "-" + from.toHexString());

  redemption.createBy = from;
  redemption.amount = event.params.amount;
  redemption.startTimestamp = event.params.starts;
  redemption.endTimestamp = event.params.ends;

  redemption.redemptionHistory = [];
  redemption.save();
}

export function handleRedemptionUpdated(event: RedemptionUpdated): void {
  const index = event.params.index.toString();
  const from = event.params.from;
  const redemptionId = index + "-" + from.toHexString();
  const redemption = Redemption.load(redemptionId);

  if (redemption) {
    const historyItemsLength = redemption.redemptionHistory.length;
    const redemptionHistoryItem = new RedemptionHistory(redemptionId + "-" + (historyItemsLength + 1));
    redemptionHistoryItem.amount = event.params.amountRedeemed;
    redemptionHistoryItem.timestamp = event.block.timestamp;
    redemptionHistoryItem.save();

    redemption.redemptionHistory.push(redemptionHistoryItem.id);
    redemption.save();
  }
  
}
