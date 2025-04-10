import React, { useEffect, useState } from 'react';
import '../ActionNodeEditor.css';

interface ActionNodeEditorProps {
    label: string;
    fields?: { name: string; value: string }[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (newLabel: string, fields: { name: string; value: string }[]) => void;
    onDelete: () => void;
}

const ActionNodeEditor: React.FC<ActionNodeEditorProps> = ({
                                                               label,
                                                               fields,
                                                               isOpen,
                                                               onClose,
                                                               onSave,
                                                               onDelete,
                                                           }) => {
    const [tempLabel, setTempLabel] = useState(label);

    useEffect(() => {
        setTempLabel(label);
    }, [label]);

    const [fieldList, setFieldList] = useState<{ name: string; value: string }[]>(fields || []);

    useEffect(() => {
        setFieldList(fields || []);
    }, [fields]);

    const handleSave = () => {
        onSave(tempLabel.trim() || label, fieldList);
        onClose();
    };

    const handleFieldChange = (index: number, key: 'name' | 'value', newValue: string) => {
        const updated = [...fieldList];
        updated[index][key] = newValue;
        setFieldList(updated);
    };

    const addField = () => {
        setFieldList([...fieldList, { name: '', value: '' }]);
    };

    const removeField = (index: number) => {
        const updated = [...fieldList];
        updated.splice(index, 1);
        setFieldList(updated);
    };


    if (!isOpen) return null;

    return (
        <div className="action-editor-overlay">
            <div className="action-editor-drawer">
                {/* Close (X) */}
                <div className="editor-close" onClick={onClose}>
                    ×
                </div>

                {/* Drawer content */}
                <div className="drawer-content">
                    <div className="editor-header">
                        <div className="editor-title">Action</div>
                        <div className="editor-subtitle">{label}</div>
                    </div>

                    <label className="editor-label">Action Name</label>
                    <input
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        className="editor-input"
                    />

                    <div className="editor-fields">
                        {fieldList.map((field, index) => (
                            <div key={index} className="editor-field-row">
                                <input
                                    className="editor-input half"
                                    placeholder="Field Name"
                                    value={field.name}
                                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                />
                                <input
                                    className="editor-input half"
                                    placeholder="Value"
                                    value={field.value}
                                    onChange={(e) => handleFieldChange(index, 'value', e.target.value)}
                                />
                                <button className="editor-remove-field" onClick={() => removeField(index)}>×</button>
                            </div>
                        ))}
                    </div>

                    <div className="editor-add-field" onClick={addField}>+ Add field</div>
                </div>

                {/* Bottom Buttons */}
                <div className="editor-buttons">
                    <button className="btn-delete" onClick={() => { onDelete(); onClose(); }}>
                        Delete
                    </button>
                    <div style={{ flexGrow: 1 }} />
                    <button className='btn-cancel' onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default ActionNodeEditor;