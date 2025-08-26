import { useCallback } from "react";
import { graphql, useFragment } from "react-relay";

import { AccountDropdownFragment$key } from "./__generated__/AccountDropdownFragment.graphql";
import { Dropdown, DropdownItem } from "./ui";

interface AccountDropdownProps {
  queryRef: AccountDropdownFragment$key;
  selectedAccountId?: string;
  onAccountSelect?: (accountId: string) => void;
  placeholder?: string;
}

export function AccountDropdown({
  queryRef,
  selectedAccountId,
  onAccountSelect,
  placeholder = "Select an account",
}: AccountDropdownProps) {
  const query = useFragment<AccountDropdownFragment$key>(
    graphql`
      fragment AccountDropdownFragment on Query {
        accounts {
          id
          name
        }
      }
    `,
    queryRef,
  );

  const dropdownItems: DropdownItem[] =
    query?.accounts?.map((account) => ({
      id: account.id,
      label: account.name,
      value: account.id,
    })) || [];

  const handleSelect = useCallback(
    (item: DropdownItem) => {
      onAccountSelect?.(item.value);
    },
    [onAccountSelect],
  );

  return (
    <Dropdown
      items={dropdownItems}
      selectedValue={selectedAccountId}
      onSelect={handleSelect}
      placeholder={placeholder}
    />
  );
}
