import { getCatalog } from '@/lib/catalog';
import { CountdownApp } from '@/components/CountdownApp';

export default async function Home() {
  const catalog = await getCatalog();
  return <CountdownApp catalog={catalog} />;
}
