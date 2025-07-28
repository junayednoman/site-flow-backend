import Payment from "./payment.model";
import AggregationBuilder from "../../classes/AggregationBuilder";

const getAllPayments = async (query: Record<string, any>) => {
  // Helper to build $match for search
  const buildSearchMatch = (term: string, baseFields: string[]) => {
    if (!term) return {};
    return {
      $or: [
        ...baseFields.map(f => ({ [f]: { $regex: term, $options: "i" } })),
        { "companyAdmin.company_name": { $regex: term, $options: "i" } },
        { "companyAdmin.email": { $regex: term, $options: "i" } },
      ]
    };
  };

  const searchableFields = ["amount", "transaction_id"];
  const builder = new AggregationBuilder(Payment, [], query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const pipeline = [
    ...builder["pipeline"],

    // Join with Auth
    {
      $lookup: {
        from: "auths",
        localField: "user",
        foreignField: "_id",
        as: "authData"
      }
    },
    { $unwind: "$authData" },

    // Join with CompanyAdmin
    {
      $lookup: {
        from: "companyadmins", // collection name
        localField: "authData.user",
        foreignField: "_id",
        as: "companyAdmin"
      }
    },
    { $unwind: "$companyAdmin" },

    // Apply search term if exists
    {
      $match: buildSearchMatch(query.searchTerm, searchableFields)
    },

    // Only keep necessary fields
    {
      $project: {
        amount: 1,
        transaction_id: 1,
        createdAt: 1,
        status: 1,
        "authData.user_type": 1,
        "companyAdmin.name": 1,
        "companyAdmin.email": 1,
        "companyAdmin.image": 1,
        "companyAdmin.company_name": 1,
      }
    }
  ];

  const builderTotal = await builder.countTotal();
  const data = await Payment.aggregate(pipeline);

  return { data, meta: { total: builderTotal.total } }
};

const getSinglePayment = async (id: string) => {
  const result = await Payment.findOne({ _id: id }).populate("user", "name email image");
  return result;
}

export const paymentServices = {
  getAllPayments,
  getSinglePayment,
}