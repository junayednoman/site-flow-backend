import Stripe from "stripe";
import Auth from "../auth/auth.model";
import Payment from "../payment/payment.model";
import config from "../../config";

// Initialize the Stripe client
const stripe = new Stripe(config.stripe_secret_key as string, {
  apiVersion: "2025-02-24.acacia",
});

const getDashboardStats = async () => {
  const totalUsers = await Auth.countDocuments();
  const totalEarningData = await Payment.aggregate([
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: "$amount" }
      }
    }
  ])

  const getTotalActiveSubscriptions = async () => {
    let total = 0;
    let hasMore = true;
    let startingAfter;

    while (hasMore) {
      const res: any = await stripe.subscriptions.list({
        status: "active",
        limit: 100,
        starting_after: startingAfter,
      });

      total += res.data.length;
      hasMore = res.has_more;
      if (hasMore) {
        startingAfter = res.data[res.data.length - 1].id;
      }
    }
    return total;
  };
  const activeSubscriptions = await getTotalActiveSubscriptions();

  return { totalUsers, totalEarnings: totalEarningData[0]?.totalEarnings, activeSubscriptions };
};

const getPaymentSummary = async (year: number) => {
  const currentYear = new Date().getFullYear();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const result = await Payment.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: {
          $gte: new Date(`${year || currentYear}-01-01T00:00:00Z`),
          $lte: new Date(`${year || currentYear}-12-31T23:59:59Z`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$amount" }
      }
    },
    {
      $sort: { "_id": 1 }
    }
  ]);

  // Fill missing months with 0
  const summary = months.map((month, index) => {
    const found = result.find(r => r._id === index + 1);
    return {
      month,
      amount: found ? found.total : 0
    };
  });

  return summary;
};


const summaryService = {
  getDashboardStats,
  getPaymentSummary
};

export default summaryService;