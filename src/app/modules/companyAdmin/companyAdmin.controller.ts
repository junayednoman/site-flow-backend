import handleAsyncRequest from "../../utils/handleAsyncRequest";
import { successResponse } from "../../utils/successResponse";
import { companyAdminServices } from "./companyAdmin.service";

const getCompanyAdminProfile = handleAsyncRequest(async (req: any, res) => {
  const id = req.user.id;
  const result = await companyAdminServices.getCompanyAdminProfile(id);
  successResponse(res, {
    message: "User profile retrieved successfully!",
    data: result,
  });
});

const getAllCompanyAdmins = handleAsyncRequest(async (req: any, res) => {
  const result = await companyAdminServices.getAllCompanyAdmins(req.query);
  successResponse(res, {
    message: "Users retrieved successfully!",
    data: result,
  });
});

const getSingleCompanyAdmin = handleAsyncRequest(async (req, res) => {
  const id = req.params.id;
  const result = await companyAdminServices.getSingleCompanyAdmin(id);
  successResponse(res, {
    message: "Users retrieved successfully!",
    data: result,
  });
});

const updateCompanyAdminProfile = handleAsyncRequest(async (req: any, res) => {
  const email = req.user.email;
  let image = null;
  let logo = null;
  const files: any = req.files;

  if (files.image) image = files.image[0]?.location;
  if (files.logo) logo = files.logo[0]?.location;
  const payload = JSON.parse(req?.body?.payload);
  payload.image = image;
  payload.logo = logo;
  const result = await companyAdminServices.updateCompanyAdminProfile(email, payload);
  successResponse(res, {
    message: "User profile updated successfully!",
    data: result,
  });
});

const companyAdminController = {
  getCompanyAdminProfile,
  getAllCompanyAdmins,
  getSingleCompanyAdmin,
  updateCompanyAdminProfile,
};

export default companyAdminController;