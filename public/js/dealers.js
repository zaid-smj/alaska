/*
 * Alaska Batteries — authorised partner list (dealers.html)
 * Cleaned list: duplicates merged, map pins matched to the right shop, city and
 * province filled from each shop's map pin or name. Shops without a map pin use a
 * Google Maps search for their name and address. Shops with no phone number show
 * the Alaska head office number instead.
 */
const HEAD_OFFICE_PHONE = "+92 51 874 0280";
const dealers = [
 {
  "name": "ASR Traders and Builders Private Limited",
  "address": "Office#05, Prime Center Farooq Market, G-13/3, Islamabad",
  "city": "Islamabad",
  "province": "Islamabad",
  "contact": "0333-5297132",
  "map": "https://maps.google.com/maps?q=33.6554432,72.9633664&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6554432%2C72.9633664&query_place_id=ChIJ77gICQCX3zgRhn8t1EBw_7w"
 },
 {
  "name": "Ikram Battery Center - Ternol",
  "address": "Shop#29-A Chaudhary Ayoub Market ( Bank Islami Market) G.T Road, Ternol, Islamabad",
  "city": "Islamabad",
  "province": "Islamabad",
  "contact": "0336-0530520/0311-1519535",
  "map": "https://maps.google.com/maps?q=33.6543545,72.9080969&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6543545%2C72.9080969&query_place_id=ChIJZVbD8vyX3zgRNS_EsxeawZk"
 },
 {
  "name": "Melody Battery.Pk - Islamabad",
  "address": "Shop No.03, Block.5, Sector.G-6 Markaz,Melody Market, Islamabad",
  "city": "Islamabad",
  "province": "Islamabad",
  "contact": "",
  "map": "https://maps.google.com/maps?q=33.7166774,73.0848193&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.7166774%2C73.0848193&query_place_id=ChIJt0zXTuW_3zgRDXecQag9quI"
 },
 {
  "name": "Pak Japan Battery Centre - Islamabad",
  "address": "Shop#55, Street#04, I-10/3 Auto Market Islamabad",
  "city": "Islamabad",
  "province": "Islamabad",
  "contact": "0317-7666507",
  "map": "https://maps.google.com/maps?q=33.6535142,73.0417229&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6535142%2C73.0417229&query_place_id=ChIJAzK4vWTt3zgRIy7r7CX9LZU"
 },
 {
  "name": "Seven Star Electronics & Battery - Bajroh",
  "address": "Baee China, Bajaur",
  "city": "Baee China, Bajaur",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=34.7526005,71.4552824&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.7526005%2C71.4552824&query_place_id=ChIJoaM00qLH2zgRfKNd9iSff1I"
 },
 {
  "name": "Punjab Batteries Center - Bannu",
  "address": "Bannu",
  "city": "Bannu",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=32.9840971,70.6133919&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.9840971%2C70.6133919&query_place_id=ChIJW5a8YwAH2DgRbxbCGz6S2aM"
 },
 {
  "name": "Shehzad Battery Center DIKhan",
  "address": "Cantonment, Dera Ismail Khan",
  "city": "Dera Ismail Khan",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=31.8336673,70.9123018&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.8336673%2C70.9123018&query_place_id=ChIJj2I3UclvJjkRuYhVqOXXUHQ"
 },
 {
  "name": "Zahid Battery Center - D.I.Khan",
  "address": "Cantonment, Dera Ismail Khan",
  "city": "Dera Ismail Khan",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=31.8331311,70.912314&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.8331311%2C70.912314&query_place_id=ChIJRyDuyZ5vJjkR7XsKHClxBZk"
 },
 {
  "name": "Abbas Enterprises - Swat",
  "address": "Langar, Swat",
  "city": "Langar, Swat",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3270.611149615707!2d72.46353527575495!3d34.94128797283523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDU2JzI4LjYiTiA3MsKwMjcnNTguMCJF!5e0!3m2!1sen!2s!4v1780575735768!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.94128797283523,72.46353527575495"
 },
 {
  "name": "Abdul waheed khan",
  "address": "Matta, Swat",
  "city": "Matta, Swat",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3271.3929607774307!2d72.41343688964844!3d34.92168045043945!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dc3f4e2481cb33%3A0xaed1b55e9bb41550!2sAbdul%20waheed%20khan%20plaza!5e0!3m2!1sen!2s!4v1780923658086!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.92168045043945,72.41343688964844"
 },
 {
  "name": "Noor Traders - Kohat",
  "address": "Mir Ahmad Khalil, Kohat",
  "city": "Mir Ahmad Khalil, Kohat",
  "province": "Khyber Pakhtunkhwa",
  "contact": "0301-8845317/0315-9231509",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3324.9292739522853!2d71.45212937569524!3d33.55521387334818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDMzJzE4LjgiTiA3McKwMjcnMTYuOSJF!5e0!3m2!1sen!2s!4v1780724794505!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.55521387334818,71.45212937569524"
 },
 {
  "name": "Peshawar Battery Center - Nowshera",
  "address": "Shop#21, Farooq Stadium Plaza, G.T Road, Nowshera Cantt",
  "city": "Nowshera",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=34.0069597,72.0045177&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.0069597%2C72.0045177&query_place_id=ChIJeZqBdgDT3jgR3GZ--UueLfY"
 },
 {
  "name": "Haseeb Traders - Peshawar",
  "address": "Shop No.1, Nasir Mension, shuba Bazar, Peshawar Peshawar",
  "city": "Peshawar",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=34.0080109,71.5622745&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.0080109%2C71.5622745&query_place_id=ChIJo1Fvv6oX2TgRgp7Pmeof2l0"
 },
 {
  "name": "Jahangir & Momin Traders - Peshawar",
  "address": "Bakhshi Pul, Peshawar",
  "city": "Peshawar",
  "province": "Khyber Pakhtunkhwa",
  "contact": "0302-9692112",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1389.8978844414296!2d71.58269941597212!3d34.05020893647835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDAzJzAxLjEiTiA3McKwMzUnMDEuMiJF!5e0!3m2!1sen!2s!4v1780576632348!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.05020893647835,71.58269941597212"
 },
 {
  "name": "Mian Battery Zone - Peshawar",
  "address": "Shop#1, Awami Market Karkhanoo Peshawar",
  "city": "Peshawar",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://maps.google.com/maps?q=33.9978497,71.4252094&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.9978497%2C71.4252094&query_place_id=ChIJsUZq_IoR2TgRXThNm9h_W-U"
 },
 {
  "name": "Quality Battery Scrap - Peshawar",
  "address": "Haider Colony, Peshawar",
  "city": "Peshawar",
  "province": "Khyber Pakhtunkhwa",
  "contact": "",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d206.74495248193713!2d71.60510304919505!3d33.99460809024028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDM5JzQwLjYiTiA3McKwMzYnMTguOSJF!5e0!3m2!1sen!2s!4v1780572323342!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.99460809024028,71.60510304919505"
 },
 {
  "name": "Danish Traders - Charsada",
  "address": "Rajjar, Charsadda",
  "city": "Rajjar, Charsadda",
  "province": "Khyber Pakhtunkhwa",
  "contact": "0313-9335533",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3301.699631678485!2d71.75131607572082!3d34.1540259731188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDA5JzE0LjUiTiA3McKwNDUnMTQuMCJF!5e0!3m2!1sen!2s!4v1780576510089!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=34.1540259731188,71.75131607572082"
 },
 {
  "name": "Hafiz Battery Center - 18 Hazari",
  "address": "Jhang Road, Near PSO Pump, 18 Hazari, Distict Jhang",
  "city": "18 Hazari",
  "province": "Punjab",
  "contact": "0306-7509798",
  "map": "https://maps.google.com/maps?q=31.1653125,72.0989375&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.1653125%2C72.0989375&query_place_id=ChIJG3VEdHmDIzkRJ0vBX32kKdw"
 },
 {
  "name": "Madina Auto Store",
  "address": "Bhaikho, Mandi Bahauddin",
  "city": "Bhaikho, Mandi Bahauddin",
  "province": "Punjab",
  "contact": "0300-6163940",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3371.228994769613!2d73.47859577564441!3d32.332561473852536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDE5JzU3LjIiTiA3M8KwMjgnNTIuMiJF!5e0!3m2!1sen!2s!4v1780574661339!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.332561473852536,73.47859577564441"
 },
 {
  "name": "Rehman Traders",
  "address": "Dera Akbar Khan Pathan, Khushab",
  "city": "Dera Akbar Khan Pathan, Khushab",
  "province": "Punjab",
  "contact": "0300-8198824",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3388.1162724964975!2d71.89702227562584!3d31.876254974053108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDUyJzM0LjUiTiA3McKwNTMnNTguNiJF!5e0!3m2!1sen!2s!4v1780564467638!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.876254974053108,71.89702227562584"
 },
 {
  "name": "Baoo Jee Enterprises - Faisalabad",
  "address": "Shop#77, Shoaib Bilal Market, Opp Mian Trust Market, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0324-6697095",
  "map": "https://maps.google.com/maps?q=31.4265982,73.092196&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4265982%2C73.092196&query_place_id=ChIJSRjkPABDIjkR42ASOqJ9r2g"
 },
 {
  "name": "Chaudhary Battery Studio- Faisalabad",
  "address": "Shoaib Bilal Market, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0313-3744595",
  "map": "https://maps.google.com/maps?q=31.4268051,73.0919187&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4268051%2C73.0919187&query_place_id=ChIJM3L0QCFoIjkRW2Q8NRVyMEc"
 },
 {
  "name": "Hannan Traders - Faisalabad",
  "address": "Sadaqat Autos, Mian Trust Market, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0321-6600390",
  "map": "https://maps.google.com/maps?q=31.4259853,73.0920065&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4259853%2C73.0920065&query_place_id=ChIJE21oDydpIjkRsBJ0mFS5bww"
 },
 {
  "name": "Haroon Battery Center",
  "address": "Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0333-9944940",
  "map": "https://maps.google.com/maps?q=31.4277362,73.0931069&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4277362%2C73.0931069&query_place_id=ChIJDb0UUSFoIjkR7HfTdzxHcbw"
 },
 {
  "name": "Imtiaz Traders - Faisalabad",
  "address": "88-A Basement, Shoaib Bilal Market, Opp Commisioner Road,Faisalabad.",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0300-9660830",
  "map": "https://maps.google.com/maps?q=31.4265982,73.092196&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4265982%2C73.092196&query_place_id=ChIJla0eQCFoIjkRkgs_H5fMgSA"
 },
 {
  "name": "Karachi Battery Service",
  "address": "Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0321-6030072",
  "map": "https://maps.google.com/maps?q=31.4270855,73.0914733&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4270855%2C73.0914733&query_place_id=ChIJS2br7DdpIjkRTYdscdkkqXk"
 },
 {
  "name": "Rohan Traders - Faisalabad",
  "address": "216-A, Shoaib Bilal Market, Opposite General Bus Stand, Sargodha Raod Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0333-9944940",
  "map": "https://maps.google.com/maps?q=31.4265982,73.092196&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4265982%2C73.092196&query_place_id=ChIJla0eQCFoIjkRkgs_H5fMgSA"
 },
 {
  "name": "Sadaqat Autos",
  "address": "Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0323-6691244",
  "map": "https://maps.google.com/maps?q=31.4260887,73.0920602&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4260887%2C73.0920602&query_place_id=ChIJvdRcEyFoIjkRsib5YV5nP6Y"
 },
 {
  "name": "Shafi Battery Service",
  "address": "Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0300-9817799",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.566098129988!2d73.0893592756078!3d31.426078774257366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI2JzMzLjkiTiA3M8KwMDUnMzEuMCJF!5e0!3m2!1sen!2s!4v1781071196363!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.426078774257366,73.0893592756078"
 },
 {
  "name": "Shahid & Saleem Battery Center",
  "address": "Shoaib Bilal Market, Stadium Road, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0322-7661268",
  "map": "https://maps.google.com/maps?q=31.4266162,73.0921651&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4266162%2C73.0921651&query_place_id=ChIJSbDwPyFoIjkRCO4MvYB8H4w"
 },
 {
  "name": "Shahid Battery Center - Faisalabad",
  "address": "Shop #1, Mian Trust Market, Opposite Khidmat Markaz, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0304-4111268",
  "map": "https://maps.google.com/maps?q=31.4258222,73.0917691&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4258222%2C73.0917691&query_place_id=ChIJKwrYegBDIjkRLN1VzzRwP-E"
 },
 {
  "name": "Shahid Enterprises - Faisalabad",
  "address": "Shop#138-A, Shoaib Bilal Market, Near Mian Trust Market, Faisalabad",
  "city": "Faisalabad",
  "province": "Punjab",
  "contact": "0322-7661268",
  "map": "https://maps.google.com/maps?q=31.4265982,73.092196&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4265982%2C73.092196&query_place_id=ChIJla0eQCFoIjkRkgs_H5fMgSA"
 },
 {
  "name": "Bilal Battery Center - Garh More",
  "address": "Multan Road, Garh More",
  "city": "Garh More",
  "province": "Punjab",
  "contact": "0300-4029561",
  "map": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3425.5346293786884!2d71.8440548!3d30.843703500000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39249b4d3b01f793%3A0x4a5c91b29e84572c!2sBILAL%20Battery%20Center!5e0!3m2!1sen!2s!4v1771479634029!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=30.843703500000004,71.8440548"
 },
 {
  "name": "Punjab Battery House",
  "address": "Satellite Town No 3, Jauharabad",
  "city": "Jauharabad",
  "province": "Punjab",
  "contact": "0300-0677858",
  "map": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3372.8280078580015!2d72.27605218885498!3d32.28960180000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39213db7490345db%3A0x26ce00af55fb0fca!2sPunjab%20batteries%20services!5e0!3m2!1sen!2s!4v1780564773138!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.28960180000001,72.27605218885498"
 },
 {
  "name": "Risen Trading Co. - Jauharabad",
  "address": "Balouch Market Near Bus Stand, Jauharabad, Khushab",
  "city": "Jauharabad",
  "province": "Punjab",
  "contact": "0300-0677858",
  "map": "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d843.2079617022931!2d72.2800795!3d32.2894986!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39213c4da1011eb7%3A0x6674cfbd30492d81!2sBaloch%20Market%2C%20Jauharabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1771618766364!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.2894986,72.2800795"
 },
 {
  "name": "Modern Battery Service - Khushab",
  "address": "Kalma Chowk, Khushab",
  "city": "Khushab",
  "province": "Punjab",
  "contact": "0300-6032937",
  "map": "https://maps.google.com/maps?q=32.296394,72.3476616&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.296394%2C72.3476616&query_place_id=ChIJdSP26DsWITkRWSaI8uelZQc"
 },
 {
  "name": "Nadeem Noor Battery",
  "address": "Kotehra, Mandi Bahauddin",
  "city": "Kotehra, Mandi Bahauddin",
  "province": "Punjab",
  "contact": "0345-5762657",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3362.8321939626826!2d73.21683887565365!3d32.557323473756284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDMzJzI2LjQiTiA3M8KwMTMnMDkuOSJF!5e0!3m2!1sen!2s!4v1780564938772!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.557323473756284,73.21683887565365"
 },
 {
  "name": "Ali & Company - Lahore",
  "address": "391, Block D3, Main WAPDA Avenue, WAPDA Town, Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0300-8035716",
  "map": "https://maps.google.com/maps?q=31.4406142,74.274179&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4406142%2C74.274179&query_place_id=ChIJoZHE_9gBGTkRcYdXHrdhRuA"
 },
 {
  "name": "Muhammadi Battery & Oil Traders - Lahore",
  "address": "P-334 Block-6 B-01, Town Ship Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0321-0521000/0323-7104079",
  "map": "https://maps.google.com/maps?q=31.4571181,74.3080985&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4571181%2C74.3080985&query_place_id=ChIJq6qqqksBGTkR-DXYMA8fQwc"
 },
 {
  "name": "New Rajput Battery - Lahore",
  "address": "Shop#23, Montgomary Road, Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0321-4367254",
  "map": "https://maps.google.com/maps?q=31.5666571,74.3276381&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.5666571%2C74.3276381&query_place_id=ChIJF0ptnk4bGTkRSySeeZHpGkw"
 },
 {
  "name": "Sajjad Battery House - Lahore",
  "address": "Shop# E/193/2, Bank Stop Main Walton Road, Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0300-9415522",
  "map": "https://maps.google.com/maps?q=31.4882933,74.3684417&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4882933%2C74.3684417&query_place_id=ChIJ88g52M8FGTkRAmUIUv4yaOE"
 },
 {
  "name": "Umer Battery Service - Lahore",
  "address": "Shop#35, Street#9, New Iqbal Park, Opposite Adil Hospital, DHA, Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0300-9045551",
  "map": "https://maps.google.com/maps?q=31.4886607,74.3794307&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4886607%2C74.3794307&query_place_id=ChIJ1a8eJN0FGTkRe4lnrDLeO18"
 },
 {
  "name": "Zeb Battery Center - Lahore",
  "address": "42 Aziz Road, Misri Shah Opposite WASA office, Chowk Nakhuds, Lahore",
  "city": "Lahore",
  "province": "Punjab",
  "contact": "0333-6105632",
  "map": "https://maps.google.com/maps?q=31.586384,74.3350423&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.586384%2C74.3350423&query_place_id=ChIJGQZm_0YbGTkRwNYcH5ZMWpw"
 },
 {
  "name": "Al Karam Auto Store - Mandi Bahauddin",
  "address": "Larri Adda, Mandi Bahauddin",
  "city": "Mandi Bahauddin",
  "province": "Punjab",
  "contact": "0340-4898273",
  "map": "https://maps.google.com/maps?q=32.5843164,73.4840326&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.5843164%2C73.4840326&query_place_id=ChIJq4xd6et9HzkRSQxmIl-Ojic"
 },
 {
  "name": "Lahore Battery Service & Auto Store - Mandi Shah Jewana",
  "address": "Railway Crossing, Mandi Shah Jewana",
  "city": "Mandi Shah Jewana",
  "province": "Punjab",
  "contact": "0346-7374605",
  "map": "https://maps.google.com/maps?q=31.5688153,72.2926312&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.5688153%2C72.2926312&query_place_id=ChIJq6qqqpvpIzkRWjB_6_kyh0Q"
 },
 {
  "name": "Al-Nawaz Traders - Multan",
  "address": "Shop#1,Volta Market, Vehari Chowk, Multan",
  "city": "Multan",
  "province": "Punjab",
  "contact": "0346-7863132/0335-5226667",
  "map": "https://maps.google.com/maps?q=30.1744536,71.5074692&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=30.1744536%2C71.5074692&query_place_id=ChIJ34rXrvY3OzkRRRLVJbXRB-Q"
 },
 {
  "name": "Ittefaq Battery House - Nankana Sahib",
  "address": "Shop# 1979, Near Admore Pump, Lorry Adda Mangtanwala Road, Nankana Sahib",
  "city": "Nankana Sahib",
  "province": "Punjab",
  "contact": "0323-1234562",
  "map": "https://maps.google.com/maps?q=31.4528547,73.7130015&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=31.4528547%2C73.7130015&query_place_id=ChIJjeh-1QaPGDkRgK0YaiM4Oq8"
 },
 {
  "name": "Ganj Bakhash Battery Service",
  "address": "Phalia–Mandi Bahauddin Road, Phalia, Mandi Bahauddin",
  "city": "Pindi Noora, Mandi Bahauddin",
  "province": "Punjab",
  "contact": "0345-5794000",
  "map": "https://maps.google.com/maps?q=32.4373548,73.5704793&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.4373548%2C73.5704793&query_place_id=ChIJiU2MpwJkHzkRDvl1k_tEDlg"
 },
 {
  "name": "Anoosh And Shafel Traders - Rawalpindi",
  "address": "Shop#4 Pindi Cricket Stadium Road, Rawalpindi",
  "city": "Rawalpindi",
  "province": "Punjab",
  "contact": "",
  "map": "https://maps.google.com/maps?q=33.6530625,73.0715625&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6530625%2C73.0715625&query_place_id=ChIJH9eZ6juV3zgRnbwGPttSeEQ"
 },
 {
  "name": "Irfan Battery Centre - Rawalpindi",
  "address": "Shop#4324-A, Main Road Daryaabad, Gowalmandi, Rawalpindi",
  "city": "Rawalpindi",
  "province": "Punjab",
  "contact": "",
  "map": "https://maps.google.com/maps?q=33.6045495,73.0573504&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6045495%2C73.0573504&query_place_id=ChIJbc2uWACV3zgR9abGry8uNFs"
 },
 {
  "name": "Prince Battery Center - Rawalpindi",
  "address": "Shop#3, Awami Plaza, National Market, Chandni Chowk, Rawalpindi",
  "city": "Rawalpindi",
  "province": "Punjab",
  "contact": "",
  "map": "https://maps.google.com/maps?q=33.6324065,73.0687347&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=33.6324065%2C73.0687347&query_place_id=ChIJX4jMeM-V3zgRxqWQ6MIFYvo"
 },
 {
  "name": "Hafiz Battery Center - Talagang",
  "address": "Shop#3, Sunny Market, Mianwali Road, Near Chowk Siddiqabad, Talagang",
  "city": "Talagang",
  "province": "Punjab",
  "contact": "0333-5189023",
  "map": "https://maps.google.com/maps?q=32.9234295,72.3985561&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=32.9234295%2C72.3985561&query_place_id=ChIJV0oOL7mVIDkR6bkVMt6V8I4"
 },
 {
  "name": "Bangash battery",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Bangash+battery%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Bangash+battery%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Delux Battery Service",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Delux+Battery+Service%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Delux+Battery+Service%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Global Metal",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Global+Metal%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Global+Metal%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Goodluck Battery",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "0301-4192819",
  "map": "https://maps.google.com/maps?q=Goodluck+Battery%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Goodluck+Battery%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Hayat Battery",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "0313-7344595",
  "map": "https://maps.google.com/maps?q=Hayat+Battery%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Hayat+Battery%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Hayat Traders",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Hayat+Traders%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Hayat+Traders%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Ittehad And Company",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "0320-4890000",
  "map": "https://maps.google.com/maps?q=Ittehad+And+Company%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Ittehad+And+Company%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Jahangir Battery",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Jahangir+Battery%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Jahangir+Battery%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Modern BatteryService",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Modern+BatteryService%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Modern+BatteryService%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "Wasey Battery Service",
  "address": "",
  "city": "",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Wasey+Battery+Service%2C+Sindh%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Wasey+Battery+Service%2C+Sindh%2C+Pakistan"
 },
 {
  "name": "(Nadeem) Hyderabad Battery Service Hyderabad",
  "address": "Saddar, Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.6781616116987!2d68.3664901753878!3d25.38210067759246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIyJzU1LjYiTiA2OMKwMjInMDguNiJF!5e0!3m2!1sen!2s!4v1781072624861!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.38210067759246,68.3664901753878"
 },
 {
  "name": "A A Battery zone Hyderabad",
  "address": "Saddar, Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "0341-3360251",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.6074869878544!2d68.36548677538791!3d25.384468277591036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIzJzA0LjYiTiA2OMKwMjInMDUuMCJF!5e0!3m2!1sen!2s!4v1781072461007!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.384468277591036,68.36548677538791"
 },
 {
  "name": "Abdul Wahid Battery service Hyderabad",
  "address": "Gulshan-e-Hali, Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "0345-4220311",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.8429794750346!2d68.37056387538772!3d25.376578477595878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIyJzM1LjciTiA2OMKwMjInMjMuMyJF!5e0!3m2!1sen!2s!4v1781072841149!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.376578477595878,68.37056387538772"
 },
 {
  "name": "Chohan Traders Hyderabad",
  "address": "Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "0300-6058400",
  "map": "https://maps.google.com/maps?q=Chohan+Traders+Hyderabad%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Chohan+Traders+Hyderabad%2C+Pakistan"
 },
 {
  "name": "MRP Traders - Hyderabad",
  "address": "Shop#32-33 Mehran Commercial Market, Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "0313-6513390",
  "map": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d901.2132075116978!2d68.35246289999999!3d25.3762484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c717be1377c29%3A0xd47b1a06e9bb841e!2sMRP%20TRADERS!5e0!3m2!1sen!2s!4v1771619094794!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.3762484,68.35246289999999"
 },
 {
  "name": "Raja Battery Centre Qasimabad Hyderabad",
  "address": "Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "0301-6519404",
  "map": "https://maps.google.com/maps?q=25.396271,68.340458&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.396271%2C68.340458&query_place_id=ChIJP1HaTyhxTDkR5L-9PeXz_dY"
 },
 {
  "name": "Samaviah Traders Hyderabad",
  "address": "Hyderabad",
  "city": "Hyderabad",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Samaviah+Traders+Hyderabad%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Samaviah+Traders+Hyderabad%2C+Pakistan"
 },
 {
  "name": "Abdul Hadi Battery Traders - Karachi",
  "address": "Shop No 02, Main Razzaqabad Bus Stop, Bin Qasim, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0332-6250288",
  "map": "https://maps.google.com/maps?q=24.8649755,67.2939413&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8649755%2C67.2939413&query_place_id=ChIJ2x76ztAzsz4R93CK25L8FWU"
 },
 {
  "name": "Agha Battery Centre",
  "address": "Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0333-2153353/0306-2807021",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3621.329380168492!2d66.99525067536956!3d24.81840707795674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDQ5JzA2LjMiTiA2NsKwNTknNTIuMiJF!5e0!3m2!1sen!2s!4v1781072421579!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.81840707795674,66.99525067536956"
 },
 {
  "name": "Aithmad Battery Agra Taj Colony",
  "address": "Machar Colony, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=24.872085477921637,66.97610267537127&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.872085477921637,66.97610267537127"
 },
 {
  "name": "Atif Traders",
  "address": "Ajmer Nagri, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3616.597176463477!2d67.06322857537482!3d24.97981637785155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDU4JzQ3LjMiTiA2N8KwMDMnNTYuOSJF!5e0!3m2!1sen!2s!4v1781072058779!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.97981637785155,67.06322857537482"
 },
 {
  "name": "Battery Lab - Karachi",
  "address": "Korangi#5-1/2, Sector 43/B, Opposite Jumma Bazar Ground, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0336-2546020/0321-3626962",
  "map": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.1515792807836!2d67.1651621!3d24.824489399999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33bcdce243b89%3A0x7a70a4d68387521b!2sBattery%20lab!5e0!3m2!1sen!2s!4v1771619214630!5m2!1sen!2s",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.824489399999997,67.1651621"
 },
 {
  "name": "Darbar Battery Service - Karachi",
  "address": "Shop#197, Garden Takuna Market, Nishtar Road, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0321-3316771/0312-4912286",
  "map": "https://maps.google.com/maps?q=24.8767522,67.0215211&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8767522%2C67.0215211&query_place_id=ChIJp_eCQQA_sz4R87k3e2TLC-I"
 },
 {
  "name": "Hammad Battery Agra Taj Karachi",
  "address": "Shop#9, Near Navel Flates. Agra Taj Colony, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=24.8712953,66.9777156&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8712953%2C66.9777156&query_place_id=ChIJn3WdMQAVsz4RbzP9fHJ0G4o"
 },
 {
  "name": "Hammad Battery Service - Karachi",
  "address": "Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0334-3547835/0301-2600032",
  "map": "https://maps.google.com/maps?q=Hammad+Battery+Service%2C+Karachi%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Hammad+Battery+Service%2C+Karachi%2C+Pakistan"
 },
 {
  "name": "Karachi King Battery",
  "address": "Shop#1, Near Babar Kanta, Bhens Colony More, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0301-6779541",
  "map": "https://maps.google.com/maps?q=24.8225962,67.306945&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8225962%2C67.306945&query_place_id=ChIJqYlwIAAzsz4RDLY9F0GkNmE"
 },
 {
  "name": "Karachi Kings Batteries - Karachi",
  "address": "Shop#84, PNSC Flat Sector 15-A3, Buffer Zone Nagan Chowrangi, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0312-1367979/0314-2001736",
  "map": "https://maps.google.com/maps?q=Karachi+Kings+Batteries%2C+Shop%2384%2C+PNSC+Flat+Sector+15-A3%2C+Buffer+Zone+Nagan+Chowrangi%2C+Karachi%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Karachi+Kings+Batteries%2C+Shop%2384%2C+PNSC+Flat+Sector+15-A3%2C+Buffer+Zone+Nagan+Chowrangi%2C+Karachi%2C+Pakistan"
 },
 {
  "name": "M.S Battery & Solar - Karachi",
  "address": "Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0347-2024943",
  "map": "https://maps.google.com/maps?q=24.961607,67.0655417&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.961607%2C67.0655417&query_place_id=ChIJ4an8KQBBsz4Ri9OKJKT2tQc"
 },
 {
  "name": "M/S Azmi Traders - Karachi",
  "address": "Office#312, 3rd Floor Rafique Market Shorab Katrak Road Saddar Regal Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0321-2148726/0322-8229823/0316-2249258",
  "map": "https://maps.google.com/maps?q=24.8588138,67.0258032&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8588138%2C67.0258032&query_place_id=ChIJ_YHPdGg_sz4RM5KkNw9XAL8"
 },
 {
  "name": "Madina Battery Services - Karachi",
  "address": "S-3/97, Opposite Elementry Girls School, Suadabad, Malir Town, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0313-2029758/0306-8582990",
  "map": "https://maps.google.com/maps?q=24.8988548,67.2015749&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8988548%2C67.2015749&query_place_id=ChIJz8K54mY3sz4R_2ArHV3qyGc"
 },
 {
  "name": "Madni Battery Garden",
  "address": "Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=24.8769375,67.0208125&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8769375%2C67.0208125&query_place_id=ChIJhWBKEvY_sz4RYsMxbOH7thc"
 },
 {
  "name": "Mustafa Battery - Karachi",
  "address": "Shop#64, Iqra City Phase II, Abul Isphani Road, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0300-2378967",
  "map": "https://maps.google.com/maps?q=24.945059,67.0941147&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.945059%2C67.0941147&query_place_id=ChIJQaoEfLs5sz4RB3UCNDbkndY"
 },
 {
  "name": "Rashid Traders - Karachi",
  "address": "Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0314-2288107",
  "map": "https://maps.google.com/maps?q=24.8770234,67.0209638&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8770234%2C67.0209638&query_place_id=ChIJKXdrotc_sz4RttpJyBUDYeE"
 },
 {
  "name": "Rayyan Battery Services - Karachi",
  "address": "Shop#13, A-1, Heights, Nishter Road Garden, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Rayyan+Battery+Services%2C+Shop%2313%2C+A-1%2C+Heights%2C+Nishter+Road+Garden%2C+Karachi%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Rayyan+Battery+Services%2C+Shop%2313%2C+A-1%2C+Heights%2C+Nishter+Road+Garden%2C+Karachi%2C+Pakistan"
 },
 {
  "name": "Shahrukh Solar House - Karachi",
  "address": "Shop/Plot#02, Sector 32VE, Street#14, Nasir Jump, Korangi Town, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0313-2280006",
  "map": "https://maps.google.com/maps?q=Shahrukh+Solar+House%2C+Shop%2FPlot%2302%2C+Sector+32VE%2C+Street%2314%2C+Nasir+Jump%2C+Korangi+Town%2C+Karachi%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Shahrukh+Solar+House%2C+Shop%2FPlot%2302%2C+Sector+32VE%2C+Street%2314%2C+Nasir+Jump%2C+Korangi+Town%2C+Karachi%2C+Pakistan"
 },
 {
  "name": "Shamim Akhtar Battery Service - Karachi",
  "address": "H.NO. L-S -54, SECTOR 1 D, MILLATABAD, COMMERCIAL AREA ORANGI TOWN, Karachi West",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0331-2920465",
  "map": "https://maps.google.com/maps?q=Shamim+Akhtar+Battery+Service%2C+H.NO.+L-S+-54%2C+SECTOR+1+D%2C+MILLATABAD%2C+COMMERCIAL+AREA+ORANGI+TOWN%2C+Karachi+West%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Shamim+Akhtar+Battery+Service%2C+H.NO.+L-S+-54%2C+SECTOR+1+D%2C+MILLATABAD%2C+COMMERCIAL+AREA+ORANGI+TOWN%2C+Karachi+West%2C+Pakistan"
 },
 {
  "name": "Siddiq Battery Traders - Karachi",
  "address": "Shop #9, Ameen Plaza, Nishtar Road, Garden West, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=24.8779281,67.0218933&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8779281%2C67.0218933&query_place_id=ChIJ4VdtacY_sz4R3QBBKcMJpl8"
 },
 {
  "name": "Sindh Battery Safora Karachi",
  "address": "Shop#9, Amin Plaza, Garden West, Nishtar Road, Garden West, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0300-2561392/0312-8734419",
  "map": "https://maps.google.com/maps?q=Sindh+Battery+Safora+Karachi%2C+Shop%239%2C+Amin+Plaza%2C+Garden+West%2C+Nishtar+Road%2C+Garden+West%2C+Karachi%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Sindh+Battery+Safora+Karachi%2C+Shop%239%2C+Amin+Plaza%2C+Garden+West%2C+Nishtar+Road%2C+Garden+West%2C+Karachi%2C+Pakistan"
 },
 {
  "name": "Sindh Battery Service - Karachi",
  "address": "Shop No C -31, Sunley Arcade, Safoora Chowrangi ,Gulshan Town, Karachi East",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0334-3038434",
  "map": "https://maps.google.com/maps?q=24.9409115,67.154308&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.9409115%2C67.154308&query_place_id=ChIJsdNF31Q5sz4Rj0JFMj5wVzw"
 },
 {
  "name": "Sohail & Hassan Battery - Karachi",
  "address": "Shop#D-2/1, Ground Floor, Abid Square, Plot#ST-8/A/2 Block-7 F.B Area, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=24.9294838,67.067103&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.9294838%2C67.067103&query_place_id=ChIJtdYgwE8_sz4R6WtDq12PEQw"
 },
 {
  "name": "Yasir Traders",
  "address": "Shop #50, Defence Garden Apartments, Main Korangi Road, DHA, Karachi",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0333-2388490/0305-1250601",
  "map": "https://maps.google.com/maps?q=24.8451945,67.0552259&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=24.8451945%2C67.0552259&query_place_id=ChIJxzF_BQo_sz4Rs3COZjOLCQA"
 },
 {
  "name": "Zam Zam Batteries Traders - Karachi",
  "address": "Shop#50, Defence Garden Appt Phase-1, Main Korangi Road, DHA Karachi.",
  "city": "Karachi",
  "province": "Sindh",
  "contact": "0321-8262505",
  "map": "https://maps.google.com/maps?q=Zam+Zam+Batteries+Traders%2C+Shop%2350%2C+Defence+Garden+Appt+Phase-1%2C+Main+Korangi+Road%2C+DHA+Karachi.%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Zam+Zam+Batteries+Traders%2C+Shop%2350%2C+Defence+Garden+Appt+Phase-1%2C+Main+Korangi+Road%2C+DHA+Karachi.%2C+Pakistan"
 },
 {
  "name": "Habib Battery Service Khipro",
  "address": "Khipro",
  "city": "Khipro",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=25.8184098,69.3724565&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.8184098%2C69.3724565&query_place_id=ChIJiWaddAA3STkRzTZgUTzwWJs"
 },
 {
  "name": "(Awon Ali & Brother) Riaz Shah Auto Battery service Nawabshah",
  "address": "Nawabshah",
  "city": "Nawabshah",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=26.2487389,68.4090088&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=26.2487389%2C68.4090088&query_place_id=ChIJ0TdyIgBNSjkRtNfq0feDR7o"
 },
 {
  "name": "Millat Tractor & Battery Centre Nawabshah",
  "address": "Nawabshah",
  "city": "Nawabshah",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=26.2479937,68.4301394&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=26.2479937%2C68.4301394&query_place_id=ChIJ2eEabQFLSjkR5LiMTtv5Q9s"
 },
 {
  "name": "Shahid Ali Battery Shop Qazi Ahmed",
  "address": "Qazi Ahmed",
  "city": "Qazi Ahmed",
  "province": "Sindh",
  "contact": "",
  "map": "https://maps.google.com/maps?q=Shahid+Ali+Battery+Shop+Qazi+Ahmed%2C+Pakistan&z=15&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=Shahid+Ali+Battery+Shop+Qazi+Ahmed%2C+Pakistan"
 },
 {
  "name": "Bismillah Battery service Shehdadpur",
  "address": "Shahdadpur",
  "city": "Shahdadpur",
  "province": "Sindh",
  "contact": "0332-4989712",
  "map": "https://maps.google.com/maps?q=25.9189774,68.6149339&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.9189774%2C68.6149339&query_place_id=ChIJdctg7_nBSzkRRJcEM2kLqqA"
 },
 {
  "name": "Adnan Battery Center - Tando Jan Muhammad",
  "address": "Shop#3, Near Eid Gah, Jhado Road, Tando Jan Muhammad",
  "city": "Tando Jan Muhammad",
  "province": "Sindh",
  "contact": "0301/0334-2556215",
  "map": "https://maps.google.com/maps?q=25.0698194,69.2132526&z=17&output=embed",
  "directions": "https://www.google.com/maps/search/?api=1&query=25.0698194%2C69.2132526&query_place_id=ChIJ0yUSsoaNTjkRDshX09WtYkA"
 }
];

document.addEventListener("DOMContentLoaded", function () {
  var search = document.getElementById("dealerSearch");
  var clear = document.getElementById("dealerClear");
  var chipsBox = document.getElementById("regionChips");
  var list = document.getElementById("dealerList");
  var count = document.getElementById("dealerCount");
  var map = document.getElementById("dealerMap");
  var mapTitle = document.getElementById("dealerMapTitle");
  if (!list || !map) return;

  var esc = function (s) { return String(s == null ? "" : s).replace(/[&"'<>]/g, function (c) { return { "&": "&amp;", '"': "&quot;", "'": "&#39;", "<": "&lt;", ">": "&gt;" }[c]; }); };
  var tel = function (s) { return s.split("/")[0].replace(/[^+\d]/g, ""); };
  // "Shop Name - City" shows as "Shop Name" (the city is shown on the card)
  var shortName = function (d) {
    var m = /^(.*?)\s*-\s*([^-]+)$/.exec(d.name);
    return m && d.city && d.city.toLowerCase().indexOf(m[2].trim().toLowerCase().slice(0, 5)) === 0 ? m[1] : d.name;
  };
  var place = function (d) { return [d.city, d.province].filter(Boolean).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(", "); };

  var regions = ["All", "Islamabad", "Punjab", "Sindh", "Khyber Pakhtunkhwa"];
  var region = "All", selected = null;

  chipsBox.innerHTML = regions.map(function (r) {
    var n = r === "All" ? dealers.length : dealers.filter(function (d) { return d.province === r; }).length;
    return '<button type="button" class="loc-chip" data-region="' + esc(r) + '" aria-pressed="' + (r === "All") + '">' + (r === "All" ? "All Regions" : esc(r)) + ' <span class="chip-n">' + n + "</span></button>";
  }).join("");

  var show = function (d, scroll) {
    selected = d;
    if (map.getAttribute("src") !== d.map) map.setAttribute("src", d.map);
    map.title = "Map: " + d.name;
    if (mapTitle) mapTitle.textContent = shortName(d) + (d.city ? ", " + d.city.split(",")[0] : "");
    list.querySelectorAll(".dealer-card").forEach(function (c) { c.classList.toggle("is-active", c.__d === d); c.setAttribute("aria-current", c.__d === d ? "true" : "false"); });
    if (scroll && window.innerWidth < 768) document.getElementById("dealerMapWrap").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  var render = function () {
    var term = (search.value || "").trim().toLowerCase();
    var rows = dealers.filter(function (d) {
      if (region !== "All" && d.province !== region) return false;
      if (!term) return true;
      return (d.name + " " + d.address + " " + d.city + " " + d.province).toLowerCase().indexOf(term) > -1;
    });
    count.textContent = rows.length + (rows.length === 1 ? " partner" : " partners");
    clear.hidden = !term;
    list.scrollTop = 0; // new results start at the top of the list
    if (!rows.length) {
      list.innerHTML = '<div class="dealer-empty"><p>No partners match your search.</p><p>Try another city or <a href="support.html#support-content">contact us</a> and we will point you to the nearest one.</p></div>';
      return;
    }
    // group by city
    var html = "", last = null;
    list.innerHTML = "";
    rows.forEach(function (d) {
      var group = d.city ? d.city.split(",").pop().trim() : d.province;
      if (group !== last) {
        var h = document.createElement("h3");
        h.className = "dealer-group";
        h.textContent = group;
        list.appendChild(h);
        last = group;
      }
      var c = document.createElement("article");
      c.className = "dealer-card";
      c.tabIndex = 0;
      c.__d = d;
      var phone = d.contact
        ? '<a class="d-link" href="tel:' + esc(tel(d.contact)) + '"><i class="fa-solid fa-phone" aria-hidden="true"></i>' + esc(d.contact) + "</a>"
        : '<a class="d-link d-muted" href="tel:+92518740280" title="This partner has no listed number"><i class="fa-solid fa-phone" aria-hidden="true"></i>Call Alaska: ' + HEAD_OFFICE_PHONE + "</a>";
      c.innerHTML =
        '<h4 class="d-name">' + esc(shortName(d)) + "</h4>" +
        '<p class="d-addr"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>' + esc(d.address && d.address !== d.city ? d.address : place(d)) + "</span></p>" +
        (d.address && d.city && d.address.toLowerCase().indexOf(d.city.split(",")[0].toLowerCase()) < 0 ? '<p class="d-place">' + esc(place(d)) + "</p>" : "") +
        '<div class="d-actions">' + phone +
        '<a class="d-link" href="' + esc(d.directions) + '" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right" aria-hidden="true"></i>Directions</a></div>';
      c.addEventListener("click", function (e) { if (!e.target.closest("a")) show(d, true); });
      c.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(d, true); } });
      list.appendChild(c);
    });
    if (!selected || rows.indexOf(selected) < 0) show(rows[0], false);
    else show(selected, false);
  };

  chipsBox.addEventListener("click", function (e) {
    var b = e.target.closest(".loc-chip");
    if (!b) return;
    region = b.dataset.region;
    chipsBox.querySelectorAll(".loc-chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
    render();
  });
  search.addEventListener("input", render);
  clear.addEventListener("click", function () { search.value = ""; render(); search.focus(); });
  render();
});
