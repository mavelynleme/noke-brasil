import { SearchPrices } from "../../../../components/shopping";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ oferta?: string; lista?: string }>;
}) {
  const query = await searchParams;
  return <SearchPrices newOffer={query.oferta === "1"} listId={query.lista} />;
}
