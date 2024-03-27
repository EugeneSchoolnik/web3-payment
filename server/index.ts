import express from "express"
import addressPool from "./src/routes/addressPool";

const app = express()
const PORT = Bun.env.PORT || 3000

app.use("/addressPool", addressPool)

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})

