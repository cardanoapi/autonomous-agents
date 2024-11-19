import { IEventTrigger } from '@api/agents';
import Editor from '@monaco-editor/react';
import { X } from 'lucide-react';

export default function CustomEditor({
    defaultValue,
    onClose,
    onValueChange
}: {
    defaultValue: IEventTrigger | null;
    onClose: () => void;
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
            <X
                className="text-black-200 absolute right-2 top-2 cursor-pointer bg-white"
                onClick={onClose}
            />
        </>
    );
}
