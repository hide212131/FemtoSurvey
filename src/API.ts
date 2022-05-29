/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type DeleteFormAndInputsResponse = {
  __typename: "DeleteFormAndInputsResponse",
  id: string,
};

export type CreateSurveyFormInput = {
  id?: string | null,
  name: string,
  description?: string | null,
  model: string,
  createdBy: string,
  inputKey: string,
  resultKey: string,
};

export type ModelSurveyFormConditionInput = {
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  model?: ModelStringInput | null,
  createdBy?: ModelStringInput | null,
  inputKey?: ModelStringInput | null,
  resultKey?: ModelStringInput | null,
  and?: Array< ModelSurveyFormConditionInput | null > | null,
  or?: Array< ModelSurveyFormConditionInput | null > | null,
  not?: ModelSurveyFormConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type SurveyForm = {
  __typename: "SurveyForm",
  id: string,
  name: string,
  description?: string | null,
  model: string,
  createdBy: string,
  inputKey: string,
  resultKey: string,
  createdAt: string,
  updatedAt: string,
  results?: ModelSurveyInputConnection | null,
};

export type ModelSurveyInputConnection = {
  __typename: "ModelSurveyInputConnection",
  items:  Array<SurveyInput | null >,
  nextToken?: string | null,
};

export type SurveyInput = {
  __typename: "SurveyInput",
  id: string,
  formID: string,
  createdBy: string,
  content: string,
  createdAt: string,
  updatedAt: string,
  form?: SurveyForm | null,
};

export type UpdateSurveyFormInput = {
  id: string,
  name?: string | null,
  description?: string | null,
  model?: string | null,
  createdBy?: string | null,
  inputKey?: string | null,
  resultKey?: string | null,
};

export type DeleteSurveyFormInput = {
  id: string,
};

export type CreateSurveyInputInput = {
  id?: string | null,
  formID: string,
  createdBy: string,
  content: string,
};

export type ModelSurveyInputConditionInput = {
  formID?: ModelIDInput | null,
  createdBy?: ModelStringInput | null,
  content?: ModelStringInput | null,
  and?: Array< ModelSurveyInputConditionInput | null > | null,
  or?: Array< ModelSurveyInputConditionInput | null > | null,
  not?: ModelSurveyInputConditionInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type UpdateSurveyInputInput = {
  id: string,
  formID?: string | null,
  createdBy?: string | null,
  content?: string | null,
};

export type DeleteSurveyInputInput = {
  id: string,
};

export type ModelSurveyFormFilterInput = {
  id?: ModelIDInput | null,
  name?: ModelStringInput | null,
  description?: ModelStringInput | null,
  model?: ModelStringInput | null,
  createdBy?: ModelStringInput | null,
  inputKey?: ModelStringInput | null,
  resultKey?: ModelStringInput | null,
  and?: Array< ModelSurveyFormFilterInput | null > | null,
  or?: Array< ModelSurveyFormFilterInput | null > | null,
  not?: ModelSurveyFormFilterInput | null,
};

export type ModelSurveyFormConnection = {
  __typename: "ModelSurveyFormConnection",
  items:  Array<SurveyForm | null >,
  nextToken?: string | null,
};

export type ModelSurveyInputFilterInput = {
  id?: ModelIDInput | null,
  formID?: ModelIDInput | null,
  createdBy?: ModelStringInput | null,
  content?: ModelStringInput | null,
  and?: Array< ModelSurveyInputFilterInput | null > | null,
  or?: Array< ModelSurveyInputFilterInput | null > | null,
  not?: ModelSurveyInputFilterInput | null,
};

export type DeleteFormAndInputsMutationVariables = {
  formID?: string | null,
};

export type DeleteFormAndInputsMutation = {
  deleteFormAndInputs?:  {
    __typename: "DeleteFormAndInputsResponse",
    id: string,
  } | null,
};

export type CreateSurveyFormMutationVariables = {
  input: CreateSurveyFormInput,
  condition?: ModelSurveyFormConditionInput | null,
};

export type CreateSurveyFormMutation = {
  createSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type UpdateSurveyFormMutationVariables = {
  input: UpdateSurveyFormInput,
  condition?: ModelSurveyFormConditionInput | null,
};

export type UpdateSurveyFormMutation = {
  updateSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type DeleteSurveyFormMutationVariables = {
  input: DeleteSurveyFormInput,
  condition?: ModelSurveyFormConditionInput | null,
};

export type DeleteSurveyFormMutation = {
  deleteSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type CreateSurveyInputMutationVariables = {
  input: CreateSurveyInputInput,
  condition?: ModelSurveyInputConditionInput | null,
};

export type CreateSurveyInputMutation = {
  createSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type UpdateSurveyInputMutationVariables = {
  input: UpdateSurveyInputInput,
  condition?: ModelSurveyInputConditionInput | null,
};

export type UpdateSurveyInputMutation = {
  updateSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type DeleteSurveyInputMutationVariables = {
  input: DeleteSurveyInputInput,
  condition?: ModelSurveyInputConditionInput | null,
};

export type DeleteSurveyInputMutation = {
  deleteSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type GetSurveyFormQueryVariables = {
  id: string,
};

export type GetSurveyFormQuery = {
  getSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type ListSurveyFormsQueryVariables = {
  filter?: ModelSurveyFormFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSurveyFormsQuery = {
  listSurveyForms?:  {
    __typename: "ModelSurveyFormConnection",
    items:  Array< {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetSurveyInputQueryVariables = {
  id: string,
};

export type GetSurveyInputQuery = {
  getSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type ListSurveyInputsQueryVariables = {
  filter?: ModelSurveyInputFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSurveyInputsQuery = {
  listSurveyInputs?:  {
    __typename: "ModelSurveyInputConnection",
    items:  Array< {
      __typename: "SurveyInput",
      id: string,
      formID: string,
      createdBy: string,
      content: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateSurveyFormSubscription = {
  onCreateSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnUpdateSurveyFormSubscription = {
  onUpdateSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnDeleteSurveyFormSubscription = {
  onDeleteSurveyForm?:  {
    __typename: "SurveyForm",
    id: string,
    name: string,
    description?: string | null,
    model: string,
    createdBy: string,
    inputKey: string,
    resultKey: string,
    createdAt: string,
    updatedAt: string,
    results?:  {
      __typename: "ModelSurveyInputConnection",
      nextToken?: string | null,
    } | null,
  } | null,
};

export type OnCreateSurveyInputSubscription = {
  onCreateSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type OnUpdateSurveyInputSubscription = {
  onUpdateSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};

export type OnDeleteSurveyInputSubscription = {
  onDeleteSurveyInput?:  {
    __typename: "SurveyInput",
    id: string,
    formID: string,
    createdBy: string,
    content: string,
    createdAt: string,
    updatedAt: string,
    form?:  {
      __typename: "SurveyForm",
      id: string,
      name: string,
      description?: string | null,
      model: string,
      createdBy: string,
      inputKey: string,
      resultKey: string,
      createdAt: string,
      updatedAt: string,
    } | null,
  } | null,
};
