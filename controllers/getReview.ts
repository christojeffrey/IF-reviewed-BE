import { getDB, getFirebaseAuth } from "../helper";
import studentData from "../helper/studentData";
const { Timestamp } = require("firebase-admin/firestore");

export default async function getReview(req: any, res: any) {
  const authHeader = req.headers.authorization;
  const { NIM, UID } = req.params;
  // validate authHeader
  if (!authHeader) {
    res.status(401).send("Unauthorized");
    return;
  }
  const idToken = authHeader.split(" ")[1];
  const { auth } = getFirebaseAuth();
  const decodedToken = await auth.verifyIdToken(idToken);
  console.log("decodedToken", decodedToken);
  if (decodedToken.uid !== UID) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { db } = getDB();
  const reviewRef = db
    .collection("users")
    .doc(NIM)
    .collection("reviews")
    .doc(UID);
  const review = await reviewRef.get();
  if (!review.exists) {``
    res.json({ error: "review doesn't exist" }).status(404);
  } else {
    const data = review.data();
    data["name"] = studentData.get(NIM);
    res.json({ data });
  }
}
