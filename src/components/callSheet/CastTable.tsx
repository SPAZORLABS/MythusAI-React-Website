import React from 'react';
import { useCallSheet } from '@/contexts/CallSheetContext';
import { TextField } from './Field';

export function CastTable() {
  const { data, dispatch } = useCallSheet();
  
  const rows = data.cast || [{}];

  const addRow = () => {
    dispatch({ type: 'ADD_ROW', table: 'cast' });
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      dispatch({ type: 'REMOVE_ROW', table: 'cast', index });
    }
  };

  return (
    <div className="border border-black">
      <div className="bg-black text-white text-xs font-bold p-1 text-center uppercase">
        CAST
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1 w-12 font-bold">SR NO.</th>
              <th className="border-r border-black p-1 flex-1 font-bold">ARTIST</th>
              <th className="border-r border-black p-1 flex-1 font-bold">CHARACTER</th>
              <th className="border-r border-black p-1 w-20 font-bold">ON LOCATION</th>
              <th className="border-r border-black p-1 w-20 font-bold">HAIR & MAKE UP</th>
              <th className="p-1 w-16 font-bold">ON SET</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="border-r border-black p-1">
                  <TextField path={`cast[${index}].srNo`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`cast[${index}].artist`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`cast[${index}].character`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`cast[${index}].onLocation`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`cast[${index}].hairMakeup`} className="w-full" />
                </td>
                <td className="p-1 relative">
                  <TextField path={`cast[${index}].onSet`} className="w-full pr-6" />
                  <button
                    onClick={() => removeRow(index)}
                    className="absolute right-0 top-1 text-red-500 hover:text-red-700 screen-only"
                    disabled={rows.length === 1}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-2 screen-only">
        <button
          onClick={addRow}
          className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-secondary"
        >
          Add Row
        </button>
      </div>
    </div>
  );
}
