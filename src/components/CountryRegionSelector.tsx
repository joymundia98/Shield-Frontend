// CountryRegionSelector.tsx
import { useState, useEffect } from "react";

// Sample countries with regions, you can replace this with your full list
const countriesWithProvinces: Record<string, string[]> = {
  Afghanistan: ["Badakhshan", "Bamyan", "Daykundi", "Ghazni", "Helmand", "Herat", "Jowzjan", "Kabul", "Kandahar", "Kunar", "Kunduz", "Laghman", "Logar", "Nangarhar", "Nimroz", "Nuristan", "Paktia", "Paktika", "Panjshir", "Parwan", "Samangan", "Sar-e Pol", "Takhar", "Urozgan", "Wardak", "Zabul"],
  Albania: ["Berat", "Dibër", "Durres", "Elbasan", "Shkoder", "Fier", "Gjirokaster", "Korçë", "Kukës", "Tiranë"],
  Algeria: ["Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira", "Tamanghasset", "Tébessa", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"],
  Andorra: ["Andorra la Vella", "Escaldes-Engordany", "Encamp", "Sant Julià de Lòria", "La Massana", "Ordino"],
  Angola: ["Bengo", "Benguela", "Bié", "Cabinda", "Cunene", "Huambo", "Huíla", "Kwanza Norte", "Kwanza Sul", "Luanda", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"],
  Antigua_and_Barbuda: ["Barbuda", "Antigua"],
  Argentina: ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  Armenia: ["Aragatsotn", "Ararat", "Armavir", "Gegharkunik", "Kotayk", "Lori", "Shirak", "Syunik", "Tavush", "Vayots Dzor", "Yerevan"],
  Australia: ["Australian Capital Territory", "New South Wales", "Northern Territory", "Queensland", "South Australia", "Tasmania", "Victoria", "Western Australia"],
  Austria: ["Burgenland", "Carinthia", "Lower Austria", "Salzburg", "Styria", "Tyrol", "Upper Austria", "Vorarlberg", "Vienna"],
  Azerbaijan: ["Abseron", "Ganja", "Guba", "Khanlar", "Mingachevir", "Sheki", "Shirvan", "Sizdah", "Sumqayit", "Tartar", "Yardimli", "Baku", "Ganja"],
  Bahamas: ["Acklins", "Andros", "Berry Islands", "Bimini", "Cat Island", "Crooked Island", "Eleuthera", "Exuma", "Grand Bahama", "Inagua", "Long Island", "Mayaguana", "New Providence", "Ragged Island", "San Salvador"],
  Bahrain: ["Capital Governorate", "Northern Governorate", "Southern Governorate", "Muharraq Governorate"],
  Bangladesh: ["Barisal", "Chittagong", "Dhaka", "Khulna", "Rajshahi", "Rangpur", "Sylhet", "Mymensingh", "Rajshahi"],
  Barbados: ["Christ Church", "Saint Andrew", "Saint George", "Saint James", "Saint John", "Saint Joseph", "Saint Lucy", "Saint Michael", "Saint Peter", "Saint Philip", "Saint Thomas", "Trinidad"],
  Belarus: ["Brest", "Gomel", "Grodno", "Minsk", "Mogilev", "Vitebsk"],
  Belgium: ["Antwerp", "East Flanders", "Flemish Brabant", "Hainaut", "Liege", "Limburg", "Luxembourg", "Namur", "Walloon Brabant", "West Flanders"],
  Belize: ["Belize", "Cayo", "Corozal", "Orange Walk", "Toledo", "Stann Creek"],
  Benin: ["Alibori", "Atakora", "Atlantique", "Borgou", "Collines", "Donga", "Kouffo", "Littoral", "Mono", "Ouémé", "Plateau", "Zou"],
  Bhutan: ["Bumthang", "Chukha", "Dagana", "Gasa", "Haa", "Lhuntse", "Mongar", "Paro", "Punakha", "Samdrup Jongkhar", "Sarpang", "Thimphu", "Trashi Yangtse", "Trashigang", "Zhemgang"],
  Bolivia: ["Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí", "Santa Cruz", "Tarija"],
  Bosnia_and_Herzegovina: ["Federation of Bosnia and Herzegovina", "Republika Srpska", "Brčko District"],
  Botswana: ["Central", "Ghanzi", "Kgatleng", "Kweneng", "North-East", "North-West", "South-East", "Southern"],
  Brazil: ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"],
  Brunei: ["Brunei-Muara", "Belait", "Tutong", "Temburong"],
  Bulgaria: ["Blagoevgrad", "Burgas", "Dobrich", "Gabrovo", "Haskovo", "Jambol", "Kardzhali", "Kyustendil", "Lovech", "Montana", "Pazardzhik", "Pernik", "Pleven", "Plovdiv", "Razgrad", "Ruse", "Shumen", "Silistra", "Sliven", "Smolyan", "Sofia", "Stara Zagora", "Targovishte", "Varna", "Veliko Tarnovo", "Vidin", "Vratza"],
  Burkina_Faso: ["Bam", "Balé", "Banzon", "Bougouriba", "Boulkiemdé", "Ganzourgou", "Gnagna", "Gnibouré", "Kadiogo", "Kénédougou", "Kossi", "Komondjari", "Kompienga", "Koulpélogo", "Kouritenga", "Kourwéogo", "Léraba", "Mouhoun", "Noumbiel", "Oudalan", "Passoré", "Poni", "Sanguié", "Sanmatenga", "Sissili", "Soum", "Sourou", "Tapoa", "Tui", "Ziro", "Zoundwéogo"],
  Burundi: ["Bubanza", "Bujumbura Mairie", "Bururi", "Cibitoke", "Gitega", "Karuzi", "Kayanza", "Kirundo", "Makamba", "Muramvya", "Muyinga", "Mwaro", "Ngozi", "Rutana", "Ruyigi"],
  Cabo_Verde: ["Boa Vista", "Brava", "Fogo", "Maio", "Sal", "Santiago", "São Nicolau", "São Vicente"],
  Cambodia: ["Banteay Meanchey", "Battambang", "Kampong Cham", "Kampong Chhnang", "Kampong Speu", "Kampong Thom", "Kandal", "Koh Kong", "Kratié", "Mondulkiri", "Preah Vihear", "Prey Veng", "Pursat", "Ratanakiri", "Siem Reap", "Sihanoukville", "Stung Treng", "Svay Rieng", "Takeo", "Tboung Khmum"],
  Cameroon: ["Adamawa", "Centre", "East", "Far North", "Littoral", "North", "North West", "South", "South West", "West"],
  Canada: ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"],
  Central_African_Republic: ["Bamingui-Bangoran", "Bangui", "Basse-Kotto", "Haut-Mbomou", "Haut-Oubangui", "Kémo", "Lobaye", "Mambéré-Kadéï", "Mbomou", "Nana-Grébizi", "Nana-Mambéré", "Ombella-Mpoko", "Sangha-Mbaéré", "Vakaga", "Ouaka", "Ouham", "Ouham-Pendé"],
  Chad: ["Chari-Baguirmi", "Guéra", "Hadjer-Lamis", "Kanem", "Lac", "Logone Occidental", "Logone Oriental", "Mandoul", "Mayo-Kebbi Est", "Mayo-Kebbi Ouest", "N'Djamena", "Salamat", "Sila", "Tandjilé", "Tchad", "Wadi Fira", "Ouaddaï", "Bahr el-Ghazal", "Borkou", "Tibesti"],
  Chile: ["Antofagasta", "Araucanía", "Arica and Parinacota", "Atacama", "Aysén", "Biobío", "Coquimbo", "Libertador General Bernardo O'Higgins", "Los Lagos", "Los Ríos", "Magallanes", "Maule", "Metropolitana", "Ñuble", "Tarapacá", "Valparaíso"],
  China: ["Anhui", "Beijing", "Chongqing", "Fujian", "Gansu", "Guangdong", "Guangxi", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Macau", "Ningxia", "Qinghai", "Shaanxi", "Shandong", "Shanghai", "Shanxi", "Sichuan", "Tianjin", "Tibet", "Xinjiang", "Yunnan", "Zhejiang"],
  Colombia: ["Amazonas", "Antioquia", "Arauca", "Atlantico", "Bolivar", "Boyaca", "Caldas", "Caqueta", "Casanare", "Cauca", "Cesar", "Choco", "Cordoba", "Cundinamarca", "Guaviare", "Guainia", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindio", "Risaralda", "San Andres and Providencia", "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"],
  Comoros: ["Anjouan", "Grande Comore", "Moheli"],
  Congo: ["Bandundu", "Bas-Congo", "Equateur", "Kasai-Occidental", "Kasai-Oriental", "Katanga", "Kinshasa", "Maniema", "North Kivu", "Orientale", "South Kivu", "West Kasai"],
  "Congo (Democratic Republic)": ["Bas-Congo", "Bandundu", "Equateur", "Kinshasa", "Kasai-Occidental", "Kasai-Oriental", "Katanga", "Maniema", "North Kivu", "South Kivu", "Orientale", "Tshuapa", "Mai-Ndombe", "Kwilu", "Kwango", "Kasaï", "Lualaba", "Haut-Uele", "Ituri"],
  Costa_Rica: ["Alajuela", "Cartago", "Guanacaste", "Heredia", "Limón", "Puntarenas", "San José"],
  Croatia: ["Bjelovar-Bilogora", "Dubrovnik-Neretva", "Istria", "Karlovac", "Koprivnica-Križevci", "Krapina-Zagorje", "Lika-Senj", "Međimurje", "Osijek-Baranja", "Požega-Slavonia", "Primorje-Gorski Kotar", "Sisak-Moslavina", "Split-Dalmatia", "Šibenik-Knin", "Varaždin", "Virovitica-Podravina", "Vukovar-Srijem", "Zadar", "Zagreb", "Zagreb City"],
  Cuba: ["Camagüey", "Ciego de Ávila", "Cienfuegos", "Granma", "Guantánamo", "Havana", "Holguín", "Isla de la Juventud", "Las Tunas", "Matanzas", "Pinar del Río", "Sancti Spíritus", "Santiago de Cuba", "Villa Clara"],
  Cyprus: ["Famagusta", "Kyrenia", "Larnaca", "Limassol", "Nicosia", "Paphos"],
  Czech_Republic: ["Prague", "Central Bohemian", "South Bohemian", "West Bohemian", "East Bohemian", "North Bohemian", "South Moravian", "North Moravian", "Olomouc", "Zlín", "Vysočina", "Pardubice", "Karlovy Vary"],
  Denmark: ["Capital Region", "Central Jutland", "North Jutland", "Zealand", "Southern Denmark"],
  Djibouti: ["Ali Sabieh", "Arta", "Dikhil", "Djibouti", "Tadjourah"],
  Dominica: ["Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Joseph", "Saint Luke", "Saint Mark", "Saint Patrick", "Saint Paul", "Saint Peter"],
  Dominican_Republic: ["Azua", "Baoruco", "Barahona", "Dajabón", "Distrito Nacional", "Duarte", "El Seybo", "Elías Piña", "Espaillat", "Hato Mayor", "Independencia", "La Altagracia", "La Romana", "La Vega", "María Trinidad Sánchez", "Monte Cristi", "Monseñor Nouel", "Monte Plata", "Pedernales", "Peravia", "Puerto Plata", "Samana", "San Cristóbal", "San Juan", "San Pedro de Macorís", "Sánchez Ramírez", "Santiago", "Santiago Rodríguez", "Valverde"],
  Ecuador: ["Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galápagos", "Guayas", "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pichincha", "Tungurahua", "Zamora-Chinchipe"],
  Egypt: ["Alexandria", "Aswan", "Asyut", "Beheira", "Beni Suef", "Cairo", "Dakahlia", "Damietta", "Faiyum", "Gharbia", "Giza", "Ismailia", "Kafr El Sheikh", "Luxor", "Matruh", "Minya", "Monufia", "New Valley", "North Sinai", "Port Said", "Qalyubia", "Qena", "Red Sea", "Sharqia", "Sohag", "South Sinai", "Suez"],
  El_Salvador: ["Ahuachapán", "Cabañas", "Chalatenango", "Cuscatlán", "La Libertad", "La Paz", "La Unión", "Morazán", "San Miguel", "San Salvador", "San Vicente", "Santa Ana", "Sonsonate", "Usulután"],
  Equatorial_Guinea: ["Annobón", "Bioko Norte", "Bioko Sur", "Centro Sur", "Kie-Ntem", "Litoral", "Wele-Nzas"],
  Eritrea: ["Anseba", "Debub", "Gash-Barka", "Maekel", "Semien Keih Bahri"],
  Estonia: ["Harju", "Hiiu", "Ida-Viru", "Jõgeva", "Järva", "Lääne", "Lääne-Viru", "Põlva", "Pärnu", "Rapla", "Saare", "Tartu", "Valga", "Viru", "Viljandi", "Võru"],
  Eswatini: ["Hhohho", "Lubombo", "Manzini", "Shiselweni"],
  Ethiopia: ["Addis Ababa", "Afder", "Amhara", "Benishangul-Gumuz", "Dire Dawa", "Gambela", "Harari", "Oromia", "Sidama", "Southern Nations, Nationalities, and Peoples' Region", "Somali", "Tigray"],
  Fiji: ["Central", "Eastern", "Northern", "Western"],
  Finland: ["Åland Islands", "Central Finland", "Kainuu", "Kymenlaakso", "Lapland", "North Karelia", "North Ostrobothnia", "North Savo", "Ostrobothnia", "Päijät-Häme", "Pirkanmaa", "South Karelia", "South Ostrobothnia", "South Savo", "Uusimaa", "Varsinais-Suomi"],
  France: ["Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire", "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"],
  Gabon: ["Estuaire", "Haut-Ogooué", "Moyen-Ogooué", "Ngounié", "Nyanga", "Ogooué-Ivindo", "Ogooué-Lolo", "Ogooué-Maritime", "Woleu-Ntem"],
  Gambia: ["Banjul", "Brikama", "Janjangbureh", "Kerewan", "Kanifing", "Mansa Konko", "Murataya", "Mile 2", "Sibanor"],
  Georgia: ["Abkhazia", "Adjara", "Guria", "Imereti", "Kakheti", "Kvemo Kartli", "Mtskheta-Mtianeti", "Racha-Lechkhumi and Kvemo Svaneti", "Samegrelo-Zemo Svaneti", "Shida Kartli", "Tbilisi", "Zugdidi"],
  Germany: ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  Ghana: ["Ahafo", "Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern", "Oti", "Western", "Western North", "Volta", "Upper East", "Upper West"],
  Greece: ["Attica", "Central Greece", "Central Macedonia", "Crete", "Eastern Macedonia and Thrace", "Ionian Islands", "Northern Aegean", "Peloponnese", "South Aegean", "Western Greece", "Western Macedonia"],
  Grenada: ["Saint Andrew", "Saint David", "Saint George", "Saint John", "Saint Mark", "Saint Patrick"],
  Guatemala: ["Chimaltenango", "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"],
  Guinea: ["Boké", "Conakry", "Faranah", "Kankan", "Kindia", "Labé", "Mamou", "Nzérékoré"],
  Guinea_Bissau: ["Bafatá", "Biombo", "Bolama", "Cacheu", "Cantá", "Gabu", "Oio", "Quinara", "Tombali"],
  Guyana: ["Barima-Waini", "Cuyuni-Mazaruni", "Demerara-Mahaica", "East Berbice-Corentyne", "Essequibo Islands-West Demerara", "Mahaica-Berbice", "Pomeroon-Supenaam", "Upper Demerara-Berbice", "Upper Takutu-Upper Essequibo"],
  Haiti: ["Artibonite", "Centre", "Grand'Anse", "Nippes", "Nord", "Nord-Est", "Nord-Ouest", "Ouest", "Sud", "Sud-Est"],
  Honduras: ["Atlántida", "Choluteca", "Colón", "Comayagua", "Copán", "Cortes", "El Paraíso", "Francisco Morazán", "Gracias a Dios", "Intibucá", "La Paz", "Lempira", "Ocotepeque", "Olancho", "Santa Bárbara", "Valle", "Yoro"],
  Hungary: ["Bács-Kiskun", "Baranya", "Békés", "Borsod-Abaúj-Zemplén", "Budapest", "Csongrád", "Fejér", "Győr-Moson-Sopron", "Hajdú-Bihar", "Heves", "Jász-Nagykun-Szolnok", "Komárom-Esztergom", "Nógrád", "Pest", "Somogy", "Szabolcs-Szatmár-Bereg", "Tolna", "Vas", "Veszprém", "Zala"],
  Iceland: ["Capital Region", "East", "Northeast", "Northwest", "South", "Southeast", "West", "Westfjords"],
  India: ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Delhi", "Puducherry"],
  Indonesia: ["Aceh", "Bali", "Banten", "Bengkulu", "Gorontalo", "Jakarta", "Jambi", "Jawa Barat", "Jawa Tengah", "Jawa Timur", "Kalimantan Barat", "Kalimantan Selatan", "Kalimantan Tengah", "Kalimantan Timur", "Kepulauan Bangka Belitung", "Kepulauan Riau", "Lampung", "Maluku", "Maluku Utara", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Papua", "Papua Barat", "Riau", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tengah", "Sulawesi Tenggara", "Sulawesi Utara", "Sumatera Barat", "Sumatera Selatan", "Sumatera Utara", "Yogyakarta"],
  Iran: ["Alborz", "Ardabil", "Esfahan", "Fars", "Gilan", "Golestan", "Hamadan", "Hormozgan", "Ilam", "Kerman", "Kermanshah", "Khuzestan", "Kohgiluyeh and Boyer-Ahmad", "Kurdistan", "Lorestan", "Mazandaran", "North Khorasan", "Qazvin", "Qom", "Razavi Khorasan", "Semnan", "Sistan and Baluchestan", "South Khorasan", "Tehran", "Yazd", "Zanjan"],
  Iraq: ["Al-Qadisiyyah", "Anbar", "Baghdad", "Basra", "Dhi Qar", "Diyala", "Erbil", "Karbala", "Kirkuk", "Muthanna", "Najaf", "Nineveh", "Qadisiya", "Salah al-Din", "Sulaymaniyah", "Wasit"],
  Ireland: ["Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford", "Westmeath", "Wexford", "Wicklow"],
  Israel: ["Central", "Haifa", "Jerusalem", "Northern", "Southern", "Tel Aviv"],
  Italy: ["Abruzzo", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont", "Puglia", "Sardinia", "Sicily", "Trentino-South Tyrol", "Tuscany", "Umbria", "Veneto"],
  Jamaica: ["Clarendon", "Hanover", "Kingston", "Manchester", "Portland", "Saint Andrew", "Saint Ann", "Saint Catherine", "Saint Elizabeth", "Saint James", "Saint Mary", "Saint Thomas", "Trelawny", "Westmoreland"],
  Japan: ["Aichi", "Akita", "Amami", "Aomori", "Chiba", "Ehime", "Fukuoka", "Fukui", "Fukuoka", "Gifu", "Gunma", "Hiroshima", "Hokkaido", "Hyogo", "Ibaraki", "Ishikawa", "Iwami", "Ishikawa", "Ishigaki", "Izu", "Kagawa", "Kagoshima", "Kanagawa", "Kochi", "Kumamoto", "Kyoto", "Mie", "Miyagi", "Miyazaki", "Nagano", "Nagasaki", "Nara", "Niigata", "Okinawa", "Osaka", "Saga", "Saitama", "Shiga", "Shimane", "Shizuoka", "Tochigi", "Tokyo", "Tottori", "Toyama", "Wakayama", "Yamagata", "Yamaguchi", "Yokohama"],
  Jordan: ["Ajloun", "Amman", "Irbid", "Jerash", "Karak", "Ma'an", "Madaba", "Mafraq", "Tafilah", "Zarqa"],
  Kazakhstan: ["Akmola", "Aktobe", "Almaty", "Atyrau", "East Kazakhstan", "Jambyl", "Karaganda", "Kostanay", "Kyzylorda", "Mangystau", "Pavlodar", "North Kazakhstan", "South Kazakhstan", "West Kazakhstan", "Almaty city", "Shymkent city"],
  Kenya: ["Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyanza", "Samburu", "Siaya", "Taita Taveta", "Tana River", "Tharaka Nithi", "Trans-Nzoia", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot", "Kakamega", "Mombasa"],
  Kiribati: ["Gilbert Islands", "Line Islands", "Phoenix Islands"],
  Korea_North: ["Chagang", "Hamgyong", "Hwanghae", "Kaesong", "Kangwon", "Koryo", "North P'yongan", "North Hwanghae", "Pyongyang", "South Hwanghae", "South P'yongan", "Sunan"],
  Korea_South: ["Chungcheongbuk", "Chungcheongnam", "Gyeonggi", "Gyeongsangbuk", "Gyeongsangnam", "Jeju", "Jeollabuk", "Jeollanam", "Sejong", "Seoul", "Incheon", "Busan", "Daegu", "Daejeon", "Ulsan", "Gangwon", "North Jeolla", "South Jeolla"],
  Kuwait: ["Al Asimah", "Al Ahmadi", "Al Farwaniyah", "Al Jahra", "Al Mubarak Al Kabeer", "Hawalli", "Capital"],
  Kyrgyzstan: ["Batken", "Chui", "Jalal-Abad", "Naryn", "Osh", "Talas", "Ysyk-Köl"],
  Laos: ["Attapeu", "Bokeo", "Bolikhamsai", "Champasak", "Houaphanh", "Khammouane", "Luang Namtha", "Luang Prabang", "Oudomxay", "Phongsaly", "Savannakhet", "Sekong", "Vientiane", "Vientiane Province", "Xaisomboun", "Xayaburi", "Xieng Khouang"],
  Latvia: ["Aizkraukle", "Alūksne", "Bauska", "Cēsis", "Daugavpils", "Jelgava", "Jurmala", "Jurmala", "Kandava", "Liepāja", "Ludza", "Madona", "Ogre", "Preiļi", "Rīga", "Rēzekne", "Rūjiena", "Sigulda", "Valmiera", "Ventspils"],
  Lebanon: ["Akkar", "Beqaa", "Beirut", "Mount Lebanon", "Nabatieh", "North Lebanon", "South Lebanon", "Zahle"],
  Lesotho: ["Berea", "Mafeteng", "Maseru", "Mohale's Hoek", "Mokhotlong", "Qacha's Nek", "Quthing", "Thaba-Tseka"],
  Liberia: ["Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"],
  Libya: ["Al Buṭnan", "Al Jabal al Akhdar", "Al Jufrah", "Al Khums", "Al Kufrah", "Al Marj", "An Nuqat al Khams", "Az Zawiya", "Benghazi", "Darnah", "Gharyan", "Ghat", "Jabal al Gharbi", "Misrata", "Murzuq", "Nalut", "Nawfaliyah", "Sabratha", "Sirt", "Tubruq", "Wadi al Shatii", "Zliten"],
  Liechtenstein: ["Balzers", "Eschen", "Gamprin", "Mauren", "Planken", "Schaan", "Schellenberg", "Vaduz", "Balzers", "Lichtenstein"],
  Lithuania: ["Alytus", "Kaunas", "Klaipėda", "Marijampolė", "Panevėžys", "Šiauliai", "Tauragė", "Telšiai", "Utena", "Vilnius", "Vilnius City"],
  Luxembourg: ["Grevenmacher", "Luxembourg", "Clervaux", "Diekirch", "Ettelbruck", "Remich", "Wasserbillig", "Wiltz"],
  Madagascar: ["Antananarivo", "Antsiranana", "Fianarantsoa", "Mahajanga", "Toamasina", "Toliara", "Sava", "Vakinankaratra"],
  Malawi: ["Balaka", "Blantyre", "Chikwawa", "Chiradzulu", "Lilongwe", "Machinga", "Mangochi", "Mulanje", "Mzimba", "Nkhata Bay", "Nkhotakota", "Phalombe", "Rumphi", "Salima", "Thyolo", "Zomba"],
  Malaysia: ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Penang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"],
  Maldives: ["Baa Atoll", "Dhaalu Atoll", "Gnaviyani Atoll", "Haa Alif Atoll", "Haa Dhaalu Atoll", "Kaafu Atoll", "Laamu Atoll", "Lhaviyani Atoll", "Maale", "Malé", "Meemu Atoll", "Mudhdhoo", "Noonu Atoll", "Raa Atoll", "Seenu Atoll", "Shaviyani Atoll", "Thaa Atoll"],
  Mali: ["Bamako", "Gao", "Kadiogo", "Kayes", "Kidal", "Koulikoro", "Mopti", "Segou", "Sikasso", "Tombouctou", "Zagora"],
  Malta: ["Attard", "Birgu", "Bormla", "Floriana", "Gzira", "Mosta", "Mtarfa", "Naxxar", "Paola", "Pembroke", "Pietà", "Rabat", "Sliema", "Swieqi", "Tarxien", "Valletta"],
  Marshall_Islands: ["Ailinglaplap", "Ailuk", "Arno", "Bikar", "Enewetak", "Jaluit", "Kwajalein", "Lae", "Lib", "Majuro", "Maloelap", "Mejit", "Mili", "Namorik", "Namu", "Rongelap", "Runit", "Ujae", "Utirik"],
  Mauritania: ["Adrar", "Assaba", "Brakna", "Gorgol", "Guidimaka", "Hodh Ech Chargui", "Hodh El Gharbi", "Inchiri", "Nouakchott", "Tagant", "Tiris Zemmour"],
  Mauritius: ["Black River", "Flacq", "Grand Port", "Moka", "Pamplemousses", "Plaines Wilhems", "Port Louis", "Rivière du Rempart", "Savanne", "Rodrigues"],
  Mexico: ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Mexico", "Mexico City", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
  Micronesia: ["Chuuk", "Kosrae", "Pohnpei", "Yap"],
  Moldova: ["Anenii Noi", "Bălți", "Bender", "Briceni", "Cahul", "Cantemir", "Călărași", "Căușeni", "Chișinău", "Criuleni", "Dondușeni", "Drochia", "Edineț", "Fălești", "Florești", "Găgăuzia", "Glodeni", "Hîncești", "Ialoveni", "Leova", "Nisporeni", "Ocnita", "Orhei", "Rezina", "Rîșcani", "Sîngerei", "Slobozia", "Strășeni", "Telenesti", "Telenești", "Ungheni"],
  Monaco: ["Monaco"],
  Mongolia: ["Arhangai", "Bayankhongor", "Bulgan", "Darhan-Uul", "Dornod", "Dornogovi", "Dundgovi", "Govi-Altai", "Govisümber", "Khentii", "Khovd", "Khuvsgul", "Orkhon", "Ovorhangai", "Selenge", "Töv", "Ulaanbaatar", "Uvs", "Zavkhan"],
  Montenegro: ["Andrijevica", "Bar", "Berane", "Bijelo Polje", "Cetinje", "Danilovgrad", "Herceg Novi", "Kolašin", "Nikšić", "Plav", "Pljevlja", "Podgorica", "Rožaje", "Šavnik", "Tivat", "Ulcinj", "Zabljak"],
  Morocco: ["Agadir-Ida-Ou-Tanane", "Al Haouz", "Azilal", "Ben Slimane", "Benslimane", "Boujdour", "Casablanca", "Chaouia-Ouardigha", "Chtouka-Ait Baha", "Draa-Tafilalet", "El Jadida", "Fès", "Fès-Meknès", "Guelmim-Oued Noun", "Ifrane", "Kénitra", "Khemisset", "Khémisset", "Laâyoune-Sakia El Hamra", "Marrakech-Tensift-Al Haouz", "Meknès", "Nador", "Ouarzazate", "Rabat-Salé-Zemmour-Zaer", "Safi", "Settat", "Sidi Kacem", "Sidi Slimane", "Tangier-Tetouan-Al Hoceima", "Taza-Al Hoceima-Taounate", "Tetouan"],
  Portugal: ["Aveiro", "Beja", "Braga", "Bragança", "Castelo Branco", "Coimbra", "Évora", "Faro", "Guarda", "Leiria", "Lisbon", "Madeira", "Oporto", "Portalegre", "Santarém", "Setúbal", "Viana do Castelo", "Vila Real", "Viseu"],
  Qatar: ["Doha", "Al Daayen", "Al Khor", "Al Shahaniya", "Al Wakrah", "Al Rayyan", "Umm Salal"],
  Romania: ["Alba", "Arad", "Arges", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brașov", "Brăila", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea"],
  Russia: ["Adygea", "Altai", "Amur", "Arkhangelsk", "Astrakhan", "Bashkortostan", "Belgorod", "Bryansk", "Buryatia", "Chechnya", "Chelyabinsk", "Chukotka", "Chuvashia", "Dagestan", "Ingushetia", "Irkutsk", "Ivanovo", "Kabardino-Balkaria", "Kaliningrad", "Kaluga", "Kamchatka", "Kemerovo", "Khabarovsk", "Khakassia", "Kirov", "Komi", "Kostroma", "Krasnodar", "Krasnoyarsk", "Kurgan", "Kursk", "Leningrad", "Lipetsk", "Moscow", "Murmansk", "Nizhny Novgorod", "North Ossetia-Alania", "Omsk", "Orenburg", "Oryol", "Penza", "Perm", "Primorye", "Pskov", "Rostov", "Ryazan", "Sakha", "Sakhalin", "Samara", "Saratov", "Smolensk", "St. Petersburg", "Sverdlovsk", "Tambov", "Tatarstan", "Tomsk", "Tula", "Tver", "Tyumen", "Udmurtia", "Ulyanovsk", "Vladimir", "Volgograd", "Vologda", "Voronezh", "Yamalo-Nenets", "Yaroslavl", "Zabaykalsky"],
  Rwanda: ["Eastern Province", "Kigali", "Northern Province", "Western Province", "Southern Province"],
  Saint_Kitts_and_Nevis: ["Christ Church Nichola Town", "Saint Anne Sandy Point", "Saint George Basseterre", "Saint George Gingerland", "Saint James Windward", "Saint John Capisterre", "Saint John Figtree", "Saint Mary Cayon", "Saint Paul Capisterre", "Saint Paul’s", "Trinity Palmetto Point"],
  Saint_Lucia: ["Castries", "Choiseul", "Dennery", "Gros Islet", "Laborie", "Mabouya Valley", "Soufrière", "Vieux Fort"],
  Saint_Vincent_and_the_Grenadines: ["Charlotte", "Grenadines", "Saint Andrew", "Saint David", "Saint George", "Saint Patrick"],
  Samoa: ["Aiga-i-le-Tai", "Atua", "Fa'asaleleaga", "Gaga'emauga", "Gagaifomauga", "Palauli", "Satupa'itea", "Tofa", "Vaimauga", "Va'a-o-Fonoti"],
  San_Marino: ["Acquaviva", "Borgo Maggiore", "Chiesanuova", "Domagnano", "Faetano", "Fiorentino", "Montegiardino", "San Marino", "Serravalle"],
  Sao_Tome_and_Principe: ["Água Grande", "Cantagalo", "Lembá", "Me-Zóchi", "Norte", "Pacuá", "Principe", "Santo Amaro"],
  Saudi_Arabia: ["Al Bahah", "Al Jawf", "Al Qassim", "Al Riyadh", "Asir", "Eastern Province", "Hail", "Jizan", "Makkah", "Medina", "Najran", "Northern Borders", "Tabuk", "Riyadh"],
  Senegal: ["Dakar", "Diourbel", "Fatick", "Fatik", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thies", "Ziguinchor"],
  Serbia: ["Beograd", "Borski", "Braničevo", "Central Serbia", "Jablanica", "Kosovo", "Kosovo and Metohija", "Macedonia", "Mojkovac", "Moravička", "Niš", "Pirot", "Pomoravlje", "Srem", "Šumadija", "Vojvodina", "Zaječar"],
  Seychelles: ["Anse Boileau", "Anse Etoile", "Anse Louis", "Anse Royale", "Baie Lazare", "Baie Sainte Anne", "Bel Air", "Bel Ombre", "Cascade", "Glacis", "Grand Anse", "La Digue", "Les Mamelles", "Mont Fleuri", "Plaisance", "Port Glaud", "Saint Anne", "Takamaka"],
  Sierra_Leone: ["Eastern", "Northern", "Southern", "Western Area"],
  Singapore: ["Central", "Eastern", "Northern", "Southern", "Western"],
  Slovakia: ["Banská Bystrica", "Bratislava", "Košice", "Nitra", "Prešov", "Trenčín", "Trnava", "Žilina"],
  Slovenia: ["Pomurska", "Podravska", "Osrednjeslovenska", "Jugovzhodna Slovenija", "Osrednje Primorska", "Jugoslovenska Primorska", "Primorska", "Notranjsko-Kraška", "Osrednje-Koroška"],
  Solomon_Islands: ["Central", "Choiseul", "Guadalcanal", "Honiara", "Isabel", "Makira-Ulawa", "Malaita", "Rennell and Bellona", "Temotu", "Western"],
  Somalia: ["Awdal", "Bakool", "Banaadir", "Bari", "Bay", "Galgaduud", "Gedo", "Hiiraan", "Jubbada Dhexe", "Jubbada Hoose", "Mudug", "Nugaal", "Sool", "Sanaag", "Shabelle Dhexe", "Shabelle Hoose", "Togdheer", "Woqooyi Galbeed"],
  South_Africa: ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"],
  South_Sudan: ["Central Equatoria", "Eastern Equatoria", "Jonglei", "Lakes", "Northern Bahr el Ghazal", "Western Bahr el Ghazal", "Western Equatoria", "Upper Nile", "Unity", "Warrap"],
  Spain: ["Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands", "Cantabria", "Castile and León", "Castile-La Mancha", "Catalonia", "Extremadura", "Galicia", "Madrid", "Murcia", "Navarre", "La Rioja", "Valencia", "Ceuta", "Melilla"],
  Sri_Lanka: ["Central", "Eastern", "Northern", "North Western", "North Central", "Sabaragamuwa", "Southern", "Uva", "Western"],
  Sudan: ["Blue Nile", "Central Darfur", "East Darfur", "Gharb Darfur", "Ghiryan", "Khartoum", "Kordofan", "Northern", "Red Sea", "Sennar", "South Darfur", "Western Darfur", "White Nile", "Wadi Halfa"],
  Suriname: ["Brokopondo", "Commewijne", "Coronie", "Para", "Paramaribo", "Saramacca", "Marowijne", "Wanica"],
  Sweden: ["Blekinge", "Dalarna", "Gotland", "Gävleborg", "Halland", "Hälsingland", "Jämtland", "Jönköping", "Kalmar", "Kronoberg", "Norrbotten", "Örebro", "Östergötland", "Skåne", "Södermanland", "Stockholm", "Uppsala", "Värmland", "Västerbotten", "Västernorrland", "Västmanland", "Västra Götaland"],
  Switzerland: ["Aargau", "Appenzell Ausserrhoden", "Appenzell Innerrhoden", "Basel-Landschaft", "Basel-Stadt", "Bern", "Fribourg", "Geneva", "Glarus", "Graubünden", "Jura", "Lucerne", "Neuchâtel", "Nidwalden", "Obwalden", "Schaffhausen", "Schwyz", "Solothurn", "St. Gallen", "Ticino", "Thurgau", "Uri", "Valais", "Vaud", "Zug", "Zurich"],
  Syria: ["Aleppo", "Al-Hasakah", "Al-Quneitra", "Damascus", "Daraa", "Deir ez-Zor", "Hama", "Homs", "Idlib", "Lattakia", "Rif Dimashq", "Tartus"],
  Taiwan: ["Changhua", "Chiayi", "Hsinchu", "Hualien", "Keelung", "Kinmen", "Matsu", "Nantou", "New Taipei", "Penghu", "Taichung", "Tainan", "Taipei", "Taitung", "Taoyuan", "Yilan"],
  Tajikistan: ["Ayni", "Badakhshan", "Gorno-Badakhshan", "Khatlon", "Khujand", "Sugd", "Tajikistan"],
  Tanzania: ["Arusha", "Dar es Salaam", "Dodoma", "Iringa", "Kagera", "Katavi", "Kigoma", "Kilimanjaro", "Lindi", "Mara", "Mbeya", "Morogoro", "Mtwara", "Mwanza", "Njombe", "Pemba North", "Pemba South", "Rukwa", "Ruvuma", "Shinyanga", "Simiyu", "Singida", "Tanga", "Zanzibar"],
  Thailand: ["Bangkok", "Chachoengsao", "Chaiyaphum", "Chanthaburi", "Chiang Mai", "Chiang Rai", "Chonburi", "Krabi", "Lampang", "Lamphun", "Loei", "Lopburi", "Mae Hong Son", "Makham", "Nakhon Nayok", "Nakhon Pathom", "Nakhon Ratchasima", "Nakhon Sawan", "Nakhon Si Thammarat", "Nan", "Narathiwat", "Nong Bua Lamphu", "Nong Khai", "Pathum Thani", "Pattani", "Phang Nga", "Phatthalung", "Phayao", "Phetchabun", "Phetchaburi", "Phichit", "Phitsanulok", "Prachinburi", "Prachuap Khiri Khan", "Ranong", "Ratchaburi", "Rayong", "Roi Et", "Sa Kaeo", "Sakon Nakhon", "Samut Prakan", "Samut Sakhon", "Samut Songkhram", "Saraburi", "Satun", "Sing Buri", "Sukhothai", "Suphan Buri", "Surat Thani", "Surin", "Tak", "Trang", "Trat", "Ubon Ratchathani", "Udon Thani", "Uthai Thani", "Uttaradit", "Yala", "Yasothon"],
  Timor_Leste: ["Aileu", "Ainaro", "Baucau", "Bobonaro", "Covalima", "Díli", "Ermera", "Lautem", "Liquiça", "Manatuto", "Manufahi", "Oecusse", "Viqueque"],
  Togo: ["Centrale", "Kara", "Maritime", "Savanes"],
  Tonga: ["Ha'apai", "Niuas", "Tongatapu", "Vava'u"],
  Trinidad_and_Tobago: ["Arima", "Chaguanas", "Couva-Tabaquite-Talparo", "Diego Martin", "Diberes", "Gulf of Paria", "Lavinia", "Lopatka", "Mayaro-Rio Claro", "Port of Spain", "Princes Town", "San Fernando", "San Juan", "Sangre Grande", "Tunapuna-Piarco"],
  Tunisia: ["Ariana", "Beja", "Ben Arous", "Bizerte", "Gabes", "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kebili", "Kef", "Mahdia", "Manouba", "Medenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Tataouine", "Tozeur", "Tunis", "Zaghouan"],
  Turkey: ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kastamonu", "Kayseri", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Sivas", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"],
  Turkmenistan: ["Ahal", "Balkan", "Dashoguz", "Lebap", "Mary"],
  Tuvalu: ["Funafuti", "Nukufetau", "Niutao", "Nanumea", "Vaitupu"],
  Uganda: ["Central", "Eastern", "Northern", "Western"],
  Ukraine: ["Cherkasy", "Chernihiv", "Chernivtsi", "Dnipropetrovsk", "Donetsk", "Ivano-Frankivsk", "Kharkiv", "Kherson", "Khmelnytskyi", "Kiev", "Kirovohrad", "Luhansk", "Lviv", "Mykolaiv", "Odesa", "Poltava", "Rivne", "Sumy", "Ternopil", "Vinnytsia", "Volyn", "Zakarpattia", "Zaporizhzhia", "Zhytomyr"],
  United_Arab_Emirates: ["Abu Dhabi", "Ajman", "Dubai", "Fujairah", "Ras Al Khaimah", "Sharjah", "Umm Al-Quwain"],
  United_Kingdom: ["England", "Northern Ireland", "Scotland", "Wales"],
  United_States: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  Uruguay: ["Artigas", "Canelones", "Cerro Largo", "Colonia", "Durazno", "Flores", "Florida", "Lavalleja", "Maldonado", "Montevideo", "Paysandú", "Rio Negro", "Rivera", "Rocha", "Salto", "San José", "Soriano", "Tacuarembó", "Treinta y Tres"],
  Uzbekistan: ["Andijan", "Bukhara", "Fergana", "Jizzakh", "Kashkadarya", "Khorezm", "Namangan", "Navoiy", "Samarkand", "Sirdarya", "Surkhandarya", "Tashkent", "Tashkent City", "Bukhara", "Republic of Karakalpakstan"],
  Vanuatu: ["Malampa", "Penama", "Sanma", "Shefa", "Tafea", "Torba"],
  Vatican_City: [], // Vatican City is a city-state with no administrative divisions.
  Venezuela: ["Amazonas", "Anzoátegui", "Apure", "Aragua", "Barinas", "Bolívar", "Carabobo", "Cojedes", "Delta Amacuro", "Falcón", "Guárico", "Lara", "Miranda", "Monagas", "Nueva Esparta", "Portuguesa", "Sucre", "Táchira", "Trujillo", "Yaracuy", "Zulia"],
  Vietnam: ["An Giang", "Bà Rịa–Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tây", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên–Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"],
  Yemen: ["Aden", "Al Bayda", "Al Hudaydah", "Al Jawf", "Al Maharah", "Al Mahwit", "Amran", "Abyan", "Dhamar", "Hadramaut", "Hajjah", "Ibb", "Lahij", "Ma'rib", "Sa'dah", "Sana'a", "Shabwah", "Socotra", "Ta'izz", "Hadramawt"],
  Zambia: ["Central", "Copperbelt", "Eastern", "Luapula", "Lusaka", "Muchinga", "Northern", "North-Western", "Southern", "Western"],
  Zimbabwe: ["Bulawayo", "Harare", "Manicaland", "Mashonaland Central", "Mashonaland East", "Mashonaland West", "Masvingo", "Matabeleland North", "Matabeleland South", "Midlands"]
};

interface CountryRegionSelectorProps {
  onCountryChange: (country: string) => void;
  onRegionChange: (region: string) => void;
  selectedCountry: string;
  selectedRegion: string;
  errorMessage?: string;
}

const CountryRegionSelector: React.FC<CountryRegionSelectorProps> = ({ onCountryChange, onRegionChange, selectedCountry, selectedRegion, errorMessage }) => {
  const [regions, setRegions] = useState<string[]>([]);

  useEffect(() => {
    if (selectedCountry) {
      const selectedRegions = countriesWithProvinces[selectedCountry] || [];
      setRegions(selectedRegions);
    }
  }, [selectedCountry]);

  return (
    <div>
      {/* Country Dropdown */}
      <div className="field input-field select-field">
        <select value={selectedCountry} onChange={(e) => onCountryChange(e.target.value)}>
          <option value="" disabled>Select Country</option>
          {Object.keys(countriesWithProvinces).map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
          <option value="Not Listed">Not Listed</option>
        </select>
      </div>

      {/* Region Dropdown */}
      <div className="field input-field select-field">
        <select value={selectedRegion} onChange={(e) => onRegionChange(e.target.value)} disabled={!selectedCountry}>
          <option value="" disabled>Select Region</option>
          {regions.map((region, idx) => (
            <option key={idx} value={region}>
              {region}
            </option>
          ))}
          <option value="Not Listed">Not Listed</option>
        </select>
      </div>

      {/* Display error message */}
      {errorMessage && <p className="form-error">{errorMessage}</p>}
    </div>
  );
};

export default CountryRegionSelector;
