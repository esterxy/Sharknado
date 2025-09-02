import React from 'react';
import './Sidebar.css';


export const Sidebar = () => {
  return (
    <div className="sidebar-container">
      <h1>Projeto Sharknados</h1>
      <p>Previsão de Hotspots de Tubarões</p>
      
      <div className="filters">
        <h2>Filtros</h2>
        <label htmlFor="date-picker">Selecione a Data:</label>
        <input type="date" id="date-picker" />
        
        <label htmlFor="species-select">Selecione a Espécie:</label>
        <select id="species-select">
          <option>Tubarão-Branco</option>
          <option>Tubarão-Tigre</option>
          <option>Tubarão-Martelo</option>
          <option>Tubarão-Mako</option>
          <option>Tubarão-Lixa</option>
        </select>
      </div>
    </div>
  );
};