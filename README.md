*For the graph-node configuration, check [./provision](./provision.md).*

# Connect to the production server

To manage containers, update the subgraph: `ssh worker@api.neokingdom.org`

To admin the server: `ssh root@api.neokingdom.org`

## Deploy a new subgraph

Make sure you've updated the networks/:DAO.json. **Attention**: the shape of the JSON **needs** to be:

```JSON
{
  "networkName": {
     "ContractName": {
      "address": "...",
      "startBlock": 123
    },
  },
}
```

Otherwise it will error upon deployment

Connect to worker@api2.neokingdom.org, run `tmux attach` to connect to the current tmux session, go to `/home/worker/subgraph/dao`, run 

- staging instance: `pnpm run remove-local:DAO ; pnpm run create-local:DAO ; pnpm deploy-staging:DAO`
- production instance: `pnpm run remove-local:DAO ; pnpm run create-local:DAO ; pnpm deploy-production:DAO`

Note: At the moment, `:DAO` can be `neokingdom`, `crowdpunk` or `teledisko`

### Sample deployment of a new subgraph (i.e. Crowdpunk)

ℹ️ Update the network json (if not updated already), push the code.

```bash
ssh worker@api2.neokingdom.org

worker@neokingdom2:~$ cd NEOKingdomDAO/subgraph/dao
worker@neokingdom2:~/NEOKingdomDAO/subgraph/dao$ git pull
worker@neokingdom2:~/NEOKingdomDAO/subgraph/dao$ pnpm run remove-local:crowdpunk; pnpm create-local:crowdpunk; pnpm deploy-production:crowdpunk
```

✅

## Troubleshooting

### ERRO the genesis block hash for chain tevmos has changed from X to Y since the last time we ran, component: BlockStore

See: https://github.com/graphprotocol/graph-node/issues/3655

Solution: stop docker compose, remove `/home/worker/subgraph/data` dir, restart docker compose.

### ERRO Connection to provider failed when connecting to TEVMOS

See: https://github.com/graphprotocol/graph-node/issues/3699

Solution:
- check if the testnet has been restarted and recreated using a new genesis file: https://github.com/evmos/testnets
- if so, check the new lowest block number
- update the lowest block number in `docker-compose.yml`, env variable `GRAPH_ETHEREUM_GENESIS_BLOCK_NUMBER`


# Installation
```
npm install -g @graphprotocol/graph-cli
```

# Local development

## Setup
```
# make sure your env contains the following variable
ETHEREUM=<tevmos:https://eth.bd.evmos.dev:8545 | evmos:https://eth.bd.evmos.org:8545>
GENESIS_BLOCK=<genesis block>

# install and run ethnode or ganache-cli
# deploy contracts locally

git clone https://github.com/graphprotocol/graph-node/
cd graph-node/docker
docker-compose up
```

## Deploy locally
```
graph create --node http://localhost:8020/ <subgraph-name>
graph init --product hosted-service --from-contract <address> --allow-simple-name --index-events --contract-name <contract-name> --abi <dir> --network mainnet --protocol ethereum <subgraph-name>
graph deploy <subgraph-name> -g http://localhost:8020/ -i http://localhost:5001/
```

## Deploy locally
```
graph create --node http://localhost:8020/ <subgraph-name>
graph init --product hosted-service --from-contract <address> --allow-simple-name --index-events --contract-name <contract-name> --abi <dir> --network mainnet --protocol ethereum <subgraph-name>
graph deploy <subgraph-name> -g http://localhost:8020/ -i http://localhost:5001/
```