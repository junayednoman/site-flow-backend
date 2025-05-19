import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { Server as HttpServer } from "http";
import Admin from "./app/modules/admin/admin.model";
import bcrypt from "bcrypt";
import Auth from "./app/modules/auth/auth.model";
import initializeSocketIO from "./socket";

let server: HttpServer;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    server = app.listen(Number(config.port), config.ip as string, () => {
      console.log(`🏗️ Site flow server is running on port: ${config.port}`);
    });

    const socketServer = new HttpServer();
    initializeSocketIO(socketServer);
    socketServer.listen(Number(config.socket_port), () => {
      console.log('🔌 Socket server is running on port:', config.socket_port);
    });
  } catch (error) {
    console.log("server error:", error);
  }
}

main();

// create default admin user
const createAdmin = async () => {
  const session = await mongoose.startSession();
  const email = config.admin_email;
  try {
    session.startTransaction();
    const admin = await Admin.findOne({ email });
    const auth = await Auth.findOne({
      email,
      is_deleted: false,
      is_blocked: false,
    });
    if (admin && auth) {
      return;
    }

    const adminData = {
      name: "Admin",
      email,
    };

    const password = config.admin_password!;
    const hashedPassword = await bcrypt.hash(
      password,
      Number(config.salt_rounds)
    );

    const newAdmin = await Admin.create([adminData], { session });

    const authData = {
      email,
      password: hashedPassword,
      role: "admin",
      user: newAdmin[0]?._id,
      is_account_verified: true
    }
    await Auth.create(
      [authData],
      { session }
    );



    await session.commitTransaction();
    return console.log(`Admin account created`);
  } catch (err: any) {
    await session.abortTransaction();
    console.log(err.message || "Error creating admin account");
  } finally {
    session.endSession();
  }
};

createAdmin();

process.on("unhandledRejection", () => {
  console.log(`unhandledRejection is detected, server shutting down... 😞`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`uncaughtException is detected, server shutting down... 😞`);
  process.exit();
});
