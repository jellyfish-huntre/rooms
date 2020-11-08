import { DataConnection, PeerConnectOption } from 'peerjs'
import { MessageType, RoomSyncMessage } from '../types/Message'
import ConnectionSet from './ConnectionSet'

// Class that creates a host endpoint for a given room.
export default class Host extends ConnectionSet {
  constructor(roomId: string, connectionOptions?: PeerConnectOption) {
    super(roomId, connectionOptions)

    this.addListener(MessageType.RoomSyncRequest, this.sendRoomSyncMessage.bind(this))
  }

  private sendRoomSyncMessage(connection: DataConnection) {
    const message: RoomSyncMessage = {
      type: MessageType.RoomSync,
      participants: Array.from(this.connectionMap.keys()),
    }

    connection.send(message)
  }

  protected handlePeerError(error: string) {
    console.error(`Host ${this.id} error: ${error}`)
  }
}