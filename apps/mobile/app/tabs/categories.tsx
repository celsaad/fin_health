/**
 * Categories screen
 */

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { trpc } from '../../lib/trpc';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function CategoriesScreen() {
  const { data: categories, refetch } = trpc.categories.list.useQuery();
  const utils = trpc.useUtils();

  const createCategoryMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
    },
  });

  const handleAddCategory = () => {
    Alert.prompt(
      'New Category',
      'Enter category name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name) => {
            if (name?.trim()) {
              createCategoryMutation.mutate({ name: name.trim() });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleAddSubcategory = (categoryId: string, categoryName: string) => {
    Alert.prompt(
      `New Subcategory for ${categoryName}`,
      'Enter subcategory name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: (name) => {
            if (name?.trim()) {
              // TODO: Call createSubcategory mutation
              Alert.alert('Coming Soon', 'Subcategory creation will be implemented');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (!categories) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Categories</Text>
            <Text style={styles.subtitle}>
              Organize your expenses with categories and subcategories
            </Text>
          </View>

          {categories.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first category to get started
              </Text>
            </Card>
          ) : (
            categories.map((category) => (
              <Card key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {!category.archived && (
                    <TouchableOpacity
                      onPress={() => handleAddSubcategory(category.id, category.name)}
                    >
                      <Text style={styles.addSubButton}>+ Sub</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {category.subcategories.length > 0 && (
                  <View style={styles.subcategories}>
                    {category.subcategories.map((sub) => (
                      <View key={sub.id} style={styles.subcategoryItem}>
                        <Text style={styles.subcategoryName}>• {sub.name}</Text>
                        {sub.archived && (
                          <Text style={styles.archivedBadge}>Archived</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {category.archived && (
                  <View style={styles.archivedBanner}>
                    <Text style={styles.archivedText}>Archived</Text>
                  </View>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Add Category"
          onPress={handleAddCategory}
          loading={createCategoryMutation.isPending}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  addSubButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  subcategories: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subcategoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subcategoryName: {
    fontSize: 14,
    color: '#666',
  },
  archivedBadge: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  archivedBanner: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  archivedText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
