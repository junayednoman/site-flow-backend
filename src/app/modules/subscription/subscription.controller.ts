import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import subscriptionServices from "./subscription.service";

const getAllSubscriptions = handleAsyncRequest(async (req, res) => {
  const query = req.query;
  const result = await subscriptionServices.getAllSubscriptions(query);
  successResponse(res, {
    message: "Subscriptions retrieved successfully!",
    data: result
  });
});

const getSingleSubscription = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await subscriptionServices.getSingleSubscription(id);
  successResponse(res, {
    message: "Subscription retrieved successfully!",
    data: result
  });
});

const getMySubscription = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const result = await subscriptionServices.getMySubscription(id);
  successResponse(res, {
    message: "Subscription retrieved successfully!",
    data: result
  });
});


const subscriptionControllers = {
  getAllSubscriptions,
  getSingleSubscription,
  getMySubscription
};

export default subscriptionControllers;