---
marp: true
theme: internal
---

# Intro to Nostr Development

---

# What is a Nostr Note?

A Nostr note is a basic JSON object that contains the following fields:

```
content    : The text content of the note.
created_at : A unix timestamp (in seconds) of when the note was published.
kind       : The 'kind' or type of note that is being published.
tags       : Metadata tags associated with the note.
id         : A hash that commits to the details of the note.
pubkey     : The public key of the user who published the note.
sig        : A digital signature that verifies the id and pubkey of the note.
```

```js
const event = {
  "content"    : "I think I'm the first (but not the last) to mention nostr on an earnings call...",
  "created_at" : 1683236216,
  "kind"       : 1,
  "tags"       : [],
  "id"         : "3b29d6525096f2162888e5e5d8fb266e11d052a15f9f90f1dda144ed652f3f44",
  "pubkey"     : "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
  "sig"        : "639a56adbf60519a3c1697cd3abe9afe0eee55163a1d3cf45f2efaae5928ec95a5c74679f85b5d716fdf972604f635c72bc68842c278744c7e5ca4f9a2f88cc1",
}
```

---

# Publish a Nostr Note

To publish a note, we connect to a relay and send an `EVENT` message:

```js
const ws = new WebSocket('wss://damus.relay.io')

ws.on('open', () => {
  ws.send(JSON.stringify([ 'EVENT', event ]))
})
```

You can publish a signed note from any user to a relay.

Most relays will respond with an `OK` message with success or errors.

---

# Note ID

The `id` is a cryptographic hash that commits to the message details:

</br>

```js
const preimg = [
  0,                    // Future version number.
  event['pubkey'],      // Pubkey of the author.
  event['created_at'],  // Unix timestamp of the note.
  event['kind'],        // The 'kind' or type of note.
  event['tags'],        // Metadata tags for the note.
  event['content'],     // Content of the note.
]
```

---

# Sign and Verify a Nostr Note

The signature is produced by signing the Note ID with your secret key.

```js
const sig = schnorr.sign(seckey, id)
```

Any client can verify your note by checking the signature, id, and public key.

```js
const isValid = schnorr.verify(sig, id, pubkey)
```

---

# What is a Relay?

* A relay is a websocket server that stores notes and manages subscriptions.
* A relay can use any kind of database to store notes.
* A relay can also run as 'forward-only' and not store any persistent data.

---

# Create a Subscription Filter

A filter is used to subscribe to a feed of notes stored on a relay.

```js
// Note timestamps are stored in seconds, so we need to factor out milliseconds.
const now = Math.floor(Date.now() / 1000)

const filter = {
  // Subscribe to all notes of kind 1 since now.
  kinds : [ 1 ],
  since : now
}
```

When requesting a back-log of notes, relays typically enforce a limit of 100 notes per query. You can use `since` and `until` keywords to paginate your queries.

---

# Subscribe to Events

To subscribe to an event feed, we connect to a relay and send a `REQ` message:

```js
const ws = new WebSocket('wss://damus.relay.io')

ws.on('message', (msg) => {
  const [ type, subId, event ] = msg

  if (type === 'EVENT') console.log(event)
  if (type === 'EOSE' ) console.log('End of subscribed events!')
})

ws.on('open', () => {
  const subId = 'somerandomstring'
  ws.send(JSON.stringify([ 'REQ', subId, filter ]))
})
```

---

# Nostr Implementation Possibilities (NIP)

  The original specification to the Nostr protocol is listed here:

  - https://github.com/nostr-protocol/nips/blob/master/01.md

  <br/>
  
  Each proposal is given a number. You can track a comprehensive list here:

  - https://nips.be

---

# Developer Resources

Here are some great resources for new developers:

<style scoped>
  div {
    margin: auto;
    text-align: left;
    font-size: 0.75rem;
    display: grid; 
    grid-template-columns: 1fr 1fr;
    margin-top: 1rem;
  }
</style>

<div>

**Awesome Nostr**
A comprehensive list of nostr resources:
https://github.com/aljazceru/awesome-nostr

**Nostr.Watch**
A list of publicly available relays:
https://nostr.watch

**Nostr Tools**
A library tool for developing nostr clients:
https://github.com/nbd-wtf/nostr-tools

**Nostr.band**
A search engine for nostr:
https://nostr.band

**Army Knife**
A web tool for checking / validating nostr events:
https://nak.nostr.com

</div>

---

# Next : Build Your First Nostr App
