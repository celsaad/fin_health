import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  Button,
  Header,
  Input,
  ScreenContainer,
  Section,
} from "@/components/ui";
import { useNavigationUtils } from "@/hooks/useNavigationUtils";

export default function AddAccountScreen() {
  const [accountName, setAccountName] = useState("");
  const { back } = useNavigationUtils();

  const handleAddAccount = useCallback(() => {
    console.log("Add Account", accountName);
  }, [accountName]);

  return (
    <ScreenContainer>
      <Header title="Add Account" leftIcon="xmark" onLeftPress={back} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Account Name">
          <Input
            placeholder="Account Name"
            value={accountName}
            onChangeText={setAccountName}
          />
        </Section>

        <View style={styles.buttonContainer}>
          <Button
            title="Add Account"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleAddAccount}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
  },
});
