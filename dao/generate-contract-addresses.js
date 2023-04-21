const networks = require("./networks.json");
const fs = require("fs");

const network = process.env.NETWORK || "evmos";
const votingAddress = networks[network]?.Voting.address;

console.log("🚀 Generating contract address for network", network, "...");

if (!votingAddress) {
  console.log(
    `❌ ${network} network not found, please make sure to provide the NETWORK environment variable`
  );
  process.exit(1);
}

fs.writeFile(
  "./generated/addresses.ts",
  `

export const VOTING_CONTRACT_ADDRESS = '${votingAddress}';

`.replace(/\n/g, ""),
  () => {
    console.log("✅ Contract address generated");
  }
);
