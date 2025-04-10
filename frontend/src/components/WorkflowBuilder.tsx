import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
    Background,
    Controls,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Node,
    Edge,
    Connection,
    NodeMouseHandler,
    ReactFlowProvider,
    ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';

import StartNode from './nodes/StartNode';
import EndNode from './nodes/EndNode';
import AddButtonNode from './nodes/AddButtonNode';
import ActionNode from './nodes/ActionNode';
import ActionNodeEditor from '../components/ActionNodeEditor';

// Node types for custom node components
const nodeTypes = {
    start: StartNode,
    end: EndNode,
    add: AddButtonNode,
    action: ActionNode,
};

// Constants for layout
const NODE_VERTICAL_SPACING = 120;
const CENTER_X = 250;

/**
 * WorkflowBuilder component that manages a vertical workflow with action nodes
 * that can be added, removed, and renamed.
 */
const WorkflowBuilder: React.FC = () => {
    // State for nodes, edges, and ReactFlow instance
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

    const getEditingNode = () => nodes.find((n) => n.id === editingNodeId);

    /**
     * Initialize workflow with start -> add button -> end structure
     */
    useEffect(() => {
        const initialNodes = [
            { id: 'start', type: 'start', position: { x: CENTER_X, y: 50 }, data: {} },
            { id: 'add-1', type: 'add', position: { x: CENTER_X, y: 50 + NODE_VERTICAL_SPACING }, data: {} },
            { id: 'end', type: 'end', position: { x: CENTER_X, y: 50 + NODE_VERTICAL_SPACING * 2 }, data: {} },
        ];

        const initialEdges = [
            {
                id: 'e-start-add-1',
                source: 'start',
                target: 'add-1',
                type: 'default',
                animated: false,
                style: { stroke: '#333', strokeWidth: 1.5 }
            },
            {
                id: 'e-add-1-end',
                source: 'add-1',
                target: 'end',
                type: 'default',
                animated: false,
                style: { stroke: '#333', strokeWidth: 1.5 }
            },
        ];

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, []);

    /**
     * Fit view whenever nodes change to ensure all nodes are visible
     */
    useEffect(() => {
        if (reactFlowInstance) {
            setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.2, duration: 800 });
            }, 150);
        }
    }, [nodes, reactFlowInstance]);

    /**
     * Updates the entire layout:
     * - Positions nodes vertically in sequence
     * - Renumbers action nodes from top to bottom
     * - Rebuilds all edge connections
     */
    const updateLayout = useCallback((updatedNodes: Node[]) => {
        // Position all nodes vertically with even spacing
        const positionedNodes = updatedNodes.map((node, index) => ({
            ...node,
            position: { x: CENTER_X, y: 50 + index * NODE_VERTICAL_SPACING },
        }));

        // Renumber all action nodes from top to bottom
        let actionIndex = 1;
        const relabeledNodes = positionedNodes.map((node) => {
            if (node.type === 'action') {
                // Keep custom label if it exists, otherwise use numbered format
                const hasCustomLabel = node.data.customLabel || false;
                const defaultLabel = `Action ${actionIndex++}`;
                return {
                    ...node,
                    data: {
                        ...node.data,
                        label: hasCustomLabel ? node.data.label : defaultLabel,
                        defaultLabel,
                        onDelete: handleDeleteNode,
                        onChange: handleRenameNode,
                    },
                };
            }
            return node;
        });

        // Rebuild all edges to connect adjacent nodes
        const newEdges: Edge[] = [];
        for (let i = 0; i < relabeledNodes.length - 1; i++) {
            newEdges.push({
                id: `e-${relabeledNodes[i].id}-${relabeledNodes[i + 1].id}`,
                source: relabeledNodes[i].id,
                target: relabeledNodes[i + 1].id,
                type: 'default',
                animated: false,
                style: { stroke: '#333', strokeWidth: 1.5 },
            });
        }

        setNodes(relabeledNodes);
        setEdges(newEdges);
    }, []);

    /**
     * Handles click on an add button node to insert a new action node
     * with add buttons above and below it
     */
    const handleAddClick: NodeMouseHandler = useCallback((_, clickedNode) => {
        if (clickedNode.type !== 'add') return;

        setNodes((currentNodes) => {
            const index = currentNodes.findIndex((n) => n.id === clickedNode.id);
            if (index === -1) return currentNodes;

            // Generate unique IDs for new nodes
            const newActionId = `action-${Date.now()}`;
            const newAddTopId = `add-${Date.now()}-top`;
            const newAddBottomId = `add-${Date.now()}-bottom`;

            // Create a block of nodes to insert: add button + action node + add button
            const newNodes = [
                { id: newAddTopId, type: 'add', position: { x: 0, y: 0 }, data: {} },
                {
                    id: newActionId,
                    type: 'action',
                    position: { x: 0, y: 0 },
                    data: {
                        label: '',
                        onDelete: handleDeleteNode,
                        onChange: handleRenameNode,
                    },
                },
                { id: newAddBottomId, type: 'add', position: { x: 0, y: 0 }, data: {} },
            ];

            // Insert the new nodes at the position of the clicked add button
            const updatedNodes = [
                ...currentNodes.slice(0, index),
                ...newNodes,
                ...currentNodes.slice(index + 1),
            ];

            // Update the layout with the new nodes
            setTimeout(() => updateLayout(updatedNodes), 0);
            return updatedNodes;
        });
    }, [updateLayout]);

    /**
     * Handles deletion of an action node.
     * Ensures there's an add button node connecting the nodes above and below.
     */
    const handleDeleteNode = useCallback((id: string) => {
        setNodes((currentNodes) => {
            const index = currentNodes.findIndex((n) => n.id === id);
            if (index === -1) return currentNodes;

            let updatedNodes = [...currentNodes];

            // Check if the action node has add buttons before and after
            const hasAddBefore = index > 0 && updatedNodes[index - 1].type === 'add';
            const hasAddAfter = index < updatedNodes.length - 1 && updatedNodes[index + 1].type === 'add';

            if (hasAddBefore && hasAddAfter) {
                // Keep one add button and remove the action node and the other add button
                updatedNodes = [
                    ...updatedNodes.slice(0, index - 1),
                    updatedNodes[index - 1], // Keep the first add button
                    ...updatedNodes.slice(index + 2) // Skip the action node and second add button
                ];
            } else {
                // Just remove the action node and ensure there's an add button
                const newAddId = `add-${Date.now()}`;
                updatedNodes = [
                    ...updatedNodes.slice(0, index),
                    { id: newAddId, type: 'add', position: { x: 0, y: 0 }, data: {} },
                    ...updatedNodes.slice(index + 1)
                ];
            }

            // Update layout
            setTimeout(() => updateLayout(updatedNodes), 0);
            return updatedNodes;
        });
    }, [updateLayout]);

    /**
     * Updates the label text of a node when renamed by user,
     * preserving the custom label flag
     */
    const handleRenameNode = useCallback((id: string, newLabel: string) => {
        setNodes((currentNodes) =>
            currentNodes.map((node) => {
                if (node.id === id) {
                    // Find the node's default label from the current state
                    const defaultLabel = node.data.defaultLabel || node.data.label;

                    // Set customLabel flag if the user entered something different than default
                    const isCustom = newLabel.trim() !== defaultLabel && newLabel.trim() !== '';

                    return {
                        ...node,
                        data: {
                            ...node.data,
                            label: newLabel.trim() || defaultLabel,
                            customLabel: isCustom,
                            defaultLabel,
                            onDelete: handleDeleteNode,
                            onChange: handleRenameNode,
                        },
                    };
                }
                return node;
            })
        );
    }, []);

    const handleNodeClick: NodeMouseHandler = useCallback((_, clickedNode) => {
        if (clickedNode.type === 'action') {
            setEditingNodeId(clickedNode.id);
            setEditorOpen(true);
        } else if (clickedNode.type === 'add') {
            handleAddClick(_, clickedNode);
        }
    }, [handleAddClick]);

    const handleUpdateFields = useCallback((id: string, fields: { name: string; value: string }[]) => {
        setNodes((currentNodes) =>
            currentNodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            fields,
                        },
                    };
                }
                return node;
            })
        );
    }, []);


    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    onNodesChange={(changes) => setNodes((nds) => applyNodeChanges(changes, nds))}
                    onEdgesChange={(changes) => setEdges((eds) => applyEdgeChanges(changes, eds))}
                    onConnect={(params: Connection) => setEdges((eds) => addEdge(params, eds))}
                    onNodeClick={handleNodeClick}
                    onInit={setReactFlowInstance}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.1}
                    maxZoom={1.5}
                    nodesDraggable={true}
                    elementsSelectable={true}
                    connectionLineStyle={{ stroke: '#333', strokeWidth: 1.5 }} // Style for the connection line
                    defaultEdgeOptions={{
                        type: 'smoothstep',
                        animated: false,
                        style: { stroke: '#333', strokeWidth: 1.5 }
                    }}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </ReactFlowProvider>
            <ActionNodeEditor
                isOpen={editorOpen}
                label={getEditingNode()?.data.label || ''}
                fields={getEditingNode()?.data.fields || []}
                onSave={(newLabel, updatedFields) => {
                    if (editingNodeId) {
                        handleRenameNode(editingNodeId, newLabel);
                        handleUpdateFields(editingNodeId, updatedFields);
                    }
                }}
                onClose={() => setEditorOpen(false)}
                onDelete={() => {
                    if (editingNodeId) handleDeleteNode(editingNodeId);
                }}
            />

        </div>
    );
};

export default WorkflowBuilder;