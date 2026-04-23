import { Router, type IRouter } from "express";

const router: IRouter = Router();

const RECOMMENDATIONS = [
  {
    id: 1,
    title: "Maintain Indoor Humidity Between 40-60%",
    description: "Keep relative humidity levels between 40% and 60% to prevent mould growth. Use dehumidifiers in high-moisture areas like bathrooms and basements.",
    category: "humidity",
    priority: "high",
    applicable: true,
  },
  {
    id: 2,
    title: "Ensure Adequate Ventilation",
    description: "Open windows regularly to allow fresh air circulation. Install exhaust fans in bathrooms and kitchens to remove moisture at the source.",
    category: "ventilation",
    priority: "high",
    applicable: true,
  },
  {
    id: 3,
    title: "Fix Leaks and Water Damage Promptly",
    description: "Repair leaking pipes, roofs, and windows immediately. Dry wet areas within 24-48 hours to prevent mould from establishing.",
    category: "structural",
    priority: "high",
    applicable: true,
  },
  {
    id: 4,
    title: "Maintain Temperature Between 18-24°C",
    description: "Keep indoor temperatures consistent between 18°C and 24°C. Avoid temperature extremes which can cause condensation on cold surfaces.",
    category: "temperature",
    priority: "medium",
    applicable: true,
  },
  {
    id: 5,
    title: "Clean and Dry Surfaces Regularly",
    description: "Wipe down bathroom tiles, shower curtains, and window sills weekly. Use mould-resistant cleaning products in high-risk areas.",
    category: "cleaning",
    priority: "medium",
    applicable: true,
  },
  {
    id: 6,
    title: "Use Mould-Resistant Paint",
    description: "Apply mould-resistant paint in bathrooms, kitchens, and basements. This creates an additional barrier against mould growth on walls.",
    category: "structural",
    priority: "medium",
    applicable: true,
  },
  {
    id: 7,
    title: "Monitor with Smart Sensors",
    description: "Install Bluetooth-enabled humidity and temperature sensors in each room. Connect them to this app for automatic readings and real-time alerts.",
    category: "monitoring",
    priority: "high",
    applicable: true,
  },
  {
    id: 8,
    title: "Insulate Cold Surfaces",
    description: "Add insulation to cold walls, floors, and pipes to prevent condensation. Double-glazed windows help reduce cold spots that attract moisture.",
    category: "structural",
    priority: "medium",
    applicable: true,
  },
  {
    id: 9,
    title: "Use Bathroom Exhaust Fans During and After Showers",
    description: "Run exhaust fans for at least 20 minutes after showering to remove moisture. Leave bathroom doors open to allow air circulation.",
    category: "ventilation",
    priority: "high",
    applicable: true,
  },
  {
    id: 10,
    title: "Schedule Regular Inspections",
    description: "Conduct monthly visual inspections of high-risk areas: bathrooms, under sinks, around windows, and in basements. Document findings in the app.",
    category: "monitoring",
    priority: "medium",
    applicable: true,
  },
  {
    id: 11,
    title: "Dry Laundry Outdoors or Use a Dryer",
    description: "Avoid drying clothes indoors as it significantly increases indoor humidity. If using a dryer, ensure it is vented to the outside.",
    category: "humidity",
    priority: "medium",
    applicable: true,
  },
  {
    id: 12,
    title: "Keep Gutters and Drains Clear",
    description: "Clean gutters and drains regularly to prevent water overflow that can seep into walls and foundations, creating ideal mould conditions.",
    category: "structural",
    priority: "low",
    applicable: true,
  },
];

router.get("/", async (_req, res) => {
  res.json(RECOMMENDATIONS);
});

export default router;
