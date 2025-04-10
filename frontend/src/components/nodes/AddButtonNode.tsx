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
            cursor: 'pointer',
            width: 30,
            height: 30,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            +
            <Handle type="target" position={Position.Top} style={{ opacity: 0, visibility: 'hidden'}} />
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0, visibility: 'hidden' }} />
        </div>
    );
};

export default AddButtonNode;
