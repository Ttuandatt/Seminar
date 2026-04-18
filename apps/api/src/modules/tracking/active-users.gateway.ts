import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class ActiveUsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ActiveUsersGateway.name);

    // Map: socket.id => deviceId
    private activeSockets = new Map<string, string>();
    // Map: deviceId => connection count
    private activeDevices = new Map<string, number>();

    handleConnection(client: Socket) {
        const deviceId = client.handshake.query.deviceId as string || client.id;
        this.activeSockets.set(client.id, deviceId);

        const count = this.activeDevices.get(deviceId) || 0;
        this.activeDevices.set(deviceId, count + 1);

        this.logger.log(`Client connected: ${client.id} (device: ${deviceId}). Active devices: ${this.activeDevices.size}`);
        this.broadcastActiveUsers();
    }

    handleDisconnect(client: Socket) {
        const deviceId = this.activeSockets.get(client.id);
        if (deviceId) {
            const count = this.activeDevices.get(deviceId) || 1;
            if (count <= 1) {
                this.activeDevices.delete(deviceId);
            } else {
                this.activeDevices.set(deviceId, count - 1);
            }
            this.activeSockets.delete(client.id);
        }

        this.logger.log(`Client disconnected: ${client.id} (device: ${deviceId}). Active devices: ${this.activeDevices.size}`);
        this.broadcastActiveUsers();
    }

    private broadcastActiveUsers() {
        const count = this.activeDevices.size;
        this.server.emit('activeDeviceCount', { count });
    }

    public getActiveDeviceCount(): number {
        return this.activeDevices.size;
    }
}
