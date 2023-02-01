import { getDB } from "../helper";
const { Timestamp } = require("firebase-admin/firestore");

export default async function postFormNIM(req: any, res: any) {
  // setup
  const NIM = "13520055";
  const reviewerID = "test11ing";
  let review: any = {
    comStyle: 1,
    rating: 3,
    timeStamp: Timestamp.now().toDate().toString(),
  };

  // at this point, the data is valid
  const { db } = getDB();
  const reviewRef = db.collection("users").doc(NIM).collection("reviews").doc(reviewerID);

  const respond = await reviewRef.update(review, { merge: true });

  res.send(respond);
}
