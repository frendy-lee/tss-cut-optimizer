import CutlistOptimizer from '@/components/CutlistOptimizer';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Cutlist Optimizer for Carpentry</h1>
      <CutlistOptimizer />
    </main>
  );
}