import Footer from '../../../components/layout/Footer';
import { createFooterConfig, FooterConfig } from '@shared/types/footer.types';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

type FooterPreviewPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const parseConfigParam = (value?: string | string[]): FooterConfig | null => {
  if (!value) return null;
  const param = Array.isArray(value) ? value[0] : value;
  if (!param) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(param);
    const parsed = JSON.parse(decoded);
    return createFooterConfig(parsed);
  } catch (error) {
    console.warn('[FooterPreview] Failed to parse config param', error);
    return null;
  }
};

export default function FooterPreviewPage({ searchParams }: FooterPreviewPageProps) {
  const configOverride = parseConfigParam(searchParams?.config || undefined);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="flex-1 flex items-center justify-center border-b border-gray-200 bg-white">
        <div className="text-sm text-gray-500">
          Previewing storefront footer
        </div>
      </div>
      <Footer configOverride={configOverride} />
    </div>
  );
}
