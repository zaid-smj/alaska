// This would ideally live in js/data.js
const dealers = [
  {
    name: "Baoo Jee Enterprises - Faisalabad",
    address: "Shop#77, Shoaib Bilal Market, Opp Mian Trust Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0324-6697095",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d27236.377910279356!2d73.0561471!3d31.4265982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392243003ce41849%3A0x68af7da23a1260e3!2sBao%20Gee%20Battery%20Center!5e0!3m2!1sen!2s!4v1771479601960!5m2!1sen!2s",
  },
  {
    name: "Imtiaz Traders - Faisalabad",
    address: "88-A Basement, Shoaib Bilal Market, Opp Commisioner Road,Faisalabad.",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0300-9660830",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d212.78291460228772!2d73.091338!3d31.4271657!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3922682131ab0a03%3A0x1a3fc4565c7f1d41!2sImtiaz%20Ahmed%20%26%20Javed%20Traders!5e0!3m2!1sen!2s!4v1771618716455!5m2!1sen!2s",
  },
  {
    name: "Rohan Traders - Faisalabad",
    address: "216-A, Shoaib Bilal Market, Opposite General Bus Stand, Sargodha Raod Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0333-9944940",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d851.134850855405!2d73.0914854!3d31.426814!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226821401ead95%3A0x2081cc971f3f0b92!2sShoaib%20Bilal%20Market!5e0!3m2!1sen!2s!4v1771618887077!5m2!1sen!2s",
  },
  {
    name: "Shahid Battery Center - Faisalabad",
    address: "Shop #1, Mian Trust Market, Opposite Khidmat Markaz, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0304-4111268",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.559434696852!2d73.09224329999999!3d31.4262623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392243007ad80a2b%3A0xe13f7034cf55dd2c!2sShahid%20Battery%20Center%20(Agency)!5e0!3m2!1sen!2s!4v1771618902265!5m2!1sen!2s",
  },
  {
    name: "Shahid Enterprises - Faisalabad",
    address: "Shop#138-A, Shoaib Bilal Market, Near Mian Trust Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0322-7661268",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d851.1374124140546!2d73.0918723!3d31.4265318!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226821401ead95%3A0x2081cc971f3f0b92!2sShoaib%20Bilal%20Market!5e0!3m2!1sen!2s!4v1771618917080!5m2!1sen!2s",
  },
  {
    name: "Adnan Battery Center - Tando Jan Muhammad",
    address: "Shop#3, Near Eid Gah, Jhado Road, Tando Jan Muhammad",
    city: "Tando Jan Muhammad",
    province: "SINDH",
    contact: "0301/0334-2556215",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.9459978733553!2d69.21325259999999!3d25.069819400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394e8d86b21225d3%3A0x4062add5d357c80e!2sAdnan%20battery%20centre!5e0!3m2!1sen!2s!4v1771618932278!5m2!1sen!2s",
  },
  {
    name: "MRP Traders - Hyderabad",
    address: "Shop#32-33 Mehran Commercial Market, Hyderabad",
    city: "Hyderabad",
    province: "SINDH",
    contact: "0313-6513390",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d901.2132075116978!2d68.35246289999999!3d25.3762484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c717be1377c29%3A0xd47b1a06e9bb841e!2sMRP%20TRADERS!5e0!3m2!1sen!2s!4v1771619094794!5m2!1sen!2s",
  },
  {
    name: "Abdul Hadi Battery Traders - Karachi",
    address: "Shop No 02, Main Razzaqabad Bus Stop, Bin Qasim, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0333-2153353/0306-2807021",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14478.745051232441!2d67.1678194!3d24.8745628!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb339a20ea9bb8f%3A0x44cc0edf52ba87c1!2sAbdul%20Hadi%20Battery%20Traders!5e0!3m2!1sen!2s!4v1771619160608!5m2!1sen!2s",
  },
  {
    name: "Battery Lab - Karachi",
    address: "Korangi#5-1/2, Sector 43/B, Opposite Jumma Bazar Ground, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0336-2546020/0321-3626962",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.1515792807836!2d67.1651621!3d24.824489399999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33bcdce243b89%3A0x7a70a4d68387521b!2sBattery%20lab!5e0!3m2!1sen!2s!4v1771619176070!5m2!1sen!2s",
  },
  {
    name: "Darbar Battery Service - Karachi",
    address: "Shop#197, Garden Takuna Market, Nishtar Road, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0321-3316771/0312-4912286",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.6221304927194!2d67.0215211!3d24.876752199999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f004182f7a7%3A0xe20bcb647b37b9f3!2sDarbar%20battery!5e0!3m2!1sen!2s!4v1771619188438!5m2!1sen!2s",
  },
  {
    name: "Hammad Battery Service - Karachi",
    address: "Shop#9, Near Navel Flates. Agra Taj Colony, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0334-3547835/0301-2600032",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.7821497112272!2d66.977605!3d24.871288999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb31500319d759f%3A0x8a1b74727cfd336f!2sHammad%20battery!5e0!3m2!1sen!2s!4v1771619201830!5m2!1sen!2s",
  },
  {
    name: "Karachi Kings Batteries - Karachi",
    address: "Shop#1, Near Babar Kanta, Bhens Colony More, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0312-1367979/0314-2001736",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.22677179287!2d67.2599228!3d24.856103299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb331001533f0dd%3A0xe762852d3b389d41!2sKarachi%20king%20battery!5e0!3m2!1sen!2s!4v1771619214630!5m2!1sen!2s",
  },
  {
    name: "M.S Battery & Solar - Karachi",
    address: "Shop#84, PNSC Flat Sector 15-A3, Buffer Zone Nagan Chowrangi, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0347-2024943",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.1324767198053!2d67.0655417!3d24.961606999999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb3410029fca9e1%3A0x7b5f6a4248ad38b!2sM.S%20battery%20and%20solar!5e0!3m2!1sen!2s!4v1771619234635!5m2!1sen!2s",
  },
  {
    name: "M/S Azmi Traders - Karachi",
    address: "Office#312, 3rd Floor Rafique Market Shorab Katrak Road Saddar Regal Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0321-2148726/0322-8229823/0316-2249258",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.147429712373!2d67.0258032!3d24.8588138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f6874cf81fd%3A0xbf00570f37a49233!2sAzmi%20Traders!5e0!3m2!1sen!2s!4v1771619251248!5m2!1sen!2s",
  },
  {
    name: "Madina Battery Services - Karachi",
    address: "S-3/97, Opposite Elementry Girls School, Suadabad, Malir Town, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0313-2029758/0306-8582990",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.9744010024183!2d67.2015749!3d24.8988548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33766e2b9c2cf%3A0x67c8ea5d1d2b60ff!2sMadina%20Battery%20Service!5e0!3m2!1sen!2s!4v1771619263191!5m2!1sen!2s",
  },
  {
    name: "Mustafa Battery - Karachi",
    address: "Shop#64, Iqra City Phase II, Abul Isphani Road, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-2378967",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.618620657673!2d67.09411469999999!3d24.945059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb339bb7c04aa41%3A0xd69de43634027507!2sMustafa%20battery%20%7C%20Daewoo%20AGS%20Osaka%20Tubular%20Deepcyle%20%26%20Dry%20MF%20Batteries.!5e0!3m2!1sen!2s!4v1771619280129!5m2!1sen!2s",
  },
  {
    name: "Rashid Traders - Karachi",
    address: "Shop#13, A-1, Heights, Nishter Road Garden, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0314-2288107",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.614186083567!2d67.02096379999999!3d24.877023400000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33fd7a26b7729%3A0xe1610315c849dab6!2sRashid%20Traders!5e0!3m2!1sen!2s!4v1771619292859!5m2!1sen!2s",
  },
  {
    name: "Rayyan Battery Services - Karachi",
    address: "Shop/Plot#02, Sector 32VE, Street#14, Nasir Jump, Korangi Town, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.2225282920017!2d67.1249375!3d24.822062499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33b7de677e4f1%3A0x82d5becd5ae634e9!2sRayyan%20Battery%20services!5e0!3m2!1sen!2s!4v1771619304527!5m2!1sen!2s",
  },
  {
    name: "Shahrukh Solar House - Karachi",
    address: "H.NO. L-S -54, SECTOR 1 D, MILLATABAD, COMMERCIAL AREA ORANGI TOWN, Karachi West",
    city: "Karachi",
    province: "SINDH",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.8040208473917!2d67.0114567!3d24.938745399999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb341804ba73833%3A0x7b2fd9e83ec24bff!2zU2hhaHJ1a2ggU29sYXIgSG91c2Ug2LTYp9uBINix2K4g2LPZiNmE2LEg24HYp9ik2LM!5e0!3m2!1sen!2s!4v1771619321667!5m2!1sen!2s",
  },
  {
    name: "Shamim Akhtar Battery Service - Karachi",
    address: "Shop#1/2, Plot C-554, Near Malir Bridge. Quaidabad Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0313-2280006",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.088865640466!2d67.20701!3d24.860814299999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb330bc03427fdb%3A0x6658826969e69a1!2sShamim%20Akhtar%20Battery%20Service!5e0!3m2!1sen!2s!4v1771619342156!5m2!1sen!2s",
  },
  {
    name: "Siddiq Battery Traders - Karachi",
    address: "Shop#9, Amin Plaza, Garden West, Nishtar Road, Garden West, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0331-2920465",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.587683627755!2d67.0218933!3d24.8779281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33fc6696d57e1%3A0x5fa609c3294100dd!2sSIDDIQ%20BATTERY%20TRADERS!5e0!3m2!1sen!2s!4v1771619354442!5m2!1sen!2s",
  },
  {
    name: "Sindh Battery Service - Karachi",
    address: "Shop No C -31, Sunley Arcade, Safoora Chowrangi ,Gulshan Town, Karachi East",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-2561392/0312-8734419",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3617.7404178162806!2d67.15430800000001!3d24.9409115!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33954df45d3b1%3A0x3c57703e3245428f!2sSindh%20Battery%20service!5e0!3m2!1sen!2s!4v1771619369325!5m2!1sen!2s",
  },
  {
    name: "Sohail & Hassan Battery - Karachi",
    address: "Shop#D-2/1, Ground Floor, Abid Square, Plot#ST-8/A/2 Block-7 F.B Area, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0334--3038434",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3618.0759101897143!2d67.067103!3d24.929483800000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f4fc020d6b5%3A0xc118f5dab436be9!2sSohail%20and%20Hassan%20Battery!5e0!3m2!1sen!2s!4v1771619386026!5m2!1sen!2s",
  },
  {
    name: "Zam Zam Batteries Traders - Karachi",
    address: "Shop#50, Defence Garden Appt Phase-1, Main Korangi Road, DHA Karachi.",
    city: "Karachi",
    province: "SINDH",
    contact: "0333-2388490/0305-1250601",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.546013570203!2d67.0552259!3d24.845194499999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0a057f31c7%3A0x98b33668e70b3!2sZam%20Zam%20Batteries%20Traders!5e0!3m2!1sen!2s!4v1771619398005!5m2!1sen!2s",
  },
  {
    name: "Haseeb Traders - Peshawar",
    address: "Shop No.1, Nasir Mension, shuba Bazar, Peshawar Peshawar",
    city: "Peshawar",
    province: "KPK",
    contact: "0313-9335533",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.3973211925486!2d71.5622745!3d34.008010899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917aabf6f51a3%3A0x5dda1fea99cf9e82!2sHaseeb%20traders!5e0!3m2!1sen!2s!4v1771619410036!5m2!1sen!2s",
  },
  {
    name: "Mian Battery Zone - Peshawar",
    address: "Shop#1, Awami Market Karkhanoo Peshawar",
    city: "Peshawar",
    province: "KPK",
    contact: "0302-9692112",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.793024851256!2d71.4252094!3d33.997849699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9118afc6a46b1%3A0xe55b7fd89b4d385d!2sMian%20Battery%20and%20Solar%20Zone!5e0!3m2!1sen!2s!4v1771619425949!5m2!1sen!2s",
  },
  {
    name: "Peshawar Battery Center - Nowshera",
    address: "Shop#21, Farooq Stadium Plaza, G.T Road, Nowshera Cantt",
    city: "Nowshera",
    province: "KPK",
    contact: "0301-8845317/0315-9231509",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4382624895084!2d72.0045177!3d34.006959699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ded30076819a79%3A0xf62d9e4bf97e66dc!2sPeshawar%20battery%20centre!5e0!3m2!1sen!2s!4v1771619439210!5m2!1sen!2s",
  },
  {
    name: "Ali & Company - Lahore",
    address: "391, Block D3, Main WAPDA Avenue, WAPDA Town, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0321-8262505",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1702.0191232673815!2d74.2722845!3d31.440614!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391901d8ffc491a1%3A0xe04661b71e578771!2sExide%20Quality%20Point%20%2F%20Ali%20%26%20Company!5e0!3m2!1sen!2s!4v1771619450438!5m2!1sen!2s",
  },
  {
    name: "Ittefaq Battery House - Nankana Sahib",
    address: "Shop# 1979, Near Admore Pump, Lorry Adda Mangtanwala Road, Nankana Sahib",
    city: "Nankana Sahib",
    province: "PUNJAB",
    contact: "0300-8035716",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.5935514797025!2d73.71300149999999!3d31.4528547!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39188f06d57ee88d%3A0xaf3a38236a18ad80!2sITTEFAQ%20BATTERY%20HOUSE!5e0!3m2!1sen!2s!4v1771619462500!5m2!1sen!2s",
  },
  {
    name: "Muhammadi Battery & Oil Traders - Lahore",
    address: "P-334 Block-6 B-01, Town Ship Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0323-1234562",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3403.438629015674!2d74.3080985!3d31.457118100000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3919014baaaaaaab%3A0x7431f0f30d835f8!2sMuhammadi%20Battery%20and%20solar%20solution%20(MSS)!5e0!3m2!1sen!2s!4v1771619474499!5m2!1sen!2s",
  },
  {
    name: "New Rajput Battery - Lahore",
    address: "Shop#23, Montgomary Road, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0321-0521000/0323-7104079",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d849.8644807735085!2d74.3268567!3d31.5664882!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39191b4e9e6d4a17%3A0x4c1ae991799e244b!2sRajput%20Battery!5e0!3m2!1sen!2s!4v1771619494736!5m2!1sen!2s",
  },
  {
    name: "Sajjad Battery House - Lahore",
    address: "Shop# E/193/2, Bank Stop Main Walton Road, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0321-4367254",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.305219008857!2d74.36844169999999!3d31.4882933!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391905cfd839c8f3%3A0xe16832fe52086502!2sSajjad%20battery%20House!5e0!3m2!1sen!2s!4v1771619506885!5m2!1sen!2s",
  },
  {
    name: "Umer Battery Service - Lahore",
    address: "Shop#35, Street#9, New Iqbal Park, Opposite Adil Hospital, DHA, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0300-9415522",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3402.291855756225!2d74.3794307!3d31.488660699999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391905dd241eafd5%3A0x5f3bde32ac67897b!2sUmer%20Battery%20Service!5e0!3m2!1sen!2s!4v1771619520970!5m2!1sen!2s",
  },
  {
    name: "Zeb Battery Center - Lahore",
    address: "42 Aziz Road, Misri Shah Opposite WASA office, Chowk Nakhuds, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0300-9045551",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3398.7324504588723!2d74.3350423!3d31.586383999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39191b46ff660619%3A0x9c5a4c961f1cd6c0!2sZeb%20battery!5e0!3m2!1sen!2s!4v1771619533469!5m2!1sen!2s",
  },
  {
    name: "Al-Nawaz Traders - Multan",
    address: "Shop#1,Volta Market, Vehari Chowk, Multan",
    city: "Multan",
    province: "PUNJAB",
    contact: "0333-6105632",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3449.193935884641!2d71.5074692!3d30.1744536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b37f6aed78adf%3A0xe407d1b525d51245!2sAlnawaz%20Traders!5e0!3m2!1sen!2s!4v1771619546742!5m2!1sen!2s",
  },
  {
    name: "Anoosh And Shafel Traders - Rawalpindi",
    address: "Shop#4 Pindi Cricket Stadium Road, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "0333-5297132",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.1582012985727!2d73.0715625!3d33.6530625!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df953bea99d71f%3A0x447852db3e06bc9d!2sAnoosh%20and%20Shafel%20Traders!5e0!3m2!1sen!2s!4v1771619566936!5m2!1sen!2s",
  },
  {
    name: "ASR Traders and Builders Private Limited",
    address: "Office#05, Prime Center Farooq Market, G-13/3, Islamabad",
    city: "Islamabad",
    province: "PUNJAB",
    contact: "0346-7863132/0335-5226667",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.066328700612!2d72.9633664!3d33.6554432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df97000908b8ef%3A0xbcff7040d42d7f86!2sASR%20Traders%20and%20Builders%20pvt%20Ltd!5e0!3m2!1sen!2s!4v1771619582002!5m2!1sen!2s",
  },
  {
    name: "Hafiz Battery Center - Talagang",
    address: "Shop#3, Sunny Market, Mianwali Road, Near Chowk Siddiqabad, Talagang",
    city: "Talagang",
    province: "PUNJAB",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3349.044235348985!2d72.39855610000001!3d32.923429500000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392095b92f0e4a57%3A0x8ef095de3215b9e9!2sHAFIZ%20BATTERY%20CENTER!5e0!3m2!1sen!2s!4v1771619595048!5m2!1sen!2s",
  },
  {
    name: "Ikram Battery Center - Ternol",
    address: "Shop#29-A Chaudhary Ayoub Market ( Bank Islami Market) G.T Road, Ternol, Islamabad",
    city: "Islamabad",
    province: "PUNJAB",
    contact: "0333-5189023",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.1083429784644!2d72.90809689999999!3d33.6543545!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df97fcf2c35665%3A0x99c19a17b3c42f35!2sIkram%20Battery%20Center!5e0!3m2!1sen!2s!4v1771619606739!5m2!1sen!2s",
  },
  {
    name: "Irfan Battery Centre - Rawalpindi",
    address: "Shop#4324-A, Main Road Daryaabad, Gowalmandi, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "0336-0530520/0311-1519535",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.0290970424003!2d73.05735039999999!3d33.6045495!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df950058aecd6d%3A0x5b342e2fafc6a6f5!2sIrfan%20Battery%20Centre!5e0!3m2!1sen!2s!4v1771619618602!5m2!1sen!2s",
  },
  {
    name: "Melody Battery.Pk - Islamabad",
    address: "Shop No.03, Block.5, Sector.G-6 Markaz,Melody Market, Islamabad",
    city: "Islamabad",
    province: "PUNJAB",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3318.70129534571!2d73.08481929999999!3d33.7166774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfbfe54ed74cb7%3A0xe2aa3da8419c770d!2sMelody%20Battery.PK!5e0!3m2!1sen!2s!4v1771619633195!5m2!1sen!2s",
  },
  {
    name: "Pak Japan Battery Centre - Islamabad",
    address: "Shop#55, Street#04, I-10/3 Auto Market Islamabad",
    city: "Islamabad",
    province: "PUNJAB",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d26569.80202138914!2d73.0287388!3d33.6513249!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dfed64bdb83203%3A0x952dfd25eceb2e23!2sAGS%20Pak%20Japan%20Battery!5e0!3m2!1sen!2s!4v1771619645502!5m2!1sen!2s",
  },
  {
    name: "Prince Battery Center - Rawalpindi",
    address: "Shop#3, Awami Plaza, National Market, Chandni Chowk, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "0317-7666507",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3321.955218768275!2d73.0687441!3d33.6324031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df95cf78cc885f%3A0xfa6205c2e890a5c6!2sPrince%20Battery%20Centre!5e0!3m2!1sen!2s!4v1771619657011!5m2!1sen!2s",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("dealerSearch");
  const provinceSelect = document.getElementById("provinceFilter");
  const dealerList = document.getElementById("dealerList");
  const dealerCount = document.getElementById("dealerCount");
  const dealerCountDisplay = document.getElementById("dealerCountDisplay");

  function renderDealers(data) {
    dealerList.innerHTML = "";
    dealerCount.innerText = data.length;
    if (dealerCountDisplay) dealerCountDisplay.innerText = data.length;

    if (data.length === 0) {
      dealerList.innerHTML = `
                <div class="p-10 text-center border-2 border-dashed border-gray-100">
                    <p class="text-gray-400 font-black uppercase text-xs tracking-widest">No dealers found in this region</p>
                </div>`;
      return;
    }

    data.forEach((dealer) => {
      const card = document.createElement("div");
      card.className = "dealer-card bg-white border-2 border-gray-200 p-5 rounded-lg hover:border-[#c00d1e] hover:shadow-md transition-all group cursor-pointer";
      card.innerHTML = `
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="text-zinc-900 font-bold uppercase tracking-wide text-sm mb-2 group-hover:text-[#c00d1e] transition-colors">${dealer.name}</h4>
                        <p class="text-gray-600 text-xs font-medium leading-relaxed">${dealer.address}</p>
                    </div>
                    <span class="text-xs bg-gray-100 text-[#c00d1e] px-3 py-1 rounded-full font-bold uppercase ml-2 whitespace-nowrap">${dealer.province}</span>
                </div>
                <div class="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <a href="tel:${dealer.contact}" class="text-zinc-900 text-xs font-bold uppercase tracking-wide hover:text-[#c00d1e] transition-colors flex items-center gap-1">
                    <i class="fa-solid fa-phone text-[10px]"></i>
                    ${dealer.contact}
                  </a>
                  <span class="text-gray-300">|</span>
                  <button class="get-directions-btn text-[#c00d1e] text-xs font-semibold uppercase tracking-wide hover:underline">Get Directions</button>
                </div>
            `;
      dealerList.appendChild(card);

      // Add click handler to update map and scroll when card is clicked
      card.addEventListener("click", () => {
        // Use pin if available for more precise location
        if (dealer.pin) {
          updateMapLocationByPin(dealer.pin);
        } else {
          updateMapLocation(dealer.address);
        }
        scrollToSearchBar();
      });

      // Wire the Get Directions button separately so it doesn't trigger the card click
      const dirBtn = card.querySelector(".get-directions-btn");
      if (dirBtn) {
        dirBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (dealer.pin) {
            updateMapLocationByPin(dealer.pin);
          } else {
            updateMapLocation(dealer.address);
          }
          scrollToSearchBar();
        });
      }
    });
  }

  function filterDealers() {
    const term = searchInput.value.toLowerCase();
    const prov = provinceSelect.value;
    const provNorm = (prov || "").toLowerCase();

    const filtered = dealers.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(term) || d.address.toLowerCase().includes(term) || d.city.toLowerCase().includes(term) || d.province.toLowerCase().includes(term);
      const dProv = (d.province || "").toLowerCase();
      let matchesProv = false;
      if (prov === "All") {
        matchesProv = true;
      } else if (provNorm === "ict") {
        matchesProv = (d.city || "").toLowerCase().includes("islamabad") || dProv === provNorm;
      } else if (provNorm === "gilgit baltistan") {
        matchesProv = dProv.includes("gilgit");
      } else {
        matchesProv = dProv === provNorm;
      }
      return matchesSearch && matchesProv;
    });

    renderDealers(filtered);
  }

  searchInput.addEventListener("input", filterDealers);
  provinceSelect.addEventListener("change", filterDealers);

  // Clear button and suggestions
  const dealerClear = document.getElementById("dealerClear");
  const suggestionsBox = document.getElementById("dealer-suggestions");

  function updateSuggestions(term) {
    term = (term || "").toLowerCase().trim();
    if (!term) {
      suggestionsBox.classList.add("hidden");
      return;
    }

    const prov = provinceSelect.value;
    const provNorm = (prov || "").toLowerCase();

    const matches = dealers
      .filter((d) => {
        const matchesSearch = d.name.toLowerCase().includes(term) || d.address.toLowerCase().includes(term) || d.city.toLowerCase().includes(term) || d.province.toLowerCase().includes(term);
        const dProv = (d.province || "").toLowerCase();
        let matchesProv = false;
        if (prov === "All") {
          matchesProv = true;
        } else if (provNorm === "ict") {
          matchesProv = (d.city || "").toLowerCase().includes("islamabad") || dProv === provNorm;
        } else if (provNorm === "gilgit baltistan") {
          matchesProv = dProv.includes("gilgit");
        } else {
          matchesProv = dProv === provNorm;
        }
        return matchesSearch && matchesProv;
      })
      .slice(0, 8);

    if (matches.length === 0) {
      suggestionsBox.innerHTML = `<div class="p-3 text-gray-500 text-sm">No suggestions</div>`;
      suggestionsBox.classList.remove("hidden");
      return;
    }

    suggestionsBox.innerHTML = matches
      .map(
        (m) =>
          `<button type="button" class="w-full text-left px-4 py-2 hover:bg-gray-100 suggestion-item" data-value="${escapeHtml(
            m.name,
          )}"><div class="text-sm font-bold">${escapeHtml(m.name)}</div><div class="text-xs text-gray-500">${escapeHtml(m.city)} • ${escapeHtml(m.province)}</div></button>`,
      )
      .join("");

    suggestionsBox.classList.remove("hidden");
  }

  function escapeHtml(str) {
    return String(str).replace(/[&"'<>]/g, (s) => ({ "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" })[s]);
  }

  // Show/hide clear button
  function toggleClear() {
    if ((searchInput.value || "").trim()) {
      dealerClear.classList.remove("hidden");
    } else {
      dealerClear.classList.add("hidden");
    }
  }

  // Wire input to suggestions + clear button
  searchInput.addEventListener("input", function (e) {
    toggleClear();
    updateSuggestions(this.value);
  });

  dealerClear.addEventListener("click", function (e) {
    e.preventDefault();
    searchInput.value = "";
    toggleClear();
    suggestionsBox.classList.add("hidden");
    filterDealers();
    searchInput.focus();
  });

  // Delegate suggestion clicks
  suggestionsBox.addEventListener("click", function (e) {
    const btn = e.target.closest(".suggestion-item");
    if (!btn) return;
    const val = btn.getAttribute("data-value");
    if (val) {
      searchInput.value = val;
      toggleClear();
      suggestionsBox.classList.add("hidden");
      filterDealers();
    }
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest("#dealer-suggestions") && !e.target.closest("#dealerSearch")) {
      suggestionsBox.classList.add("hidden");
    }
  });

  // Update map location function
  function updateMapLocation(address) {
    const mapIframe = document.getElementById("dealerMap");
    const encodedAddress = encodeURIComponent(address);
    mapIframe.src = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  }

  // Set iframe source directly when an embed 'pin' URL is provided
  function updateMapLocationByPin(pinUrl) {
    const mapIframe = document.getElementById("dealerMap");
    if (!mapIframe) return;
    // If pinUrl already looks like an embed, use it directly; otherwise, set as query
    if (pinUrl.includes("google.com/maps/embed")) {
      mapIframe.src = pinUrl;
    } else {
      const encoded = encodeURIComponent(pinUrl);
      mapIframe.src = `https://maps.google.com/maps?q=${encoded}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // Scroll to search bar on desktop, map on mobile
  function scrollToSearchBar() {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const mapIframe = document.getElementById("dealerMap");
    const searchSection = document.querySelector(".max-w-7xl");

    if (isMobile && mapIframe) {
      mapIframe.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (searchSection) {
      searchSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Initial load
  renderDealers(dealers);
});
