import BuilderCanvas from './BuilderCanvas'
import BuilderRail from './BuilderRail'
import ElementPanel from './ElementPanel'
import LayersPanel from './LayersPanel'
import PropertiesPanel from './PropertiesPanel'

// Khung Builder thuần UI/interaction. Admin và User truyền persistence/topbar từ bên ngoài.
const BuilderWorkspace = ({ controller, settings, library = [], libraryEmptyMessage }) => (
  <div className="flex min-h-0 flex-1 overflow-hidden">
    <BuilderRail activePanel={controller.activePanel} onToggle={controller.togglePanel} />
    {controller.activePanel === 'add' && (
      <ElementPanel
        recent={controller.recent}
        library={library}
        libraryEmptyMessage={libraryEmptyMessage}
        onUse={controller.useRecent}
      />
    )}
    {controller.activePanel === 'layers' && (
      <LayersPanel
        elements={controller.viewElements}
        selectedId={controller.selectedId}
        onSelect={controller.setSelectedId}
        onToggleHidden={controller.toggleHidden}
        onDelete={controller.deleteElement}
        onMoveLayer={controller.moveLayer}
      />
    )}
    <BuilderCanvas
      device={controller.device}
      settings={settings}
      elements={controller.viewElements}
      selectedId={controller.selectedId}
      onAddElement={controller.addElement}
      onAddBlock={controller.addBlock}
      onSelect={controller.setSelectedId}
      onBeginGesture={controller.beginGesture}
      onMove={controller.moveElement}
      onResize={controller.resizeElement}
      onUpdate={controller.updateElement}
      onDuplicate={controller.duplicateElement}
      onDelete={controller.deleteElement}
      onFitContent={controller.fitContentToWidth}
    />
    <PropertiesPanel
      element={controller.selected}
      onUpdate={controller.updateElement}
      onDelete={controller.deleteElement}
    />
  </div>
)

export default BuilderWorkspace
