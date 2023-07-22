const express = require('express');
const fetch = require('node-fetch');

const app = express();
const port = 3000; // Change this to your desired port number

// Set your PayPal credentials as environment variables
process.env.CLIENT_ID = "AftrIaLTH4qD92wDVjG2dr4vBisK7yF5pkQucEoyKMDV-Pf2ajtITChp0zXVYQJIEWKy4QVV9FGD2Nev";
process.env.APP_SECRET = "EHncHx15yVXp0MYALTcCbJJKoi8ouiXsWgkA0wTOhqBpbgnWn9_Z1wrpb3FNYWTca7efVoTNWLsQs8oP";

const { CLIENT_ID, APP_SECRET } = process.env;
const baseURL = {
    sandbox: "https://api-m.sandbox.paypal.com",
    production: "https://api-m.paypal.com"
};

// Allow json body
app.use(express.json());

// create a new order
app.post("/create-paypal-order", async (req, res) => {
  const order = await createOrder();
  res.json(order);
});

// capture payment & store order information or fulfill order
app.post("/capture-paypal-order", async (req, res) => {
  const { orderID } = req.body;
  const captureData = await capturePayment(orderID);
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

//////////////////////
// PayPal API helpers
//////////////////////

// use the orders api to create an order
async function createOrder() {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "100.00",
          },
        },
      ],
    }),
  });
  const data = await response.json();
  return data;
}

// use the orders api to capture payment for an order
async function capturePayment(orderId) {
  const accessToken = await generateAccessToken();
  const url = `${baseURL.sandbox}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
  const response = await fetch(`${baseURL.sandbox}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
