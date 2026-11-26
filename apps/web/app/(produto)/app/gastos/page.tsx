import { Expenses } from "../../../../components/expenses";
import { periods, type Period } from "@noke/domain";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;
  return (
    <Expenses
      report
      initial={periods.find((value) => value === periodo) as Period | undefined}
    />
  );
}
