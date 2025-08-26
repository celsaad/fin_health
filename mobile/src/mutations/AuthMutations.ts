import { graphql } from "react-relay";

export const LoginMutation = graphql`
  mutation AuthMutations_LoginMutation($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;

export const RegisterMutation = graphql`
  mutation AuthMutations_RegisterMutation($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        createdAt
        updatedAt
      }
    }
  }
`;
