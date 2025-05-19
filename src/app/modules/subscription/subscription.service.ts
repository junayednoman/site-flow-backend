import QueryBuilder from "../../classes/queryBuilder";
import Subscription from "./subscription.model";

const getAllSubscriptions = async (query: Record<string, any>) => {
  const searchableFields = [
    "name",
    "email"
  ];
  const userQuery = new QueryBuilder(
    Subscription.find(),
    query
  )
    .search(searchableFields)
    .filter()
    .sort()
    .paginate()
    .selectFields();

  const meta = await userQuery.countTotal();
  const result = await userQuery.queryModel.populate("user", "name email").populate("plan", "name");
  return { data: result, meta };
};

const getSingleSubscription = async (id: string) => {
  const result = await Subscription.findById(id).populate("user", "name email").populate("plan", "name");
  return result;
};

const getMySubscription = async (id: string) => {
  const result = await Subscription.findOne({ user: id, status: "active" });
  return result;
};

const subscriptionServices = {
  getAllSubscriptions,
  getSingleSubscription,
  getMySubscription
};

export default subscriptionServices;