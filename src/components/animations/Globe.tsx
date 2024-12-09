import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(300, 300);
    containerRef.current.appendChild(renderer.domElement);

    // Create sphere
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/earth.jpg');
    const material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 5
    });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      sphere.rotation.y += 0.003;
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center"
      style={{ width: '300px', height: '300px' }}
    />
  );
}