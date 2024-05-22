import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import addressPool from "./src/routes/addressPool";
import user from "./src/routes/user";
import payment from "./src/routes/payment";
import profile from "./src/routes/profile";

const app = express();
const PORT = Bun.env.PORT || 3000;

app
  // middlewares
  .use(express.json())
  .use(cookieParser())
  .use(cors({ credentials: true, origin: Bun.env.CLIENT_HOST }))

  // routes
  .use("/addressPool", addressPool)
  .use("/user", user)
  .use("/payment", payment)
  .use("/profile", profile);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
