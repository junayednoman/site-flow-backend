import { Router } from "express";
import authVerify from "../../middlewares/authVerify";
import messageControllers from "./message.controller";

const messageRouters = Router();

messageRouters.get("/:chatId", authVerify(["user"]), messageControllers.getMessages);
messageRouters.put("/:id", authVerify(["user"]), messageControllers.updateMessage);
messageRouters.delete("/:id", authVerify(["user"]), messageControllers.deleteMessage);

export default messageRouters;