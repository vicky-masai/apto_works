"use client";

import React, { useState, useEffect } from 'react';
import { getProfitPercents, updateProfitPercent } from '../API/api';
import Cookies from 'js-cookie';

const ProfitPercentManager = () => {
  const [profitPercents, setProfitPercents] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const authToken = Cookies.get('adminToken');

  useEffect(() => {
    const fetchProfitPercents = async () => {
      try {
        const data = await getProfitPercents(authToken);
        setProfitPercents(data);
      } catch (error) {
        console.error('Failed to fetch profit percentages:', error);
      }
    };
    fetchProfitPercents();
  }, [authToken]);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingValue(profitPercents[index].profitPercent);
  };

  const handleSave = async (index) => {
    try {
      const profitPercent = parseFloat(editingValue);
      await updateProfitPercent(authToken, profitPercent);
      const updatedProfitPercents = [...profitPercents];
      updatedProfitPercents[index].profitPercent = profitPercent;
      setProfitPercents(updatedProfitPercents);
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to update profit percentage:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Modify Profit Percentages</h1>
        <ul className="list-disc pl-5">
          {profitPercents.map((percent, index) => (
            <li key={percent.id} className="mb-2 flex justify-between items-center">
              {editingIndex === index ? (
                <>
                  <input
                    type="number"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="border p-2 mr-2 rounded w-2/3"
                  />
                  <button onClick={() => handleSave(index)} className="bg-green-500 text-white p-2 rounded w-1/3">Save</button>
                </>
              ) : (
                <>
                  <span className="w-2/3">{percent.profitPercent}%</span>
                  <button onClick={() => handleEdit(index)} className="bg-yellow-500 text-white p-2 ml-2 rounded w-1/3">Edit</button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfitPercentManager; 