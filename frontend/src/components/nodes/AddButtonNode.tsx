import React from 'react';
import { Handle, Position } from 'reactflow';

/**
 * AddButtonNode renders a simple "+" symbol between nodes,
 * used for inserting new workflow elements in Level 2/3.
 */
const AddButtonNode: React.FC = () => {
    return (
        <div style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#444',
            userSelect: 'none',
        }}>
            +
            <Handle type="target" position={Position.Top} style={{ visibility: 'hidden' }} />
            <Handle type="source" position={Position.Bottom} style={{ visibility: 'hidden' }} />
        </div>
    );
};

export default AddButtonNode;
