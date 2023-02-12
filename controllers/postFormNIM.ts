import { getDB, getFirebaseAuth } from "../helper";
const { Timestamp } = require("firebase-admin/firestore");

export default async function postFormNIM(req: any, res: any) {
  // setup
  // get auth header
  const authHeader = req.headers.authorization;
  console.log("authHeader", authHeader);
  const NIM = req.body.NIM;
  const reviewerID = req.body.reviewerID;
  let NewReview: any = {
    comStyle: req.body.comStyle,
    rating: req.body.rating,
    timeStamp: Timestamp.now().toDate().toString(),
  };
  console.log("NewReview");
  console.log(NIM, NewReview);

  // validate authHeader
  if (!authHeader) {
    res.status(401).send("Unauthorized");
    return;
  }

  // validate new review
  // com style is string '1' to '4', rating is number 1 to 5
  if (typeof NewReview.comStyle !== "string" || typeof NewReview.rating !== "number") {
    res.status(400).send("Bad Request");
    return;
  }
  if (NewReview.comStyle.length !== 1 || NewReview.comStyle < "1" || NewReview.comStyle > "4") {
    res.status(400).send("Bad Request");
    return;
  }
  const idToken = authHeader.split(" ")[1];
  const { auth } = getFirebaseAuth();
  const decodedToken = await auth.verifyIdToken(idToken);
  console.log("decodedToken", decodedToken);
  if (decodedToken.uid !== reviewerID) {
    res.status(401).send("Unauthorized");
    return;
  }

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
    rating: (totalRating / totalReviews).toFixed(2),
    comStyle: comStyle,
    comStyleDetail: comStyleCount,
    totalReviews: totalReviews,
    lastUpdated: Timestamp.now().toDate().toString(),
  };
  console.log("updatedValue", updatedValue);

  // update the review summary
  reviewSummaryRef.set(updatedValue, { merge: true });

  res.send({
    status: "success",
  });
}
