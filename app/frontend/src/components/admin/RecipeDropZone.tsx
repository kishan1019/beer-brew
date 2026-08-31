import { useState } from 'react';
import { parseRecipeHtml } from '../../lib/recipeParser';
import type { RecipeLine } from '../../lib/types';

export default function RecipeDropZone({
  onParsed,
}: {
  onParsed: (result: { lines: RecipeLine[]; name: string; style: string; src: string }) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(false);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseRecipeHtml(String(reader.result || ''), file.name);
      if (!parsed) {
        setError(true);
        setDragging(false);
        return;
      }
      setError(false);
      setDragging(false);
      onParsed({ ...parsed, src: file.name });
    };
    reader.onerror = () => {
      setError(true);
      setDragging(false);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!dragging) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files[0]);
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          padding: '22px 14px',
          borderRadius: 14,
          cursor: 'pointer',
          transition: 'all .15s',
          border: `1.5px dashed ${dragging ? '#F0B429' : '#33291F'}`,
          background: dragging ? '#241B0C' : '#14110F',
        }}
      >
        <div style={{ fontSize: 23 }}>📄</div>
        <div style={{ font: "700 13.5px 'Bricolage Grotesque'", color: '#FBF6EC', textAlign: 'center' }}>
          {dragging ? "Let go — I'll read it" : 'Drop a recipe file here'}
        </div>
        <div style={{ font: "400 11.5px/1.45 'IBM Plex Sans'", color: '#8A7A63', textAlign: 'center', maxWidth: 236 }}>
          BeerSmith, Brewfather or Brewer's Friend export — any HTML with the grain bill in it. Or tap to browse.
        </div>
        <input type="file" accept=".html,.htm,text/html" onChange={(e) => handleFile(e.target.files?.[0])} style={{ display: 'none' }} />
      </label>
      {error && (
        <div style={{ marginTop: 8, font: "500 12px/1.45 'IBM Plex Sans'", color: '#F2856B' }}>
          Nothing recipe-shaped in that file. Drop an HTML recipe export, or type it in by hand below.
        </div>
      )}
    </div>
  );
}
