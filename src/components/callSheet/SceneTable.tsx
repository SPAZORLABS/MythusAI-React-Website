import React, { useCallback } from 'react';
import { useCallSheet } from '@/contexts/CallSheetContext';
import { useScenes } from '@/contexts/ScenesContext';
import { TextField, SelectField } from './Field';

interface SceneTableProps {
  tableName: 'scenes' | 'advanceSchedule';
  title: string;
}

export function SceneTable({ tableName, title }: SceneTableProps) {
  const { data, dispatch } = useCallSheet();
  const { state, fetchSceneDetail, fetchSceneElements } = useScenes();
  const { scenes = [] } = state;

  const rows = data[tableName] || [{}];

  const addRow = () => {
    dispatch({ type: 'ADD_ROW', table: tableName });
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      dispatch({ type: 'REMOVE_ROW', table: tableName, index });
    }
  };

  const handleSceneSelect = useCallback(async (index: number, sceneId: string) => {
    // Persist selection
    dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].selectedScene`, value: sceneId });

    // Try to fetch full scene metadata
    const detail = await fetchSceneDetail(sceneId);
    if (detail) {
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].sceneNo`, value: String(detail.scene_number ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].intExt`, value: String(detail.int_ext ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].dayNight`, value: String(detail.day_night ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].location`, value: String(detail.location ?? detail.set_name ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].sceneDescription`, value: String(detail.synopsis ?? detail.header ?? '') });

      // Attempt to auto-fill character names
      if (detail.scene_number) {
        try {
          const breakdown = await fetchSceneElements(String(detail.scene_number));
          if (breakdown && Array.isArray(breakdown.scene_elements)) {
            const featured = breakdown.scene_elements.find(el => el.key === 'featured_artists');
            const extras = breakdown.scene_elements.find(el => el.key === 'extras');
            const names = [
              ...(Array.isArray(featured?.values) ? featured!.values : []),
              ...(Array.isArray(extras?.values) ? extras!.values : []),
            ]
              .map(val => (typeof val === 'string' ? val : String((val as any)?.name ?? val ?? '')))
              .filter(Boolean);
              console.log('Auto-filled characters:', names);
            if (names.length > 0) {
              // Update characters column in the selected scene row
              dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].characters`, value: names.join(', ') });

              // Also merge these characters into the Cast table
              const existingCast = data.cast || [{}];
              const normalized = Array.from(new Set(names.map(n => n.trim()).filter(Boolean)));
              // Exclude names that already exist in cast.character
              const toInsert = normalized.filter(n => !existingCast.some(r => String((r as any).character || '').trim().toUpperCase() === n.toUpperCase()));
              if (toInsert.length > 0) {
                const baseLen = existingCast.length;
                const emptyIndices = existingCast
                  .map((r, i) => (!String((r as any).character || '').trim() ? i : -1))
                  .filter(i => i >= 0);
                const additionsNeeded = Math.max(0, toInsert.length - emptyIndices.length);
                for (let a = 0; a < additionsNeeded; a++) {
                  dispatch({ type: 'ADD_ROW', table: 'cast' });
                }
                toInsert.forEach((name, i) => {
                  const targetIndex = i < emptyIndices.length ? emptyIndices[i] : baseLen + (i - emptyIndices.length);
                  dispatch({ type: 'SET_FIELD', path: `cast[${targetIndex}].character`, value: name });
                });
              }
            }
          } else {
            const body = String(detail.body ?? '');
            const candidateLines = body.split('\n').filter(l => l.trim().length > 0);
            const charCandidates = new Set<string>();
            candidateLines.forEach(line => {
              const trimmed = line.trim();
              const isUpper = trimmed === trimmed.toUpperCase();
              const likelyName = /^[A-Z][A-Z\s\-\.']{2,}$/.test(trimmed) && !trimmed.includes(':');
              if (isUpper && likelyName && trimmed.length <= 40) {
                charCandidates.add(trimmed.replace(/\s+/g, ' '));
              }
            });
            if (charCandidates.size > 0) {
              const names = Array.from(charCandidates);
              // Update characters column in the selected scene row
              dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].characters`, value: names.join(', ') });

              // Also merge these characters into the Cast table
              const existingCast = data.cast || [{}];
              const normalized = Array.from(new Set(names.map(n => n.trim()).filter(Boolean)));
              // Exclude names that already exist in cast.character
              const toInsert = normalized.filter(n => !existingCast.some(r => String((r as any).character || '').trim().toUpperCase() === n.toUpperCase()));
              if (toInsert.length > 0) {
                const baseLen = existingCast.length;
                const emptyIndices = existingCast
                  .map((r, i) => (!String((r as any).character || '').trim() ? i : -1))
                  .filter(i => i >= 0);
                const additionsNeeded = Math.max(0, toInsert.length - emptyIndices.length);
                for (let a = 0; a < additionsNeeded; a++) {
                  dispatch({ type: 'ADD_ROW', table: 'cast' });
                }
                toInsert.forEach((name, i) => {
                  const targetIndex = i < emptyIndices.length ? emptyIndices[i] : baseLen + (i - emptyIndices.length);
                  dispatch({ type: 'SET_FIELD', path: `cast[${targetIndex}].character`, value: name });
                });
              }
            }
          }
        } catch {}
      }
      return;
    }

    // Fallback to summary scene if detail not available
    const summary = scenes.find((scene: any) => (scene.scene_id || scene.id) === sceneId);
    if (summary) {
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].sceneNo`, value: String(summary.scene_number ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].intExt`, value: String(summary.int_ext ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].dayNight`, value: String(summary.day_night ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].location`, value: String(summary.location ?? summary.set_name ?? '') });
      dispatch({ type: 'SET_FIELD', path: `${tableName}[${index}].sceneDescription`, value: String(summary.synopsis ?? summary.header ?? '') });
    }
  }, [dispatch, fetchSceneDetail, fetchSceneElements, scenes, tableName]);

  return (
    <div className="border border-black">
      <div className="bg-black text-white text-xs font-bold p-1 text-center uppercase">
        {title}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black">
              <th className="border-r border-black p-1 w-24 font-bold">SELECT SCENE</th>
              <th className="border-r border-black p-1 w-16 font-bold">SCENE NO.</th>
              <th className="border-r border-black p-1 w-12 font-bold">SL NO</th>
              <th className="border-r border-black p-1 flex-1 font-bold">SCENE DESCRIPTION</th>
              <th className="border-r border-black p-1 w-40 font-bold">CHARACTERS</th>
              <th className="border-r border-black p-1 w-16 font-bold">INT/EXT</th>
              <th className="border-r border-black p-1 w-20 font-bold">DAY/NIGHT</th>
              <th className="p-1 w-24 font-bold">LOCATION</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-b border-gray-300">
                <td className="border-r border-black p-1">
                  <SelectField
                    path={`${tableName}[${index}].selectedScene`}
                    options={scenes.map((scene: any) => ({
                      label: String(scene.scene_number ?? scene.sceneNumber ?? ''),
                      value: String(scene.scene_id ?? scene.id ?? ''),
                    }))}
                    onChange={e => handleSceneSelect(index, e.target.value)}
                    className="w-full"
                  />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`${tableName}[${index}].sceneNo`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`${tableName}[${index}].slNo`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`${tableName}[${index}].sceneDescription`} className="w-full" multiline rows={2} />
                </td>
                <td className="border-r border-black p-1">
                  <TextField path={`${tableName}[${index}].characters`} className="w-full" />
                </td>
                <td className="border-r border-black p-1">
                  <SelectField 
                    path={`${tableName}[${index}].intExt`} 
                    options={['INT', 'EXT']} 
                    className="w-full"
                  />
                </td>
                <td className="border-r border-black p-1">
                  <SelectField 
                    path={`${tableName}[${index}].dayNight`} 
                    options={['DAY', 'NIGHT']} 
                    className="w-full"
                  />
                </td>
                <td className="p-1 relative">
                  <TextField path={`${tableName}[${index}].location`} className="w-full pr-6" />
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
