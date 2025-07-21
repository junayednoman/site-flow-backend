import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { paymentServices } from "./payment.service";

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
  getSinglePayment
};

export default paymentControllers;