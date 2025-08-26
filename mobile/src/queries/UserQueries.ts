import { graphql } from "react-relay";

export const UserMeQuery = graphql`
  query UserQueries_MeQuery {
    me {
      id
      email
      name
      createdAt
      updatedAt
    }
  }
`;

export const UserAccountsQuery = graphql`
  query UserQueries_AccountsQuery {
    accounts {
      id
      name
      type
      balance
      icon
      createdAt
      updatedAt
    }
  }
`;

export const UserCategoriesQuery = graphql`
  query UserQueries_CategoriesQuery {
    categories {
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

export const UserTransactionsQuery = graphql`
  query UserQueries_TransactionsQuery(
    $filter: TransactionFilter
    $limit: Int
    $offset: Int
  ) {
    transactions(filter: $filter, limit: $limit, offset: $offset) {
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

export const UserFinancialMetricsQuery = graphql`
  query UserQueries_FinancialMetricsQuery($year: Int!, $month: Int!) {
    netWorth
    monthlySpending(year: $year, month: $month)
    savingsRate(year: $year, month: $month)
    debtToIncomeRatio
  }
`;
