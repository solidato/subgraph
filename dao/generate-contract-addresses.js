const networksNeokingdom = require("./networks-neokingdom.json");
const networksCrowdpunk = require("./networks-crowdpunk.json");
const fs = require("fs");

const networksChooser = {
  neokingdom: networksNeokingdom,
  crowdpunk: networksCrowdpunk,
}

const networks = networksChooser[process.env.CURRENT_DAO || "neokingdom"]
const network = process.env.NETWORK || "evmos";
const votingAddress = networks[network]?.Voting?.address;
const internalMarketAddress = networks[network]?.InternalMarket?.address;
const governanceTokenAddress = networks[network]?.GovernanceToken?.address;
const neokingdomTokenAddress = networks[network]?.NeokingdomToken?.address;
const shareholderRegistryAddress =
  networks[network]?.ShareholderRegistry?.address;

console.log("🚀 Generating contract addresses for network", network, "...");

if (!networks[network]) {
  console.log(
    `❌ ${network} network not found, please make sure to provide the NETWORK environment variable`
  );
  process.exit(1);
}

fs.writeFile(
  "./generated/addresses.ts",
  `export const VOTING_CONTRACT_ADDRESS = '${votingAddress}';
export const INTERNAL_MARKET_CONTRACT_ADDRESS = '${internalMarketAddress}';
export const GOVERNANCE_TOKEN_CONTRACT_ADDRESS = '${governanceTokenAddress}';
export const NEOKINGDOM_TOKEN_CONTRACT_ADDRESS = '${neokingdomTokenAddress}';
export const SHAREHOLDER_REGISTRY_CONTRACT_ADDRESS = '${shareholderRegistryAddress}';
`,
  () => {
    console.log("✅ Contract addresses generated");
  }
);
