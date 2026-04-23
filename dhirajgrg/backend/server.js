import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const PORT = process.env.PORT || 3001;

const initServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error.message);
    process.exit(1)
  }
};
initServer();
