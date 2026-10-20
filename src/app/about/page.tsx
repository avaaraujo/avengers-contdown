import { InfoPageView, infoMetadata } from '@/components/InfoPage';
import { infoPage } from '@/lib/pages';

const page = infoPage('about')!;

export const metadata = infoMetadata(page);

export default function Page() {
  return <InfoPageView page={page} />;
}
