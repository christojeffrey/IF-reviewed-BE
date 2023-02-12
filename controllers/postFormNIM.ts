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

  // determine if this review is new or updating an existing review
  const reviewSnapshot = await reviewRef.get();
  let isUpdate = false;
  let oldReview;
  if (reviewSnapshot.exists) {
    isUpdate = true;
    oldReview = reviewSnapshot.data();
  }

  // add the review
  reviewRef.set(NewReview, { merge: true });

  // ---
  // update the review summary field
  const reviewSummaryRef = db.collection("users").doc(NIM);
  const reviewSummarySnapshot = await reviewSummaryRef.get();

  const OldReviewSummary = reviewSummarySnapshot.data();

  console.log("OldReviewSummary", OldReviewSummary);

  // recount rating and comstyle. com style is determined by the majority of the comStyle
  // ---
  // new way
  const newComStyleDetail = OldReviewSummary.comStyleDetail ? OldReviewSummary.comStyleDetail : {};
  // update it. if not new review, subtract old value and add new value first, then update the value
  console.log("newComStyleDetail", newComStyleDetail);
  console.log("oldReview", oldReview);
  if (isUpdate) {
    // if value is not 1, subtract 1. if not, remove the key
    if (newComStyleDetail[oldReview.comStyle] > 1) {
      newComStyleDetail[oldReview.comStyle] -= 1;
    } else {
      delete newComStyleDetail[oldReview.comStyle];
    }
  }

  // add new value
  if (newComStyleDetail[NewReview.comStyle]) {
    newComStyleDetail[NewReview.comStyle] += 1;
  } else {
    newComStyleDetail[NewReview.comStyle] = 1;
  }

  // update comStyle
  let newComStyle: string = OldReviewSummary.comStyle ? OldReviewSummary.comStyle : "1";
  let newMaxCount = 0;
  for (let key in newComStyleDetail) {
    if (newComStyleDetail[key] > newMaxCount) {
      newComStyle = key;
      newMaxCount = newComStyleDetail[key];
    }
  }
  // update new totalRating
  let newTotalRating: number;
  // handling if attribute is not exist
  if (OldReviewSummary.totalRating) {
    newTotalRating = OldReviewSummary.totalRating;
    if (isUpdate) {
      newTotalRating = newTotalRating - oldReview.rating;
    }
    newTotalRating = newTotalRating + NewReview.rating;
  } else {
    newTotalRating = await excessiveGetTotalRating(db, NIM);
  }
  // if update, subtract old value first

  // update new totalReviews
  let newTotalReviews: number = OldReviewSummary.totalReviews ? OldReviewSummary.totalReviews : 0;
  // if update, subtract old value first
  if (isUpdate) {
    newTotalReviews = newTotalReviews - 1;
  }
  newTotalReviews = newTotalReviews + 1;

  // update new rating
  const newRating = parseFloat((newTotalRating / newTotalReviews).toFixed(2));

  const newUpdatedValue = {
    NIM: OldReviewSummary.NIM,
    name: OldReviewSummary.name,
    totalRating: newTotalRating,
    rating: newRating,
    comStyle: newComStyle,
    comStyleDetail: newComStyleDetail,
    totalReviews: newTotalReviews,
    lastUpdated: Timestamp.now().toDate().toString(),
  };
  console.log("newUpdatedValue", newUpdatedValue);

  // update the review summary
  reviewSummaryRef.set(newUpdatedValue);

  res.send({
    status: "success",
  });
}

// this function is bad interms of performance. it needs to read all the reviews
async function excessiveGetTotalRating(db: any, NIM: any) {
  const reviewSummaryRef = db.collection("users").doc(NIM);
  const reviewSummarySnapshot = await reviewSummaryRef.get();
  const reviewsSnapshot = await reviewSummarySnapshot.ref.collection("reviews").get();

  const reviews = reviewsSnapshot.docs.map((doc: any) => doc.data());

  let totalRating = 0;
  reviews.forEach((review: any) => {
    totalRating += review.rating;
  });
  return totalRating;
}
