import Peer, { DataConnection, PeerConnectOption } from 'peerjs'
import Message, { MessageListener, MessageType } from '../types/Message'

// Class that represents and manages a set of connections.
export default abstract class ConnectionSet {
  public id: string
  public peer: Peer
  public connectionMap: Map<string, DataConnection> = new Map()
  protected listenerMap: Map<MessageType, MessageListener[]> = new Map()
  protected connectionOptions?: PeerConnectOption

  constructor(idOrPeer: string | Peer, connectionOptions?: PeerConnectOption) {
    if (typeof idOrPeer === 'string') {
      this.id = idOrPeer
      this.peer = new Peer(idOrPeer)
    } else {
      this.id = idOrPeer.id
      this.peer = idOrPeer
    }

    this.peer.on('error', this.handlePeerError.bind(this))
    this.peer.on('connection', this.handleConnection.bind(this))
    this.connectionOptions = connectionOptions
  }

  addListener(type: MessageType, listener: MessageListener) {
    const listeners = this.listenerMap.get(type) || []
    listeners.push(listener)
    this.listenerMap.set(type, listeners)
  }

  removeListener(listener: MessageListener) {
    const listenerArrs = Array.from(this.listenerMap.values())

    for (const listenerArr of listenerArrs) {
      if (listenerArr) {
        const indexOf = listenerArr?.indexOf(listener)

        if (indexOf !== -1) listenerArr.splice(indexOf, 1)
      }
    }
  }

  broadcast(message: Message) {
    const peerIds = Array.from(this.connectionMap.keys())

    for (const id of peerIds) {
      this.send(id, message)
    }
  }

  send(peerId: string, message: Message) {
    const connection = this.connectionMap.get(peerId)

    if (connection?.open) {
      connection.send(message)
    } else {
      this.connectionMap.delete(peerId)
    }
  }

  maybeConnect(peerId: string): Promise<DataConnection> {
    if (this.connectionMap.get(peerId)?.open) {
      return Promise.reject('duplicate-connection')
    }

    const connection = this.peer.connect(peerId, this.connectionOptions)

    return new Promise((resolve, reject) => {
      connection.on('open', () => {
        this.handleConnection(connection)
        resolve(connection)
      })
      connection.on('error', reject)
    })
  }

  private handleConnection(connection: DataConnection) {
    const peerId = connection.peer
    const oldConnection: DataConnection | undefined = this.connectionMap.get(peerId)

    if (oldConnection?.open &&
      oldConnection?.dataChannel === connection.dataChannel &&
      oldConnection?.peerConnection === connection.peerConnection) {
      return
    }

    oldConnection?.close()
    this.connectionMap.set(peerId, connection)
  }

  protected abstract handlePeerError(error: string): void
}