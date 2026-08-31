import { useState } from 'react';
import RecipeDropZone from './RecipeDropZone';
import { splitRecipeLines } from '../../lib/recipeParser';
import { api } from '../../lib/api';
import type { RecipeLine, HopLine } from '../../lib/types';

function genPreviewCode(): string {
  const words = ['MALT', 'HOPS', 'BREW', 'YEAST', 'WORT', 'CASK'];
  return words[Math.floor(Math.random() * words.length)] + '-' + (100 + Math.floor(Math.random() * 899));
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#14110F',
  border: '1.5px solid #33291F',
  borderRadius: 14,
  padding: '13px 14px',
  font: "500 14px 'IBM Plex Sans'",
  color: '#FBF6EC',
  outline: 'none',
};

const labelStyle: React.CSSProperties = { font: "600 10.5px 'IBM Plex Mono'", color: '#8A7A63', letterSpacing: '.1em', marginBottom: 6 };

export default function NewBatchForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState('');
  const [style, setStyle] = useState('');
  const [brewDate, setBrewDate] = useState(new Date().toISOString().slice(0, 10));
  const [seats, setSeats] = useState(6);
  const [recipeLines, setRecipeLines] = useState<RecipeLine[] | null>(null);
  const [recipeSrc, setRecipeSrc] = useState('');
  const [hops, setHops] = useState<HopLine[]>([]);
  const [yeast, setYeast] = useState({ name: '', style: '', temp: '', pitchedNote: '' });
  const [previewCode] = useState(genPreviewCode);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) {
      setSaveError('Give the batch a name.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const split = splitRecipeLines(recipeLines || []);
    try {
      await api.createBatch({
        name: name.trim(),
        style: style.trim(),
        volumeL: 20,
        brewDate,
        seats,
        primaryDays: 11,
        conditioningDays: 13,
        og: split.og,
        fg: split.fg,
        abv: split.abv,
        ibu: split.ibu,
        grainBill: split.grainBill,
        hops: hops.filter((h) => h.name.trim()),
        yeast: yeast.name.trim() ? yeast : {},
        recipeSrc,
        preferredCode: previewCode,
      });
      onCreated();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save this batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#221D19', border: '1px solid #33291F', borderRadius: 20, padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ font: "700 16px 'Bricolage Grotesque'", color: '#FBF6EC' }}>New batch</div>

      <div>
        <div style={labelStyle}>BATCH NAME</div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nachtwacht Dubbel" style={inputStyle} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>STYLE</div>
          <input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Belgian Dubbel" style={inputStyle} />
        </div>
        <div style={{ width: 96 }}>
          <div style={labelStyle}>VOLUME</div>
          <div style={{ ...inputStyle, color: '#8A7A63', display: 'flex', alignItems: 'center' }}>20 L</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={labelStyle}>BREW DATE</div>
          <input type="date" value={brewDate} onChange={(e) => setBrewDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ width: 96 }}>
          <div style={labelStyle}>SEATS</div>
          <input type="number" min={1} max={20} value={seats} onChange={(e) => setSeats(Number(e.target.value) || 1)} style={inputStyle} />
        </div>
      </div>

      <div>
        <div style={labelStyle}>RECIPE</div>
        {!recipeLines ? (
          <RecipeDropZone
            onParsed={(result) => {
              setRecipeLines(result.lines);
              setRecipeSrc(result.src);
              if (!name.trim() && result.name) setName(result.name);
              if (!style.trim() && result.style) setStyle(result.style);
            }}
          />
        ) : (
          <div className="animate-pop" style={{ background: '#14110F', border: '1.5px solid #4C7C4A', borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ font: "600 10.5px 'IBM Plex Mono'", color: '#7BC47F', letterSpacing: '.08em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                READ FROM {recipeSrc}
              </div>
              <button
                onClick={() => {
                  setRecipeLines(null);
                  setRecipeSrc('');
                }}
                style={{ flex: 'none', background: 'none', border: 'none', color: '#8A7A63', font: "600 11.5px 'IBM Plex Sans'", cursor: 'pointer', padding: 0 }}
              >
                Replace
              </button>
            </div>
            {recipeLines.map((line, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderTop: '1px solid #241D17', font: "500 12.5px 'IBM Plex Sans'", color: '#C9BCA6' }}>
                <span>{line.label}</span>
                <b style={{ color: '#FBF6EC', whiteSpace: 'nowrap' }}>{line.value}</b>
              </div>
            ))}
            <div style={{ font: "400 11.5px/1.45 'IBM Plex Sans'", color: '#8A7A63', marginTop: 10 }}>
              This becomes the guests' recipe card. Hops and yeast below are typed in by hand.
            </div>
          </div>
        )}
      </div>

      <div>
        <div style={labelStyle}>HOPS (OPTIONAL)</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hops.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 6 }}>
              <input
                value={h.name}
                onChange={(e) => setHops(hops.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="Styrian Golding"
                style={{ ...inputStyle, flex: 2, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }}
              />
              <input
                value={h.amount}
                onChange={(e) => setHops(hops.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                placeholder="30 g"
                style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }}
              />
              <input
                value={h.time}
                onChange={(e) => setHops(hops.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))}
                placeholder="60 min"
                style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }}
              />
              <button onClick={() => setHops(hops.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#8A7A63', cursor: 'pointer', padding: '0 6px' }}>
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={() => setHops([...hops, { name: '', amount: '', time: '' }])}
            style={{ alignSelf: 'flex-start', background: 'none', border: 'none', color: '#F0B429', font: "600 12px 'IBM Plex Sans'", cursor: 'pointer', padding: '4px 0' }}
          >
            + Add hop
          </button>
        </div>
      </div>

      <div>
        <div style={labelStyle}>YEAST (OPTIONAL)</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input value={yeast.name} onChange={(e) => setYeast({ ...yeast, name: e.target.value })} placeholder="Wyeast 1214" style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }} />
          <input value={yeast.style} onChange={(e) => setYeast({ ...yeast, style: e.target.value })} placeholder="Belgian Abbey" style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={yeast.temp} onChange={(e) => setYeast({ ...yeast, temp: e.target.value })} placeholder="19–21 °C" style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }} />
          <input
            value={yeast.pitchedNote}
            onChange={(e) => setYeast({ ...yeast, pitchedNote: e.target.value })}
            placeholder="pitched notes"
            style={{ ...inputStyle, flex: 1, padding: '10px 12px', font: "500 13px 'IBM Plex Sans'" }}
          />
        </div>
      </div>

      <div style={{ background: '#14110F', border: '1.5px dashed #F0B429', borderRadius: 16, padding: 16, textAlign: 'center' }}>
        <div style={{ font: "600 10.5px 'IBM Plex Mono'", color: '#8A7A63', letterSpacing: '.14em' }}>GUEST ACCESS CODE</div>
        <div style={{ font: "700 30px 'IBM Plex Mono'", color: '#F0B429', letterSpacing: '.1em', marginTop: 6 }}>{previewCode}</div>
        <div style={{ font: "400 12px 'IBM Plex Sans'", color: '#8A7A63', marginTop: 6 }}>
          Paste into your Airbnb / GetYourGuide confirmation. One code per batch, works for all {seats} guests.
        </div>
      </div>

      {saveError && <div style={{ font: "500 12.5px 'IBM Plex Sans'", color: '#F2856B' }}>{saveError}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} style={{ background: '#33291F', border: 'none', borderRadius: 14, padding: '14px 16px', color: '#8A7A63', font: "600 13px 'IBM Plex Sans'", cursor: 'pointer' }}>
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={saving}
          style={{ flex: 1, background: '#F0B429', border: 'none', borderRadius: 14, padding: 14, color: '#1B1512', font: "800 14px 'Bricolage Grotesque'", cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Creating…' : 'Create batch'}
        </button>
      </div>
    </div>
  );
}
