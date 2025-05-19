import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { paymentServices } from "./payment.service";

const createSessionForSubscription = handleAsyncRequest(async (req: any, res) => {
  const planId = req.query.planId;
  const email = req.user?.email;
  const currentUserId = req.user?._id;

  const result = await paymentServices.createSessionForSubscription(planId, email, currentUserId);
  successResponse(res, {
    message: "Checkout session created for subscription payment!",
    data: result,
    status: 201
  });
});

const verifySubscriptionPayment = handleAsyncRequest(async (req, res) => {
  const query = req.query;
  const result = await paymentServices.verifySubscriptionPayment(query);
  successResponse(res, {
    message: "Payment session verified successfully!",
    data: result
  });
});

const getAllPayments = handleAsyncRequest(async (req, res) => {
  const query = req.query
  const result = await paymentServices.getAllPayments(query);
  successResponse(res, {
    message: "Payments retrieved successfully!",
    data: result
  });
});

const getSinglePayment = handleAsyncRequest(async (req, res) => {
  const id = req.params.id
  const result = await paymentServices.getSinglePayment(id);
  successResponse(res, {
    message: "Payment retrieved successfully!",
    data: result
  });
});

const paymentControllers = {
  getAllPayments,
  getSinglePayment,
  createSessionForSubscription,
  verifySubscriptionPayment
};

export default paymentControllers;