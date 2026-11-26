import { Results, type Query } from "../../../../components/shopping";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  return <Results query={await searchParams} />;
}
