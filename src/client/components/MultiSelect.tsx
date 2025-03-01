import * as React from 'react';
import { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { apiService } from '../utils/api-services'
import { IIngredients, IRecipeIngredientsFull } from '../../interfaces';
import { OptionProps } from "react-select/src/types";
import Creatable, { makeCreatableSelect } from 'react-select/creatable';
import Select from 'react-select';
import { mergeAndFilter } from '../utils/mergeAndFilter';


/* HOOK REACT EXAMPLE */
const MultiSelect = (props: MultiSelectProps) => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    // const [x, setx] = useState<string>('');
    // const handleSetX = (e: React.ChangeEvent<HTMLInputElement>) => setx(e.target.value);

    // all ingredients from db fetch
    const [selectableItems, setAllSelectableItems] = useState<IIngredients[]>([]);
    // all existing ingredients of this recipe from db fetch
    const [ingreds, setIngreds] = useState<IRecipeIngredientsFull[]>([]);

    const [selectedItemsArray, setSelectedItemsArray] = useState<IOptionType[]>([]);
    // Dropdown options...result of merge and filter func, converted from {id,name} to {label, value}
    const [itemOptions, setItemOptions] = useState<IOptionType[]>([]);

    useEffect(() => {
        if (props.type === 'ingredients') {
            // for fetching existing recipeIngredients to be filter selectableItems
            apiService(`/api/recipeingredients/${props.recipeId?.id}`)
                .then(ingreds => setIngreds(ingreds));
        }

        apiService(`/api/${props.type}`)
            .then(selectableIngredients => setAllSelectableItems(selectableIngredients));
    }, []);

    useEffect(() => {
        // removes existing recipeIngredients from options
        const result = mergeAndFilter(selectableItems, ingreds);
        // console.log({result});
        type ISelectOption = Pick<OptionProps, "label" | "value">;
        // get  data in array format to work with label+value
        const Options = (result || []).length
            ? (result.map(selectableItem => ({
                label: selectableItem.name,
                value: selectableItem.id
            })) as ISelectOption[])
            : []
        setItemOptions(Options)
    }, [selectableItems]);


    useEffect(() => {
        if (selectedItemsArray.length === 0) return;

        const cleanedItemsArray = selectedItemsArray.map(sI => {
            return {
                id: sI.value,
                name: sI.label
            }
        })
        props.setter(cleanedItemsArray);
    }, [selectedItemsArray])

    interface IOptionType {
        label: string;
        value: string;
    };

    const handleUpdateSubmit = (e: any) => {
        setSelectedItemsArray(e);
    };


    if (!selectableItems.length) {
        return <> </>
    }

    return (
        <section className="container mb-4">
            {(props.type === 'ingredients') &&
                <Creatable
                    options={itemOptions}
                    onChange={(e: any) => handleUpdateSubmit(e)}
                    // onInputChange={(e: any) => handleUpdateSubmit(e)}
                    isMulti
                    isClearable
                    className="basic-multi-select bg-info"
                    classNamePrefix="select"
                    placeholder={`Choose ${props.placeholder}...`}
                />
            }

            {(props.type === 'flavorTags') &&
                <Select
                    options={itemOptions}
                    onChange={(e: any) => handleUpdateSubmit(e)}
                    isMulti
                    className="basic-multi-select bg-info"
                    classNamePrefix="select"
                    placeholder={`Choose ${props.placeholder}...`}
                />
            }
        </section>
    );
};

interface MultiSelectProps {
    setter: React.Dispatch<React.SetStateAction<IIngredients[]>>
    recipeId?: { id: any }
    type: 'flavorTags' | 'ingredients'
    placeholder: 'Flavor Tags' | 'Ingredients'
}

export default MultiSelect;