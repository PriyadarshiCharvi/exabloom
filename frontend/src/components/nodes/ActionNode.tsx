import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

/**
 * ActionNode: a custom editable node that allows renaming and deleting.
 */
interface ActionNodeProps {
    id: string;
    data: {
        label: string;
        defaultLabel?: string;
        customLabel?: boolean;
        fields?: { name: string; value: string }[];
        onDelete: (id: string) => void;
        onChange: (id: string, newLabel: string) => void;
    };
}

const ActionNode: React.FC<ActionNodeProps> = ({ id, data }) => {
    return (
        <div style={{
            padding: 10,
            borderRadius: 8,
            border: '1px solid #2196f3',
            backgroundColor: '#e3f2fd',
            fontFamily: 'sans-serif',
            width: 180,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <Handle type="target" position={Position.Top} style={{ opacity: 0, visibility: 'hidden' }} />
            {data.label || 'Unnamed Action'}
            {data.fields && data.fields.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: '#555' }}>
                    {data.fields.map((field, index) => (
                        <div key={index}>
                            <strong>{field.name}:</strong> {field.value}
                        </div>
                    ))}
                </div>
            )}
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0, visibility: 'hidden' }} />
        </div>
    );
};


export default ActionNode;