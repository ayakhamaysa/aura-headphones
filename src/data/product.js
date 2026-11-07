// ======================================================
// The only file you edit: the product, its colors and the 3D model
// ======================================================

// The 3D model: a .glb file in public/models (made from a photo with Hunyuan3D)
export const model = {
  file: "/models/headphones.glb",
  size: 1.05, // bigger number = the headphones look bigger
};

export const product = {
  name: "AURA ONE",
  price: { en: "$349", ar: "349$" },
  whatsapp: "971500000000", // change to the shop number
};

// Colors you can pick (hex = the color sent to the 3D model)
export const colors = [
  { id: "midnight", hex: "#1c1d22", en: "Midnight", ar: "ليلي" },
  { id: "olive", hex: "#5a6b3c", en: "Olive", ar: "زيتي" },
  { id: "ocean", hex: "#2e5a87", en: "Ocean", ar: "أزرق محيطي" },
  { id: "sand", hex: "#d6c3a5", en: "Sand", ar: "رملي" },
];

// Shown one by one while the headphones turn
export const features = [
  {
    number: "01",
    en: { title: "Studio sound", text: "Custom 40 mm drivers tuned for deep bass and clear vocals, at any volume." },
    ar: { title: "صوت استوديو", text: "سماعات 40 ملم مضبوطة لبيس عميق وصوت واضح، على أي مستوى صوت." },
  },
  {
    number: "02",
    en: { title: "Real silence", text: "Adaptive noise cancelling listens to the room 200 times a second and blocks it out." },
    ar: { title: "هدوء حقيقي", text: "عزل ضوضاء ذكي بيسمع الغرفة 200 مرة بالثانية وبيلغيها." },
  },
  {
    number: "03",
    en: { title: "40 hours", text: "A full week of listening on one charge. Ten minutes of charging gives five hours." },
    ar: { title: "40 ساعة", text: "أسبوع كامل من الاستماع بشحنة وحدة. 10 دقايق شحن بتعطيك 5 ساعات." },
  },
];

// Big numbers with a short label
export const stats = [
  { value: 40, suffix: "h", en: "Battery life", ar: "عمر البطارية" },
  { value: 5, suffix: "h", en: "From a 10 min charge", ar: "من 10 دقايق شحن" },
  { value: 250, suffix: "g", en: "Light all day", ar: "خفيفة طول اليوم" },
  { value: 2, suffix: "×", en: "Devices at once", ar: "جهازين مع بعض" },
];

export const specs = [
  { en: ["Battery", "Up to 40 h (ANC on)"], ar: ["البطارية", "لحد 40 ساعة (مع العزل)"] },
  { en: ["Charging", "USB-C, 10 min = 5 h"], ar: ["الشحن", "USB-C، 10 دقايق = 5 ساعات"] },
  { en: ["Drivers", "40 mm dynamic"], ar: ["السماعات", "40 ملم"] },
  { en: ["Bluetooth", "5.4, multipoint"], ar: ["البلوتوث", "5.4، جهازين مع بعض"] },
  { en: ["Weight", "250 g"], ar: ["الوزن", "250 غرام"] },
];
