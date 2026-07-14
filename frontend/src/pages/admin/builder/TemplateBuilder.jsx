import { useState } from 'react'
import BuilderTopbar from './components/BuilderTopbar'
import BuilderRail from './components/BuilderRail'
import ElementPanel from './components/ElementPanel'
import BuilderCanvas from './components/BuilderCanvas'

const newId = () =>
  crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())

export default function TemplateBuilder() {
  const [device, setDevice] = useState('desktop')
  const [category, setCategory] = useState('elements')
  const [blocks, setBlocks] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  const addBlock = (payload) => {
    const block = { id: newId(), ...payload }
    setBlocks((b) => [...b, block])
    setSelectedId(block.id)
  }

  const deleteBlock = (id) => {
    setBlocks((b) => b.filter((x) => x.id !== id))
    setSelectedId((s) => (s === id ? null : s))
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 text-gray-800">
      <BuilderTopbar device={device} onDeviceChange={setDevice} />
      <div className="flex flex-1 overflow-hidden">
        <BuilderRail active={category} onSelect={setCategory} />
        <ElementPanel category={category} />
        <BuilderCanvas
          device={device}
          blocks={blocks}
          selectedId={selectedId}
          onAddBlock={addBlock}
          onSelect={setSelectedId}
          onDelete={deleteBlock}
        />
      </div>
    </div>
  )
}
