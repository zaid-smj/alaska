// This would ideally live in js/data.js
const dealers = [
  {
    name: "Al Karam Auto Store - Mandi Bahauddin",
    address: "Larri Adda, Mandi Bahauddin",
    city: "Mandi Bahauddin",
    province: "PUNJAB",
    contact: "0340-4898273",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d840.4538645086028!2d73.4835991!3d32.5844453!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f7debe95d8cab%3A0x278e8e5f22660c49!2sAl-Karam%20Auto%20Store!5e0!3m2!1sen!2s!4v1771479416029!5m2!1sen!2s",
  },
  {
    name: "Al-Karam Auto Store",
    address: "",
    city: "",
    province: "",
    contact: "0340-4898273",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3361.8202919856412!2d73.48403259999999!3d32.5843164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f7debe95d8cab%3A0x278e8e5f22660c49!2sAl-Karam%20Battery%20centre%20and%20solar%20system!5e0!3m2!1sen!2s!4v1780564996997!5m2!1sen!2s",
  },
  {
    name: "Bao G Battery Center",
    address: "",
    city: "",
    province: "",
    contact: "0324-6697095",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.184700123107!2d73.08859217560823!3d31.436581774252428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI2JzExLjciTiA3M8KwMDUnMjguMiJF!5e0!3m2!1sen!2s!4v1780564685315!5m2!1sen!2s",
  },
  {
    name: "Baoo Jee Enterprises - Faisalabad",
    address: "Shop#77, Shoaib Bilal Market, Opp Mian Trust Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0324-6697095",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d27236.377910279356!2d73.0561471!3d31.4265982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392243003ce41849%3A0x68af7da23a1260e3!2sBao%20Gee%20Battery%20Center!5e0!3m2!1sen!2s!4v1771479601960!5m2!1sen!2s",
  },
  {
    name: "Bilal Battery Center - Garh More",
    address: "Multan Road, Garh More",
    city: "Garh More",
    province: "PUNJAB",
    contact: "0300-4029561",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3425.5346293786884!2d71.8440548!3d30.843703500000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39249b4d3b01f793%3A0x4a5c91b29e84572c!2sBILAL%20Battery%20Center!5e0!3m2!1sen!2s!4v1771479634029!5m2!1sen!2s",
  },
  {
    name: "Chaudhary Battery Studio- Faisalabad",
    address: "Shoaib Bilal Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0313-3744595",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.5388587930897!2d73.0919029!3d31.426828999999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226900754567b7%3A0x8bf077049964fe3e!2sChaudhary%20Battery%20Studio!5e0!3m2!1sen!2s!4v1771479663735!5m2!1sen!2s",
  },
  {
    name: "Choudhry Battery Studio",
    address: "",
    city: "",
    province: "",
    contact: "0313-7344595",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.5388815129268!2d73.08930587560775!3d31.426828374257003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI1JzM2LjYiTiA3M8KwMDUnMzAuOCJF!5e0!3m2!1sen!2s!4v1780571061703!5m2!1sen!2s",
  },
  {
    name: "Ganj Bakhash Battery Service",
    address: "",
    city: "",
    province: "",
    contact: "0345-5794000",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3367.3269396848646!2d73.56769097564441!3d32.4371825738075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDI2JzEzLjkiTiA3M8KwMzQnMTMuMCJF!5e0!3m2!1sen!2s!4v1780565102148!5m2!1sen!2s",
  },
  {
    name: "Hafiz Battery Center",
    address: "",
    city: "",
    province: "",
    contact: "0306-7509798",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3414.0024129085878!2d72.09905548!3d31.1652082!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392383797444751b%3A0xdc29a47d5fc14b27!2sHafiz%20Battery%20Center%20%26%20Oil%20Traders%2018-Hazari!5e0!3m2!1sen!2s!4v1780564833895!5m2!1sen!2s",
  },
  {
    name: "Hafiz Battery Center - 18 Hazari",
    address: "Jhang Road, Near PSO Pump, 18 Hazari, Distict Jhang",
    city: "18 Hazari",
    province: "PUNJAB",
    contact: "0306-7509798",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1707.0037200213865!2d72.0989711!3d31.1650687!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392383797444751b%3A0xdc29a47d5fc14b27!2sHafiz%20Battery%20Center%20%26%20Oil%20Traders%2018-Hazari!5e0!3m2!1sen!2s!4v1771479731763!5m2!1sen!2s",
  },
  {
    name: "Hannan Traders - Faisalabad",
    address: "Sadaqat Autos, Mian Trust Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0321-6600390",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1702.3072581765614!2d73.090636!3d31.4247452!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392269270f686d13%3A0xc6fb954987412b0!2sHannan%20Traders!5e0!3m2!1sen!2s!4v1771479746198!5m2!1sen!2s",
  },
  {
    name: "Haroon Battery Center",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0333-9944940",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.5073035523315!2d73.09054947560786!3d31.427698074256536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI1JzM5LjciTiA3M8KwMDUnMzUuMyJF!5e0!3m2!1sen!2s!4v1780565039112!5m2!1sen!2s",
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
    name: "Karachi Battery Service",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0321-6030072",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.529256073038!2d73.08887097560782!3d31.42709347425684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI1JzMyLjUiTiA3M8KwMDUnMjkuMiJF!5e0!3m2!1sen!2s!4v1780565237525!5m2!1sen!2s",
  },
  {
    name: "Lahore Battery Service & Auto Store - Mandi Shah Jewana",
    address: "Railway Crossing, Mandi Shah Jewana",
    city: "Mandi Shah Jewana",
    province: "PUNJAB",
    contact: "0346-7374605",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3399.3730898006015!2d72.2926312!3d31.568815299999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3923e99baaaaaaab%3A0x448732f9eb7f305a!2sLAHORE%20BATTERY%20SERVICE!5e0!3m2!1sen!2s!4v1771618737641!5m2!1sen!2s",
  },
  {
    name: "Madina Auto Store",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0300-6163940",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3371.228994769613!2d73.47859577564441!3d32.332561473852536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDE5JzU3LjIiTiA3M8KwMjgnNTIuMiJF!5e0!3m2!1sen!2s!4v1780574661339!5m2!1sen!2s",
  },
  {
    name: "Modern Battery Service",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0300-6032937",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3372.5728949331506!2d72.34496687564295!3d32.29645917386817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDE3JzQ3LjMiTiA3MsKwMjAnNTEuMiJF!5e0!3m2!1sen!2s!4v1781071473416!5m2!1sen!2s",
  },
  {
    name: "Modern Battery Service - Khushab",
    address: "Kalma Chowk, Khushab",
    city: "Khushab",
    province: "PUNJAB",
    contact: "0300-6032937",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3372.575319805381!2d72.3476616!3d32.29639399999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3921163be8f62375%3A0x765a5e7f2882659!2sModern%20Battery%20Service!5e0!3m2!1sen!2s!4v1771618752473!5m2!1sen!2s",
  },
  {
    name: "Nadeem Noor Battery",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0345-5762657",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3362.8321939626826!2d73.21683887565365!3d32.557323473756284!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDMzJzI2LjQiTiA3M8KwMTMnMDkuOSJF!5e0!3m2!1sen!2s!4v1780564938772!5m2!1sen!2s",
  },
  {
    name: "Punjab Battery House",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0300-0677858",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3372.8280078580015!2d72.27605218885498!3d32.28960180000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39213db7490345db%3A0x26ce00af55fb0fca!2sPunjab%20batteries%20services!5e0!3m2!1sen!2s!4v1780564773138!5m2!1sen!2s",
  },
  {
    name: "Rehman Traders",
    address: "",
    city: "",
    province: "PUNJAB",
    contact: "0300-8198824",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3388.1162724964975!2d71.89702227562584!3d31.876254974053108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDUyJzM0LjUiTiA3McKwNTMnNTguNiJF!5e0!3m2!1sen!2s!4v1780564467638!5m2!1sen!2s",
  },
  {
    name: "Risen Trading Co. - Jauharabad",
    address: "Balouch Market Near Bus Stand, Jauharabad, Khushab",
    city: "Jouharabad",
    province: "PUNJAB",
    contact: "0300-0677858",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d843.2079617022931!2d72.2800795!3d32.2894986!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39213c4da1011eb7%3A0x6674cfbd30492d81!2sBaloch%20Market%2C%20Jauharabad%2C%20Pakistan!5e0!3m2!1sen!2s!4v1771618766364!5m2!1sen!2s",
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
    name: "Sadaqat Autos",
    address: "",
    city: "",
    province: "",
    contact: "0323-6691244",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.566098129988!2d73.0893592756078!3d31.426078774257366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
  },
  {
    name: "Shafi Battery Service",
    address: "",
    city: "",
    province: "",
    contact: "0300-9817799",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.566098129988!2d73.0893592756078!3d31.426078774257366!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI2JzMzLjkiTiA3M8KwMDUnMzEuMCJF!5e0!3m2!1sen!2s!4v1781071196363!5m2!1sen!2s",
  },
  {
    name: "Shahid & Saleem Battery Center",
    address: "",
    city: "",
    province: "",
    contact: "0322-7661268",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3372.6060415623433!2d72.33790507564285!3d32.29556827386854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDE3JzQ0LjEiTiA3MsKwMjAnMjUuNyJF!5e0!3m2!1sen!2s!4v1780565150164!5m2!1sen!2s",
  },
  {
    name: "Shahid Battery Center - Faisalabad",
    address: "Shop #1, Mian Trust Market, Opposite Khidmat Markaz, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0304-4111268",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3404.545391623903!2d73.08946917560779!3d31.426649074257007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDI1JzM1LjkiTiA3M8KwMDUnMzEuNCJF!5e0!3m2!1sen!2s!4v1780564886232!5m2!1sen!2s",
  },
  {
    name: "Shahid Enterprises - Faisalabad",
    address: "Shop#138-A, Shoaib Bilal Market, Near Mian Trust Market, Faisalabad",
    city: "Faisalabad",
    province: "PUNJAB",
    contact: "0322-7661268",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3404.559434696852!2d73.09224329999999!3d31.4262623!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x392243007ad80a2b%3A0xe13f7034cf55dd2c!2sShahid%20Battery%20Center%20(Agency)!5e0!3m2!1sen!2s!4v1771618902265!5m2!1sen!2s",
  },
  {
    name: "Adnan Battery Center - Tando Jan Muhammad",
    address: "Shop#3, Near Eid Gah, Jhado Road, Tando Jan Muhammad",
    city: "Tando Jan Muhammad",
    province: "SINDH",
    contact: "0301/0334-2556215",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d851.1374124140546!2d73.0918723!3d31.4265318!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39226821401ead95%3A0x2081cc971f3f0b92!2sShoaib%20Bilal%20Market!5e0!3m2!1sen!2s!4v1771618917080!5m2!1sen!2s",
  },
  {
    name: "MRP Traders - Hyderabad",
    address: "Shop#32-33 Mehran Commercial Market, Hyderabad",
    city: "Hyderabad",
    province: "SINDH",
    contact: "0313-6513390",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3613.9459978733553!2d69.21325259999999!3d25.069819400000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394e8d86b21225d3%3A0x4062add5d357c80e!2sAdnan%20battery%20centre!5e0!3m2!1sen!2s!4v1771618932278!5m2!1sen!2s",
  },
  {
    name: "Abbas Enterprises - Swat",
    address: "",
    city: "",
    province: "",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d901.2132075116978!2d68.35246289999999!3d25.3762484!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x394c717be1377c29%3A0xd47b1a06e9bb841e!2sMRP%20TRADERS!5e0!3m2!1sen!2s!4v1771619094794!5m2!1sen!2s",
  },
  {
    name: "Abdul waheed khan",
    address: "",
    city: "",
    province: "",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3270.611149615707!2d72.46353527575495!3d34.94128797283523!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDU2JzI4LjYiTiA3MsKwMjcnNTguMCJF!5e0!3m2!1sen!2s!4v1780575735768!5m2!1sen!2s",
  },
  {
    name: "Danish Traders - Charsada",
    address: "",
    city: "",
    province: "",
    contact: "0313-9335533",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3271.3929607774307!2d72.41343688964844!3d34.92168045043945!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38dc3f4e2481cb33%3A0xaed1b55e9bb41550!2sAbdul%20waheed%20khan%20plaza!5e0!3m2!1sen!2s!4v1780923658086!5m2!1sen!2s",
  },
  {
    name: "Haseeb Traders - Peshawar",
    address: "Shop No.1, Nasir Mension, shuba Bazar, Peshawar Peshawar",
    city: "Peshawar",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3301.699631678485!2d71.75131607572082!3d34.1540259731188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDA5JzE0LjUiTiA3McKwNDUnMTQuMCJF!5e0!3m2!1sen!2s!4v1780576510089!5m2!1sen!2s",
  },
  {
    name: "Jahangir & Momin Traders - Peshawar",
    address: "",
    city: "",
    province: "",
    contact: "0302-9692112",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.3973211925486!2d71.5622745!3d34.008010899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917aabf6f51a3%3A0x5dda1fea99cf9e82!2sHaseeb%20traders!5e0!3m2!1sen!2s!4v1771619410036!5m2!1sen!2s",
  },
  {
    name: "Mian Battery Zone - Peshawar",
    address: "Shop#1, Awami Market Karkhanoo Peshawar",
    city: "Peshawar",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1389.8978844414296!2d71.58269941597212!3d34.05020893647835!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDAzJzAxLjEiTiA3McKwMzUnMDEuMiJF!5e0!3m2!1sen!2s!4v1780576632348!5m2!1sen!2s",
  },
  {
    name: "Noor Traders - Kohat",
    address: "",
    city: "",
    province: "",
    contact: "0301-8845317/0315-9231509",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.793024851256!2d71.4252094!3d33.997849699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d9118afc6a46b1%3A0xe55b7fd89b4d385d!2sMian%20Battery%20and%20Solar%20Zone!5e0!3m2!1sen!2s!4v1771619425949!5m2!1sen!2s",
  },
  {
    name: "Peshawar Battery Center - Nowshera",
    address: "Shop#21, Farooq Stadium Plaza, G.T Road, Nowshera Cantt",
    city: "Nowshera",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3324.9292739522853!2d71.45212937569524!3d33.55521387334818!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDMzJzE4LjgiTiA3McKwMjcnMTYuOSJF!5e0!3m2!1sen!2s!4v1780724794505!5m2!1sen!2s",
  },
  {
    name: "Punjab Batteries Center - Bannu",
    address: "",
    city: "",
    province: "",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4382624895084!2d72.0045177!3d34.006959699999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ded30076819a79%3A0xf62d9e4bf97e66dc!2sPeshawar%20battery%20centre!5e0!3m2!1sen!2s!4v1771619439210!5m2!1sen!2s",
  },
  {
    name: "Quality Battery Scrap - Peshawar",
    address: "",
    city: "",
    province: "",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d254708.61663707581!2d70.63716983706462!3d32.98747435919563!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzLCsDU5JzAyLjgiTiA3MMKwMzYnNDguMCJF!5e0!3m2!1sen!2s!4v1780896362935!5m2!1sen!2s",
  },
  {
    name: "Seven Star Electronics & Battery  - Bajroh",
    address: "",
    city: "",
    province: "",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d206.74495248193713!2d71.60510304919505!3d33.99460809024028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzPCsDM5JzQwLjYiTiA3McKwMzYnMTguOSJF!5e0!3m2!1sen!2s!4v1780572323342!5m2!1sen!2s",
  },
  {
    name: "Shehzad Battery Center DIKhan",
    address: "",
    city: "",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3278.110107273195!2d71.4527091757468!3d34.75281907290109!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzTCsDQ5JzEwLjIiTiA3McKwMjcnMTKuMCJF!5e0!3m2!1sen!2s!4v1780924047387!5m2!1sen!2s",
  },
  {
    name: "Zahid Battery Center - D.I.Khan",
    address: "",
    city: "",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3389.681980756825!2d70.90971757562421!3d31.833652474072043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMzHCsDUwJzAxLjIiTiA3MMKwNTQnNDQuMyJF!5e0!3m2!1sen!2s!4v1780923814058!5m2!1sen!2s",
  },
  {
    name: "(Awon Ali & Brother) Riaz Shah Auto Battery service Nawabshah",
    address: "",
    city: "",
    province: "KHYBER PAKHTUNKHWA",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3389.696831745523!2d70.9122543334961!3d31.833248138427734!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39266f9ec9ee2047%3A0x990571291c0a7bed!2sZahid%20battery%20center!5e0!3m2!1sen!2s!4v1780744888100!5m2!1sen!2s",
  },
  {
    name: "(Nadeem) Hyderabad Battery Service Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3578.399404476551!2d68.4064028754168!3d26.248697677049236!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjbCsDE0JzU1LjMiTiA2OMKwMjQnMzIuMyJF!5e0!3m2!1sen!2s!4v1781072707772!5m2!1sen!2s",
  },
  {
    name: "A A Battery zone Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0341-3360251",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.6781616116987!2d68.3664901753878!3d25.38210067759246!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIyJzU1LjYiTiA2OMKwMjInMDguNiJF!5e0!3m2!1sen!2s!4v1781072624861!5m2!1sen!2s",
  },
  {
    name: "Abdul Hadi Battery Traders - Karachi",
    address: "Shop No 02, Main Razzaqabad Bus Stop, Bin Qasim, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0332-6250288",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.6074869878544!2d68.36548677538791!3d25.384468277591036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIzJzA0LjYiTiA2OMKwMjInMDUuMCJF!5e0!3m2!1sen!2s!4v1781072461007!5m2!1sen!2s",
  },
  {
    name: "Abdul Wahid Battery service Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0345-4220311",
    pin: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14478.745051232441!2d67.1678194!3d24.8745628!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb339a20ea9bb8f%3A0x44cc0edf52ba87c1!2sAbdul%20Hadi%20Battery%20Traders!5e0!3m2!1sen!2s!4v1771619160608!5m2!1sen!2s",
  },
  {
    name: "Agha Battery Centre",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0333-2153353/0306-2807021",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3604.8429794750346!2d68.37056387538772!3d25.376578477595878!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjXCsDIyJzM1LjciTiA2OMKwMjInMjMuMyJF!5e0!3m2!1sen!2s!4v1781072841149!5m2!1sen!2s",
  },
  {
    name: "Aithmad Battery Agra Taj Colony",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3621.329380168492!2d66.99525067536956!3d24.81840707795674!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDQ5JzA2LjMiTiA2NsKwNTknNTIuMiJF!5e0!3m2!1sen!2s!4v1781072421579!5m2!1sen!2s",
  },
  {
    name: "Atif Traders",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0345-5794000",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3619.758822617334!2d66.97610267537127!3d24.872085477921637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDUyJzE5LjUiTiA2NsKwNTknNTg email address is disabled!5e0!3m2!1sen!2s!4v1781071652280!5m2!1sen!2s",
  },
  {
    name: "Bangash battery",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0340-4898273",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3616.597176463477!2d67.06322857537482!3d24.97981637785155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDU4JzQ3LjMiTiA2N8KwMDMnNTYuOSJF!5e0!3m2!1sen!2s!4v1781072058779!5m2!1sen!2s",
  },
  {
    name: "Battery Lab - Karachi",
    address: "Korangi#5-1/2, Sector 43/B, Opposite Jumma Bazar Ground, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0336-2546020/0321-3626962",
    pin: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.1515792807836!2d67.1651621!3d24.824489399999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33bcdce243b89%3A0x7a70a4d68387521b!2sBattery%20lab!5e0!3m2!1sen!2s!4v1771619214630!5m2!1sen!2s",
  },
  {
    name: "Battery Lab Korangi",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0300-0677858",
    pin: "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3621.153962635914!2d67.16255647536977!3d24.82440787795281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDQ5JyI",
  },
  {
    name: "Bismillah Battery service Shehdadpur",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0332-4989712",
    pin: "",
  },
  {
    name: "Chohan Traders Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0300-6058400",
    pin: "",
  },
  {
    name: "Darbar Battery Service - Karachi",
    address: "Shop#197, Garden Takuna Market, Nishtar Road, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0321-3316771/0312-4912286",
    pin: "",
  },
  {
    name: "Delux Battery Service",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0323-6691244",
    pin: "",
  },
  {
    name: "Global Metal",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0300-8198824",
    pin: "",
  },
  {
    name: "Goodluck Battery",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0301-4192819",
    pin: "",
  },
  {
    name: "Habib Battery Service Khipro",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Hammad Battery Agra Taj Karachi",
    address: "Shop#9, Near Navel Flates. Agra Taj Colony, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0322-7661268",
    pin: "",
  },
  {
    name: "Hammad Battery Service - Karachi",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0334-3547835/0301-2600032",
    pin: "",
  },
  {
    name: "Hayat Battery",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0313-7344595",
    pin: "",
  },
  {
    name: "Hayat Traders",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0300-9817799",
    pin: "",
  },
  {
    name: "Ittehad And Company",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0320-4890000",
    pin: "",
  },
  {
    name: "Jahangir Battery",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0333-9944940",
    pin: "",
  },
  {
    name: "Karachi King Battery",
    address: "Shop#1, Near Babar Kanta, Bhens Colony More, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0301-6779541",
    pin: "",
  },
  {
    name: "Karachi Kings Batteries - Karachi",
    address: "Shop#84, PNSC Flat Sector 15-A3, Buffer Zone Nagan Chowrangi, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0312-1367979/0314-2001736",
    pin: "",
  },
  {
    name: "M.S Battery & Solar - Karachi",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0347-2024943",
    pin: "",
  },
  {
    name: "M.S battery and solar",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "M/S Azmi Traders - Karachi",
    address: "Office#312, 3rd Floor Rafique Market Shorab Katrak Road Saddar Regal Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0321-2148726/0322-8229823/0316-2249258",
    pin: "",
  },
  {
    name: "MRP Traders Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0324-6070803",
    pin: "",
  },
  {
    name: "Madina Battery Services - Karachi",
    address: "S-3/97, Opposite Elementry Girls School, Suadabad, Malir Town, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0313-2029758/0306-8582990",
    pin: "",
  },
  {
    name: "Madni Battery Garden",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0345-5762657",
    pin: "",
  },
  {
    name: "Millat Tractor & Battery Centre Nawabshah",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Modern BatteryService",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0321-6030072",
    pin: "",
  },
  {
    name: "Mustafa Battery - Karachi",
    address: "Shop#64, Iqra City Phase II, Abul Isphani Road, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-2378967",
    pin: "",
  },
  {
    name: "Raja Battery Centre Qasimabad Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0301-6519404",
    pin: "",
  },
  {
    name: "Rashid Traders - Karachi",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0314-2288107",
    pin: "",
  },
  {
    name: "Rashid Traders Garden",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Rayyan Battery",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0324-6697095",
    pin: "",
  },
  {
    name: "Rayyan Battery Services - Karachi",
    address: "Shop#13, A-1, Heights, Nishter Road Garden, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Samaviah Traders Hyderabad",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Shahid Ali Battery Shop Qazi Ahmed",
    address: "",
    city: "",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Shahrukh Solar House - Karachi",
    address: "Shop/Plot#02, Sector 32VE, Street#14, Nasir Jump, Korangi Town, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "",
    pin: "",
  },
  {
    name: "Shahrukh solar house",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0313-2280006",
    pin: "",
  },
  {
    name: "Shamim Akhtar Battery Service - Karachi",
    address: "H.NO. L-S -54, SECTOR 1 D, MILLATABAD, COMMERCIAL AREA ORANGI TOWN, Karachi West",
    city: "Karachi",
    province: "SINDH",
    contact: "0331-2920465",
    pin: "",
  },
  {
    name: "Siddiq Battery Traders - Karachi",
    address: "Shop#1/2, Plot C-554, Near Malir Bridge. Quaidabad Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-6163940",
    pin: "",
  },
  {
    name: "Sindh Battery  Safora Karachi",
    address: "Shop#9, Amin Plaza, Garden West, Nishtar Road, Garden West, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-2561392/0312-8734419",
    pin: "",
  },
  {
    name: "Sindh Battery Service - Karachi",
    address: "Shop No C -31, Sunley Arcade, Safoora Chowrangi ,Gulshan Town, Karachi East",
    city: "Karachi",
    province: "SINDH",
    contact: "0334--3038434",
    pin: "",
  },
  {
    name: "Sohail & Hassan Battery - Karachi",
    address: "Shop#D-2/1, Ground Floor, Abid Square, Plot#ST-8/A/2 Block-7 F.B Area, Karachi",
    city: "Karachi",
    province: "SINDH",
    contact: "0300-6032937",
    pin: "",
  },
  {
    name: "Wasey Battery Service",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0306-7509798",
    pin: "",
  },
  {
    name: "Yasir Traders",
    address: "",
    city: "",
    province: "SINDH",
    contact: "0333-2388490/0305-1250601",
    pin: "",
  },
  {
    name: "Zam Zam Batteries Traders - Karachi",
    address: "Shop#50, Defence Garden Appt Phase-1, Main Korangi Road, DHA Karachi.",
    city: "Karachi",
    province: "SINDH",
    contact: "0321-8262505",
    pin: "",
  },
  {
    name: "Ali & Company - Lahore",
    address: "391, Block D3, Main WAPDA Avenue, WAPDA Town, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0300-8035716",
    pin: "",
  },
  {
    name: "Ittefaq Battery House - Nankana Sahib",
    address: "Shop# 1979, Near Admore Pump, Lorry Adda Mangtanwala Road, Nankana Sahib",
    city: "Nankana Sahib",
    province: "PUNJAB",
    contact: "0323-1234562",
    pin: "",
  },
  {
    name: "Muhammadi Battery & Oil Traders - Lahore",
    address: "P-334 Block-6 B-01, Town Ship Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0321-0521000/0323-7104079",
    pin: "",
  },
  {
    name: "New Rajput Battery - Lahore",
    address: "Shop#23, Montgomary Road, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0321-4367254",
    pin: "",
  },
  {
    name: "Sajjad Battery House - Lahore",
    address: "Shop# E/193/2, Bank Stop Main Walton Road, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0300-9415522",
    pin: "",
  },
  {
    name: "Umer Battery Service - Lahore",
    address: "Shop#35, Street#9, New Iqbal Park, Opposite Adil Hospital, DHA, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0300-9045551",
    pin: "",
  },
  {
    name: "Zeb Battery Center - Lahore",
    address: "42 Aziz Road, Misri Shah Opposite WASA office, Chowk Nakhuds, Lahore",
    city: "Lahore",
    province: "PUNJAB",
    contact: "0333-6105632",
    pin: "",
  },
  {
    name: "Al-Nawaz Traders - Multan",
    address: "Shop#1,Volta Market, Vehari Chowk, Multan",
    city: "Multan",
    province: "PUNJAB",
    contact: "0346-7863132/0335-5226667",
    pin: "",
  },
  {
    name: "ASR Traders and Builders Private Limited",
    address: "Office#05, Prime Center Farooq Market, G-13/3, Islamabad",
    city: "Islamabad",
    province: "Federal Capital Territory",
    contact: "0333-5297132",
    pin: "",
  },
  {
    name: "Anoosh And Shafel Traders - Rawalpindi",
    address: "Shop#4 Pindi Cricket Stadium Road, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "",
    pin: "",
  },
  {
    name: "Hafiz Battery Center - Talagang",
    address: "Shop#3, Sunny Market, Mianwali Road, Near Chowk Siddiqabad, Talagang",
    city: "Talagang",
    province: "PUNJAB",
    contact: "0333-5189023",
    pin: "",
  },
  {
    name: "Ikram Battery Center - Ternol",
    address: "Shop#29-A Chaudhary Ayoub Market ( Bank Islami Market) G.T Road, Ternol, Islamabad",
    city: "Islamabad",
    province: "Federal Capital Territory",
    contact: "0336-0530520/0311-1519535",
    pin: "",
  },
  {
    name: "Irfan Battery Centre - Rawalpindi",
    address: "Shop#4324-A, Main Road Daryaabad, Gowalmandi, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "",
    pin: "",
  },
  {
    name: "Melody Battery.Pk - Islamabad",
    address: "Shop No.03, Block.5, Sector.G-6 Markaz,Melody Market, Islamabad",
    city: "Islamabad",
    province: "Federal Capital Territory",
    contact: "",
    pin: "",
  },
  {
    name: "Pak Japan Battery Centre - Islamabad",
    address: "Shop#55, Street#04, I-10/3 Auto Market Islamabad",
    city: "Islamabad",
    province: "Federal Capital Territory",
    contact: "0317-7666507",
    pin: "",
  },
  {
    name: "Prince Battery Center - Rawalpindi",
    address: "Shop#3, Awami Plaza, National Market, Chandni Chowk, Rawalpindi",
    city: "Rawalpindi",
    province: "PUNJAB",
    contact: "",
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
