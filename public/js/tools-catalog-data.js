// js/data.js
// Lead-acid product catalogue (dry-charge, deep-cycle, maintenance-free).
// Source of truth for specifications: Alaska Batteries Company Profile (tabular
// version) pages 12–15 and the MF 55 / MF 95 / MF 125 datasheets (Oct 2026).
// Fields: plates (per cell), ah (capacity @ 20HR), p (nominal volts), cca (A @ -18 °C),
// rc (reserve capacity, min), weightKg (+ weightType dry|wet), dimensions (mm, TH =
// height to terminal top), terminalType, layout (L / R / L/R), boxSize (JIS box).
// `reviewNote` marks entries with an open question for the Alaska team.

const batteryData = [
  {
    "id": "1",
    "model": "Solar-50",
    "plates": 5,
    "boxSize": "NS-40",
    "weightKg": 4.9,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 22,
    "p": 12,
    "warranty": "None",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s50.png",
    "categories": [
      "Solar"
    ],
    "uses": "Home UPS, Solar Inverters",
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "L",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "2",
    "series": "dry-charge",
    "model": "A 55L",
    "plates": 7,
    "boxSize": "NS-40",
    "weightKg": 6.3,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 32,
    "p": 12,
    "warranty": "6 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a55.png",
    "categories": [
      "Automotive"
    ],
    "uses": [
      "Small Hatchbacks, Generators"
    ],
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "L",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "3",
    "model": "A 60L/R",
    "plates": 9,
    "boxSize": "NS-40",
    "weightKg": 7.65,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 42,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a60.png",
    "categories": [
      "Automotive"
    ],
    "uses": [
      "Small Hatchbacks, Generators"
    ],
    "cca": 240,
    "rc": 27,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "4",
    "model": "A 65L",
    "plates": 11,
    "boxSize": "NS-40",
    "weightKg": 8.5,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 50,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a65.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 270,
    "rc": 50,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "L",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "5",
    "model": "A 70L/R",
    "plates": 11,
    "boxSize": "N-40",
    "weightKg": 8.65,
    "dimensions": {
      "l": 238,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 50,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a70.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 270,
    "rc": 52,
    "capacityRate": "20HR",
    "terminalType": "A/B",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "6",
    "model": "A 75L/R",
    "plates": 13,
    "boxSize": "N-40",
    "weightKg": 9.82,
    "dimensions": {
      "l": 238,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 55,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a75.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 330,
    "rc": 73,
    "capacityRate": "20HR",
    "terminalType": "A/B",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "7",
    "model": "A 90",
    "plates": 9,
    "boxSize": "N-50",
    "weightKg": 9.8,
    "dimensions": {
      "l": 257,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 50,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a90.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 280,
    "rc": 83,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "8",
    "model": "A 95Z/ZL",
    "plates": 11,
    "boxSize": "N-50",
    "weightKg": 11.1,
    "dimensions": {
      "l": 257,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 60,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a95.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 350,
    "rc": 97,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "9",
    "model": "A 99",
    "plates": 13,
    "boxSize": "N-50",
    "weightKg": 12.8,
    "dimensions": {
      "l": 257,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 65,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a99.png",
    "categories": [
      "Automotive"
    ],
    "uses": "UPS Backup, Solar Inverters",
    "cca": 360,
    "rc": 116,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "10",
    "model": "Solar-100",
    "plates": 9,
    "boxSize": "N-70",
    "weightKg": 10.42,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 60,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s100.png",
    "categories": [
      "Solar"
    ],
    "uses": "Home UPS, Solar Inverters,Off-Grid Home Systems",
    "cca": 330,
    "rc": 90,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "11",
    "model": "A 110",
    "plates": 11,
    "boxSize": "N-70",
    "weightKg": 12.1,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 72,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a110.png",
    "categories": [
      "Automotive"
    ],
    "uses": "Small Hatchbacks, Generators",
    "cca": 356,
    "rc": 105,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15",
    "reviewNote": "Model naming under review: the company profile lists this 11-plate 72 Ah N70 battery as “A 115”, and the product label prints 70 Ah."
  },
  {
    "id": "12",
    "model": "A 115Z/ZL",
    "plates": 13,
    "boxSize": "N-70",
    "weightKg": 13.4,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 80,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a115.png",
    "categories": [
      "Automotive",
      "Solar"
    ],
    "uses": "Generators, Solar Inverters",
    "cca": 370,
    "rc": 138,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15",
    "reviewNote": "Model naming under review: the company profile lists this 13-plate 80 Ah N70 battery as “A 120 Z/ZL”."
  },
  {
    "id": "13",
    "model": "A 120Z/ZL",
    "plates": 15,
    "boxSize": "N-70",
    "weightKg": 14.9,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 85,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/automotive/a120.png",
    "categories": [
      "Automotive",
      "Solar"
    ],
    "uses": "Generators, Solar Inverters",
    "cca": 450,
    "rc": 123,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "L/R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15",
    "reviewNote": "Model naming under review: the company profile lists this 15-plate 85 Ah N70 battery as “A 125 Z/ZL”."
  },
  {
    "id": "14",
    "model": "A 130",
    "plates": 15,
    "boxSize": "6X15",
    "weightKg": 16.0,
    "dimensions": {
      "l": 367,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 100,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s130.png",
    "categories": [
      "Solar"
    ],
    "uses": "Home UPS, Solar Inverters,Off-Grid Home Systems",
    "cca": 520,
    "rc": 167,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "15",
    "model": "A 140",
    "plates": 17,
    "boxSize": "6X15",
    "weightKg": 17.66,
    "dimensions": {
      "l": 367,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 105,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s140.png",
    "categories": [
      "Solar"
    ],
    "uses": "Home UPS, Solar Inverters,Off-Grid Home Systems",
    "cca": 530,
    "rc": 165,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "16",
    "model": "A 150",
    "plates": 17,
    "boxSize": "N-100",
    "weightKg": 18.7,
    "dimensions": {
      "l": 405,
      "w": 172,
      "h": 207,
      "th": 230,
      "unit": "mm"
    },
    "ah": 110,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s150.png",
    "categories": [
      "Solar",
      "Industrial"
    ],
    "uses": "Home UPS, Solar Inverters,Agricultural Machinery",
    "cca": 530,
    "rc": 180,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "17",
    "model": "A 160",
    "plates": 19,
    "boxSize": "N-100",
    "weightKg": 19.64,
    "dimensions": {
      "l": 405,
      "w": 172,
      "h": 207,
      "th": 230,
      "unit": "mm"
    },
    "ah": 115,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/solar/s160.png",
    "categories": [
      "Solar",
      "Industrial"
    ],
    "uses": "Home UPS, Solar Inverters,Agricultural Machinery",
    "cca": 530,
    "rc": 195,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "18",
    "model": "A 180",
    "plates": 19,
    "boxSize": "N-120",
    "weightKg": 22.2,
    "dimensions": {
      "l": 500,
      "w": 178,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 120,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a180.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 600,
    "rc": 245,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "19",
    "model": "A 200",
    "plates": 21,
    "boxSize": "N-120",
    "weightKg": 24.4,
    "dimensions": {
      "l": 500,
      "w": 178,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 130,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a200.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 650,
    "rc": 280,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "20",
    "model": "A 205",
    "plates": 23,
    "boxSize": "N-120",
    "weightKg": 25.9,
    "dimensions": {
      "l": 500,
      "w": 178,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 140,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a205.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 650,
    "rc": 280,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "21",
    "model": "A 210",
    "plates": 21,
    "boxSize": "N-150",
    "weightKg": 25.5,
    "dimensions": {
      "l": 505,
      "w": 218,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 135,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a210.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 810,
    "rc": 280,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "22",
    "model": "A 230",
    "plates": 23,
    "boxSize": "N-150",
    "weightKg": 26.8,
    "dimensions": {
      "l": 505,
      "w": 218,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 150,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a230.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 720,
    "rc": 317,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "23",
    "model": "A 260",
    "plates": 25,
    "boxSize": "N-150",
    "weightKg": 28.4,
    "dimensions": {
      "l": 505,
      "w": 218,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 160,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a260.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 870,
    "rc": 410,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "24",
    "model": "A 270",
    "plates": 27,
    "boxSize": "N-150",
    "weightKg": 30.0,
    "dimensions": {
      "l": 505,
      "w": 218,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 180,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a270.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 920,
    "rc": 420,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "25",
    "model": "A 280",
    "plates": 31,
    "boxSize": "N-200",
    "weightKg": 34.5,
    "dimensions": {
      "l": 515,
      "w": 274,
      "h": 216,
      "th": 240,
      "unit": "mm"
    },
    "ah": 210,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a280.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 1050,
    "rc": 700,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "26",
    "model": "A 290",
    "plates": 33,
    "boxSize": "N-200",
    "weightKg": 36.4,
    "dimensions": {
      "l": 515,
      "w": 274,
      "h": 216,
      "th": 240,
      "unit": "mm"
    },
    "ah": 220,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/industrial/a290.png",
    "categories": [
      "Industrial"
    ],
    "uses": "Agricultural Machinery, Heavy Vehicles,Heavy Machinery Backup",
    "cca": 1100,
    "rc": 750,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "101",
    "series": "deep-cycle",
    "model": "DC 1100",
    "plates": 11,
    "boxSize": "N-70",
    "weightKg": 13.8,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 80,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/deep-cycle/dc1100.png",
    "categories": [
      "Deep-Cycle"
    ],
    "uses": "UPS Backup, Solar Inverters",
    "rc": 129,
    "capacityRate": "20HR",
    "terminalType": "L Type Nut & Bolt",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "102",
    "series": "deep-cycle",
    "model": "DC 1600",
    "plates": 19,
    "boxSize": "N-120",
    "weightKg": 23.8,
    "dimensions": {
      "l": 500,
      "w": 178,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 130,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/deep-cycle/dc1600.png",
    "categories": [
      "Deep-Cycle"
    ],
    "uses": "UPS Backup, Solar Inverters",
    "rc": 221,
    "capacityRate": "20HR",
    "terminalType": "L Type Nut & Bolt",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "103",
    "series": "deep-cycle",
    "model": "DC 2000",
    "plates": 21,
    "boxSize": "N-150",
    "weightKg": 26.35,
    "dimensions": {
      "l": 505,
      "w": 218,
      "h": 214,
      "th": 255,
      "unit": "mm"
    },
    "ah": 160,
    "p": 12,
    "warranty": "9 Months",
    "tech": "Graphite Enhanced Lead-Acid Battery",
    "image": "assets/batteries/deep-cycle/dc2000.png",
    "categories": [
      "Deep-Cycle"
    ],
    "uses": "UPS Backup, Solar Inverters",
    "rc": 240,
    "capacityRate": "20HR",
    "terminalType": "L Type Nut & Bolt",
    "layout": "R",
    "weightType": "dry",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "201",
    "series": "mf",
    "model": "MF 50",
    "plates": 5,
    "boxSize": "NS-40",
    "weightKg": 8.25,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 22,
    "p": 12,
    "warranty": "None",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-50.png",
    "categories": [
      "Automotive"
    ],
    "uses": "660cc - 1000cc Vehicles",
    "cca": 180,
    "rc": 25,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "202",
    "series": "mf",
    "model": "MF 55",
    "plates": 7,
    "boxSize": "NS-40",
    "weightKg": 9.4,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 34,
    "p": 12,
    "warranty": "6 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-55.png",
    "categories": [
      "Automotive"
    ],
    "uses": "660cc - 1000cc Vehicles",
    "cca": 250,
    "rc": 42,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15; MF 55 datasheet",
    "plateMaterial": "Lead Calcium Silver",
    "separator": "Polyethylene (PE)",
    "applications": [
      "Automotives",
      "Stop-Start",
      "DC Application"
    ],
    "selfDischarge": {
      "3 months": "91%",
      "6 months": "82%",
      "12 months": "64%"
    },
    "datasheet": "assets/docs/mf-55-datasheet.pdf"
  },
  {
    "id": "203",
    "series": "mf",
    "model": "MF 60L",
    "plates": 9,
    "boxSize": "NS-40",
    "weightKg": 10.6,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 42,
    "p": 12,
    "warranty": "15 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-60L.png",
    "categories": [
      "Automotive"
    ],
    "uses": "800cc - 1300cc Vehicles",
    "cca": 350,
    "rc": 50,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "L",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "204",
    "series": "mf",
    "model": "MF 60R",
    "plates": 9,
    "boxSize": "NS-40",
    "weightKg": 10.6,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 42,
    "p": 12,
    "warranty": "15 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-60R.png",
    "categories": [
      "Automotive"
    ],
    "uses": "800cc - 1300cc Vehicles",
    "cca": 350,
    "rc": 50,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15"
  },
  {
    "id": "205",
    "series": "mf",
    "model": "MF 70L",
    "plates": 11,
    "boxSize": "NS-40",
    "weightKg": 11.78,
    "dimensions": {
      "l": 197,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 50,
    "p": 12,
    "warranty": "15 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-70L.png",
    "categories": [
      "Automotive"
    ],
    "uses": "1300cc - 1800cc Vehicles",
    "cca": 370,
    "rc": 65,
    "capacityRate": "20HR",
    "terminalType": "A",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "reviewNote": "Model naming under review: the company profile lists MF 70 as “MF 70 Thin / MF 70 Thick” with R terminal layout."
  },
  {
    "id": "206",
    "series": "mf",
    "model": "MF 75L/R",
    "plates": 9,
    "boxSize": "N-40",
    "weightKg": 11.9,
    "dimensions": {
      "l": 238,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 44,
    "p": 12,
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/placeholder-mf.svg",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 360,
    "rc": 60,
    "capacityRate": "20HR",
    "terminalType": "A/B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "warranty": "15 Months",
    "reviewNote": "The company profile shows terminal layout R for this model although the name lists L/R versions.",
    "imagePending": true
  },
  {
    "id": "207",
    "series": "mf",
    "model": "MF 85L/R",
    "plates": 11,
    "boxSize": "N-40",
    "weightKg": 12.95,
    "dimensions": {
      "l": 238,
      "w": 129,
      "h": 202,
      "th": 222,
      "unit": "mm"
    },
    "ah": 52,
    "p": 12,
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/placeholder-mf.svg",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 400,
    "rc": 68,
    "capacityRate": "20HR",
    "terminalType": "A/B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "warranty": "15 Months",
    "reviewNote": "The company profile shows terminal layout R for this model although the name lists L/R versions.",
    "imagePending": true
  },
  {
    "id": "208",
    "series": "mf",
    "model": "MF 90",
    "plates": 9,
    "boxSize": "N-50",
    "weightKg": 15.6,
    "dimensions": {
      "l": 257,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 60,
    "p": 12,
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/placeholder-mf.svg",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 420,
    "rc": 75,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "warranty": "15 Months",
    "imagePending": true
  },
  {
    "id": "209",
    "series": "mf",
    "model": "MF 95Z",
    "plates": 11,
    "boxSize": "N-50",
    "weightKg": 16.9,
    "dimensions": {
      "l": 257,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 72,
    "p": 12,
    "warranty": "15 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-95z.webp",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 490,
    "rc": 80,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15; MF 95 datasheet",
    "warrantySource": "Warranty period shown on the product label in the MF datasheet",
    "plateMaterial": "Lead Calcium Silver",
    "separator": "Polyethylene (PE)",
    "applications": [
      "Automotives",
      "Stop-Start",
      "DC Application"
    ],
    "selfDischarge": {
      "3 months": "91%",
      "6 months": "82%",
      "12 months": "64%"
    },
    "datasheet": "assets/docs/mf-95-datasheet.pdf"
  },
  {
    "id": "210",
    "series": "mf",
    "model": "MF 115",
    "plates": 11,
    "boxSize": "N-70",
    "weightKg": 18.3,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 74,
    "p": 12,
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/placeholder-mf.svg",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 500,
    "rc": 82,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "warranty": "15 Months",
    "imagePending": true
  },
  {
    "id": "211",
    "series": "mf",
    "model": "MF 120",
    "plates": 13,
    "boxSize": "N-70",
    "weightKg": 19.9,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 82,
    "p": 12,
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/placeholder-mf.svg",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 640,
    "rc": 95,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15",
    "warranty": "15 Months",
    "imagePending": true
  },
  {
    "id": "212",
    "series": "mf",
    "model": "MF 125",
    "plates": 15,
    "boxSize": "N-70",
    "weightKg": 20.8,
    "dimensions": {
      "l": 300,
      "w": 170,
      "h": 202,
      "th": 225,
      "unit": "mm"
    },
    "ah": 95,
    "p": 12,
    "warranty": "15 Months",
    "tech": "German Engineering Maintenance Free Battery",
    "image": "assets/batteries/mf/mf-125.webp",
    "categories": [
      "Automotive"
    ],
    "uses": "Automotive",
    "cca": 720,
    "rc": 100,
    "capacityRate": "20HR",
    "terminalType": "B",
    "layout": "R",
    "weightType": "wet",
    "source": "Company Profile (tabular), p12–15; MF 125 datasheet",
    "warrantySource": "Warranty period shown on the product label in the MF datasheet",
    "plateMaterial": "Lead Calcium Silver",
    "separator": "Polyethylene (PE)",
    "applications": [
      "Automotives",
      "Stop-Start",
      "DC Application"
    ],
    "selfDischarge": {
      "3 months": "91%",
      "6 months": "82%",
      "12 months": "64%"
    },
    "datasheet": "assets/docs/mf-125-datasheet.pdf"
  }
];

// Helper function to get products by series
const getProductsBySeries = (seriesName) => {
  return batteryData.filter((item) => item.series === seriesName);
};
