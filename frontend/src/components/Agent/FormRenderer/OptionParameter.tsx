import { useState } from 'react';

import { IParameter, IParameterOption } from '@models/types/functions';
import { useAtom } from 'jotai';

import InputParameter from '@app/components/Agent/FormRenderer/InputParameter';
import ListParameter from '@app/components/Agent/FormRenderer/ListParameter';
import ObjectParameter from '@app/components/Agent/FormRenderer/ObjectParameter';
import { CustomCombobox } from '@app/components/molecules/CustomCombobox';
import { selectedFunctionAtom } from '@app/store/atoms/formRenderer';

const OptionsParameter = ({ parameter, paramIndex }: { parameter: IParameter; paramIndex: number }) => {
    const [selectedFunction, setSelectedFunction] = useAtom(selectedFunctionAtom);

    function renderParamsComponent(parameter: IParameter) {
        switch (parameter.type) {
            case 'number':
            case 'string':
            case 'hash':
            case 'url':
                return <InputParameter paramIndex={paramIndex} parameter={parameter} />;
            case 'object':
                return <ObjectParameter paramIndex={paramIndex} parameter={parameter} />;
            case 'list':
                return <ListParameter paramIndex={paramIndex} parameter={parameter} />;
        }
    }

    const [selectedOption, setSelectedOption] = useState<IParameterOption | null>(null);
    return (
        <div className={'flex flex-col gap-4'}>
            {parameter && parameter.options && (
                <CustomCombobox
                    isOpen
                    itemsList={
                        parameter?.options?.map((option) => ({
                            id: option.name,
                            label: option.name
                        })) || []
                    }
                    defaultValue={
                        parameter && parameter.options
                            ? {
                                  id: parameter.options[0].name,
                                  label: parameter.options[0].name
                              }
                            : { id: '', label: '' }
                    }
                    onSelect={(optionName: string) => {
                        const option = parameter.options!.find((item) => item.name === optionName);
                        if (option && selectedFunction && selectedFunction.parameters) {
                            selectedFunction.parameters[paramIndex].parameters = [option];
                            setSelectedFunction({ ...selectedFunction });
                        }
                        option && setSelectedOption(option);
                    }}
                />
            )}
            {selectedOption?.parameters ? (
                renderParamsComponent(selectedOption as IParameter)
            ) : (
                <div className={'py-2'}>
                    {selectedOption ? `Selected ${selectedOption.name}` : 'No Options Selected Yet'}
                </div>
            )}
        </div>
    );
};

export default OptionsParameter;
