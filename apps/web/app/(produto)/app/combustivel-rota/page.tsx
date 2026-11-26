import { FuelRoute, type Query } from "../../../../components/shopping";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  return <FuelRoute query={await searchParams} />;
}
