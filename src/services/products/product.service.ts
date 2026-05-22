import { apiFetch } from '@/lib/api';
import { ProductDTO, ProductRequest } from '@/types/api';

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = await readJson<{ detail?: string; message?: string; title?: string }>(response).catch(() => null);
  return data?.detail || data?.message || data?.title || fallback;
}

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

  const data = await readJson<ProductDTO>(response);
  if (!data) throw new Error('Product response was empty');
  return data;
}

export async function updateProduct(id: string, payload: ProductRequest) {
  const response = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, 'Failed to update product'));
  }

  const data = await readJson<ProductDTO>(response);
  if (!data) throw new Error('Product response was empty');
  return data;
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

  const data = await readJson<ProductDTO>(response);
  if (!data) throw new Error('Stock response was empty');
  return data;
}
