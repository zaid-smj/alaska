/*
 * Alaska Batteries — Battery Finder vehicle list
 * ------------------------------------------------------------
 * Popular vehicles on Pakistani roads with their engine options.
 * Each engine has a displacement (cc) and fuel type. The finder turns
 * these into a battery class (see CLASSES in battery-finder-engine.js).
 *
 * Optional per-engine/per-model fields:
 *   cls      force a class instead of the cc/fuel rule (e.g. "tractor")
 *   flags    ["din"]    many recent units use a European (EN/DIN) case
 *            ["hybrid"] 12 V auxiliary battery is model-specific — not covered
 *            ["24v"]    two 12 V batteries in series
 *   fit      exact Alaska model(s) from Alaska's fitment chart, in the chart's
 *            order. "MF 60L|MF 60R" = one pick sold in left and right versions.
 *            When present it overrides the rule-based recommendation.
 *   fuel     "petrol", "diesel" or "electric"; cc may be omitted (tractors by HP)
 *
 *   note     extra text shown with a chart fitment (e.g. terminal posts)
 *
 * Engines with `fit` come from Alaska's vehicle fitment chart
 * (Pakistani_Vehicles_Alaska_Batteries_Master.xlsx, Oct 2026). The rest
 * are rule-based from public engine specifications.
 */
(function (root) {
  const V = (label, cc, fuel, extra) => Object.assign({ label, cc, fuel }, extra || {});
  const P = "petrol";
  const D = "diesel";
  const H = { flags: ["hybrid"] };
  const DIN = { flags: ["din"] };

  const VEHICLES = [
    // ------------------------------------------------------------ Suzuki
    { make: "Suzuki", model: "Alto", engines: [{ label: "VX \u00b7 0.66L R06A Petrol", cc: 660, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }, { label: "VXL AGS \u00b7 0.66L R06A Petrol", cc: 660, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 60L/R"] }, { label: "VXR \u00b7 0.66L R06A Petrol", cc: 660, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }, V("1000cc (2000 to 2012)", 1000, P)] },
    { make: "Suzuki", model: "Mehran", engines: [V("800cc", 800, P)] },
    { make: "Suzuki", model: "Cultus", engines: [{ label: "Auto Gear Shift \u00b7 1.0L K10B Petrol", cc: 1000, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 70L/R"] }, { label: "VXL \u00b7 1.0L K10B Petrol", cc: 1000, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 70L/R"] }, { label: "VXR \u00b7 1.0L K10B Petrol", cc: 1000, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 70L/R"] }] },
    { make: "Suzuki", model: "Wagon R", engines: [{ label: "VXL \u00b7 1.0L K10B Petrol", cc: 1000, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 60L/R"] }, { label: "VXR \u00b7 1.0L K10B Petrol", cc: 1000, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }] },
    { make: "Suzuki", model: "Swift", engines: [{ label: "GL CVT \u00b7 1.2L K12M Petrol", cc: 1200, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "GL MT \u00b7 1.2L K12M Petrol", cc: 1200, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "GLX CVT \u00b7 1.2L K12M Petrol", cc: 1200, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, V("1.3L", 1300, P)] },
    { make: "Suzuki", model: "Bolan", engines: [{ label: "VX \u00b7 0.8L F8B Petrol", cc: 800, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }] },
    { make: "Suzuki", model: "Ravi (pickup)", engines: [{ label: "VX \u00b7 0.8L F8B Petrol", cc: 800, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }] },
    { make: "Suzuki", model: "Every", engines: [{ label: "VX \u00b7 0.66L Petrol", cc: 660, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 65L"] }, { label: "VXR \u00b7 0.66L Petrol", cc: 660, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 65L"] }] },
    { make: "Suzuki", model: "Khyber", engines: [V("1000cc", 1000, P)] },
    { make: "Suzuki", model: "Margalla", engines: [V("1300cc", 1300, P)] },
    { make: "Suzuki", model: "Baleno", engines: [V("1.3L", 1300, P), V("1.6L", 1600, P)] },
    { make: "Suzuki", model: "Liana", engines: [V("1.3L", 1300, P)] },
    { make: "Suzuki", model: "Jimny", engines: [{ label: "4WD \u00b7 1.5L K15B Petrol", cc: 1500, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, V("1.3L", 1300, P)] },
    { make: "Suzuki", model: "Vitara", engines: [V("1.6L", 1600, P)] },

    // ------------------------------------------------------------ Toyota
    { make: "Toyota", model: "Corolla", engines: [{ label: "GLi \u00b7 1.3L 2NZ Petrol", cc: 1300, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "XLi \u00b7 1.3L 2NZ Petrol", cc: 1300, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "Altis \u00b7 1.6L 1ZR Petrol", cc: 1600, fuel: "petrol", fit: ["MF 85L/R", "A 90"] }, { label: "Altis Grande \u00b7 1.8L 2ZR Petrol", cc: 1800, fuel: "petrol", fit: ["MF 90", "A 99"] }, V("2.0L Diesel", 2000, D)] },
    { make: "Toyota", model: "Corolla Cross", engines: [{ label: "Hybrid \u00b7 1.8L Hybrid", cc: 1800, fuel: "petrol", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Toyota", model: "Yaris", engines: [{ label: "GLi \u00b7 1.3L 2NR Petrol", cc: 1300, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "ATIV X \u00b7 1.5L 2NR Petrol", cc: 1500, fuel: "petrol", fit: ["MF 85L/R", "A 90"] }] },
    { make: "Toyota", model: "Vitz", engines: [V("1.0L", 1000, P)] },
    { make: "Toyota", model: "Passo", engines: [V("1.0L", 1000, P)] },
    { make: "Toyota", model: "Aqua", engines: [V("1.5L Hybrid", 1500, P, H)] },
    { make: "Toyota", model: "Prius", engines: [V("1.8L Hybrid", 1800, P, H)] },
    { make: "Toyota", model: "Hilux", engines: [{ label: "Revo Single Cabin \u00b7 2.8L 1GD Diesel", cc: 2800, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }, { label: "Revo Rocco \u00b7 2.8L 1GD Diesel", cc: 2800, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }, { label: "Revo GR Sport \u00b7 2.8L 1GD Diesel", cc: 2800, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }, V("2.4L Diesel", 2400, D), V("2.5L Diesel", 2500, D), V("3.0L Diesel", 3000, D), V("2.7L Petrol", 2700, P)] },
    { make: "Toyota", model: "Fortuner", engines: [{ label: "V \u00b7 2.7L 2TR Petrol", cc: 2700, fuel: "petrol", fit: ["MF 120", "A 120Z/ZL"] }, { label: "Legender \u00b7 2.8L 1GD Diesel", cc: 2800, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }, { label: "Sigma 4 \u00b7 2.8L 1GD Diesel", cc: 2800, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "Toyota", model: "Land Cruiser Prado", engines: [{ label: "2.7L 2TR Petrol", cc: 2700, fuel: "petrol", fit: ["MF 120", "A 120Z/ZL"] }, { label: "3.0L 1KD Diesel", cc: 3000, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }, V("2.8L Diesel", 2800, D)] },
    { make: "Toyota", model: "Hiace", engines: [V("2.7L Petrol", 2700, P), V("3.0L Diesel", 3000, D)] },

    // ------------------------------------------------------------ Honda
    { make: "Honda", model: "City", engines: [V("1.2L", 1200, P), V("1.3L", 1300, P), V("1.5L", 1500, P)] },
    { make: "Honda", model: "Civic", engines: [V("1.5L Turbo", 1500, P), V("1.8L", 1800, P)] },
    { make: "Honda", model: "BR-V", engines: [V("1.5L", 1500, P)] },
    { make: "Honda", model: "HR-V", engines: [V("1.5L", 1500, P), V("1.5L e:HEV Hybrid", 1500, P, H)] },
    { make: "Honda", model: "Vezel", engines: [V("1.5L Hybrid", 1500, P, H)] },

    // ------------------------------------------------------------ KIA
    { make: "KIA", model: "Picanto", engines: [V("1.0L", 1000, P)] },
    { make: "KIA", model: "Stonic", engines: [V("1.4L", 1400, P, DIN)] },
    { make: "KIA", model: "Sportage", engines: [V("2.0L", 2000, P, DIN), V("1.6L Turbo Hybrid", 1600, P, H)] },
    { make: "KIA", model: "Sorento", engines: [V("2.4L", 2400, P, DIN), V("3.5L V6", 3500, P, DIN)] },
    { make: "KIA", model: "Carnival", engines: [V("3.5L V6", 3500, P, DIN)] },

    // ------------------------------------------------------------ Hyundai
    { make: "Hyundai", model: "Santro", engines: [V("1.0L", 1000, P)] },
    { make: "Hyundai", model: "Tucson", engines: [{ label: "AWD \u00b7 2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }, { label: "FWD \u00b7 2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, V("2.0L", 2000, P, DIN)] },
    { make: "Hyundai", model: "Elantra", engines: [{ label: "1.6L Petrol", cc: 1600, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, V("1.6L", 1600, P, DIN), V("2.0L", 2000, P, DIN)] },
    { make: "Hyundai", model: "Sonata", engines: [{ label: "2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "2.5L Petrol", cc: 2500, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }, V("2.0L", 2000, P, DIN), V("2.5L", 2500, P, DIN)] },
    { make: "Hyundai", model: "Porter (pickup)", engines: [V("2.5L Diesel", 2500, D)] },
    { make: "Hyundai", model: "Shehzore (truck)", engines: [V("2.6L Diesel", 2600, D)] },

    // ------------------------------------------------------------ Changan
    { make: "Changan", model: "Alsvin", engines: [{ label: "1.37L Petrol", cc: 1370, fuel: "petrol", fit: ["MF 70L", "A 65L"], note: "Your vehicle uses thin terminal posts. Ask the dealer for the MF 70 with matching posts." }, { label: "DCT \u00b7 1.5L Petrol", cc: 1500, fuel: "petrol", fit: ["MF 70L", "A 70L/R"], note: "Your vehicle uses thick terminal posts. Ask the dealer for the MF 70 with matching posts." }, V("1.3L", 1300, P), V("1.5L", 1500, P)] },
    { make: "Changan", model: "Karvaan", engines: [V("1.0L", 1000, P)] },
    { make: "Changan", model: "Oshan X7", engines: [{ label: "Comfort \u00b7 1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "FutureSense \u00b7 1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, V("1.5L Turbo", 1500, P, DIN)] },

    // ------------------------------------------------------------ others
    { make: "Daihatsu", model: "Mira", engines: [V("660cc", 660, P)] },
    { make: "Daihatsu", model: "Move", engines: [V("660cc", 660, P)] },
    { make: "Daihatsu", model: "Cuore", engines: [V("850cc", 850, P)] },
    { make: "Daihatsu", model: "Hijet", engines: [V("660cc", 660, P)] },
    { make: "MG", model: "HS", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "1.5L Turbo PHEV", cc: 1500, fuel: "petrol", cls: "aux", fit: ["MF 90"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "MG", model: "ZS", engines: [{ label: "1.5L Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Haval", model: "H6", engines: [{ label: "2WD \u00b7 1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "AWD \u00b7 2.0L Turbo Petrol", cc: 2000, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }, { label: "HEV \u00b7 1.5L Hybrid", cc: 1500, fuel: "petrol", cls: "aux", fit: ["MF 90"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Haval", model: "Jolion", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "HEV \u00b7 1.5L Hybrid", cc: 1500, fuel: "petrol", cls: "aux", fit: ["MF 85L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Proton", model: "Saga", engines: [V("1.3L", 1300, P)] },
    { make: "Proton", model: "X70", engines: [V("1.8L Turbo", 1800, P, DIN)] },
    { make: "Peugeot", model: "2008", engines: [V("1.6L", 1600, P, DIN)] },
    { make: "FAW", model: "V2", engines: [V("1.3L", 1300, P)] },
    { make: "FAW", model: "Carrier (pickup)", engines: [V("1.0L", 1000, P)] },
    { make: "Prince", model: "Pearl", engines: [V("800cc", 800, P)] },
    { make: "United", model: "Bravo", engines: [V("800cc", 800, P)] },
    { make: "DFSK", model: "Glory 580", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "Pro \u00b7 1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "Isuzu", model: "D-Max", engines: [{ label: "Hi-Spark Single Cabin \u00b7 2.5L 4JA1 Diesel", cc: 2500, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }, { label: "V-Cross Double Cabin \u00b7 3.0L 4JJ1 Diesel", cc: 3000, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },

    // ------------------------------------------------------------ from Alaska's vehicle fitment chart (Oct 2026)
    { make: "Al-Ghazi (New Holland)", model: "Ghazi 65HP", engines: [{ label: "2.9L 65HP Diesel", cc: 2900, fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL", "MF 120"] }] },
    { make: "Al-Ghazi (New Holland)", model: "NH 480", engines: [{ label: "2.7L 55HP Diesel", cc: 2700, fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL", "MF 120"] }] },
    { make: "Al-Ghazi (New Holland)", model: "NH 640", engines: [{ label: "3.7L 75HP Diesel", cc: 3700, fuel: "diesel", cls: "tractor", fit: ["A 130", "MF 125"] }] },
    { make: "Al-Ghazi (New Holland)", model: "NH Dabung 85HP", engines: [{ label: "3.9L 85HP Diesel", cc: 3900, fuel: "diesel", cls: "tractor", fit: ["A 140", "MF 125"] }] },
    { make: "Ankai Bus", model: "Green Electric BRT Bus", engines: [{ label: "Electric EV Bus", fuel: "electric", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Ankai Bus", model: "HFF6120 Luxury Bus", engines: [{ label: "8.9L Yuchai Diesel", cc: 8900, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "BAIC", model: "BJ40 Plus Off-Roader", engines: [{ label: "2.0L Turbo Petrol", cc: 2000, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }] },
    { make: "BAIC", model: "D20 Hatchback", engines: [{ label: "1.3L Petrol", cc: 1300, fuel: "petrol", fit: ["MF 75L/R", "A 70L/R"] }] },
    { make: "BAIC", model: "X25 Crossover", engines: [{ label: "1.5L Petrol", cc: 1500, fuel: "petrol", fit: ["MF 85L/R", "A 75L/R"] }] },
    { make: "Belarus Tractors", model: "MTZ 50", engines: [{ label: "55HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 130"] }] },
    { make: "Belarus Tractors", model: "MTZ 510", engines: [{ label: "57HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 130"] }] },
    { make: "Belarus Tractors", model: "MTZ 80", engines: [{ label: "80HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 140"] }] },
    { make: "BYD", model: "Atto 3 EV", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R", "A 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "BYD", model: "Seal EV", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "BYD", model: "Sealion 6 PHEV", engines: [{ label: "1.5L PHEV", cc: 1500, fuel: "petrol", cls: "aux", fit: ["MF 85L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Changan", model: "Deepal", engines: [{ label: "L07 \u00b7 Electric EV", fuel: "electric", cls: "aux", fit: ["MF 85L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }, { label: "S07 \u00b7 Electric EV", fuel: "electric", cls: "aux", fit: ["MF 85L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Changan", model: "Karvaan MPV", engines: [{ label: "1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 70L", "A 65L"], note: "Your vehicle uses thin terminal posts. Ask the dealer for the MF 70 with matching posts." }] },
    { make: "Changan", model: "M9 Sherpa Pickup", engines: [{ label: "1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 70L", "A 65L"], note: "Your vehicle uses thin terminal posts. Ask the dealer for the MF 70 with matching posts." }] },
    { make: "Chery", model: "Tiggo 4 Pro", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "Chery", model: "Tiggo 8 Pro", engines: [{ label: "PHEV \u00b7 1.5L Turbo PHEV", cc: 1500, fuel: "petrol", cls: "aux", fit: ["MF 90"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }, { label: "1.6L Turbo Petrol", cc: 1600, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }] },
    { make: "Daehan", model: "Shehzore Commercial Pickup", engines: [{ label: "2.6L Hyundai Diesel", cc: 2600, fuel: "diesel", fit: ["MF 115", "A 115Z/ZL"] }] },
    { make: "Daewoo Express", model: "BH116 Luxury Bus", engines: [{ label: "11.0L DE12T Diesel", cc: 11000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "Daewoo Express", model: "G3 Urban Bus", engines: [{ label: "8.1L Doosan Diesel", cc: 8100, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "DFSK", model: "K01 Pickup Loader", engines: [{ label: "1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 75L/R", "A 70L/R"] }] },
    { make: "DFSK", model: "Prince C37 Van", engines: [{ label: "1.3L Petrol", cc: 1300, fuel: "petrol", fit: ["MF 75L/R", "A 70L/R"] }] },
    { make: "DFSK", model: "Seres 3 EV", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Dongfeng", model: "Captain C Light Truck", engines: [{ label: "3.0L Nissan Diesel", cc: 3000, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "Dongfeng", model: "DF 420 Heavy Prime Mover", engines: [{ label: "11.0L Cummins Diesel", cc: 11000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "Dongfeng", model: "KX 480 Prime Mover", engines: [{ label: "13.0L Cummins Diesel", cc: 13000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 270"] }] },
    { make: "FAW", model: "J5M Prime Mover", engines: [{ label: "8.6L FAW Diesel", cc: 8600, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "FAW", model: "J6P Heavy Tractor", engines: [{ label: "11.0L FAW Diesel", cc: 11000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 260"] }] },
    { make: "FAW", model: "Tiger V Light Truck", engines: [{ label: "3.8L Cummins Diesel", cc: 3800, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "Foton YTO", model: "YTO 404", engines: [{ label: "40HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL"] }] },
    { make: "Foton YTO", model: "YTO 804", engines: [{ label: "80HP 4WD Diesel", fuel: "diesel", cls: "tractor", fit: ["A 130"] }] },
    { make: "Foton", model: "Tunland Double Cabin Pickup", engines: [{ label: "2.8L Cummins Diesel", cc: 2800, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "GWM Ora", model: "Ora 03 EV", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "GWM Tank", model: "Tank 300 Off-Roader", engines: [{ label: "2.0L Turbo Petrol", cc: 2000, fuel: "petrol", fit: ["MF 115", "A 120Z/ZL"] }] },
    { make: "GWM Tank", model: "Tank 500 HEV", engines: [{ label: "2.0L Turbo Hybrid", cc: 2000, fuel: "petrol", cls: "aux", fit: ["MF 120"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability. This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Hino", model: "300 Series Duty Truck", engines: [{ label: "4.0L N04C Diesel", cc: 4000, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "Hino", model: "500 Series FG Truck", engines: [{ label: "7.7L J08E Diesel", cc: 7700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Hino", model: "500 Series FM Heavy Truck", engines: [{ label: "10.5L E13C Diesel", cc: 10500, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "Hino", model: "AK8J Premium Bus", engines: [{ label: "7.7L J08E Diesel", cc: 7700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "Hino", model: "FM1J City Bus", engines: [{ label: "8.0L Diesel", cc: 8000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Hino", model: "Kazay AK1J Bus", engines: [{ label: "8.0L J08C Diesel", cc: 8000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Hyundai", model: "County Bus", engines: [{ label: "3.9L D4GA Diesel", cc: 3900, fuel: "diesel", cls: "truck-light", flags: ["24v"], fit: ["A 120Z/ZL"] }] },
    { make: "Hyundai", model: "Porter H-100 Deck Pickup", engines: [{ label: "2.6L D4BB Diesel", cc: 2600, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "Hyundai", model: "Santa Fe HEV Hybrid", engines: [{ label: "1.6L Turbo Hybrid", cc: 1600, fuel: "petrol", cls: "aux", fit: ["MF 90"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Hyundai", model: "Universe Luxury Bus", engines: [{ label: "12.7L Powertec Diesel", cc: 12700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "Isuzu", model: "FTR Medium Heavy Truck", engines: [{ label: "7.8L 6HK1 Diesel", cc: 7800, fuel: "diesel", cls: "truck-light", flags: ["24v"], fit: ["A 130"] }] },
    { make: "Isuzu", model: "FVR Heavy Cargo Truck", engines: [{ label: "7.8L 6HK1 Diesel", cc: 7800, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Isuzu", model: "MT133 City Bus", engines: [{ label: "7.8L 6HH1 Diesel", cc: 7800, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Isuzu", model: "NKR Light Truck", engines: [{ label: "3.0L 4JH1 Diesel", cc: 3000, fuel: "diesel", cls: "truck-light", flags: ["24v"], fit: ["A 120Z/ZL"] }] },
    { make: "Isuzu", model: "NPR Medium Truck", engines: [{ label: "4.6L 4HG1 Diesel", cc: 4600, fuel: "diesel", cls: "truck-light", flags: ["24v"], fit: ["A 120Z/ZL"] }] },
    { make: "Isuzu", model: "NQR Coastline Bus", engines: [{ label: "4.6L 4HG1 Diesel", cc: 4600, fuel: "diesel", cls: "truck-light", flags: ["24v"], fit: ["A 130"] }] },
    { make: "JAC Motors", model: "N55 Light Duty Truck", engines: [{ label: "2.8L JAC Diesel", cc: 2800, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "JAC Motors", model: "N75 Medium Duty Truck", engines: [{ label: "3.8L Cummins Diesel", cc: 3800, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "JAC Motors", model: "T6 Double Cabin Pickup", engines: [{ label: "2.0L CTI Diesel", cc: 2000, fuel: "diesel", fit: ["MF 120", "A 120Z/ZL"] }] },
    { make: "JAC Motors", model: "T8 Double Cabin Pickup", engines: [{ label: "2.0L CTI Diesel", cc: 2000, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "JAC Motors", model: "X200 Commercial Loader", engines: [{ label: "2.8L Diesel", cc: 2800, fuel: "diesel", fit: ["MF 115", "A 115Z/ZL"] }] },
    { make: "Jaecoo", model: "J7 Crossover", engines: [{ label: "1.6L Turbo Petrol", cc: 1600, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }] },
    { make: "Jetour", model: "Dashing Crossover", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "Jetour", model: "T2 Off-Roader", engines: [{ label: "2.0L Turbo Petrol", cc: 2000, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }] },
    { make: "Jetour", model: "X70 Plus 7-Seater", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "JW Forland", model: "Bravo Loader Pickup", engines: [{ label: "1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 75L/R", "A 70L/R"] }] },
    { make: "JW Forland", model: "Safari Loader Pickup", engines: [{ label: "1.8L Diesel", cc: 1800, fuel: "diesel", fit: ["MF 85L/R", "A 75L/R"] }] },
    { make: "Kia", model: "Grand Carnival 3.5L V6", engines: [{ label: "3.5L Petrol", cc: 3500, fuel: "petrol", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "Kia", model: "Picanto", engines: [{ label: "AT \u00b7 1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 60L|MF 60R", "A 60L/R"] }, { label: "MT \u00b7 1.0L Petrol", cc: 1000, fuel: "petrol", fit: ["MF 55", "A 60L/R"] }] },
    { make: "Kia", model: "Sorento", engines: [{ label: "2.4L Petrol", cc: 2400, fuel: "petrol", fit: ["MF 120", "A 120Z/ZL"] }, { label: "3.5L Petrol", cc: 3500, fuel: "petrol", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "Kia", model: "Sportage", engines: [{ label: "AWD \u00b7 2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 95Z", "A 115Z/ZL"] }, { label: "Alpha \u00b7 2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }, { label: "FWD \u00b7 2.0L Petrol", cc: 2000, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "Kia", model: "Stonic", engines: [{ label: "EX \u00b7 1.4L Petrol", cc: 1400, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }, { label: "EX Plus \u00b7 1.4L Petrol", cc: 1400, fuel: "petrol", fit: ["MF 75L/R", "A 75L/R"] }] },
    { make: "King Long", model: "XMQ6127 Luxury Bus", engines: [{ label: "8.9L Cummins Diesel", cc: 8900, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "King Long", model: "XMQ6900 Medium Bus", engines: [{ label: "6.7L Yuchai Diesel", cc: 6700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Massey Ferguson (Millat)", model: "MF 240", engines: [{ label: "2.5L 50HP Diesel", cc: 2500, fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL", "MF 120"] }] },
    { make: "Massey Ferguson (Millat)", model: "MF 260", engines: [{ label: "2.5L 60HP Diesel", cc: 2500, fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL", "MF 120"] }] },
    { make: "Massey Ferguson (Millat)", model: "MF 375", engines: [{ label: "3.9L 75HP Diesel", cc: 3900, fuel: "diesel", cls: "tractor", fit: ["A 130", "MF 125"] }] },
    { make: "Massey Ferguson (Millat)", model: "MF 385 2WD", engines: [{ label: "4.1L 85HP Diesel", cc: 4100, fuel: "diesel", cls: "tractor", fit: ["A 130", "MF 125"] }] },
    { make: "Massey Ferguson (Millat)", model: "MF 385 4WD", engines: [{ label: "4.1L 85HP Turbo Diesel", cc: 4100, fuel: "diesel", cls: "tractor", fit: ["A 140", "MF 125"] }] },
    { make: "Master Foton", model: "Auman Heavy Duty Truck", engines: [{ label: "11.8L Cummins Diesel", cc: 11800, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "Master Foton", model: "BJ6123 City Bus", engines: [{ label: "6.7L Cummins Diesel", cc: 6700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"] }] },
    { make: "Master Foton", model: "Forland Alpha Truck", engines: [{ label: "2.8L Isuzu Diesel", cc: 2800, fuel: "diesel", fit: ["MF 115", "A 115Z/ZL"] }] },
    { make: "MG", model: "GT", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "MG", model: "MG 4", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 75L/R"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Omoda", model: "Omoda C5 Crossover", engines: [{ label: "1.5L Turbo Petrol", cc: 1500, fuel: "petrol", fit: ["MF 90", "A 95Z/ZL"] }] },
    { make: "Omoda", model: "Omoda E5 EV", engines: [{ label: "Electric EV", fuel: "electric", cls: "aux", fit: ["MF 90"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Orient Tractors", model: "IMT 540", engines: [{ label: "42HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL"] }] },
    { make: "Orient Tractors", model: "IMT 558", engines: [{ label: "58HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL"] }] },
    { make: "Qingqi", model: "Cargo Loader 150cc", engines: [{ label: "150cc Petrol", cc: 150, fuel: "petrol", cls: "three-wheeler", fit: ["MF 50", "Solar-50"] }] },
    { make: "Sazgar", model: "Cargo Loader 200cc", engines: [{ label: "200cc 4-Stroke Petrol", cc: 200, fuel: "petrol", cls: "three-wheeler", fit: ["MF 50", "Solar-50"] }] },
    { make: "Sazgar", model: "Passenger Rickshaw 200cc", engines: [{ label: "200cc 4-Stroke Petrol", cc: 200, fuel: "petrol", cls: "three-wheeler", fit: ["MF 50", "Solar-50"] }] },
    { make: "Shacman", model: "F3000 Tipper Truck", engines: [{ label: "9.7L Weichai Diesel", cc: 9700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "Shacman", model: "X3000 Heavy Prime Mover", engines: [{ label: "12.0L Weichai Diesel", cc: 12000, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 270"] }] },
    { make: "SinoTruck HOWO", model: "HOWO 371 Dump Truck", engines: [{ label: "9.7L WD615 Diesel", cc: 9700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },
    { make: "SinoTruck HOWO", model: "HOWO A7 Prime Mover", engines: [{ label: "11.6L D12 Diesel", cc: 11600, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 270"] }] },
    { make: "Sunlong Bus", model: "SLK6120 Luxury Coach", engines: [{ label: "8.9L Cummins Diesel", cc: 8900, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "Toyota", model: "Coaster", engines: [{ label: "High Roof \u00b7 4.2L 1HD Turbo Diesel", cc: 4200, fuel: "diesel", fit: ["A 130", "MF 125"] }, { label: "Standard \u00b7 4.0L 1HZ Diesel", cc: 4000, fuel: "diesel", fit: ["MF 125"], note: "Alaska's fitment chart also lists the A 125 Z/ZL (dry charge) for this vehicle. Ask an Alaska partner about availability." }] },
    { make: "Toyota", model: "Land Cruiser", engines: [{ label: "LC 300 \u00b7 3.5L Twin Turbo Petrol", cc: 3500, fuel: "petrol", fit: ["MF 125", "A 130"] }] },
    { make: "Ursus Tractors", model: "Ursus 2812", engines: [{ label: "38HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL"] }] },
    { make: "Ursus Tractors", model: "Ursus 3512", engines: [{ label: "50HP Diesel", fuel: "diesel", cls: "tractor", fit: ["A 120Z/ZL"] }] },
    { make: "Yutong", model: "ZK6118EG City Bus", engines: [{ label: "Electric EV Bus", fuel: "electric", cls: "truck-heavy", flags: ["24v"], fit: ["A 180"], note: "This is the 12 V auxiliary battery, not the high-voltage traction battery." }] },
    { make: "Yutong", model: "ZK6122H Master Luxury Bus", engines: [{ label: "8.9L Cummins Diesel", cc: 8900, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 200"] }] },
    { make: "Yutong", model: "ZK6128H Intercity Bus", engines: [{ label: "9.7L Weichai Diesel", cc: 9700, fuel: "diesel", cls: "truck-heavy", flags: ["24v"], fit: ["A 230"] }] },

    // ------------------------------------------------------------ commercial & agricultural
    { make: "Truck & Bus", model: "Light truck / mini-bus (24 V)", engines: [V("Diesel, 24 V system", 4000, D, { cls: "truck-light", flags: ["24v"] })] },
    { make: "Truck & Bus", model: "Heavy truck / bus (24 V)", engines: [V("Diesel, 24 V system", 8000, D, { cls: "truck-heavy", flags: ["24v"] })] },
  ];

  const data = { VEHICLES };
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.ALASKA_VEHICLES = VEHICLES;
})(typeof self !== "undefined" ? self : this);
