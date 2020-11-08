import { DataConnection, PeerConnectOption } from 'peerjs'
import ConnectionSet from './ConnectionSet'
import Host from './Host'
import { MessageType, RoomSyncMessage, RoomSyncRequestMessage } from '../types/Message'

// Class that represents the connections to the host and other participants.
export default class Room extends ConnectionSet {
  public host?: Host
  public hostConnection: DataConnection

  constructor(selfId: string, roomId: string, connectionOptions?: PeerConnectOption) {
    super(selfId, connectionOptions)

    this.hostConnection = this.peer.connect(roomId, this.connectionOptions)
    this.setupHostConnection()
  }

  private setupHostConnection() {
    this.hostConnection.send({ type: MessageType.RoomSyncRequest } as RoomSyncRequestMessage)

    this.hostConnection.on('open', () =>
      this.hostConnection.on('data', this.handleRoomSyncMessage.bind(this)))
  }

  private handleRoomSyncMessage(message: RoomSyncMessage) {
    for (const participant of message.participants) {
      if (participant !== this.id) {
        this.maybeConnect(participant)
      }
    }
  }

  protected handlePeerError(error: string) {
    console.error(`Room ${this.id} peerjs error: ${error}`)
  }

  static join(selfId: string, roomId: string, connectionOptions?: PeerConnectOption) {
    return new Room(selfId, roomId, connectionOptions)
  }

  static create(selfId: string, roomId: string, connectionOptions?: PeerConnectOption) {
    const host = new Host(roomId, connectionOptions)
    const room = new Room(selfId, roomId, connectionOptions)
    room.host = host
    return room
  }
}