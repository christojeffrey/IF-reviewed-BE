import { getDB } from "../helper";
const { Timestamp } = require("firebase-admin/firestore");

export default async function postFormNIM(req: any, res: any) {
  // setup
  const NIM = req.body.NIM;
  const reviewerID = req.body.reviewerID;
  let review: any = {
    comStyle: req.body.comStyle,
    rating: req.body.rating,
    timeStamp: Timestamp.now().toDate().toString(),
  };
  console.log(NIM, reviewerID, review);
  // at this point, the data is valid
  const { db } = getDB();
  const reviewRef = db
    .collection("users")
    .doc(NIM)
    .collection("reviews")
    .doc(reviewerID);

  const respond = await reviewRef.update(review, { merge: true });

  res.send(respond);
}
