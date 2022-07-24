# EVMOSWAPV2

pm2 start npm --name "evmoswap-interface" -- start

pm2 start npm --name "crswap-interface" -- start -- --port 3001
pm2 start npm --name "evmoswap-interface" -- start -- --port 3002


https://pm2.keymetrics.io/docs/usage/quick-start/
