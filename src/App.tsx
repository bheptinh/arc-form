import { Toolbar } from './components/Toolbar/Toolbar';
import { PlannerCanvas } from './components/Canvas/PlannerCanvas';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import './index.css';

export function App() {
  return (
    <div className="app">
      <Toolbar />
      <PlannerCanvas />
      <PropertiesPanel />
    </div>
  );
}
