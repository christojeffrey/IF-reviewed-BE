import { getDB } from "../helper";
const { Timestamp } = require("firebase-admin/firestore");

export default async function postFormNIM(req: any, res: any) {
  // setup
  const NIM = req.body.NIM;
  const reviewerID = req.body.reviewerID;
  let NewReview: any = {
    comStyle: req.body.comStyle,
    rating: req.body.rating,
    timeStamp: Timestamp.now().toDate().toString(),
  };
  console.log(NIM, reviewerID, NewReview);

  // at this point, the data is valid
  const { db } = getDB();
  const reviewRef = db.collection("users").doc(NIM).collection("reviews").doc(reviewerID);

  // add the review
  reviewRef.set(NewReview, { merge: true });

  // update the review summary field
  const reviewSummaryRef = db.collection("users").doc(NIM);
  const reviewSummarySnapshot = await reviewSummaryRef.get();
  const reviewsSnapshot = await reviewSummarySnapshot.ref.collection("reviews").get();

  const reviewSummary = reviewSummarySnapshot.data();
  const reviews = reviewsSnapshot.docs.map((doc: any) => doc.data());

  console.log("reviewSummary", reviewSummary);
  console.log("reviews", reviews);
  // recount rating and comstyle. com style is determined by the majority of the comStyle
  let totalRating = 0;
  let comStyleCount: any = {};
  let totalReviews = reviews.length;
  reviews.forEach((review: any) => {
    totalRating += review.rating;
    if (comStyleCount[review.comStyle]) {
      comStyleCount[review.comStyle] += 1;
    } else {
      comStyleCount[review.comStyle] = 1;
    }
  });
  let comStyle: string = reviewSummary.comStyle;
  let maxCount = 0;
  for (let key in comStyleCount) {
    if (comStyleCount[key] > maxCount) {
      comStyle = key;
      maxCount = comStyleCount[key];
    }
  }
  const updatedValue = {
    rating: totalRating / totalReviews,
    comStyle: comStyle,
    totalReviews: totalReviews,
    lastUpdated: Timestamp.now().toDate().toString(),
  };
  console.log("updatedValue", updatedValue);

  // update the review summary
  reviewSummaryRef.set(updatedValue, { merge: true });

  res.send({});
}
