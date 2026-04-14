import HomeBuilderPreviewClient from './HomeBuilderPreviewClient';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function HomeBuilderPreviewPage() {
  return <HomeBuilderPreviewClient />;
}
