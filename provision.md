# Provision

Scripts and configs used to run `graph-node`.

- [`configure.sh`](./configure.sh) commands to run to configure a server. Not automated, run it manually.
- [`Dockerfile`](./Dockerfile) configure IPFS v0.10 to run with CORS.
- [`docker-compose.yml`](./docker-compose.yml) run Postgres, IPFS, graph-node.
- [`api.neokingdom.org`](./api.neokingdom.org) nginx configuration.