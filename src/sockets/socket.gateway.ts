import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MindsaiPrismaService } from '../prisma/nest_template.prisma.service';
import { SOCKETPORT } from '../environment';

// 게이트웨이 설정 (포트, CORS 등)
@WebSocketGateway(+SOCKETPORT, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: '*', // 실제 프로덕션에서는 허용할 출처를 명시해야 합니다.
  },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server; // socket.io 서버 인스턴스

  constructor(private prisma: MindsaiPrismaService) {}

  // 클라이언트 연결 시 로그
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  // 클라이언트 연결 해제 시 로그
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // 'joinRoom' 이벤트를 구독
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room: string): Promise<void> {
    await client.join(room);
    console.log(`Client ${client.id} joined room ${room}`);
    // 방 입장 환영 메시지 (본인에게만)
    client.emit('message', `Welcome to room ${room}!`);
  }

  // 'sendMessage' 이벤트를 구독
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    payload: { room: string; author: string; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // 1. 받은 메시지를 DB에 저장
    const newMessage = await this.prisma.message.create({
      data: {
        room: payload.room,
        author: payload.author,
        content: payload.content,
      },
    });

    console.log(`Message received for room ${payload.room}:`, newMessage);

    // 2. 해당 방에 있는 모든 클라이언트에게 메시지 전송 (본인 포함)
    this.server.to(payload.room).emit('message', newMessage);
  }
}
