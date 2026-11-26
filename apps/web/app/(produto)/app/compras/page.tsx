import { Shopping } from "../../../../components/shopping";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string; lista?: string }>;
}) {
  const query = await searchParams;
  return <Shopping newItem={query.novo === "1"} />;
}
