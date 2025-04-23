import { Button } from '@app/components/atoms/Button';

const EditBtns = ({
    isEditing,
    onSave,
    onEdit,
    onCancel
}: {
    isEditing: boolean;
    onSave?: () => void;
    onEdit?: () => void;
    onCancel?: () => void;
}) => {
    return (
        <div className="flex flex-row gap-4">
            {isEditing ? (
                <>
                    <Button className="w-[100px]" onClick={onCancel} size={'md'}>
                        Cancel
                    </Button>
                    <Button className="w-[100px]" onClick={onSave} size={'md'} variant={'primary'}>
                        Save
                    </Button>
                </>
            ) : (
                <Button className="w-[100px]" onClick={onEdit} size={'md'} variant={'primary'}>
                    Edit
                </Button>
            )}
        </div>
    );
};

export default EditBtns;
