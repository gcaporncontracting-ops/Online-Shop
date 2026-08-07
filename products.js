// products.js
// This is the ONLY file you need to edit to add, remove, or change items.
// Each product is one entry in this list. Photos live in the /images folder.

const PRODUCTS = [
  {
    id: "p001",
    name: "6x4 Enclosed Box Trailer",
    description: "Solid, lockable 6x4 box trailer — ready for camping gear, tools, or tip runs. Great for a tradie needing secure lockable storage on site, or a weekend camper who wants gear off the back seat. Currently unregistered, priced accordingly.",
    price: 300,
    priceNote: "or nearest offer",
    image: "images/trailer.jpg"
  },
  {
    id: "p002",
    name: "Stainless Steel Sink & Laundry Trough Set",
    description: "Commercial-grade stainless steel sink and laundry trough, sold as a pair. Comes complete with two taps fitted. Ideal for a shed, workshop, alfresco kitchen, or dishwashing station. Optional extra: a waste pump that sits under the sink and pumps waste uphill — ask if you need it, priced separately.",
    price: 200,
    image: "images/sink-trough.jpg"
  },
  {
    id: "p004",
    name: "1987 Mercedes-Benz Unimog U1700",
    description: "Genuine 1987 Unimog U1700 with only 30,000km on the clock — original condition throughout. Currently licensed for 6 months, sold as-is. A rare chance to own a proper go-anywhere workhorse with history and low kilometres for its age.",
    price: 35000,
    priceNote: "ono",
    image: "images/unimog.jpg"
  }
];

// Giveaway item — not for direct sale, shown in the giveaway section only.
const GIVEAWAY = {
  name: "Motocross Helmets & Boots Bundle",
  description: "Two used motocross helmets plus a pair of size 11 boots. Buy anything from the shop this month and you're automatically entered to win the lot.",
  image: "images/helmets-boots.jpg"
};
