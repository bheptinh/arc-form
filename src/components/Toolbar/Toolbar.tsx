import { useEffect } from 'react';
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
  const tool = usePlannerStore((s) => s.tool);
  const setTool = usePlannerStore((s) => s.setTool);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      const map: Record<string, ToolType> = { s: 'select', w: 'wall', d: 'door', n: 'window' };
      const t = map[e.key.toLowerCase()];
      if (t) setTool(t);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setTool]);

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
    </div>
  );
}
