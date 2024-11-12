import React from 'react';

import { IParameter } from '@models/types/functions';

import InputParameter from './InputParameter';
import ListParameter from './ListParameter';
import ObjectParameter from './ObjectParameter';
import OptionsParameter from './OptionParameter';

const FormParameters = ({ parameters }: { parameters: Array<IParameter> }) => {
    function renderParamsComponent(parameter: IParameter, index: number) {
        switch (parameter.type) {
            case 'number':
            case 'string':
            case 'hash':
            case 'url':
                return <InputParameter parameter={parameter} paramIndex={index} />;
            case 'options':
                return <OptionsParameter paramIndex={index} parameter={parameter} />;
            case 'object':
                return <ObjectParameter paramIndex={index} parameter={parameter} />;
            case 'list':
                return <ListParameter paramIndex={index} parameter={parameter} />;
        }
    }

    return (
        <div className={'flex flex-col gap-6'}>
            {parameters.map((param, index) => {
                return (
                    <div key={param.id} className={'flex flex-col gap-2'}>
                        {!param.items && (
                            <span className={'text-md font-medium'}>{param.name} </span>
                        )}
                        <div>{renderParamsComponent(param, index)}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default FormParameters;