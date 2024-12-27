import { IEventTrigger } from '@api/agents';
import Editor from '@monaco-editor/react';

export default function CustomEditor({
    defaultValue,
    onValueChange
}: {
    defaultValue: IEventTrigger | null;
    onValueChange: (data: string) => void;
}) {
    return (
        <>
            <Editor
                height={'100%'}
                width={'100%'}
                defaultLanguage="json"
                className="bg-brand-vscode !rounded-xl !py-4"
                // defaultValue={JSON.stringify(defaultValue, null, 2) || ''}
                theme="vs-dark"
                value={
                    defaultValue
                        ? JSON.stringify(defaultValue, null, 2)
                        : '{"Welcome to Autonomous Agent Testing.": "Try Disabling Pro mode and use graph for initial state"}'
                }
                onChange={(data) => data && onValueChange(data)}
            ></Editor>
        </>
    );
}
