import React from 'react';
import { Handle, Position } from 'reactflow';

/**
 * StartNode is a custom React Flow node that marks the beginning of the workflow.
 */
const StartNode: React.FC = () => {
    return (
        <div style={{
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: 6,
            padding: '10px 16px',
            width: 180,
            fontFamily: 'sans-serif',
            fontSize: 14,
        }}>
            <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>Start Node</div>
            <div style={{ color: '#555' }}>Start</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};

export default StartNode;
