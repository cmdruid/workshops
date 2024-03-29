---
marp  : true
theme : default
class : invert
---

# Building on Bitcoin Core

</br>

<p class="center">
  By Topher Scott
</p>

<p class="center">
  https://t.ly/JimmS
</p>

![bg right:35% w:250](./img/qrcode.png)

---

<!-- class: _invert -->

# Presentation Goal

* Download, install, and configure Bitcoin Core.

* Generate funds, use the wallet, and run commands.

* Communicate with core using shell or HTTP requests.

* Wrap the core client with a webserver.

---

# What is Bitcoin Core?

* The original client created by Satoshi Nakamoto. Written in C++.

* The most dominant node implementation in the ecosystem.

* Light, portable binary with few dependencies.

* A basic GUI client wallet, with a developer console.

<!-- 
  * Do we have a visual breakdown of clients in the space?

  * Gold standard for on-chain disputes, peering, and mempool policy.
-->

---

# Running Bitcoin Core

* Download Links
  https://bitcoin.org/en/download

* Installation Guide
  https://bitcoin.org/en/full-node

* Build from Source
  https://github.com/bitcoin/bitcoin

![bg right:35% w:300](./img/bitcoin.png)

---

# Configure Bitcoin Core

* Using the command line:
  `bitcoin-qt -regtest`

* Using a `bitcoin.conf` config file:
  ```conf
  ## Bitcoin Config
  chain   = regtest
  server  = 1
  txindex = 1
  ```

<i>https://jlopp.github.io/bitcoin-core-config-generator</i>

![bg left:25% w:400](./img/config.jpg)

<!--
  * There are many, many great config options to play with.

  * You can also specify a config file using -conf="path", which is great for scripts.
-->

---

# Choose a Network (blockchain)

* **regtest** : Internal testing. Can generate blocks freely.

* **signet**  : Public / feature testing. Can host your own chain.

* **testnet** : Staging / final testing. Follows the main chain.

* **main**    : The main chain that we all know and love.

* **mutiny**  : Custom signet fork. Allows faster issuance of blocks.

<!--
  * What additional opcodes are enabled on signet?
-->

---

# Bitcoin QT Demo

* Launch the client: `bitcoin-qt -regtest`

* Create a new wallet and generate an address.

* Use the node console to generate blocks.

* Use our wallet to send / receive funds.

* View our transaction in the blockchain.

![bg right:40% w:400](./img/qt-client.png)

<!--
  * Homework challenge: Dump the xprv keys, load them into an HD wallet library, and try to generate the same addresses in the HD tool as in Bitcoin Core.
-->

---

# Bitcoin Core Daemon

* Run in the foreground:
  ```bash
  bitcoind -regtest
  ```

* Run in the backround:
  ```bash
  bitcoind -daemon -regtest
  tail -f ~/.bitcoin/regtest/debug.log
  ```

* Run as a system service:
  https://github.com/bitcoin/bitcoin/blob/master/contrib/init/bitcoind.service

  <!--
    * The core daemon can run in many places, including github actions!
  -->

---

# Indexing Data

* Bitcoin Core has limited indexing options.
  `txindex=1`

* Electrum offers many new indexes of chain data.

* Examples of indexing servers:
  - https://mempool.space
  - https://github.com/Blockstream/esplora

* Indexes can get very large (600+GB).

* You can mock up a fake index for local testing.

![bg left:30% w:300](./img/silo.png)

<!-- 
  * Explain what txindex does (fast lookups of tx).

  * Explain what it doesn't do (fast lookups of adresses)

  * Show a brief example of mempool.space/api (and chains)
-->

---

# Connect to Bitcoin Core (CLI)

* Generate RPC Auth String:
  https://jlopp.github.io/bitcoin-core-rpc-auth-generator

* Add to `bitcoin.conf` file:
  `rpcauth=regtest:84778e451d9eda98f9ea0c7bf6245e5e$ef8626caf617f9be75c5ad636f92e97aa85caa40cef578beb0147a9cdf158ee2`

* Restart Bitcoin Core.

* Connect to Bitcoin Core (CLI)

  ```bash
  alias bcli="bitcoin-cli -rpcuser=regtest -rpcpassword=bitcoin -rpcwallet=regtest"
  bcli getnewaddress
  ```

<i>https://developer.bitcoin.org/reference/rpc</i>

<!-- 
  * The cli tool is great for automating core through shell scripts.

  * It's helpful to use an alias that includes your connection info.
-->

---

# Connect to Bitcoin Core (JSON-RPC)

```js
{
  url     : 'http://127.0.0.1:18443/wallet/<wallet_name>',
  method  : 'POST',
  headers : {
    'Authorization' : 'Basic ' + base64('user' + ':' + 'pass'),
    'content-type'  : 'application/json'
  },
  body : JSON.stringify({
    jsonprc : 1.0,
    id      : randomId(),
    method  : 'getnewaddress',
    params  : [ '-addresstype', 'legacy' ]
  })
}
```

<i>https://github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md</i>

<!-- 
  * JSON-RPC is better thought of as an HTTP interface.

  * JSON-RPC can be configured to use an SSL certificate.
-->

---

# Wrap Bitcoin Core

* Create an http endpoint with our webserver.

* Use JSON-RPC to fetch data internally.

* Format and return the JSON-RPC in the response.

<i>https://github.com/cmdruid/core-cmd</i>

![bg left:35% w:300](./img/bun.png)

---

<!-- class: invert -->

# Go out and build!

</br>

* Contract Info:
  github.com/cmdruid
  twitter/x: @btctechsupport

</br>

* Link to presentation:
  https://t.ly/JimmS

![bg right:45% w:350](./img/dip.jpeg)