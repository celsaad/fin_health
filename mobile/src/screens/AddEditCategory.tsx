import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { useMutation } from "react-relay";

import {
  ScreenContainer,
  Section,
  Header,
  Button,
  Input,
  IconPicker,
} from "../components/ui";
import { useNavigationUtils } from "../hooks/useNavigationUtils";
import {
  CreateCategoryMutation,
  UpdateCategoryMutation,
  DeleteCategoryMutation,
} from "../mutations/DataMutations";

export default function AddEditCategoryScreen() {
  const { back } = useNavigationUtils();
  const { category: categoryParam } = useLocalSearchParams<{
    category: string;
  }>();
  const category = categoryParam ? JSON.parse(categoryParam) : null;

  const isEditing = !!category;

  const [categoryName, setCategoryName] = useState(category?.name || "");
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(
    category?.icon || undefined,
  );

  const [commitCreateMutation] = useMutation(CreateCategoryMutation);
  const [commitUpdateMutation] = useMutation(UpdateCategoryMutation);
  const [commitDeleteMutation] = useMutation(DeleteCategoryMutation);

  const handleSave = useCallback(() => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    if (isEditing && category) {
      // Update existing category
      commitUpdateMutation({
        variables: {
          id: category.id,
          input: {
            name: categoryName.trim(),
            icon: selectedIcon || "star.fill",
            color: "#007AFF",
          },
        },
        onCompleted: () => {
          Alert.alert("Success", "Category updated successfully!", [
            {
              text: "OK",
              onPress: () => back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
        updater: (store) => {
          // Invalidate the categories query to force a refetch
          const root = store.getRoot();
          root.invalidateRecord();
        },
      });
    } else {
      // Create new category
      commitCreateMutation({
        variables: {
          input: {
            name: categoryName.trim(),
            icon: selectedIcon || "star.fill",
            color: "#007AFF",
          },
        },
        onCompleted: () => {
          Alert.alert("Success", "Category added successfully!", [
            {
              text: "OK",
              onPress: () => back(),
            },
          ]);
        },
        onError: (error) => {
          Alert.alert("Error", error.message);
        },
        updater: (store) => {
          // Invalidate the categories query to force a refetch
          const root = store.getRoot();
          root.invalidateRecord();
        },
      });
    }
  }, [
    categoryName,
    selectedIcon,
    isEditing,
    category,
    commitCreateMutation,
    commitUpdateMutation,
    back,
  ]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Category",
      "Are you sure you want to delete this category?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            commitDeleteMutation({
              variables: {
                id: category.id,
              },
              onCompleted: () => {
                Alert.alert("Success", "Category deleted successfully!", [
                  { text: "OK", onPress: () => back() },
                ]);
              },
            });
          },
        },
      ],
    );
  }, [category?.id, back, commitDeleteMutation]);

  return (
    <ScreenContainer bottomPadding={50}>
      <Header
        title={isEditing ? "Edit Category" : "Add Category"}
        leftIcon="xmark"
        onLeftPress={back}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Category Details">
          <Input
            placeholder="Category name"
            value={categoryName}
            onChangeText={setCategoryName}
            containerStyle={styles.input}
          />

          <IconPicker
            selectedIcon={selectedIcon}
            onIconSelect={setSelectedIcon}
            title="Choose an icon"
          />
        </Section>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? "Update Category" : "Add Category"}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSave}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Delete Category"
          variant="secondary"
          size="large"
          fullWidth
          onPress={handleDelete}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});
