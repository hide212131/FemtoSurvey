/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const deleteFormAndInputs = /* GraphQL */ `
  mutation DeleteFormAndInputs($formID: ID) {
    deleteFormAndInputs(formID: $formID) {
      id
    }
  }
`;
export const createSurveyForm = /* GraphQL */ `
  mutation CreateSurveyForm(
    $input: CreateSurveyFormInput!
    $condition: ModelSurveyFormConditionInput
  ) {
    createSurveyForm(input: $input, condition: $condition) {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      createdAt
      updatedAt
      results {
        nextToken
      }
    }
  }
`;
export const updateSurveyForm = /* GraphQL */ `
  mutation UpdateSurveyForm(
    $input: UpdateSurveyFormInput!
    $condition: ModelSurveyFormConditionInput
  ) {
    updateSurveyForm(input: $input, condition: $condition) {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      createdAt
      updatedAt
      results {
        nextToken
      }
    }
  }
`;
export const deleteSurveyForm = /* GraphQL */ `
  mutation DeleteSurveyForm(
    $input: DeleteSurveyFormInput!
    $condition: ModelSurveyFormConditionInput
  ) {
    deleteSurveyForm(input: $input, condition: $condition) {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      createdAt
      updatedAt
      results {
        nextToken
      }
    }
  }
`;
export const createSurveyInput = /* GraphQL */ `
  mutation CreateSurveyInput(
    $input: CreateSurveyInputInput!
    $condition: ModelSurveyInputConditionInput
  ) {
    createSurveyInput(input: $input, condition: $condition) {
      id
      formID
      createdBy
      content
      createdAt
      updatedAt
      form {
        id
        name
        description
        model
        createdBy
        inputKey
        resultKey
        createdAt
        updatedAt
      }
    }
  }
`;
export const updateSurveyInput = /* GraphQL */ `
  mutation UpdateSurveyInput(
    $input: UpdateSurveyInputInput!
    $condition: ModelSurveyInputConditionInput
  ) {
    updateSurveyInput(input: $input, condition: $condition) {
      id
      formID
      createdBy
      content
      createdAt
      updatedAt
      form {
        id
        name
        description
        model
        createdBy
        inputKey
        resultKey
        createdAt
        updatedAt
      }
    }
  }
`;
export const deleteSurveyInput = /* GraphQL */ `
  mutation DeleteSurveyInput(
    $input: DeleteSurveyInputInput!
    $condition: ModelSurveyInputConditionInput
  ) {
    deleteSurveyInput(input: $input, condition: $condition) {
      id
      formID
      createdBy
      content
      createdAt
      updatedAt
      form {
        id
        name
        description
        model
        createdBy
        inputKey
        resultKey
        createdAt
        updatedAt
      }
    }
  }
`;
