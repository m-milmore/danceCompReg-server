const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const useStrip = async () => {
  // normally this would be in a database or in a json file
	// the number would be the id of the item
	// the client only has to send the id to the server and the number of purchase for each item
	// there's no prices send from the client to the server for security reason
  const storeItems = new Map([
    [1, { priceInCents: 7000, name: "friday1" }],
    [2, { priceInCents: 5500, name: "friday2" }],
    [3, { priceInCents: 2500, name: "friday0" }],
  ]);
};

module.exports = useStrip;
