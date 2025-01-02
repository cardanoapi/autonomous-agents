import React, { useEffect, useState } from 'react';

import { IEventTrigger } from '@api/agents';
import { useDebounceValue } from 'usehooks-ts';

import CustomEditor from '@app/app/(pages)/templates/create-template/components/event/CustomEditor';
import NodeGraph from '@app/app/(pages)/templates/create-template/components/event/EventTriggerGraph';
import { ErrorToast } from '@app/components/molecules/CustomToasts';

const EventTabRenderer = ({
    displayMonacoEditor,
    formData,
    onEditorValueChange
}: {
    displayMonacoEditor: boolean;
    formData: IEventTrigger | null;
    onEditorValueChange: (value: IEventTrigger) => void;
}) => {
    const [editorValue, setEditorValue] = useState(
        formData ? JSON.stringify(formData) : ''
    );
    const handleOnEditorValueChange = (value: string) => {
        setEditorValue(value);
    };

    const [debouncedValue] = useDebounceValue(editorValue, 800);

    useEffect(() => {
        try {
            const parsedData = JSON.parse(debouncedValue);
            onEditorValueChange(parsedData);
        } catch (err) {
            if (!debouncedValue) return;
            ErrorToast('Invalid JSON');
        }
    }, [debouncedValue]);

    return (
        <div className="h-[600px] w-[1200px] items-center scroll-auto">
            {displayMonacoEditor ? (
                <CustomEditor
                    defaultValue={formData}
                    onValueChange={handleOnEditorValueChange}
                />
            ) : (
                <NodeGraph data={formData} />
            )}
        </div>
    );
};

export default EventTabRenderer;
