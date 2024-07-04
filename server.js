const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 3000;
const API_KEY = process.env.API_KEY || "V0lbg4Wf3w11E2XvGvQxeF7KbXTSdz1VEvmez6FYnSFh";

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/getPrediction", (req, res) => {
  function getToken(errorCallback, loadCallback) {
    const options = {
      method: "POST",
      hostname: "iam.cloud.ibm.com",
      path: "/identity/token",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    };

    const tokenReq = https.request(options, (tokenRes) => {
      let data = "";

      tokenRes.on("data", (chunk) => {
        data += chunk;
      });

      tokenRes.on("end", () => {
        loadCallback(JSON.parse(data));
      });
    });

    tokenReq.on("error", errorCallback);

    tokenReq.write(
      `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${API_KEY}`
    );
    tokenReq.end();
  }

  function apiPost(scoring_url, token, payload, loadCallback, errorCallback) {
    const options = {
      method: "POST",
      hostname: "us-south.ml.cloud.ibm.com",
      path: "/ml/v4/deployments/quality_/predictions?version=2021-05-01",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json;charset=UTF-8",
      },
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = "";

      apiRes.on("data", (chunk) => {
        data += chunk;
      });

      apiRes.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          loadCallback(parsedData);
        } catch (error) {
          console.error("Error parsing response:", data);
          errorCallback(new Error("Invalid JSON response"));
        }
      });
    });

    apiReq.on("error", errorCallback);
    apiReq.write(JSON.stringify(payload));
    apiReq.end();
  }

  const payload = req.body;

  getToken(
    (err) => {
      console.error("Error fetching token:", err);
      res.status(500).send(err);
    },
    (tokenResponse) => {
      const scoring_url =
        "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/tash/predictions?version=2021-05-01";
      apiPost(
        scoring_url,
        tokenResponse.access_token,
        payload,
        (resp) => {
          res.json(resp);
        },
        (error) => {
          console.error("Error in API request:", error);
          res.status(500).send(error);
        }
      );
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
