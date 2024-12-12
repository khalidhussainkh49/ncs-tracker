import { io } from 'socket.io-client';
import { API_URL } from '../config/constants';
import type { User, Location } from '../types/user';
import videoService from './videoService';

class SocketService {
  private static instance: SocketService;
  private socket: any;

  private constructor() {
    this.socket = io(API_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket() {
    return this.socket;
  }

  public updateLocation(location: Location) {
    this.socket.emit('location-update', location);
  }

  public onLocationUpdate(callback: (data: { user: User; location: Location }) => void) {
    this.socket.on('location-update', callback);
  }

  public sendPrivateMessage(to: string, message: string) {
    this.socket.emit('private-message', { to, message });
  }

  public sendBroadcastMessage(message: string) {
    this.socket.emit('broadcast-message', { message });
  }

  public onPrivateMessage(callback: (data: any) => void) {
    this.socket.on('private-message', callback);
  }

  public onBroadcastMessage(callback: (data: any) => void) {
    this.socket.on('broadcast-message', callback);
  }

  public onDangerAlert(callback: (data: any) => void) {
    this.socket.on('danger-alert', callback);
  }

public onStartCall(remotePeerId:string, peerId:string){     ///////new edit 1
this.socket.emit("start-call", {
  to: remotePeerId, // Recipient's user ID or peer ID
  from: peerId, // Current user's peer ID


})


}
  

}

export default SocketService;







// import { io } from 'socket.io-client';
// import { API_URL } from '../config/constants';

// class SocketService {
//   private static instance: SocketService;
//   private socket: any;

//   private constructor() {
//     this.socket = io(API_URL);
    
//     this.socket.on('connect', () => {
//       console.log('Connected to socket server');
//     });
//   }

//   public static getInstance(): SocketService {
//     if (!SocketService.instance) {
//       SocketService.instance = new SocketService();
//     }
//     return SocketService.instance;
//   }

//   public getSocket() {
//     return this.socket;
//   }

//   public updateLocation(location: { lat: number; lng: number }) {
//     this.socket.emit('location-update', { location });
//   }

//   // public onLocationUpdate(callback: (data: { userId: string; location: { lat: number; lng: number } }) => void) {
//   //   this.socket.on('location-update', callback);
//   // }

//     public onLocationUpdate(callback: (data: { user:{id: number, name:string, email:string, role:string, avatar:string }; location: {userid:number, lat: number; lng: number } }) => void) {
//     this.socket.on('location-update', callback);
//   }


//   public sendPrivateMessage(to: string, message: string) {
//     this.socket.emit('private-message', { to, message });
//   }

//   public sendBroadcastMessage(message: string) {
//     this.socket.emit('broadcast-message', { message });
//   }

//   public onPrivateMessage(callback: (data: any) => void) {
//     this.socket.on('private-message', callback);
//   }

//   public onBroadcastMessage(callback: (data: any) => void) {
//     this.socket.on('broadcast-message', callback);
//   }

//   public onDangerAlert(callback: (data: any) => void) {
//     this.socket.on('danger-alert', callback);
//   }
// }

// export default SocketService;