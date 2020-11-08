import { DataConnection } from 'peerjs'

export default interface Message {
  type: MessageType,
}

export type MessageListener = (connection: DataConnection, message: Message) => void;

export enum MessageType {
  RoomSync,
  RoomSyncRequest,
}

// New messages below this line.
export interface RoomSyncMessage extends Message {
  type: MessageType.RoomSync,
  participants: string[],
}

export interface RoomSyncRequestMessage extends Message {
  type: MessageType.RoomSyncRequest,
}
