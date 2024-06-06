---
marp: true
---

<div style="padding-top:200px;">
  <h1>Taproot Workshop</h1>
  <p>by Christopher Scott</p>
  <img src="static/taproot-qr.png" style="float:right;"/>
  <p style="height:210px;"></p>
  <a href="https://github.com/cmdruid/workshops">https://github.com/cmdruid/workshops</a>
</div>

---

# What is Taproot?

* Taproot is a soft-fork update to the Bitcoin protocol.

* Activated on November 14, 2021, at block height 709,632.

* The details of taproot are covered in BIP340, BIP341, and BIP342.

* Taproot updates the witness script engine to version 1.

---

# Features of Taproot

* Schnorr-based signatures. This allows easier aggregation of signatures, plus a lot of new cryptography protocols (such as FROST).

* Moved back to using naked public keys on-chain, and shortened them to 32 bytes (x-only). Keys are encoded using bech32m.

* Key-spends now only require a 64-byte signature, which makes simple taproot transactions cheaper than segwit.

* OP_CHECKMULTISIG replaced with OP_CHECKSIGADD (which uses schnorr). Allows custom values for keys weights in a scripted multi-sig.

* Introduces MAST for script. Allows storing bitcoin scripts inside a MAST, and spending via revealing a single script + merkle proof.

---

# What is a Merkle Tree

* A binary tree of hashes.

* Each leaf node contains a hash of some data.

* Each branch node is the hash of its children.

* The root hash is a commitment to all leaves and their location.

* You can prove a leaf is included in the tree with minimal data.

<img src="static/hash-tree.png" style="padding-left:350px;width:350px;"/>

---

# MAST and Bitcoin Script

* You can store hashes of multiple bitcoin scripts in the tree.

* You can also store the hashes of *any* other data in the tree.

* To lock bitcoin to a MAST, use a public key tweaked with the root hash.

* To disable spending from the public key, use a provably unspendable key.

* To spend with a script, you reveal the desired script in the witness, along with a merkle proof, or proof of inclusion (called the "control block").

* This proof does not reveal any other scripts or data within the tree.

---

# MAST Considerations

* Taproot has no opinions on tree structure.

* Trees can be unbalanced, and leaves can have varying depths.

* When computing branches, children are sorted lexographically.

* The verifier algorithm simply starts with a script hash, then consumes the merkle proof 32 bytes at a time.

---

# Validating a Bitcoin MAST

* The script (when hashed) + merkle proof must compute the merke root.
* The internal pubkey + merkle root tweak must equal the on-chain pubkey.
* For OP_CHECKSIG, the sighash must commit to the script (as an "extension").

---

# Creating a Taproot Tree

* Show list of scripts.

* Tapleaf version.

* Show scripts hashed.

* Balancing a tree.

* Show branches hashed.

* Show root.

---

# Deriving a Taproot Address

* Create the tweak.

* Tweak the public key.

* Format using bech32m.

* Using an unspendable key (hashed, serialized generator point)

---

# The Control Block

* Show a color-highlighted diagram of the control block.

* Outline what each item is.

* Control block version.

* Internal key.

* Merkle proof.

---

# Spending from a MAST

* Sign the transaction (with script extension).

* Compute the control block.

* Format the witness (arguments, script, cblock)

---

# BONUS: Using MAST to store data

* Sparse Merkle Trees

* Merkle Sum Trees

* Taproot Assets

<!--

A Sparse (meaning ‘thinly scattered’) Merkle tree is a data structure in which it can be proven that specific data doesn't exist within a merkle tree. An SMT is an authenticated key-value store, meaning that the key, or location, of a leaf and the content of the leaf are bound to each other.

To achieve this property, the contents of the leaf are hashed and a merkle tree is created in which the leaf's position corresponds to the bitmap of the hash digest. By necessity, this requires a tree of 256 levels and 2^256 leaves. Generation of the tree is efficient--despite the apparently large size--because the overwhelming majority of the branches contain empty leaves and can be represented with nil hashes.

In Sparse Merkle trees, every leaf can be described as a guide to itself through a map when expressed in binary form.

i.e the binary digits of the leaf also represent its location in the tree

0 = go left, 1 = go right, result is either null 

Merkle sum trees are a type of merkle tree that contains numeric values at each leaf, and each node also carries the sum of the values below it. At the root of the Merkle sum tree is the sum of total values in the tree.

Merkle Sum trees allow efficient verification of conservation (non-inflation) by committing to quantities associated with leaves.

https://docs.lightning.engineering/the-lightning-network/taproot-assets/taproot-assets-protocol
-->

---

<div style="padding-top:200px;">
  <h1>The End</h1>
  <img src="static/taproot-qr.png" style="float:right;"/>
  <p style="height:210px;"></p>
  <a href="https://github.com/cmdruid/workshops">https://github.com/cmdruid/workshops</a>
</div>
