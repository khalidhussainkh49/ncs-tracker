import { MapContainer, TileLayer, useMap, LayersControl, FeatureGroup, } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import { EditControl } from 'react-leaflet-draw';
//import {FeatureLayer} from 'react-esri-leaflet'
import { Maximize2, History, Shield, MapPin, X } from 'lucide-react';
//import * as turf from '@turf/turf';
import { point, circle, polygon, booleanPointInPolygon } from '@turf/turf';
import type { User } from '../types/user';
import UserMarker from './UserMarker';
import LocationHistory from './LocationHistory';
import useMapStore from '../stores/mapStore';
import useSound from 'use-sound';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { FeatureLayer } from 'react-esri-leaflet';
//import { setEsriAuthCredentials } from 'react-esri-leaflet';
import L from 'leaflet';
//import L from 'leaflet';
//import L from 'leaflet';


const { BaseLayer } = LayersControl;

interface MapProps {
  users: User[];
  selectedUsers: string[];
}

// setEsriAuthCredentials({
//   token: process.env.REACT_APP_ARCGIS_API_KEY,
// });

function MapController({ selectedUsers, users }: MapProps) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedUsers.length === 1) {
      const user = users.find(u => u.id === selectedUsers[0]);
      if (user) {
        map.flyTo([user.location.lat, user.location.lng], 16, {   // initially 8
          duration: 1.5
        });
      }
    } else if (selectedUsers.length === 0) {
      // Reset to default view
      //map.setView([39.8283, -98.5795], 4, {
       // Reset to Nigeria's center coordinates (approximately)
       map.setView([9.0820, 8.6753], 6, {
        duration: 1.5
      });
    }
  }, [selectedUsers, users, map]);

  return null;
}

export default function Map({ users, selectedUsers }: MapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showGeofencing, setShowGeofencing] = useState(false);
  const [isPlottingLocation, setIsPlottingLocation] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [playAlert] = useSound('/sounds/alert.mp3');
  const { addGeofence, removeGeofence, geofences, bulkAddGeofence } = useMapStore();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!mapContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await mapContainerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const handleGeofenceCreated = (e: any) => {
    const { layerType, layer } = e;
    const geofence = {
      id: crypto.randomUUID(),
      type: layerType as 'circle' | 'polygon',
      coordinates: layerType === 'circle' 
        ? [layer.getLatLng().lat, layer.getLatLng().lng]
        : layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]),
      radius: layerType === 'circle' ? layer.getRadius() : undefined,
      name: `Geofence ${new Date().toLocaleTimeString()}`,
      createdAt: new Date()
    };

    if (selectedUsers.length > 1) {
      bulkAddGeofence(selectedUsers, geofence);
    } else if (selectedUsers.length === 1) {
      addGeofence(selectedUsers[0], geofence);
    }
  };

  const checkGeofenceViolation = (user: User) => {
    const userGeofences = geofences.get(user.id) || [];
    const userPoint = point([user.location.lng, user.location.lat]);

    for (const fence of userGeofences) {
      if (fence.type === 'circle') {
        const center = point([fence.coordinates[1] as number, fence.coordinates[0] as number]);
        const radius = (fence.radius || 0) / 1000; // Convert to kilometers
        const circlePolygon = circle(center, radius);
        
        if (!booleanPointInPolygon(userPoint, circlePolygon)) {
          playAlert();
          break;
        }
      } else {
        const fencePolygon = polygon([[...fence.coordinates as number[][], (fence.coordinates as number[][])[0]]]);
        if (!booleanPointInPolygon(userPoint, fencePolygon)) {
          playAlert();
          break;
        }
      }
    }
  };

  useEffect(() => {
    
    users.forEach(user => {
      if (geofences.has(user.id)) {
        checkGeofenceViolation(user);
      }
    });
  }, [users, geofences]);

  return (
    
    <div ref={mapContainerRef} className="relative w-full h-full">
      <MapContainer
        //center={[39.8283, -98.5795]}
        center={[9.0820, 8.6753]}
        zoom={6}
        className={`w-full h-full ${isFullscreen ? 'fullscreen-map' : ''}`}

         
      >
  <LayersControl position="topright">
  <BaseLayer checked name="Detailed Street Map">
 
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
    />
    
    
  </BaseLayer>
  
  {/* <BaseLayer name="Esri Navigation">
    <TileLayer
      attribution='Navigation &copy; <a href="https://www.esri.com/">Esri</a> contributors'
      url={`https://navigation.arcgis.com/arcgis/rest/services/World/Navigation/MapServer/tile/{z}/{y}/{x}?token=${process.env.REACT_APP_ARCGIS_API_KEY}`}
      maxZoom={19}
      tileSize={256}
      zoomOffset={0}
    />
  </BaseLayer> */}

  <BaseLayer name="OpenStreetMap with Buildings">
  
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  </BaseLayer>
  <BaseLayer name="ArcGIS Street Map">
    <TileLayer
      attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> contributors'
      url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    />
  </BaseLayer>
  <BaseLayer name="ArcGIS Satellite">
    <TileLayer
      attribution='Imagery &copy; <a href="https://www.esri.com/">Esri</a> contributors'
      url="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />
    
  </BaseLayer>

  <LayersControl.Overlay name="Feature Service">
    <FeatureLayer
      url="https://cgiu.nigeriatradehub.gov.ng/server/rest/services/Hosted/survey123_4773a21ac0e54754a9cbc458709be35e/FeatureServer/0"
      style={() => ({
        color: '#ff7800',
        weight: 2,
        fillOpacity: 0.5,
      })}
      onEachFeature={(feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(`
            <div>
              <h3 class="font-bold">${feature.properties.name || 'Location'}</h3>
              <p>${feature.properties.description || ''}</p>
            </div>
          `);
        }
      }}
    />
  </LayersControl.Overlay>

  <LayersControl.Overlay name="Points of Interest">
    <FeatureLayer
      // url="YOUR_FEATURE_SERVICE_URL/0"
      url="https://cgiu.nigeriatradehub.gov.ng/server/rest/services/Hosted/survey123_4773a21ac0e54754a9cbc458709be35e/FeatureServer/0"
      pointToLayer={(_feature, latlng) => {
        return L.circleMarker(latlng, {
          radius: 8,
          fillColor: "#ff7800",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      }}
    />
  </LayersControl.Overlay>

  <LayersControl.Overlay name="Boundaries">
    <FeatureLayer
      url="YOUR_FEATURE_SERVICE_URL/1"
      style={() => ({
        color: '#0033ff',
        weight: 2,
        fillOpacity: 0.2
      })}
    />
  </LayersControl.Overlay>
</LayersControl>

       
        <MapController selectedUsers={selectedUsers} users={users} />
        
        {users.map(user => (
          <UserMarker 
            key={user.id} 
            user={user}
            isSelected={selectedUsers.includes(user.id)}
          />
        ))}
        
        {showGeofencing && (
          <FeatureGroup>
            <EditControl
              position="topleft"
              onCreated={handleGeofenceCreated}
              draw={{
                rectangle: false,
                circlemarker: false,
                polyline: false,
                marker: false,
                circle: true,
                polygon: true,
              }}
            />
          </FeatureGroup>
        )}

      {/* <FeatureLayer  url = {"https://cgiu.nigeriatradehub.gov.ng/server/rest/services/Hosted/survey123_4773a21ac0e54754a9cbc458709be35e/FeatureServer"}/>  */}
      </MapContainer>

      {/* Controls */}
      <div className={`absolute top-4 right-4 z-[1000] flex gap-2 transition-opacity duration-300 ${
        isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
      }`}>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
          title="Toggle fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
        {selectedUsers.length > 0 && (
          <>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
                showHistory ? 'bg-indigo-100' : 'bg-white'
              }`}
              title="View location history"
            >
              <History className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setShowGeofencing(!showGeofencing)}
              className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
                showGeofencing ? 'bg-indigo-100' : 'bg-white'
              }`}
              title="Configure geofencing"
            >
              <Shield className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={() => setIsPlottingLocation(!isPlottingLocation)}
              className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
                isPlottingLocation ? 'bg-indigo-100' : 'bg-white'
              }`}
              title="Plot location"
            >
              <MapPin className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Location History Sidebar */}
      {selectedUsers.length === 1 && showHistory && !isFullscreen && (
        <div className="absolute top-16 right-4 z-[1000] w-80">
          <LocationHistory userId={selectedUsers[0]} />
        </div>
      )}

      {/* Geofencing Controls */}
      {showGeofencing && selectedUsers.length > 0 && !isFullscreen && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold">Geofencing Controls</h3>
            </div>
            <button
              onClick={() => setShowGeofencing(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {selectedUsers.length > 1 
                ? `Creating geofence for ${selectedUsers.length} users`
                : 'Draw a circle or polygon on the map'}
            </p>
            {selectedUsers.map(userId => {
              const userGeofences = geofences.get(userId) || [];
              return userGeofences.map(fence => (
                <div key={fence.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{fence.name}</span>
                  <button
                    onClick={() => removeGeofence(userId, fence.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ));
            })}
          </div>
        </div>
      )}
    </div>
  );
}











// import { MapContainer, TileLayer, useMap, LayersControl, FeatureGroup } from 'react-leaflet';
// import { useState, useEffect, useRef } from 'react';
// import { EditControl } from 'react-leaflet-draw';
// import { Maximize2, History, Shield, MapPin, X } from 'lucide-react';
// import * as turf from '@turf/turf';
// import type { User } from '../types/user';
// import UserMarker from './UserMarker';
// import LocationHistory from './LocationHistory';
// import useMapStore from '../stores/mapStore';
// import useSound from 'use-sound';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-draw/dist/leaflet.draw.css';

// const { BaseLayer } = LayersControl;

// interface MapProps {
//   users: User[];
//   selectedUsers: string[];
// }

// function MapController({ selectedUsers, users }: MapProps) {
//   const map = useMap();

//   useEffect(() => {
//     if (selectedUsers.length === 1) {
//       const user = users.find(u => u.id === selectedUsers[0]);
//       if (user) {
//         map.flyTo([user.location.lat, user.location.lng], 8, {
//           duration: 1.5
//         });
//       }
//     } else if (selectedUsers.length === 0) {
//       // Reset to default view
//       map.setView([39.8283, -98.5795], 4, {
//         duration: 1.5
//       });
//     }
//   }, [selectedUsers, users, map]);

//   return null;
// }

// export default function Map({ users, selectedUsers }: MapProps) {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [showGeofencing, setShowGeofencing] = useState(false);
//   const [isPlottingLocation, setIsPlottingLocation] = useState(false);
//   const mapContainerRef = useRef<HTMLDivElement>(null);
//   const [playAlert] = useSound('/sounds/alert.mp3');
//   const { addGeofence, removeGeofence, geofences, bulkAddGeofence } = useMapStore();

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(!!document.fullscreenElement);
//     };

//     document.addEventListener('fullscreenchange', handleFullscreenChange);
//     return () => {
//       document.removeEventListener('fullscreenchange', handleFullscreenChange);
//     };
//   }, []);

//   const toggleFullscreen = async () => {
//     if (!mapContainerRef.current) return;

//     try {
//       if (!document.fullscreenElement) {
//         await mapContainerRef.current.requestFullscreen();
//       } else {
//         await document.exitFullscreen();
//       }
//     } catch (err) {
//       console.error('Error toggling fullscreen:', err);
//     }
//   };

//   const handleGeofenceCreated = (e: any) => {
//     const { layerType, layer } = e;
//     const geofence = {
//       id: crypto.randomUUID(),
//       type: layerType as 'circle' | 'polygon',
//       coordinates: layerType === 'circle' 
//         ? [layer.getLatLng().lat, layer.getLatLng().lng]
//         : layer.getLatLngs()[0].map((ll: any) => [ll.lat, ll.lng]),
//       radius: layerType === 'circle' ? layer.getRadius() : undefined,
//       name: `Geofence ${new Date().toLocaleTimeString()}`,
//       createdAt: new Date()
//     };

//     if (selectedUsers.length > 1) {
//       bulkAddGeofence(selectedUsers, geofence);
//     } else if (selectedUsers.length === 1) {
//       addGeofence(selectedUsers[0], geofence);
//     }
//   };

//   const checkGeofenceViolation = (user: User) => {
//     const userGeofences = geofences.get(user.id) || [];
//     const point = turf.point([user.location.lng, user.location.lat]);

//     for (const fence of userGeofences) {
//       if (fence.type === 'circle') {
//         const center = turf.point([fence.coordinates[1], fence.coordinates[0]]);
//         const radius = (fence.radius || 0) / 1000; // Convert to kilometers
//         const circle = turf.circle(center, radius);
        
//         if (!turf.booleanPointInPolygon(point, circle)) {
//           playAlert();
//           break;
//         }
//       } else {
//         const polygon = turf.polygon([fence.coordinates as number[][]]);
//         if (!turf.booleanPointInPolygon(point, polygon)) {
//           playAlert();
//           break;
//         }
//       }
//     }
//   };

//   useEffect(() => {
//     users.forEach(user => {
//       if (geofences.has(user.id)) {
//         checkGeofenceViolation(user);
//       }
//     });
//   }, [users, geofences]);

//   return (
//     <div ref={mapContainerRef} className="relative w-full h-full">
//       <MapContainer
//         center={[39.8283, -98.5795]}
//         zoom={4}
//         className={`w-full h-full ${isFullscreen ? 'fullscreen-map' : ''}`}
//       >
//         <LayersControl position="topright">
//           <BaseLayer checked name="Street Map">
//             <TileLayer
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//             />
//           </BaseLayer>
//           <BaseLayer name="Satellite">
//             <TileLayer
//               attribution='Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
//               url="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw"
//             />
//           </BaseLayer>
//         </LayersControl>

//         <MapController selectedUsers={selectedUsers} users={users} />
        
//         {users.map(user => (
//           <UserMarker 
//             key={user.id} 
//             user={user}
//             isSelected={selectedUsers.includes(user.id)}
//           />
//         ))}
        
//         {showGeofencing && (
//           <FeatureGroup>
//             <EditControl
//               position="topleft"
//               onCreated={handleGeofenceCreated}
//               draw={{
//                 rectangle: false,
//                 circlemarker: false,
//                 polyline: false,
//                 marker: false,
//                 circle: true,
//                 polygon: true,
//               }}
//             />
//           </FeatureGroup>
//         )}
//       </MapContainer>

//       {/* Controls */}
//       <div className={`absolute top-4 right-4 z-[1000] flex gap-2 transition-opacity duration-300 ${
//         isFullscreen ? 'opacity-0 hover:opacity-100' : 'opacity-100'
//       }`}>
//         <button
//           onClick={toggleFullscreen}
//           className="p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50"
//           title="Toggle fullscreen"
//         >
//           <Maximize2 className="w-5 h-5 text-gray-700" />
//         </button>
//         {selectedUsers.length > 0 && (
//           <>
//             <button
//               onClick={() => setShowHistory(!showHistory)}
//               className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
//                 showHistory ? 'bg-indigo-100' : 'bg-white'
//               }`}
//               title="View location history"
//             >
//               <History className="w-5 h-5 text-gray-700" />
//             </button>
//             <button
//               onClick={() => setShowGeofencing(!showGeofencing)}
//               className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
//                 showGeofencing ? 'bg-indigo-100' : 'bg-white'
//               }`}
//               title="Configure geofencing"
//             >
//               <Shield className="w-5 h-5 text-gray-700" />
//             </button>
//             <button
//               onClick={() => setIsPlottingLocation(!isPlottingLocation)}
//               className={`p-2 rounded-lg shadow-lg hover:bg-gray-50 ${
//                 isPlottingLocation ? 'bg-indigo-100' : 'bg-white'
//               }`}
//               title="Plot location"
//             >
//               <MapPin className="w-5 h-5 text-gray-700" />
//             </button>
//           </>
//         )}
//       </div>

//       {/* Location History Sidebar */}
//       {selectedUsers.length === 1 && showHistory && !isFullscreen && (
//         <div className="absolute top-16 right-4 z-[1000] w-80">
//           <LocationHistory userId={selectedUsers[0]} />
//         </div>
//       )}

//       {/* Geofencing Controls */}
//       {showGeofencing && selectedUsers.length > 0 && !isFullscreen && (
//         <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-2">
//               <Shield className="w-5 h-5 text-amber-500" />
//               <h3 className="font-semibold">Geofencing Controls</h3>
//             </div>
//             <button
//               onClick={() => setShowGeofencing(false)}
//               className="p-1 hover:bg-gray-100 rounded"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="space-y-2">
//             <p className="text-sm text-gray-600">
//               {selectedUsers.length > 1 
//                 ? `Creating geofence for ${selectedUsers.length} users`
//                 : 'Draw a circle or polygon on the map'}
//             </p>
//             {selectedUsers.map(userId => {
//               const userGeofences = geofences.get(userId) || [];
//               return userGeofences.map(fence => (
//                 <div key={fence.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
//                   <span className="text-sm">{fence.name}</span>
//                   <button
//                     onClick={() => removeGeofence(userId, fence.id)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <X className="w-4 h-4" />
//                   </button>
//                 </div>
//               ));
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }