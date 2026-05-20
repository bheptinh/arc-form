import { usePlannerStore } from '../../store/usePlannerStore';
import styles from './PropertiesPanel.module.css';

export function PropertiesPanel() {
  const defaultWallThickness = usePlannerStore((s) => s.defaultWallThickness);
  const setDefaultWallThickness = usePlannerStore((s) => s.setDefaultWallThickness);
  const tool = usePlannerStore((s) => s.tool);
  const viewport = usePlannerStore((s) => s.viewport);

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.heading}>Defaults</h3>
        <label className={styles.field}>
          <span>Wall thickness</span>
          <div className={styles.inputRow}>
            <input
              type="number"
              className={styles.input}
              value={defaultWallThickness}
              min={50}
              max={600}
              step={10}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v) && v > 0) setDefaultWallThickness(v);
              }}
            />
            <span className={styles.unit}>mm</span>
          </div>
        </label>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>View</h3>
        <div className={styles.info}>
          <span>Zoom</span>
          <span>{Math.round(viewport.scale / 0.15 * 100)}%</span>
        </div>
        <div className={styles.info}>
          <span>Tool</span>
          <span>{tool}</span>
        </div>
      </div>
    </div>
  );
}
