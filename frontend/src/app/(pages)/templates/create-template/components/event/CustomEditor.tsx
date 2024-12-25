import { IEventTrigger } from '@api/agents';
import Editor from '@monaco-editor/react';

export default function CustomEditor({
    defaultValue,
    onValueChange
}: {
    defaultValue: IEventTrigger | null;
    onValueChange: (data: IEventTrigger) => void;
}) {
    return (
        <>
            <Editor
                height={'100%'}
                width={'100%'}
                defaultLanguage="json"
                className="rounded-xl"
                // defaultValue={JSON.stringify(defaultValue, null, 2) || ''}
                theme="vs-dark"
                value={JSON.stringify(defaultValue, null, 2) || '{}'}
                onChange={(data) => data && onValueChange(JSON.parse(data))}
            ></Editor>
        </>
    );
}
