import { Expenses } from "../../../../components/expenses";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  return (
    <Expenses initial="day" newExpense={(await searchParams).novo === "1"} />
  );
}
