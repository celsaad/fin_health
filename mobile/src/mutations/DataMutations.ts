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
      accountId
      categoryId
      subcategory {
        id
        name
        categoryId
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
    }
  }
`;

export const UpdateCategoryMutation = graphql`
  mutation DataMutations_UpdateCategoryMutation(
    $id: ID!
    $input: UpdateCategoryInput!
  ) {
    updateCategory(id: $id, input: $input) {
      id
      name
      icon
      color
    }
  }
`;

export const DeleteCategoryMutation = graphql`
  mutation DataMutations_DeleteCategoryMutation($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const CreateTransferMutation = graphql`
  mutation DataMutations_CreateTransferMutation($input: CreateTransferInput!) {
    createTransfer(input: $input) {
      id
      name
      amount
      date
      notes
      hasNote
      accountId
      categoryId
      createdAt
      updatedAt
    }
  }
`;
