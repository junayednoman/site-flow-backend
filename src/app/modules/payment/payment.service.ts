import Payment from "./payment.model";
import QueryBuilder from "../../classes/queryBuilder";

const getAllPayments = async (query: Record<string, any>) => {
  const { startDate, endDate, ...restQuery } = query;
  const reportQuery = {} as any;
  if (startDate && endDate) {
    reportQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    }
  }
  const searchableFields = [
    "amount",
    "purpose",
    "status",
    "transaction_id"
  ];
  const userQuery = new QueryBuilder(
    Payment.find(reportQuery),
    restQuery
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel.populate("user", "name email image");
  return { data: result, meta };
};

const getSinglePayment = async (id: string) => {
  const result = await Payment.findOne({ _id: id }).populate("user", "name email image");
  return result;
}

export const paymentServices = {
  getAllPayments,
  getSinglePayment,
}