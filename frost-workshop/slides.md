---
marp: true
---

# FROST Workshop
by Christopher Scott


---

# What is FROST?

* Fast Round-Optimized Schnorr Signatures with Threshold.

* Published in December, 2020 by Chelsea Komlo and Iam Goldberg.

* Builds on top of the Shamir Secret Sharing (SSS) protocol.

* Use secret shares to sign a message as a group, without revealing the group secret or your share to others.

<!--
  * Both authors are from University of Waterloo in Ontario, Canada.

  * Chelsea works for Zcash foundation.

  * Fixes a forged-signature vulnerability that was present in previous protocols.

  * Similar to the Musig2 (BIP327) protocol, but for shamir secrets.
-->

---

# What can we do with FROST?

* We can publish a signed message using **k** of **n** signatures.

* Control magic internet money using a quorum of **k** of **n** participants.

* Keep the identity of all signing participants private.

---

# Hidden Benefits of FROST

* Should work with any schnorr-based digital signature protocol.

* The FROST secret key can be provably unknowable (via DKG).

* The **k** of **n** terms of a FROST pubkey can be updated by **k** particpants.

* The terms can be updated without changing the pubkey or secret.

---

# What is not defined in FROST?

* How secret shares are generated for participants.

* Delivery of Shares / Nonces / Signatures.

* BIP340 Taproot.

<!--
* FROST is not a batteries-included protocol.

* For compatibility with Bitcoin, some additional parts need to be added.

* FROST is flexible because it does not rely on these parts being strictly defined.

* In order to really understand FROST, you should also understand Shamir Secret Sharing.
-->

---

# Shamir Secrets Crash Course

* Polynomials.

* Polynomial Interpolation.

* Shamir Secret Sharing.

* Distributed Key Generation (DKG).

---

# What is a Polynomial?

* A math expression that consists of numbers, variables and exponents:

  **P(x) = 3x$^{2}$ + 2x + 1**

* Each "term" can be combined using addition, subtraction, and multiplication.

* The relationship between **P(x)** and **x** can be plotted on a graph:

  ![](static/nhutd.png) **P(x)$^{2}$ = x$^{3}$ + 7** 

<!--
* Polynomials can range from being very simple, to very complex.

* The secp256k1 curve is visible when modeled over a small range of real numbers (ex: -8 ~ 8+).
-->

---

# Polynomial Interpolation

* Creates a polynomial based on a set of data points.

* Evaluating **P(x)** will create new  points in relation to the existing set.

* The preferred method we use is called Lagrange Interpolation.

  **P(x) = y$_{0}$L$_{0}$(x) + y$_{1}$L$_{1}$(x) + ... + y$_{i}$L$_{i}$(x)**

<img src="static/lagrange.jpg" style="padding-left:50px;height:300px;width:400px;"/>

<!--
  * New data points will follow the "curve" that passes through the existing set of points.

  * This is only part of the formula. Not pictured is the Basis Polynomials (L).
-->

---

# Shamir Secret Shares

* Create the following polynomial of degree (**t - 1**) with constant term **S**:

  **P1(x) = **S** + a1x + a2x$^{2}$ + ... + a$_{t-1}$x$^{t-1}$**

* For each **P1(x)** we evaluate, we receive a new point (called a "share").

* Using **t** number of shares, we create a second polynomial via interpolation.

  **P2(x) = y$_{1}$L$_{1}$(x) + y$_{2}$L$_{2}$(x) + ... + y$_{t}$L$_{t}$(x)**

* If we evaluate at **P2(0)**, we will return the constant **S**.

---

# Why use Shamir Secret Shares?

* We can imbue a secret **S** to have a desired threshold of **t**.

* We can then split **S** into *any* number of individual shares.

* We can recover **S** using any subset of shares, provided we have **t** shares.

---

# Limitations of Shamir Secret Sharing

* Because **t** shares will reveal **S**, each share must be kept secret.

* Shamir assumes one person will generate all shares.

* We need a polynomial that is shared by a group of adversaries.

* How do we create a group polynomial where nobody knows **S**?

---

# Distributed Key Generation

For each participant :

* Create a polynomial with random **S** and threshold **t**.

* Deliver share **P(x)** to every participant **x** (including you).

* Sum all participant shares (including yours) into share **gx**.

* Share **gx** is a part of unknown group polynomial **gP(x)**.

Participants must collect **t** shares to create **gP**, which reveals **gP(0) = gS**.

But what if we don't want to reveal **gS** when **t** shares are combined?

---

# The FROST Protocol

FROST defines a safe protocol for collaboratively signing a message using secret shares, without revealing the group secret, or your share to others.

For each participant:

* Step 1: Create and distribute public nonce values (Round 1).

* Step 2: Collect other nonces, compute the group nonce and challenge.

* Step 3: Sign challenge with your share + secret nonce values.

* Step 4: Distribute, collect and verify partial signatures (Round 2).

Finally, combine **t** partial signatures into a complete schnorr signature.

---

# Round 1: Enrollment

* Generate two nonce values: "hidden" nonce and "binding" nonce.

* All participants exchange public nonces with each other.

* Also a good time to exchange shares and commits for DKG.

<img src="static/cs_vs_p2p.png" style="padding-left:200px;width:600px;"/>

<!--
* The "nonce" value is a one-time secret that you generate when signing a message.

* The nonce "masks" your secret and protects it from being revealed.

* The binding nonce will be tweaked with a group commitment.

* The hidden nonce will remain unchanged by the protocol.

* Round 1 is the most intensive for communication.

* P2P: Imagine a room where everyone must shake the hand of everyone else at least once.

* Client-server: Imagine a room where everyone must shake the hand of one special person.
-->

---

# Computing the Group Nonce for a Signature

* Generate a list of ids (**x**) and public nonces from each participant.

* Concatenate all participant data and hash it (using sha256).

* Concatenate this hash with the group pubkey and message being signed, then hash again. This is the group "prefix".

* For each participant, concatenate their id (**x**) with the prefix, then hash it. This is the participant's "binding factor".

* Tweak the participant's binding nonce value with the binding factor. Then add the tweaked nonce to the hidden nonce.

* Combine all particiant nonces into the group nonce **R**.

---

# Computing the Group Nonce for a Signature

```py
# Generate a list of concatenated data from each participant.
commits = [ concat(p.x, p.h_pnonce, p.b_pnonce) for p in participants ]

# Reduce all commitments into a single hash.
c_hash = sha256(...commits)

# Compute the group prefix hash.
prefix  = sha256(group_pk, message, c_hash)

# Compute the binders for each participant.
binders = [ sha256(prefix, p.x) for p in participants ]

# Compute the group nonce value.
group_R = 0
for p in participants:
  group_R += p.h_pnonce
  group_R += (p.b_pnonce + binders[p.x])
```

<!--
* This is a gross over-simplification of the protocol. Read the actual IETF specification for more accurate code.

* The prefix is meant to commit to the data of all participants involved the signing session.

* Each participant receives a unique commitment hash, which includes the group prefix hash + their share's x value.

* It's okay if your brain "tunes-out" on this slide.
-->

---

# Why are we doing this?

* The nonce value is the most vulnerable part of a digital signature.

* The nonce value is what sits between your private key and the world.

* Allowing strangers to influence this nonce is very dangerous.

* The group nonce must *not* be gameable.

* Contributions to the group nonce must have zero effect on its entropy.

<!--
* There are numerous attacks that involve manipulating the nonce (ROS).

* The core principle of FROST is to protect your secret share from being manipulated or revealed.

* Creating the group nonce for a signature is really the meat and potatoes of FROST.

* When you are dealing with cryptography, a concept of entropy is a very important thing to have.

* Good rule of thumb to remember: When you pick from a pool of one million numbers, each number must have a one-in-a-million chance. Bias reduces entropy.

* If the nonce is brute-forcable, then your secret key can be extracted from the signature. If bitcoin is involved, those funds are compromised.



-->
 
---

# Creating a Partial Signature

* We have to negate our nonce values if the group nonce has an odd y-value.

* We also have to calculate the parity and accumulative parity of the group public key when tweaks are applied.

* Compute lambda coefficient for the participant's secret share.

* Compute the challenge using BIP340.

* Compute the participant's secret nonce.

* Compute the final signature.

---

# Creating a Partial Signature

```py
# Taproot: Negate nonces if needed.
if group_R.y % 2 !== 0:
  h_snonce = N - h_snonce
  b_snonce = N - b_snonce

# Taproot: Set the correct parity for the secret key (BIP327).
sk = group_Q.parity * group_Q.state * share_secret

# Taproot: Format challenge using BIP340.
e = hash340('BIP340/challenge', message, share_pubkey, group_R)

# Compute participant coefficient from x values.
c = interpolate(identifiers, share_x)

# Compute the participant's secret nonce.
k = (b_snonce * bind_factor) + h_snonce

# Compute the participant's partial signature.
psig = (sk * e * c) + k
```

---

# Combining Partial Signatures

* If **t** partial signatures are combined, the result is a valid schnorr signature.

* Any tweaks to the group pubkey must also be applied to the signature.

```py
# Taproot: Compute the proper tweak value.
T = challenge * group_Q.parity * tweak

# Sum partial signature values, plus tweak.
s = ps_1 + ps_2 + ... + ps_t + T

# Return the final schnorr signature.
signature = concat(R, s)
```

---

# Demo

---

# BONUS: Updating shares of a Group Secret

* Set of **t + 1** participants create a new polynomial where **P(0) = 0**.

* Each participant delivers shares of their polynomial using DKG.

* Each participant computes group share **gy**, then sums **gx + gy = gz**

* Because **gPY(0) = 0**, **gPZ(0) = gS**. The group constant does not change.

Based on how **gPY** is constructed, you can add / remove participants, replace shares, change the threshold, and more!

---


# FROST Workshop

* Github link

* QR code