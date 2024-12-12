import { useState, useEffect } from 'react';
// import { generateMockUsers } from '../utils/mockData';
import Map from './Map';
import RestrictedMap from './RestrictedMap';
import Sidebar from './Sidebar';
import Chat from './Chat';
import VideoCall from './VideoCall';
import LogoutButton from './common/LogoutButton';
import AdminPanel from './admin/AdminPanel';
import { useAuth } from '../contexts/AuthContext';
import useMapStore from '../stores/mapStore';
import SocketService from '../services/socketService';
import type { User } from '../types/user'; ///////////


export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const { selectedUsers, clearSelectedUsers } = useMapStore();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const socketService = SocketService.getInstance();



  useEffect(() => {
    if (user) {
      console.log(user.id + ' user from dashboard');
      // Connect to socket and identify user
      socketService.getSocket().emit('user-connected', user.id);

      // Listen for location updates from other users
      socketService.onLocationUpdate(({ user, location }) => {
        console.log(`Received location update for user: ${user.id}, Location: (${location.lat as number}, ${location.lng as number})`);
        
        setUsers(prevUsers => {
          const existingUser = prevUsers.find(u => u.id === user.id);
          if (existingUser) {
            // Update existing user's location
            return prevUsers.map(u => 
              u.id === user.id 
                ? { ...u, location: { lat: location.lat as number, lng: location.lng as number}, status: user.status } // Update user location and status
                : u
            );
          } else {
            // Add new user if not already in the list
            return [...prevUsers, { ...user, location: { lat: location.lat, lng: location.lng } }];
          }
        });
      });

      // Listen for user disconnections
      socketService.getSocket().on('user-disconnected', (userId: string) => {
        setUsers(prevUsers =>
          prevUsers.map(u =>
            u.id === userId
              ? { ...u, status: 'offline' }
              : u
          )
        );
      });

      // Start sending location updates
      const locationInterval = setInterval(() => {
        // Remove the mock location generation
        // const mockLocation = {
        //   lat: Math.random() * 180 - 90,
        //   lng: Math.random() * 360 - 180
        // };
        // socketService.updateLocation(mockLocation);
      }, 5000);

      return () => {
        clearInterval(locationInterval);
      };
    }
  }, [user]);
  
  
  // from chat gpt
  // useEffect(() => {
  //   if (user) {
  //     console.log(`${user.id} user from dashboard`);
      
  //     // Emit user connection to the server
  //     socketService.getSocket().emit('user-connected', user);

  //     // Listen for location updates sent from Flutter app
  //     socketService.onLocationUpdate(({ user: updatedUser, location }) => {
  //       // console.log(`Received location update for user ${updatedUser.id}: ${location.lat}, ${location.lng}`);
  //      console.log(`Received location update for user ${updatedUser.id}: ${location.location.lat}, ${location.location.lng}`);


  //       setUsers(prevUsers => {
  //         const userExists = prevUsers.find(u => u.id === updatedUser.id);
          
  //         if (userExists) {
  //           // Update existing user
  //           return prevUsers.map(u => 
  //             u.id === updatedUser.id 
  //               ? { ...u, location, status: updatedUser.status }
  //               : u
  //           );
  //         } else {
  //           // Add new user
  //           return [...prevUsers, { ...updatedUser, location }];
  //         }
  //       });
  //     });

  //     // Listen for user disconnections
  //     socketService.getSocket().on('user-disconnected', (userId: string) => {
  //       console.log(`User ${userId} disconnected`);
  //       setUsers(prevUsers =>
  //         prevUsers.map(u =>
  //           u.id === userId
  //             ? { ...u, status: 'offline' }
  //             : u
  //         )
  //       );
  //     });

  //     return () => {
  //       socketService.getSocket().off('location-update');
  //       socketService.getSocket().off('user-disconnected');
  //     };
  //   }
  // }, [user]);

  if (!user) return null;

  if (user.role === 'restricted') {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-10">
          <LogoutButton />
        </div>
        <RestrictedMap users={users} />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        users={users} 
        selectedUsers={selectedUsers}
        onClearSelection={clearSelectedUsers}
      />
      <main className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {user.role === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {showAdminPanel ? 'Close Admin Panel' : 'Open Admin Panel'}
              </button>
            )}
          </div>
          <LogoutButton />
        </div>
        
        {showAdminPanel && user.role === 'admin' ? (
          <AdminPanel />
        ) : (
          <>
            <div className="flex-1 relative">
              <Map 
                users={users} 
                selectedUsers={selectedUsers}
              />
            </div>
            <div className="h-1/3 p-4 bg-gray-50 border-t flex gap-4">
              <div className="flex-1">
                <Chat 
                  currentUserId={user.id} 
                  selectedUserId={selectedUsers[0]} 
                />
              </div>
              <div className="flex-1">
                <VideoCall selectedUserId={selectedUsers[0]} />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}




// import { useState, useEffect } from 'react';
// // import { generateMockUsers } from '../utils/mockData';
// import Map from './Map';
// import RestrictedMap from './RestrictedMap';
// import Sidebar from './Sidebar';
// import Chat from './Chat';
// import VideoCall from './VideoCall';
// import LogoutButton from './common/LogoutButton';
// import AdminPanel from './admin/AdminPanel';
// import { useAuth } from '../contexts/AuthContext';
// import useMapStore from '../stores/mapStore';
// import SocketService from '../services/socketService';
// import type { User, Location } from '../types/user'; ///////////

// export default function Dashboard() {
//   //const [users, setUsers] = useState<User[]>(() => generateMockUsers(20));
//   const [users, setUsers] = useState<User[]>([]); // Changed from generateMockUsers(20) to []
//   const { user } = useAuth();
//   const { selectedUsers, clearSelectedUsers } = useMapStore();
//   const [showAdminPanel, setShowAdminPanel] = useState(false);
//   const socketService = SocketService.getInstance();

//   useEffect(() => {
//     if (user) {
//       console.log(user.id +' user from dashboard')
//       // Connect to socket and identify user
//       socketService.getSocket().emit('user-connected', user.id);

//       // Listen for location updates from other users
//       socketService.onLocationUpdate(({ userId, location }) => {
//         console.log('${userId} and ${location}')
//         setUsers(prevUsers => 
//           prevUsers.map(u => 
//             u.id === userId 
//               ? { ...u, location } // Update user location based on received data
//               : u
//           )
//         );
//       });

//       // Listen for user disconnections
//       socketService.getSocket().on('user-disconnected', (userId: string) => {
//         setUsers(prevUsers =>
//           prevUsers.map(u =>
//             u.id === userId
//               ? { ...u, status: 'offline' }
//               : u
//           )
//         );
//       });

//       // Start sending location updates
//       const locationInterval = setInterval(() => {
//         // Remove the mock location generation
//         // const mockLocation = {
//         //   lat: Math.random() * 180 - 90,
//         //   lng: Math.random() * 360 - 180
//         // };
//         // socketService.updateLocation(mockLocation);
//       }, 5000);

//       return () => {
//         clearInterval(locationInterval);
//       };
//     }
//   }, [user]);
// // 
// // 
// // 
// // 
// // 
// // 








//   // useEffect(() => {
//   //   if (user) {
//   //     // Connect to socket and identify user
//   //     socketService.getSocket().emit('user-connected', user.id);

//   //     // Listen for location updates from other users
//   //     socketService.onLocationUpdate(({ userId, location }) => {
//   //       setUsers(prevUsers => 
//   //         prevUsers.map(u => 
//   //           u.id === userId 
//   //             ? { ...u, location }
//   //             : u
//   //         )
//   //       );
//   //     });

//   //     // Listen for user disconnections
//   //     socketService.getSocket().on('user-disconnected', (userId: string) => {
//   //       setUsers(prevUsers =>
//   //         prevUsers.map(u =>
//   //           u.id === userId
//   //             ? { ...u, status: 'offline' }
//   //             : u
//   //         )
//   //       );
//   //     });

//   //     // Start sending location updates
//   //     const locationInterval = setInterval(() => {
//   //       const mockLocation = {
//   //         lat: Math.random() * 180 - 90,
//   //         lng: Math.random() * 360 - 180
//   //       };
//   //       socketService.updateLocation(mockLocation);
//   //     }, 5000);

//   //     return () => {
//   //       clearInterval(locationInterval);
//   //     };
//   //   }
//   // }, [user]);








//   if (!user) return null;

//   // For restricted users, show only the map view
//   if (user.role === 'restricted') {
//     return (
//       <div className="relative">
//         <div className="absolute top-4 right-4 z-10">
//           <LogoutButton />
//         </div>
//         <RestrictedMap users={users} />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen">
//       <Sidebar 
//         users={users} 
//         selectedUsers={selectedUsers}
//         onClearSelection={clearSelectedUsers}
//       />
//       <main className="flex-1 flex flex-col">
//         <div className="bg-white shadow-sm p-4 flex justify-between items-center">
//           <div className="flex items-center gap-4">
//             {user.role === 'admin' && (
//               <button
//                 onClick={() => setShowAdminPanel(!showAdminPanel)}
//                 className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//               >
//                 {showAdminPanel ? 'Close Admin Panel' : 'Open Admin Panel'}
//               </button>
//             )}
//           </div>
//           <LogoutButton />
//         </div>
        
//         {showAdminPanel && user.role === 'admin' ? (
//           <AdminPanel />
//         ) : (
//           <>
//             <div className="flex-1 relative">
//               <Map 
//                 users={users} 
//                 selectedUsers={selectedUsers}
//               />
//             </div>
//             <div className="h-1/3 p-4 bg-gray-50 border-t flex gap-4">
//               <div className="flex-1">
//                 <Chat 
//                   currentUserId={user.id} 
//                   selectedUserId={selectedUsers[0]} 
//                 />
//               </div>
//               <div className="flex-1">
//                 <VideoCall selectedUserId={selectedUsers[0]} />
//               </div>
//             </div>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }