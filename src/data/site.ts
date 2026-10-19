// Everything about the person and the site in one place: used by the pages, the structured
// data (JSON-LD), the RSS feed and llms.txt, so the facts never disagree.

export const SITE = {
  url: "https://kacperpawlowski.tech",
  name: "Kacper Pawlowski",
  alternateName: "Kacper Pawłowski",
  role: "AI Engineer",
  roleLong: "AI engineer - computer vision, LiDAR and sensor fusion",
  location: "Trondheim, Norway",
  locale: "en",
  email: "contact@kacperpawlowski.tech",
  github: "https://github.com/kapi0okapi",
  githubUser: "kapi0okapi",
  linkedin: "https://www.linkedin.com/in/kacper-pawlowski-914ab8297/",
  description:
    "Kacper Pawlowski is an AI engineer and MSc student at NTNU in Trondheim, Norway. He builds computer vision, LiDAR and sensor-fusion systems end to end - from raw data to deployed models.",
  keywords: [
    "Kacper Pawlowski",
    "Kacper Pawłowski",
    "AI engineer",
    "computer vision engineer",
    "machine learning engineer",
    "NTNU",
    "Trondheim",
    "LiDAR",
    "sensor fusion",
    "SLAM",
    "YOLO",
    "PyTorch",
  ],
  knowsAbout: [
    "Computer vision",
    "Deep learning",
    "Object detection",
    "Semantic segmentation",
    "Monocular depth estimation",
    "LiDAR point clouds",
    "SLAM",
    "Visual odometry",
    "Sensor fusion",
    "Kalman filtering",
    "Model quantization",
    "Edge deployment",
    "Geographic information systems",
    "PyTorch",
    "Python",
  ],
};

export const EDUCATION = [
  {
    degree: "MSc, Computer Science - Artificial Intelligence",
    school: "NTNU, Norwegian University of Science and Technology",
    period: "2022 - present",
    note: "Exchange semester at Instituto Superior Técnico, University of Lisbon.",
  },
  {
    degree: "MSc, Physics and Mathematics - Industrial Mathematics",
    school: "NTNU, Norwegian University of Science and Technology",
    period: "2023 - present",
    note: "",
  },
  {
    degree: "Upper secondary school",
    school: "Orkdal vidaregåande skole",
    period: "2019 - 2022",
    note: "Graduated as the top student of my year.",
  },
];

export const EXPERIENCE = [
  {
    title: "AI Engineer",
    org: "Lighthouse Consulting",
    period: "Jun 2026 - present",
    text: "Computer vision systems end to end, and the models behind them, for predictive maintenance: catching wear and faults early so clients can plan instead of reacting to breakdowns. From classical image processing to deep learning, including automated visual inspection on industrial lines.",
  },
  {
    title: "Tech Consultant",
    org: "Pango Consulting",
    period: "Feb 2025 - present",
    text: "Maintaining and extending client systems, troubleshooting live environments and improving their stability.",
  },
  {
    title: "Traffic Manager",
    org: "Boreal Buss | Vy Buss",
    period: "Sep 2022 - present",
    text: "Real-time traffic control: reassigning buses and drivers during delays and handling faults and incidents on the road. Fast decisions on incomplete information.",
  },
];

export const SKILLS = [
  { group: "Vision & ML", items: ["PyTorch", "Ultralytics YOLO", "Transformers", "timm", "OpenCV", "scikit-learn"] },
  { group: "3D & sensors", items: ["LiDAR point clouds", "ICP / SLAM", "Visual odometry", "Kalman filters", "GNSS / IMU"] },
  { group: "Geodata", items: ["PostGIS", "GeoPandas", "NVDB", "MapLibre", "Vector tiles"] },
  { group: "Deployment", items: ["ONNX Runtime", "TensorRT", "OpenVINO", "Core ML", "Docker", "AWS", "Terraform", "GitHub Actions", "Slurm"] },
  { group: "Languages", items: ["Python", "C++", "TypeScript", "Rust", "SQL", "Java", "C#"] },
];

export const LANGUAGES = ["English", "Norwegian", "Polish", "German", "Ukrainian"];
