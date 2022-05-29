/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getSurveyForm = /* GraphQL */ `
  query GetSurveyForm($id: ID!) {
    getSurveyForm(id: $id) {
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
export const listSurveyForms = /* GraphQL */ `
  query ListSurveyForms(
    $filter: ModelSurveyFormFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSurveyForms(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getSurveyInput = /* GraphQL */ `
  query GetSurveyInput($id: ID!) {
    getSurveyInput(id: $id) {
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
export const listSurveyInputs = /* GraphQL */ `
  query ListSurveyInputs(
    $filter: ModelSurveyInputFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSurveyInputs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        formID
        createdBy
        content
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
