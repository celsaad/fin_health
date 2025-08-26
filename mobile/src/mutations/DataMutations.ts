import { graphql } from "react-relay";

export const CreateAccountMutation = graphql`
  mutation DataMutations_CreateAccountMutation($input: CreateAccountInput!) {
    createAccount(input: $input) {
      name
      type
      icon
    }
  }
`;

export const CreateTransactionMutation = graphql`
  mutation DataMutations_CreateTransactionMutation(
    $input: CreateTransactionInput!
  ) {
    createTransaction(input: $input) {
      id
      name
      amount
      date
      notes
      hasNote
      icon
      color
      account {
        id
        name
        type
      }
      category {
        id
        name
        icon
        color
      }
      subcategory {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

export const CreateCategoryMutation = graphql`
  mutation DataMutations_CreateCategoryMutation($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      icon
      color
      subcategories {
        id
        name
      }
    }
  }
`;
