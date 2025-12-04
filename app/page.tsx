import Calculator from '@/components/Calculator';
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
  return (
    <AuthGuard>
      <main>
        <Calculator />
      </main>
    </AuthGuard>
  );
}

