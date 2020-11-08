![Rooms logo](./static/rooms.png)
<br/>

_Rooms_ is a frontend library for enabling multi-user sessions (multiplayer games, chatrooms, etc) without any backends beyond [ICE servers](https://webrtc.org/getting-started/peer-connections#ice_candidates). With _Rooms_, developers would only have to write frontend code and throw it onto a CDN to create a functional group experience.*

As of November 2020, _Rooms_ is still in early development.

\* - Developers may want to host their own ICE servers. Still, the developer experience has the potential to be serverless due to the availability of free, public ICE servers.

### Design

_Rooms_ provides functionality in two parts. The high-level design is as follows.

##### Fault-tolerant serverless group connections

WebRTC is scoped for 1:1 connections where the two peers are aware of each other e.g. they have exchanged their ids. For group connections, every participant needs to go through an exchange with each other participant. A backend service traditionally handles id generation and exchange.

_Rooms_ instead specifies a participant to act as a doorman and represent the room. The doorman is responsible for programmatically accepting connections from newcomers and introducing them to the rest of the participants. This way, clients that want to join the group connection only need to know the room id.

Note: the concept of the room is abstract, as there are no centralized instances of the room. The term "room" just refers to the inter-connected cluster of participants. The term "room id" instead refers to the id of the endpoint hosted by the doorman.

Re-assignment of the doorman role is integrated with the election algorithm provided by the [Raft consensus algorithm](https://raft.github.io/). This ensures that there is always a doorman available even if the current doorman goes offline.


##### Distributed state consensus

 _Rooms_ uses the [Raft consensus algorithm](https://raft.github.io/) to ensure that every participant has the same application state and therefore sees the same thing.

##### FAQ
These are the most common catches that people have asked about:

_|| What about accountability? (cheating, impostering, etc)_

There are some precautions that can be taken e.g. requiring signatures on state change proposals. Additionally, the distributed nature requires at least of half the participants to agree on a state change before it is allowed.

However, since Raft operates in a leader-follower fashion, _Rooms_ will always require trust to a certain extent. Because of this, _Rooms_ will likely not be suitable for highly competitive/ranked games.

_|| What about data persistence?_

It's possible for the room state to be saved to local storage/cookies and then be programmatically restored at a later time. This would be up to the app developer and would be a trade-off with accountability.

_|| What about latency?_

There are a lot more mechanics involved with updating distributed state vs. centralized state. _Rooms_ likely won't be suitable for intensive real-time games, but would be fine for social apps and turn-based games.

### Proposed API
##### Creating/joining a room
```ts
import {Room} from 'rooms'

const room = Room.join('desired-participant-id', 'preexisting-room-id')

// OR

const room = Room.create('desired-participant-id', 'new-room-id', initialState)
```

##### Listening for events
```ts
/**
 * TBH, I haven't thought about this much... Would probably need to provide some React
 * hooks and other features.
 */
room.on('state-update', (change, currState) => { ... })
```
