function getData(event) {
  event.preventDefault();

  const form = document.getElementById("waterQualityForm");
  const formData = new FormData(form);

  const payload = {
    input_data: [
      {
        fields: [
          "State Code",
          "state",
          "tMin",
          "tMax",
          "pHmin",
          "pHmax",
          "cMin",
          "cMax",
          "bMin",
          "bMax",
          "nMin",
          "nMax",
          "year",
        ],
        values: [
          [
            formData.get("stateCode"),
            formData.get("state"),
            parseFloat(formData.get("tMin")),
            parseFloat(formData.get("tMax")),
            parseFloat(formData.get("pHmin")),
            parseFloat(formData.get("pHmax")),
            parseFloat(formData.get("cMin")),
            parseFloat(formData.get("cMax")),
            parseFloat(formData.get("bMin")),
            parseFloat(formData.get("bMax")),
            parseFloat(formData.get("nMin")),
            parseFloat(formData.get("nMax")),
            parseInt(formData.get("year")),
          ],
        ],
      },
    ],
  };

  fetch("http://localhost:3000/getPrediction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      const prediction = data.predictions[0].values[0][0];
      const probabilities = data.predictions[0].values[0][1];
      // document.getElementById("boolean").innerHTML = prediction;
      if (prediction === true) {
        document.getElementById("boolean").innerHTML = "Water is Drinkable";
      } else {
        document.getElementById("boolean").innerHTML = "Water is not Drinkable";
      }
      
      // Ensure the probability is a valid number before displaying it
      if (typeof probabilities === 'number' && !isNaN(probabilities)) {
        document.getElementById("probabily").innerHTML = `${(probabilities * 100).toFixed(2)}%`;
      } else {
        document.getElementById("probabily").innerHTML = "Try Again!";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
