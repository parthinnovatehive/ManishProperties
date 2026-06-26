export interface SubArea {
  id: string;
  name: string;
  city_id: string;
  status: string;
  slug: string;
}

export interface SubAreaGroup {
  cityId: string;
  cityName: string;
  subareas: SubArea[];
}

const subareasData: SubArea[] = [
  { id: "sub_aurangpura", name: "Aurangpura", city_id: "city_aurangabad", status: "active", slug: "aurangpura" },
  { id: "sub_gulmandi", name: "Gulmandi", city_id: "city_aurangabad", status: "active", slug: "gulmandi" },
  { id: "sub_shahganj", name: "Shahganj", city_id: "city_aurangabad", status: "active", slug: "shahganj" },
  { id: "sub_city_chowk", name: "City Chowk", city_id: "city_aurangabad", status: "active", slug: "city-chowk" },
  { id: "sub_buddi_lane", name: "Buddi Lane", city_id: "city_aurangabad", status: "active", slug: "buddi-lane" },
  { id: "sub_juna_bazaar", name: "Juna Bazaar", city_id: "city_aurangabad", status: "active", slug: "juna-bazaar" },
  { id: "sub_osmanpura", name: "Osmanpura", city_id: "city_aurangabad", status: "active", slug: "osmanpura" },
  { id: "sub_samarth_nagar", name: "Samarth Nagar", city_id: "city_aurangabad", status: "active", slug: "samarth-nagar" },
  { id: "sub_kranti_chowk", name: "Kranti Chowk", city_id: "city_aurangabad", status: "active", slug: "kranti-chowk" },
  { id: "sub_cidco_n1", name: "Cidco N-1", city_id: "city_aurangabad", status: "active", slug: "cidco-n-1" },
  { id: "sub_cidco_n2", name: "Cidco N-2", city_id: "city_aurangabad", status: "active", slug: "cidco-n-2" },
  { id: "sub_cidco_n3", name: "Cidco N-3", city_id: "city_aurangabad", status: "active", slug: "cidco-n-3" },
  { id: "sub_cidco_n4", name: "Cidco N-4", city_id: "city_aurangabad", status: "active", slug: "cidco-n-4" },
  { id: "sub_cidco_n5", name: "Cidco N-5", city_id: "city_aurangabad", status: "active", slug: "cidco-n-5" },
  { id: "sub_cidco_n6", name: "Cidco N-6", city_id: "city_aurangabad", status: "active", slug: "cidco-n-6" },
  { id: "sub_cidco_n7", name: "Cidco N-7", city_id: "city_aurangabad", status: "active", slug: "cidco-n-7" },
  { id: "sub_cidco_n8", name: "Cidco N-8", city_id: "city_aurangabad", status: "active", slug: "cidco-n-8" },
  { id: "sub_cidco_n9", name: "Cidco N-9", city_id: "city_aurangabad", status: "active", slug: "cidco-n-9" },
  { id: "sub_cidco_n10", name: "Cidco N-10", city_id: "city_aurangabad", status: "active", slug: "cidco-n-10" },
  { id: "sub_cidco_n11", name: "Cidco N-11", city_id: "city_aurangabad", status: "active", slug: "cidco-n-11" },
  { id: "sub_cidco_n12", name: "Cidco N-12", city_id: "city_aurangabad", status: "active", slug: "cidco-n-12" },
  { id: "sub_hudco", name: "Hudco", city_id: "city_aurangabad", status: "active", slug: "hudco" },
  { id: "sub_garkheda", name: "Garkheda", city_id: "city_aurangabad", status: "active", slug: "garkheda" },
  { id: "sub_garkheda_parisar", name: "Garkheda Parisar", city_id: "city_aurangabad", status: "active", slug: "garkheda-parisar" },
  { id: "sub_ulkanagari", name: "Ulkanagari", city_id: "city_aurangabad", status: "active", slug: "ulkanagari" },
  { id: "sub_jawahar_colony", name: "Jawahar Colony", city_id: "city_aurangabad", status: "active", slug: "jawahar-colony" },
  { id: "sub_mayur_park", name: "Mayur Park", city_id: "city_aurangabad", status: "active", slug: "mayur-park" },
  { id: "sub_shreya_nagar", name: "Shreya Nagar", city_id: "city_aurangabad", status: "active", slug: "shreya-nagar" },
  { id: "sub_padampura", name: "Padampura", city_id: "city_aurangabad", status: "active", slug: "padampura" },
  { id: "sub_kasliwal_nagar", name: "Kasliwal Nagar", city_id: "city_aurangabad", status: "active", slug: "kasliwal-nagar" },
  { id: "sub_sutgirni_chowk_area", name: "Sutgirni Chowk Area", city_id: "city_aurangabad", status: "active", slug: "sutgirni-chowk-area" },
  { id: "sub_beed_bypass", name: "Beed Bypass", city_id: "city_aurangabad", status: "active", slug: "beed-bypass" },
  { id: "sub_satara_parisar", name: "Satara Parisar", city_id: "city_aurangabad", status: "active", slug: "satara-parisar" },
  { id: "sub_deolai", name: "Deolai", city_id: "city_aurangabad", status: "active", slug: "deolai" },
  { id: "sub_itkheda", name: "Itkheda", city_id: "city_aurangabad", status: "active", slug: "itkheda" },
  { id: "sub_bajajnagar", name: "Bajajnagar", city_id: "city_aurangabad", status: "active", slug: "bajajnagar" },
  { id: "sub_waluj", name: "Waluj", city_id: "city_aurangabad", status: "active", slug: "waluj" },
  { id: "sub_waluj_midc", name: "Waluj MIDC", city_id: "city_aurangabad", status: "active", slug: "waluj-midc" },
  { id: "sub_chikalthana", name: "Chikalthana", city_id: "city_aurangabad", status: "active", slug: "chikalthana" },
  { id: "sub_chikalthana_midc", name: "Chikalthana MIDC", city_id: "city_aurangabad", status: "active", slug: "chikalthana-midc" },
  { id: "sub_airport_road", name: "Airport Road", city_id: "city_aurangabad", status: "active", slug: "airport-road" },
  { id: "sub_padegaon", name: "Padegaon", city_id: "city_aurangabad", status: "active", slug: "padegaon" },
  { id: "sub_kanchanwadi", name: "Kanchanwadi", city_id: "city_aurangabad", status: "active", slug: "kanchanwadi" },
  { id: "sub_nakshatrawadi", name: "Nakshatrawadi", city_id: "city_aurangabad", status: "active", slug: "nakshatrawadi" },
  { id: "sub_mitmita", name: "Mitmita", city_id: "city_aurangabad", status: "active", slug: "mitmita" },
  { id: "sub_jalna_road", name: "Jalna Road", city_id: "city_aurangabad", status: "active", slug: "jalna-road" },
  { id: "sub_seven_hills", name: "Seven Hills", city_id: "city_aurangabad", status: "active", slug: "seven-hills" },
  { id: "sub_town_centre", name: "Town Centre", city_id: "city_aurangabad", status: "active", slug: "town-centre" },
  { id: "sub_chetak_ghoda_chowk", name: "Chetak Ghoda Chowk", city_id: "city_aurangabad", status: "active", slug: "chetak-ghoda-chowk" },
  { id: "sub_nirala_bazar", name: "Nirala Bazar", city_id: "city_aurangabad", status: "active", slug: "nirala-bazar" },
  { id: "sub_adalat_road", name: "Adalat Road", city_id: "city_aurangabad", status: "active", slug: "adalat-road" },
  { id: "sub_railway_station_road", name: "Railway Station Road", city_id: "city_aurangabad", status: "active", slug: "railway-station-road" },
  { id: "sub_harsul", name: "Harsul", city_id: "city_aurangabad", status: "active", slug: "harsul" },
  { id: "sub_mukundwadi", name: "Mukundwadi", city_id: "city_aurangabad", status: "active", slug: "mukundwadi" },
  { id: "sub_shivajinagar", name: "Shivajinagar", city_id: "city_aurangabad", status: "active", slug: "shivajinagar" },
  { id: "sub_begumpura", name: "Begumpura", city_id: "city_aurangabad", status: "active", slug: "begumpura" },
  { id: "sub_roshan_gate", name: "Roshan Gate", city_id: "city_aurangabad", status: "active", slug: "roshan-gate" },
  { id: "sub_bansilal_nagar", name: "Bansilal Nagar", city_id: "city_aurangabad", status: "active", slug: "bansilal-nagar" },
  { id: "sub_jadhavwadi", name: "Jadhavwadi", city_id: "city_aurangabad", status: "active", slug: "jadhavwadi" },
  { id: "sub_pandharpur", name: "Pandharpur", city_id: "city_aurangabad", status: "active", slug: "pandharpur" },
  { id: "sub_pisadevi_road", name: "Pisadevi Road", city_id: "city_aurangabad", status: "active", slug: "pisadevi-road" },
  { id: "sub_khadkeshwar", name: "Khadkeshwar", city_id: "city_aurangabad", status: "active", slug: "khadkeshwar" },
  { id: "sub_jyoti_nagar", name: "Jyoti Nagar", city_id: "city_aurangabad", status: "active", slug: "jyoti-nagar" },
  { id: "sub_sindhi_colony", name: "Sindhi Colony", city_id: "city_aurangabad", status: "active", slug: "sindhi-colony" },
  { id: "sub_shendra_midc", name: "Shendra MIDC", city_id: "city_aurangabad", status: "active", slug: "shendra-midc" },
  { id: "sub_five_star_midc", name: "Five Star MIDC", city_id: "city_aurangabad", status: "active", slug: "five-star-midc" },
  { id: "sub_bajajnagar_industrial_area", name: "Bajajnagar Industrial Area", city_id: "city_aurangabad", status: "active", slug: "bajajnagar-industrial-area" },
  { id: "sub_shendra", name: "Shendra", city_id: "city_aurangabad", status: "active", slug: "shendra" },
  { id: "sub_beed_bypass_road", name: "Beed Bypass Road", city_id: "city_aurangabad", status: "active", slug: "beed-bypass-road" },
  { id: "sub_deolai_road", name: "Deolai Road", city_id: "city_aurangabad", status: "active", slug: "deolai-road" },
  { id: "sub_jalna_road_corridor", name: "Jalna Road Corridor", city_id: "city_aurangabad", status: "active", slug: "jalna-road-corridor" },
  { id: "sub_college_road", name: "College Road", city_id: "city_nashik", status: "active", slug: "college-road" },
  { id: "sub_gangapur_road", name: "Gangapur Road", city_id: "city_nashik", status: "active", slug: "gangapur-road" },
  { id: "sub_govind_nagar", name: "Govind Nagar", city_id: "city_nashik", status: "active", slug: "govind-nagar" },
  { id: "sub_indira_nagar", name: "Indira Nagar", city_id: "city_nashik", status: "active", slug: "indira-nagar" },
  { id: "sub_canada_corner", name: "Canada Corner", city_id: "city_nashik", status: "active", slug: "canada-corner" },
  { id: "sub_sharanpur_road", name: "Sharanpur Road", city_id: "city_nashik", status: "active", slug: "sharanpur-road" },
  { id: "sub_tide_colony", name: "Tide Colony", city_id: "city_nashik", status: "active", slug: "tide-colony" },
  { id: "sub_mahatma_nagar", name: "Mahatma Nagar", city_id: "city_nashik", status: "active", slug: "mahatma-nagar" },
  { id: "sub_parijat_nagar", name: "Parijat Nagar", city_id: "city_nashik", status: "active", slug: "parijat-nagar" },
  { id: "sub_ashok_nagar", name: "Ashok Nagar", city_id: "city_nashik", status: "active", slug: "ashok-nagar" },
  { id: "sub_pathardi_phata", name: "Pathardi Phata", city_id: "city_nashik", status: "active", slug: "pathardi-phata" },
  { id: "sub_makhmalabad", name: "Makhmalabad", city_id: "city_nashik", status: "active", slug: "makhmalabad" },
  { id: "sub_adgaon", name: "Adgaon", city_id: "city_nashik", status: "active", slug: "adgaon" },
  { id: "sub_panchavati", name: "Panchavati", city_id: "city_nashik", status: "active", slug: "panchavati" },
  { id: "sub_hirawadi", name: "Hirawadi", city_id: "city_nashik", status: "active", slug: "hirawadi" },
  { id: "sub_mhasrul", name: "Mhasrul", city_id: "city_nashik", status: "active", slug: "mhasrul" },
  { id: "sub_kamatwade", name: "Kamatwade", city_id: "city_nashik", status: "active", slug: "kamatwade" },
  { id: "sub_rane_nagar", name: "Rane Nagar", city_id: "city_nashik", status: "active", slug: "rane-nagar" },
  { id: "sub_ambad", name: "Ambad", city_id: "city_nashik", status: "active", slug: "ambad" },
  { id: "sub_cidco", name: "Cidco", city_id: "city_nashik", status: "active", slug: "cidco" },
  { id: "sub_anandvalli", name: "Anandvalli", city_id: "city_nashik", status: "active", slug: "anandvalli" },
  { id: "sub_serene_meadows", name: "Serene Meadows", city_id: "city_nashik", status: "active", slug: "serene-meadows" },
  { id: "sub_mumbai_naka", name: "Mumbai Naka", city_id: "city_nashik", status: "active", slug: "mumbai-naka" },
  { id: "sub_dwarka", name: "Dwarka", city_id: "city_nashik", status: "active", slug: "dwarka" },
  { id: "sub_cbs_area", name: "CBS Area", city_id: "city_nashik", status: "active", slug: "cbs-area" },
  { id: "sub_shalimar", name: "Shalimar", city_id: "city_nashik", status: "active", slug: "shalimar" },
  { id: "sub_old_agra_road", name: "Old Agra Road", city_id: "city_nashik", status: "active", slug: "old-agra-road" },
  { id: "sub_trimbak_road", name: "Trimbak Road", city_id: "city_nashik", status: "active", slug: "trimbak-road" },
  { id: "sub_satpur_midc", name: "Satpur MIDC", city_id: "city_nashik", status: "active", slug: "satpur-midc" },
  { id: "sub_ambad_midc", name: "Ambad MIDC", city_id: "city_nashik", status: "active", slug: "ambad-midc" },
  { id: "sub_ojhar_midc", name: "Ojhar MIDC", city_id: "city_nashik", status: "active", slug: "ojhar-midc" },
  { id: "sub_sinnar_midc", name: "Sinnar MIDC", city_id: "city_nashik", status: "active", slug: "sinnar-midc" },
  { id: "sub_nashik_road", name: "Nashik Road", city_id: "city_nashik", status: "active", slug: "nashik-road" },
  { id: "sub_jail_road", name: "Jail Road", city_id: "city_nashik", status: "active", slug: "jail-road" },
  { id: "sub_upnagar", name: "Upnagar", city_id: "city_nashik", status: "active", slug: "upnagar" },
  { id: "sub_dasak", name: "Dasak", city_id: "city_nashik", status: "active", slug: "dasak" },
  { id: "sub_deolali_camp", name: "Deolali Camp", city_id: "city_nashik", status: "active", slug: "deolali-camp" },
  { id: "sub_deolali_gaon", name: "Deolali Gaon", city_id: "city_nashik", status: "active", slug: "deolali-gaon" },
  { id: "sub_chehedi", name: "Chehedi", city_id: "city_nashik", status: "active", slug: "chehedi" },
  { id: "sub_gandharva_nagari", name: "Gandharva Nagari", city_id: "city_nashik", status: "active", slug: "gandharva-nagari" },
  { id: "sub_chandshi", name: "Chandshi", city_id: "city_nashik", status: "active", slug: "chandshi" },
  { id: "sub_rasbihari_link_road", name: "Rasbihari Link Road", city_id: "city_nashik", status: "active", slug: "rasbihari-link-road" },
  { id: "sub_gangapur_someshwar_belt", name: "Gangapur-Someshwar Belt", city_id: "city_nashik", status: "active", slug: "gangapur-someshwar-belt" },
];

const puneSubareas: SubArea[] = [
  { id: "sub_shivajinagar_pune", name: "Shivajinagar", city_id: "city_pune", status: "active", slug: "shivajinagar" },
  { id: "sub_deccan_gymkhana", name: "Deccan Gymkhana", city_id: "city_pune", status: "active", slug: "deccan-gymkhana" },
  { id: "sub_erandwane", name: "Erandwane", city_id: "city_pune", status: "active", slug: "erandwane" },
  { id: "sub_sadashiv_peth", name: "Sadashiv Peth", city_id: "city_pune", status: "active", slug: "sadashiv-peth" },
  { id: "sub_narayan_peth", name: "Narayan Peth", city_id: "city_pune", status: "active", slug: "narayan-peth" },
  { id: "sub_budhwar_peth", name: "Budhwar Peth", city_id: "city_pune", status: "active", slug: "budhwar-peth" },
  { id: "sub_rasta_peth", name: "Rasta Peth", city_id: "city_pune", status: "active", slug: "rasta-peth" },
  { id: "sub_camp_pune", name: "Camp", city_id: "city_pune", status: "active", slug: "camp" },
  { id: "sub_swargate", name: "Swargate", city_id: "city_pune", status: "active", slug: "swargate" },
  { id: "sub_model_colony", name: "Model Colony", city_id: "city_pune", status: "active", slug: "model-colony" },
  { id: "sub_koregaon_park", name: "Koregaon Park", city_id: "city_pune", status: "active", slug: "koregaon-park" },
  { id: "sub_kalyani_nagar", name: "Kalyani Nagar", city_id: "city_pune", status: "active", slug: "kalyani-nagar" },
  { id: "sub_viman_nagar", name: "Viman Nagar", city_id: "city_pune", status: "active", slug: "viman-nagar" },
  { id: "sub_aundh", name: "Aundh", city_id: "city_pune", status: "active", slug: "aundh" },
  { id: "sub_baner", name: "Baner", city_id: "city_pune", status: "active", slug: "baner" },
  { id: "sub_bavdhan", name: "Bavdhan", city_id: "city_pune", status: "active", slug: "bavdhan" },
  { id: "sub_prabhat_road", name: "Prabhat Road", city_id: "city_pune", status: "active", slug: "prabhat-road" },
  { id: "sub_bhandarkar_road", name: "Bhandarkar Road", city_id: "city_pune", status: "active", slug: "bhandarkar-road" },
  { id: "sub_nibm_road", name: "NIBM Road", city_id: "city_pune", status: "active", slug: "nibm-road" },
  { id: "sub_boat_club_road", name: "Boat Club Road", city_id: "city_pune", status: "active", slug: "boat-club-road" },
  { id: "sub_hinjewadi", name: "Hinjewadi", city_id: "city_pune", status: "active", slug: "hinjewadi" },
  { id: "sub_wakad", name: "Wakad", city_id: "city_pune", status: "active", slug: "wakad" },
  { id: "sub_balewadi", name: "Balewadi", city_id: "city_pune", status: "active", slug: "balewadi" },
  { id: "sub_tathawade", name: "Tathawade", city_id: "city_pune", status: "active", slug: "tathawade" },
  { id: "sub_kharadi", name: "Kharadi", city_id: "city_pune", status: "active", slug: "kharadi" },
  { id: "sub_magarpatta", name: "Magarpatta", city_id: "city_pune", status: "active", slug: "magarpatta" },
  { id: "sub_hadapsar", name: "Hadapsar", city_id: "city_pune", status: "active", slug: "hadapsar" },
  { id: "sub_pimple_saudagar", name: "Pimple Saudagar", city_id: "city_pune", status: "active", slug: "pimple-saudagar" },
  { id: "sub_pimple_nilakh", name: "Pimple Nilakh", city_id: "city_pune", status: "active", slug: "pimple-nilakh" },
  { id: "sub_kothrud", name: "Kothrud", city_id: "city_pune", status: "active", slug: "kothrud" },
  { id: "sub_karve_nagar", name: "Karve Nagar", city_id: "city_pune", status: "active", slug: "karve-nagar" },
  { id: "sub_bibwewadi", name: "Bibwewadi", city_id: "city_pune", status: "active", slug: "bibwewadi" },
  { id: "sub_sahakar_nagar", name: "Sahakar Nagar", city_id: "city_pune", status: "active", slug: "sahakar-nagar" },
  { id: "sub_dhankawadi", name: "Dhankawadi", city_id: "city_pune", status: "active", slug: "dhankawadi" },
  { id: "sub_sinhagad_road", name: "Sinhagad Road", city_id: "city_pune", status: "active", slug: "sinhagad-road" },
  { id: "sub_anand_nagar", name: "Anand Nagar", city_id: "city_pune", status: "active", slug: "anand-nagar" },
  { id: "sub_ambegaon", name: "Ambegaon", city_id: "city_pune", status: "active", slug: "ambegaon" },
  { id: "sub_warje", name: "Warje", city_id: "city_pune", status: "active", slug: "warje" },
  { id: "sub_narhe", name: "Narhe", city_id: "city_pune", status: "active", slug: "narhe" },
  { id: "sub_wagholi", name: "Wagholi", city_id: "city_pune", status: "active", slug: "wagholi" },
  { id: "sub_lohegaon", name: "Lohegaon", city_id: "city_pune", status: "active", slug: "lohegaon" },
  { id: "sub_keshav_nagar", name: "Keshav Nagar", city_id: "city_pune", status: "active", slug: "keshav-nagar" },
  { id: "sub_mundhwa", name: "Mundhwa", city_id: "city_pune", status: "active", slug: "mundhwa" },
  { id: "sub_magarpatta_city", name: "Magarpatta City", city_id: "city_pune", status: "active", slug: "magarpatta-city" },
  { id: "sub_chandan_nagar", name: "Chandan Nagar", city_id: "city_pune", status: "active", slug: "chandan-nagar" },
  { id: "sub_pashan", name: "Pashan", city_id: "city_pune", status: "active", slug: "pashan" },
  { id: "sub_sus", name: "Sus", city_id: "city_pune", status: "active", slug: "sus" },
  { id: "sub_mahalunge", name: "Mahalunge", city_id: "city_pune", status: "active", slug: "mahalunge" },
  { id: "sub_bhugaon", name: "Bhugaon", city_id: "city_pune", status: "active", slug: "bhugaon" },
  { id: "sub_pirangut", name: "Pirangut", city_id: "city_pune", status: "active", slug: "pirangut" },
  { id: "sub_kondhwa", name: "Kondhwa", city_id: "city_pune", status: "active", slug: "kondhwa" },
  { id: "sub_nibm", name: "NIBM", city_id: "city_pune", status: "active", slug: "nibm" },
  { id: "sub_undri", name: "Undri", city_id: "city_pune", status: "active", slug: "undri" },
  { id: "sub_mohammadwadi", name: "Mohammadwadi", city_id: "city_pune", status: "active", slug: "mohammadwadi" },
  { id: "sub_katraj", name: "Katraj", city_id: "city_pune", status: "active", slug: "katraj" },
  { id: "sub_yerawada", name: "Yerawada", city_id: "city_pune", status: "active", slug: "yerawada" },
  { id: "sub_vishrantwadi", name: "Vishrantwadi", city_id: "city_pune", status: "active", slug: "vishrantwadi" },
  { id: "sub_dhanori", name: "Dhanori", city_id: "city_pune", status: "active", slug: "dhanori" },
  { id: "sub_tingre_nagar", name: "Tingre Nagar", city_id: "city_pune", status: "active", slug: "tingre-nagar" },
  { id: "sub_bhosari", name: "Bhosari", city_id: "city_pune", status: "active", slug: "bhosari" },
  { id: "sub_moshi", name: "Moshi", city_id: "city_pune", status: "active", slug: "moshi" },
  { id: "sub_chakan", name: "Chakan", city_id: "city_pune", status: "active", slug: "chakan" },
  { id: "sub_alandi_road", name: "Alandi Road", city_id: "city_pune", status: "active", slug: "alandi-road" },
  { id: "sub_pimpri", name: "Pimpri", city_id: "city_pune", status: "active", slug: "pimpri" },
  { id: "sub_chinchwad", name: "Chinchwad", city_id: "city_pune", status: "active", slug: "chinchwad" },
  { id: "sub_nigdi", name: "Nigdi", city_id: "city_pune", status: "active", slug: "nigdi" },
  { id: "sub_akurdi", name: "Akurdi", city_id: "city_pune", status: "active", slug: "akurdi" },
  { id: "sub_ravet", name: "Ravet", city_id: "city_pune", status: "active", slug: "ravet" },
  { id: "sub_punawale", name: "Punawale", city_id: "city_pune", status: "active", slug: "punawale" },
  { id: "sub_pimple_gurav", name: "Pimple Gurav", city_id: "city_pune", status: "active", slug: "pimple-gurav" },
  { id: "sub_thergaon", name: "Thergaon", city_id: "city_pune", status: "active", slug: "thergaon" },
  { id: "sub_spine_road", name: "Spine Road", city_id: "city_pune", status: "active", slug: "spine-road" },
];

const allSubareas = [...subareasData, ...puneSubareas];

const nameToIdMap = new Map<string, string>();
const idToNameMap = new Map<string, string>();
for (const s of allSubareas) {
  nameToIdMap.set(s.name.toLowerCase(), s.id);
  idToNameMap.set(s.id, s.name);
}

const cityNameMap: Record<string, string> = {
  city_aurangabad: "Aurangabad",
  city_nashik: "Nashik",
  city_pune: "Pune",
};

export function fetchSubAreas(): SubArea[] {
  return allSubareas.filter((s) => s.status === "active");
}

export function getSubAreaIdByName(name: string): string | undefined {
  return nameToIdMap.get(name.toLowerCase());
}

export function getSubAreaNameById(id: string): string | undefined {
  return idToNameMap.get(id);
}

export function groupSubAreasByCity(subareas: SubArea[]): SubAreaGroup[] {
  const groups: Record<string, SubArea[]> = {};
  for (const s of subareas) {
    if (!groups[s.city_id]) groups[s.city_id] = [];
    groups[s.city_id].push(s);
  }
  return Object.entries(groups)
    .map(([cityId, items]) => ({
      cityId,
      cityName: cityNameMap[cityId] || cityId,
      subareas: items.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.cityName.localeCompare(b.cityName));
}
