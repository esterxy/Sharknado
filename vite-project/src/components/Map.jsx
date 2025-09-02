import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './Map.css';
import mockHotspots from '../data/mockHotspots.json';

// TOKEN DO MAPBOX 
mapboxgl.accessToken = 'pk.eyJ1IjoiZXN0ZXJzenkiLCJhIjoiY21mMXZxdWN3MTMweDJpcHpvdGhlMngyNSJ9.c0ejHv0aJlpe03h4acYJgw'; 

export const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const lng = -120;
  const lat = 35;
  const zoom = 5.5;

  useEffect(() => {
    if (map.current) return; 
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
      mockHotspots.forEach(hotspot => {
        new mapboxgl.Marker({ color: "#646cff" })
          .setLngLat([hotspot.lng, hotspot.lat]) // Atenção: a ordem é [longitude, latitude]
          .addTo(map.current);
      });
    });
  });

  return (
    <div ref={mapContainer} className="map-container" />
  );
};