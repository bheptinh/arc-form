import { usePlannerStore } from '../../store/usePlannerStore';
import styles from './PropertiesPanel.module.css';

export function PropertiesPanel() {
  const defaultWallThickness   = usePlannerStore((s) => s.defaultWallThickness);
  const setDefaultWallThickness = usePlannerStore((s) => s.setDefaultWallThickness);
  const setWallThickness        = usePlannerStore((s) => s.setWallThickness);
  const updateOpening           = usePlannerStore((s) => s.updateOpening);
  const tool                    = usePlannerStore((s) => s.tool);
  const viewport                = usePlannerStore((s) => s.viewport);
  const selectedId              = usePlannerStore((s) => s.selectedId);

  const selectedWall    = usePlannerStore((s) => s.selectedId ? s.walls[s.selectedId]    : null);
  const selectedOpening = usePlannerStore((s) => s.selectedId ? s.openings[s.selectedId] : null);

  return (
    <div className={styles.panel}>

      {selectedWall && (
        <div className={styles.section}>
          <h3 className={styles.heading}>Selected wall</h3>
          <label className={styles.field}>
            <span>Thickness</span>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.input}
                value={selectedWall.thickness}
                min={50}
                max={600}
                step={10}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 50) setWallThickness(selectedId!, v);
                }}
              />
              <span className={styles.unit}>mm</span>
            </div>
          </label>
        </div>
      )}

      {selectedOpening && (
        <div className={styles.section}>
          <h3 className={styles.heading}>Selected {selectedOpening.type}</h3>
          <label className={styles.field}>
            <span>Width</span>
            <div className={styles.inputRow}>
              <input
                type="number"
                className={styles.input}
                value={selectedOpening.width}
                min={200}
                max={3000}
                step={50}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 200) updateOpening(selectedId!, { width: v });
                }}
              />
              <span className={styles.unit}>mm</span>
            </div>
          </label>
          {selectedOpening.type === 'door' && (
            <label className={styles.field}>
              <span>Swing</span>
              <div className={styles.inputRow}>
                <select
                  className={styles.input}
                  value={selectedOpening.swing ?? 'inside-left'}
                  onChange={(e) =>
                    updateOpening(selectedId!, { swing: e.target.value as import('../../types/planner').SwingDir })
                  }
                >
                  <option value="inside-left">Inside, hinge left</option>
                  <option value="inside-right">Inside, hinge right</option>
                  <option value="outside-left">Outside, hinge left</option>
                  <option value="outside-right">Outside, hinge right</option>
                </select>
              </div>
            </label>
          )}
        </div>
      )}

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
          <span>{Math.round((viewport.scale / 0.15) * 100)}%</span>
        </div>
        <div className={styles.info}>
          <span>Tool</span>
          <span>{tool}</span>
        </div>
      </div>

    </div>
  );
}
