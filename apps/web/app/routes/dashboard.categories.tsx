/**
 * Categories management route
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation } from '@remix-run/react';
import { requireAuth } from '~/lib/auth.server';
import { createTRPCClient } from '~/lib/trpc.server';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';

export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const categories = await trpc.categories.list.query();

  return json({ categories });
}

export async function action({ request }: ActionFunctionArgs) {
  const { token } = await requireAuth(request);
  const trpc = createTRPCClient(token);

  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'create-category') {
    const name = formData.get('name');

    if (!name) {
      return json({ error: 'Category name is required' }, { status: 400 });
    }

    await trpc.categories.create.mutate({ name: name.toString() });

    return json({ success: true });
  }

  if (intent === 'create-subcategory') {
    const categoryId = formData.get('categoryId');
    const name = formData.get('name');

    if (!categoryId || !name) {
      return json({ error: 'Category and name are required' }, { status: 400 });
    }

    await trpc.categories.createSubcategory.mutate({
      categoryId: categoryId.toString(),
      name: name.toString(),
    });

    return json({ success: true });
  }

  if (intent === 'archive-category') {
    const categoryId = formData.get('categoryId');

    if (!categoryId) {
      return json({ error: 'Category ID is required' }, { status: 400 });
    }

    await trpc.categories.update.mutate({
      id: categoryId.toString(),
      archived: true,
    });

    return json({ success: true });
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function Categories() {
  const { categories } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            Organize your expenses with categories and subcategories
          </p>
        </div>
      </div>

      {/* Create Category Form */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
        <Form method="post" className="flex gap-4">
          <input type="hidden" name="intent" value="create-category" />
          <div className="flex-1">
            <Input name="name" placeholder="Category name" required />
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            Create
          </Button>
        </Form>
      </Card>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">No categories yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Create your first category to get started
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category.id}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                {!category.archived && (
                  <Form method="post">
                    <input type="hidden" name="intent" value="archive-category" />
                    <input type="hidden" name="categoryId" value={category.id} />
                    <Button type="submit" variant="outline" size="sm">
                      Archive
                    </Button>
                  </Form>
                )}
              </div>

              {/* Subcategories */}
              {category.subcategories.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Subcategories</h4>
                  <div className="space-y-2">
                    {category.subcategories.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">• {sub.name}</span>
                        {sub.archived && (
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                            Archived
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Subcategory Form */}
              {!category.archived && (
                <Form method="post" className="flex gap-2">
                  <input type="hidden" name="intent" value="create-subcategory" />
                  <input type="hidden" name="categoryId" value={category.id} />
                  <div className="flex-1">
                    <Input
                      name="name"
                      placeholder="Add subcategory"
                    />
                  </div>
                  <Button type="submit" size="sm" isLoading={isSubmitting}>
                    Add
                  </Button>
                </Form>
              )}

              {category.archived && (
                <div className="text-sm text-gray-500 italic">Archived</div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
