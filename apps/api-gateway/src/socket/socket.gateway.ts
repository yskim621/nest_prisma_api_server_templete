import { Inject, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientProxy } from '@nestjs/microservices';
import { CORE_SERVICE } from '@app/common';

@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling'],
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(SocketGateway.name);

  constructor(@Inject(CORE_SERVICE) private readonly coreClient: ClientProxy) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    client.emit('joinedRoom', { room: data.room, message: `Joined room: ${data.room}` });
    this.server.to(data.room).emit('userJoined', { userId: client.id, room: data.room });
    return { event: 'joinRoom', data: { room: data.room, success: true } };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.room);
    this.server.to(data.room).emit('userLeft', { userId: client.id, room: data.room });
    return { event: 'leaveRoom', data: { room: data.room, success: true } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { room: string; author: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const messageData = {
      author: data.author,
      content: data.content,
      room: data.room,
      timestamp: new Date().toISOString(),
      clientId: client.id,
    };

    this.server.to(data.room).emit('newMessage', messageData);
    return { event: 'sendMessage', data: messageData };
  }
}
