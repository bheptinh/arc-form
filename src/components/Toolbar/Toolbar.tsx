import { useEffect, useRef } from 'react';
import { usePlannerStore } from '../../store/usePlannerStore';
import type { ToolType } from '../../types/planner';
import styles from './Toolbar.module.css';

const TOOLS: { type: ToolType; label: string; shortcut: string; icon: string }[] = [
  { type: 'select', label: 'Select',  shortcut: 'S', icon: '↖' },
  { type: 'wall',   label: 'Wall',    shortcut: 'W', icon: '▬' },
  { type: 'door',   label: 'Door',    shortcut: 'D', icon: '⌐' },
  { type: 'window', label: 'Window',  shortcut: 'N', icon: '⊞' },
];

export function Toolbar() {
  const tool      = usePlannerStore((s) => s.tool);
  const setTool   = usePlannerStore((s) => s.setTool);
  const loadPlan  = usePlannerStore((s) => s.loadPlan);
  const clearPlan = usePlannerStore((s) => s.clearPlan);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const map: Record<string, ToolType> = { s: 'select', w: 'wall', d: 'door', n: 'window' };
      const t = map[e.key.toLowerCase()];
      if (t) setTool(t);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool]);

  function handleExport() {
    const { points, walls, openings } = usePlannerStore.getState();
    const json = JSON.stringify({ points, walls, openings }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'floor-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        loadPlan({ points: data.points ?? {}, walls: data.walls ?? {}, openings: data.openings ?? {} });
      } catch {
        alert('Invalid plan file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleNew() {
    if (confirm('Start a new plan? This will clear the current floor plan.')) {
      clearPlan();
    }
  }

  return (
    <div className={styles.toolbar}>
      {TOOLS.map((t) => (
        <button
          key={t.type}
          className={`${styles.btn} ${tool === t.type ? styles.active : ''}`}
          onClick={() => setTool(t.type)}
          title={`${t.label} (${t.shortcut})`}
        >
          <span className={styles.icon}>{t.icon}</span>
          <span className={styles.label}>{t.label}</span>
        </button>
      ))}

      <div className={styles.divider} />

      <button className={styles.btn} onClick={handleExport} title="Export plan as JSON">
        <span className={styles.icon}>↓</span>
        <span className={styles.label}>Save</span>
      </button>

      <button className={styles.btn} onClick={() => fileInputRef.current?.click()} title="Import plan from JSON">
        <span className={styles.icon}>↑</span>
        <span className={styles.label}>Open</span>
      </button>
      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />

      <button className={styles.btn} onClick={handleNew} title="New plan">
        <span className={styles.icon}>⊘</span>
        <span className={styles.label}>New</span>
      </button>
    </div>
  );
}
