import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    
    renderer.setSize(600, 600);
    containerRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/earth.jpg');
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    camera.position.z = 7;

    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.003;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-screen bg-[#111111] flex flex-col items-center justify-center gap-8">
      <div className="text-center">
{/*         <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-pulse hover:scale-105 transition-transform duration-300">
          E-enforcement
        </h1>
      </div> */}
      
      <div 
        ref={containerRef} 
        className="flex items-center justify-center"
        style={{ width: '800px', height: '800px' }}
      />

      {/* <div className="text-center">
        <p className="text-white text-xl">Continue Anywhere</p>
      </div> */}
    </div>
  );
}
