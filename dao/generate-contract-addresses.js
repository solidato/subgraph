const networks = require("./networks.json");
const fs = require("fs");

const votingAddress = networks.tevmos.Voting.address;
fs.writeFile(
  "./generated/addresses.ts",
  `

export const VOTING_CONTRACT_ADDRESS = '${votingAddress}';

`.replace(/\n/g, ""),
  () => {
    console.log("✅ Contract address generated");
  }
);
