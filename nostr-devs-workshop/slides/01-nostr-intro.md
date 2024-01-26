---
marp: true
theme: internal
---

# Intro to Nostr

---

# What is Nostr?

* Notes and other stuff transmitted by relays.

* Nostr is a message protocol built on websockets.

* Nostr uses dumb servers to relay and store data.

* Nostr implements modern cryptography in a simple and powerful way.

---

# The Peer Discovery Problem

* We don't have enough IP (v4) addresses for everyone.

* Clients behind private networks are not publicly reachable.

* The simplest way to connect is to rendevous on a public server.

* Almost all application protocols use a client / server model.

---

# Pros and Cons 

[ + ] Public servers help us find and connect with other peers.

[ + ] They establish our digital identity across multiple devices.

[ - ] They can have complete control over your information.

[ - ] They can have complete control over your digital identity.

---

# Protocol Examples

* Centralized: (Facebook, Twitter, Discord, Signal)

* Federated: (Mastadon, Matrix, IRC, Email)

* Decentralized: (Bitcoin, Bitorrent, Tor)

---

# Key Features of Nostr

* Servers are simple to build and easy to run.
* Clients have complete ownership of their identity.
* Uses websockets (which work in the browser).
* The core specification is short and easy to understand.

---

# Examples of Decentralized Apps

* Social Media (with micro-payments)
  <!-- Damus, Amethyst, Iris, Snort -->
* Messaging / Chat
  <!-- Anigma, NostrChat, Vidya Live -->
* Search / Analytics
  <!-- Nostr.band, Zaplife.lol -->
* Marketplace / Ecommerce
  <!-- NostrMarket, Super Store  -->
* Machine-to-Machine Interface.
  <!-- NostrConnect, NostrEmitter -->

---

# Criticisms

* Scalability.
* Identity recovery.
* Resistance to attacks.
* Still very early.

---

# Why Nostr?

- Very simple and fun to build with.
- Relays are small and light-weight to use.
- Peering works natively within the browser.
- Decentralized identity comes standard.

---

# Next : Intro to Nostr Development
