import React from 'react';
import { Handle, Position } from 'reactflow';

/**
 * EndNode is a custom node marking the end of the workflow.
 * It has a rounded visual style and accepts incoming connections.
 */
const EndNode: React.FC = () => {
    return (
        <div style={{
            backgroundColor: '#eee',
            border: '1px solid #bbb',
            borderRadius: 30,
            padding: '12px 30px',
            fontWeight: 600,
            fontSize: 16,
            color: '#444',
        }}>
            <Handle type="target" position={Position.Top} />
            END
        </div>
    );
};

export default EndNode;
