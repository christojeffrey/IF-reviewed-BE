const { initializeApp, applicationDefault, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue } = require("firebase-admin/firestore");

initializeApp({
  credential: cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  }),
});

const db = getFirestore();

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

  const reviewRef = db.collection("users").doc(NIM).collection("reviews").doc(reviewerID);

  const respond = await reviewRef.update(review, { merge: true });

  res.send(respond);
}
