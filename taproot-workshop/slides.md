---
marp: true
---

<div style="padding-top:200px;">
  <h1>Taproot MAST Workshop</h1>
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

<!--
  * The "segwit" update (BIP140) introduced the witness versioning system. This system upgraded bitcoin's script execution, without breaking existing consensus rules.
-->

---

# Features of Taproot

* Schnorr-based signatures. Allows simpler aggregation of signatures, plus new cryptography protocols (such as FROST).

* Reverted to using naked public keys on-chain, shortened to 32 bytes (x-only). Keys are encoded using bech32m.

* Key-spends now only require a 64-byte signature, which makes simple taproot transactions cheaper than segwit.

* Allows spending from a MAST of bitcoin scripts. Full proof requires a single script + internal public key + merkle proof.

<!--
* Internal key is the bare public key of the custodian.

* Later we'll get into how the proof is constructed and verified.

-->

---

# What is a Merkle Tree

* A binary tree of hashes.

* Each leaf node contains a hash of some data.

* Each branch node is the hash of its children.

* The final hash is considered the root.

<img src="static/hash-tree.png" style="padding-left:300px;width:400px;"/>

<!--
* You start with hashing the data in each leaf node.

* Then you iterate over the leaves in batches of two, 
-->

---

# Why Merkle Trees

* The root hash commits to all leaves and their location.

* You can prove a leaf is included with minimal data.

* They are very fast to search and update (**O(logn)**).

<!--
**Operation	Complexity**

Space     :	O(n)
Searching :	O(logn)
Traversal :	O(n)
Insertion :	O(logn)
Deletion  :	O(logn)
Sync      :	O(logn)
-->

---

# MAST and Bitcoin Script

* You can store a hashed bitcoin script in the tree.

* You can also store a hash of *any* type of data in the tree.

* To spend with a script, you reveal the desired script along with a merkle proof (called the "control block").

* This proof does not reveal any other scripts or data within the tree.

---

# Tagged Hashing

* Introduced in BIP340.

* Provides domain separation for hashes.

* Prevents hash collisions with other protocols.

```py
def hash340 (tagstr, ...data):
  # The tag hash is a sha256 digest of the string.
  taghash  = sha256(encode(tagstr)) 
  # Prefix the data with the tag hash twice.
  preimage = concat(taghash, taghash, ...data)
  # Return the sha256 digest of the pre-image.
  return sha256(preimage)
```

<!--
* Without tagged hashing, a BIP340 signature could be valid for another signature scheme where the only difference is the ordering of terms in the signature itself.

* Worse, this other signature protocol may recompute the same nonce and possibly leak the private key.
-->

---

# Example Script Paths

* Path A: Unlock with a signature from `pubkey_a`.

* Path B: Unlock with a `preimage` and signature from `pubkey_b`.

* Path C: After 2048 blocks, unlock with a signature from `pubkey_c`.

```json
[
  [ "<pubkey_a>", "OP_CHECKSIG" ],
  [ "OP_HASH160", "<hash>", "OP_EQUALVERIFY", "<pubkey_b>", "OP_CHECKSIG" ],
  [ "2048", "OP_CHECKSEQUENCEVERIFY", "OP_DROP", "<pubkey_c>", "OP_CHECKSIG" ]
]
```

---

# Creating the Leaves

```py
# Default MAST version for taproot.
DEFAULT_VERSION = 0xc0

# Compute a tapleaf hash.
def get_tap_leaf(script, version = DEFAULT_VERSION):
  # Encode the script as bytes.
  script_hex   = encode_script(script)
  # Normalize the version parity bit.
  leaf_version = version & 0xfe
  # Return a tagged hash of the serialized script.
  return hash340('TapLeaf', leaf_version, script_hex)
```

```
0807eaaea88f9334ac6239800261928924a3a921a92256523c43c05b85b06da5
fe938722046a4c6c6955d917f1d33b0a0b5d79173c76ed39c9ab50cc772aace0
d9dbdf499e22e2998378310c6241bc1458c888f1fecce853ff946474d9b1db66
```

---

# Computing the Branches

* Nodes are sorted in lexographical order.

* This example naively assumes a balanced tree.

```py
def compute_branch (node_a, node_b):
  # Compare and sort nodes.
  if node_b < node_a:
    node_a, node_b = node_b, node_a
  # Return a tagged hash of both nodes.
  return hash340('TapBranch', node_a, node_b)
```

```
d1e80d43a973b446dac609e96c5932bb2159d73bfc460e79a726e8b16a66b3ab
2da3d9180c1f0f4c0028efdaf62b6a44e962bf7a350a434a49503d9250520aa0
```
---

# Computing the MAST Root

* Taproot is very naive towards tree structure.

* Trees can be unbalanced, and leaves can have varying depths.

* Most implementations use a complete, balanced binary tree.

* The verifier algorithm starts with a script hash, then consumes the merkle proof 32 bytes at a time.

<!--
* To balance a tree, sort all leaves lexographically, then copy the last element.
-->

---

# Creating the Taproot Tweak

* Compute a tweak value using the internal pubkey and root hash.

```py
def get_tap_tweak(internal_pubkey, root_hash):
  # Make sure the internal key is x-only.
  internal_pubkey = get_xonly_key(internal_pubkey)
  # Return a tagged commitment to the internal key and root hash.
  return hash340('TapTweak', internal_pubkey, root_hash).digest
```

```
root  : bf8217433e921df96bb9e5c946500c2f50903127dcd7f9737275416d7d12a5e0
tweak : a33249257ae7d48c2320b2e0e7b09a4469d2387128aa3909d8ad33f7d6b9eb12
addr  : bcrt1p3vm5tgyx2azh4cudlga0h2jxuyc56mkku7r82ylgnfm86hfttzcs009tdf
```

---

# Deriving a Taproot Address

* The internal key can be a single pubkey, or Musig / FROST group pubkey.

* Tweak the internal public key with the taproot tweak.

* For script-only spending, use a provably un-spendable key (BIP341).

* Format the key using bech32m.

```py
taproot_tweak   = get_tap_tweak(internal_pubkey, root_hash)
taproot_pubkey  = tweak_pubkey(internal_pubkey, taproot_tweak)
locking_script  = encode_script([ 'OP_1', taproot_pubkey ])
taproot_address = bech32m.encode(locking_script)
```

---

# The Control Block

* First segment is a version bit for the MAST protocol.

* The LSB of the version bit defines the parity of the internal pubkey.

* Second segment is the 32-byte internal public key.

* Remaining data contains the merkle proof (in 32-byte segments).

```
c1
1340a0cdc67100268fd325ff41ddc736e7fc2b078526758633e0c2d260fd1afa
0807eaaea88f9334ac6239800261928924a3a921a92256523c43c05b85b06da5
2da3d9180c1f0f4c0028efdaf62b6a44e962bf7a350a434a49503d9250520aa0
```

---

# Spending with the Pubkey

* Tweak the private key with the taproot tweak (and negate if needed).

* Sign the transaction using BIP341 and include the signature.

```py
# Transaction input.
vin : [
  {
    txid : 'e0b1b0aea95095bf7e113c37562a51cb8c3f50f5145c17952e766f7a84fcc5d7'
    vout : 0,
    prevout : {
      value : 100_000,
      scriptPubKey : [ 'OP_1', taproot_pubkey ]
    }
    sequence : 0xFFFFFF,
    witness  : [ signature ]
  }
]
```

---

# Spending from the MAST

* Sign the transaction using BIP341 (with script extension).

* Include the witness data (arguments, script, cblock).

```py
# Transaction input.
vin : [
  {
    txid : 'e0b1b0aea95095bf7e113c37562a51cb8c3f50f5145c17952e766f7a84fcc5d7'
    vout : 0,
    prevout : {
      value : 100_000,
      scriptPubKey : [ 'OP_1', taproot_pubkey ]
    }
    sequence : 2048,
    witness  : [ signature, script_hex, cblock ]
  }
]
```

---

# Taproot Spending Review

* All taproot addresses can be spent via the on-chain pubkey, or via a script.

* Key spends require tweaking the private key before signing.

* Script spends require revealing the internal key + a merkle proof.

* Key spending can be disabled using a provably unspendable key.

---

# Verifying a MAST

* The script (as a tapleaf) + merkle proof must compute up to the merke root.

* The internal pubkey + merkle root tweak must equal the on-chain pubkey.

* For OP_CHECKSIG, the sighash must commit to the script tapleaf being spent.

---

# Using MAST to prove Data

* Basic Trees.

* Sparse Merkle Trees.

* Merkle Sum Trees.

<!--

With a baasic tree, you can prove the inclusiion of a leaf within the tree. You can also imply depth based on the size of the merkle proof.

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

# Using Scripts to store Data

* The taproot upgrade removed the limits on script size in a transaction.

* You can embed data into a script using `OP_IF` as an envelope.

* Spending with the script also publishes the data on-chain.

```py
[ '<pubkey>', 'OP_CHECKSIG' 'OP_0', 'OP_IF', '<data_payload>', 'OP_ENDIF' ]
```

<!--
* There is a transaction size limit enforced by the mempool policy of Bitcoin Core. This limit does not apply to transactions already in a block.

* Miners have been known to accept non-standard transactions from outside the mempool.
-->

---

<div style="padding-top:200px;">
  <h1>The End</h1>
  <img src="static/taproot-qr.png" style="float:right;"/>
  <p style="height:210px;"></p>
  <a href="https://github.com/cmdruid/workshops">https://github.com/cmdruid/workshops</a>
</div>
