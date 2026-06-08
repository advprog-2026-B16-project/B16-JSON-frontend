import { apiFetch } from '@/lib/api';
import { expectJson, getErrorMessage, readJson } from '@/lib/http';
import { ProductDTO, ProductRequest } from '@/types/api';

export async function getProducts() {
  const response = await apiFetch('/products', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to fetch products'));
  }

  return (await readJson<ProductDTO[]>(response)) || [];
}

export async function createProduct(payload: ProductRequest) {
  const response = await apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to create product'));
  }

  return expectJson<ProductDTO>(response, 'Failed to create product');
}

export async function updateProduct(id: string, payload: ProductRequest) {
  const response = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to update product'));
  }

  return expectJson<ProductDTO>(response, 'Failed to update product');
}

export async function deleteProduct(id: string) {
  const response = await apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to delete product'));
  }
}

export async function reduceProductStock(id: string, quantity: number) {
  const response = await apiFetch(`/products/${id}/reduce`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to reserve product stock'));
  }

  return expectJson<ProductDTO>(response, 'Failed to reserve product stock');
}
