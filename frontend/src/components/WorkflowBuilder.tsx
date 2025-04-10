import React, { useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';

import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import AddButtonNode from './nodes/AddButtonNode';

/**
 * Mapping of custom node types for React Flow
 */
const nodeTypes = {
    start: StartNode,
    end: EndNode,
    add: AddButtonNode,
};

const WorkflowBuilder: React.FC = () => {
    const [nodes, setNodes] = useState<Node[]>([
        {
            id: 'start',
            type: 'start',
            position: { x: 300, y: 50 },
            data: {},
        },
        {
            id: 'add',
            type: 'add',
            position: { x: 320, y: 170 },
            data: {},
        },
        {
            id: 'end',
            type: 'end',
            position: { x: 310, y: 290 },
            data: {},
        },
    ]);

    const [edges, setEdges] = useState<Edge[]>([
        {
            id: 'e1',
            source: 'start',
            target: 'add',
            style: { stroke: '#aaa', strokeWidth: 1.5 },
        },
        {
            id: 'e2',
            source: 'add',
            target: 'end',
            style: { stroke: '#aaa', strokeWidth: 1.5 },
        },
    ]);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
                onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                onConnect={(params: Connection) => setEdges((eds) => addEdge(params, eds))}
                nodeTypes={nodeTypes}
                fitView
            >
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default WorkflowBuilder;
