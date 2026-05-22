import { Suspense } from 'react';
import RefundClient from './RefundClient';

export default function RefundPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefundClient />
    </Suspense>
  );
}
