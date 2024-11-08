import { Dialog, DialogContent } from '@mui/material';

import { FunctionForm } from '@app/app/(pages)/templates/create-template/components/FunctionForm';

import ConfirmationBox from '@app/components/molecules/ConfirmationBox';

const UpdateFunctionDialog = ({
    dialogOpen,
    currentFunction,
    toggleDialog,
    handleFunctionUpdate
}: {
    dialogOpen: boolean;
    currentFunction: any;
    toggleDialog: () => void;
    handleFunctionUpdate: (functionItem: any) => void;
}) => (
    <Dialog open={dialogOpen}>
        <DialogContent className="!p-0">
            {currentFunction && (
                <FunctionForm
                    currentFunction={currentFunction}
                    onValueChange={() => {}}
                    onClose={toggleDialog}
                    onSave={handleFunctionUpdate}
                    btnPlaceholder="Update"
                />
            )}
        </DialogContent>
    </Dialog>
);

const AddFunctionDialog = ({
    dialogOpen,
    toggleDialog,
    handleAddNewFunction
}: {
    dialogOpen: boolean;
    toggleDialog: () => void;
    handleAddNewFunction: (functionItem: any) => void;
}) => (
    <Dialog open={dialogOpen}>
        <DialogContent className="!p-0">
            <FunctionForm
                renderFunctionSelector={true}
                onValueChange={() => {}}
                onClose={toggleDialog}
                onSave={handleAddNewFunction}
                btnPlaceholder="Add"
            />
        </DialogContent>
    </Dialog>
);

const DeleteFunctionDialog = ({
    dialogOpen,
    deleteIndex,
    toggleDialog,
    handleFunctionDelete
}: {
    dialogOpen: boolean;
    deleteIndex: number;
    toggleDialog: () => void;
    handleFunctionDelete: (index: number) => void;
}) => (
    <Dialog open={dialogOpen}>
        <DialogContent>
            <ConfirmationBox
                onAccept={() => handleFunctionDelete(deleteIndex)}
                onClose={toggleDialog}
                onDecline={toggleDialog}
                title="Delete Template"
                msg="Are you sure you want to delete this Function? This function will be lost once template is saved."
            />
        </DialogContent>
    </Dialog>
);

export { UpdateFunctionDialog, AddFunctionDialog, DeleteFunctionDialog };
