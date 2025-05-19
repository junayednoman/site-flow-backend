import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { adminServices } from "./admin.service";

const getAdminProfile = handleAsyncRequest(async (req: any, res) => {
  const email = req.user.email
  const result = await adminServices.getAdminProfile(email);
  successResponse(res, {
    message: "Profile retrieved successfully!",
    data: result,
  });
});

const updateAdmin = handleAsyncRequest(async (req: any, res) => {
  const payload = req.body;
  const email = req.user.email;
  const result = await adminServices.updateAdmin(email, payload);
  successResponse(res, {
    message: "Profile updated successfully!",
    data: result,
  });
});

const updateAdminImage = handleAsyncRequest(async (req: any, res) => {
  const image = req.file?.location;
  const email = req.user.email;
  const result = await adminServices.updateAdminImage(email, image);
  successResponse(res, {
    message: "Profile image updated successfully!",
    data: result,
  });
});

const adminControllers = {
  updateAdmin,
  getAdminProfile,
  updateAdminImage
};

export default adminControllers;
