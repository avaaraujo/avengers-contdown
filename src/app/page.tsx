import type { Metadata } from 'next';
import { getCatalog } from '@/lib/catalog';
import { CountdownApp } from '@/components/CountdownApp';
import { HomeContent } from '@/components/HomeContent';
import { JsonLd } from '@/components/JsonLd';
import { homeLd } from '@/lib/structured';

// the home names the product and the goal, so a search for "Avengers Countdown" lands on the right page
export const metadata: Metadata = {
  title: { absolute: 'Avengers Countdown: maratona do MCU em ordem cronológica até Vingadores: Doutor Destino' },
  alternates: { canonical: '/' },
};

export default async function Home() {
  const catalog = await getCatalog();
  return (
    <>
      <JsonLd data={homeLd(catalog)} />
      <CountdownApp catalog={catalog} />
      <HomeContent catalog={catalog} />
    </>
  );
}
