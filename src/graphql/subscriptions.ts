/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateSurveyForm = /* GraphQL */ `
  subscription OnCreateSurveyForm {
    onCreateSurveyForm {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      results {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSurveyForm = /* GraphQL */ `
  subscription OnUpdateSurveyForm {
    onUpdateSurveyForm {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      results {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSurveyForm = /* GraphQL */ `
  subscription OnDeleteSurveyForm {
    onDeleteSurveyForm {
      id
      name
      description
      model
      createdBy
      inputKey
      resultKey
      results {
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateSurveyInput = /* GraphQL */ `
  subscription OnCreateSurveyInput {
    onCreateSurveyInput {
      id
      formID
      createdBy
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
      content
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateSurveyInput = /* GraphQL */ `
  subscription OnUpdateSurveyInput {
    onUpdateSurveyInput {
      id
      formID
      createdBy
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
      content
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteSurveyInput = /* GraphQL */ `
  subscription OnDeleteSurveyInput {
    onDeleteSurveyInput {
      id
      formID
      createdBy
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
      content
      createdAt
      updatedAt
    }
  }
`;
