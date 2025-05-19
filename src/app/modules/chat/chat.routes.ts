import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import chatControllers from "./chat.controller";
import { handleZodValidation } from "../../middlewares/handleZodValidation";
import { chatValidationSchema } from "./chat.validation";

const chatRouters = Router();

chatRouters.post("/", authVerify(["user"]), handleZodValidation(chatValidationSchema), chatControllers.createChat);
chatRouters.get("/", authVerify(["user"]), chatControllers.getChats);
chatRouters.delete("/:id", authVerify(["user"]), chatControllers.deleteChat);

export default chatRouters;