import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { graphql, useLazyLoadQuery } from "react-relay";

import {
  ScreenContainer,
  Section,
  Header,
  Button,
  IconSymbol,
} from "../components/ui";

import { categoriesScreenQuery } from "./__generated__/categoriesScreenQuery.graphql";

export default function CategoriesScreen() {
  const router = useRouter();

  const query = useLazyLoadQuery<categoriesScreenQuery>(
    graphql`
      query categoriesScreenQuery {
        categories {
          id
          name
          icon
          color
        }
      }
    `,
    {},
  );

  const handleAddCategory = useCallback(() => {
    router.push("/add-edit-category");
  }, [router]);

  const handleEditCategory = useCallback(
    (category: any) => {
      router.push({
        pathname: "/add-edit-category",
        params: {
          category: JSON.stringify(category),
        },
      });
    },
    [router],
  );

  return (
    <ScreenContainer hasTabBar>
      <Header title="Categories" />

      {/* Categories List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Section title="Your Categories">
          {query?.categories?.length === 0 ? (
            <Text style={styles.emptyText}>
              No categories yet. Add your first category!
            </Text>
          ) : (
            <View style={styles.categoriesList}>
              {query?.categories?.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryItem}
                  onPress={() => handleEditCategory(category)}
                  activeOpacity={0.7}
                >
                  <View style={styles.categoryIcon}>
                    <IconSymbol
                      name={category.icon as any}
                      size={24}
                      color="#007AFF"
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <IconSymbol name="chevron.right" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Section>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Add Category"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleAddCategory}
          icon="plus"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 16,
    marginVertical: 20,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#e8f4fd",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
});
