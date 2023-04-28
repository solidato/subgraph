import { Address } from "@graphprotocol/graph-ts";
import {
  NeokingdomToken,
  Transfer,
} from "../generated/NeokingdomToken/NeokingdomToken";
import { NEOKINGDOM_TOKEN_CONTRACT_ADDRESS } from "../generated/addresses";
import { getDaoUser } from "./dao-user";

export function handleTransfer(event: Transfer) {
  const addressTo = event.params.to;
  const addressFrom = event.params.from;

  const addressToHex = event.params.to.toHexString();
  const addressFromHex = event.params.from.toHexString();

  const nekoingdomTokenContract = NeokingdomToken.bind(
    Address.fromString(NEOKINGDOM_TOKEN_CONTRACT_ADDRESS)
  );

  if (addressFrom != Address.zero()) {
    const daoUserFrom = getDaoUser(addressFromHex);
    daoUserFrom.address = addressFrom;
    daoUserFrom.neokigdomTokenBalance = nekoingdomTokenContract.balanceOf(
      addressFrom
    );

    daoUserFrom.save();
  }

  if (addressTo != Address.zero()) {
    const daoUserTo = getDaoUser(addressToHex);
    daoUserTo.address = addressTo;
    daoUserTo.neokigdomTokenBalance = nekoingdomTokenContract.balanceOf(
      addressTo
    );

    daoUserTo.save();
  }
}
