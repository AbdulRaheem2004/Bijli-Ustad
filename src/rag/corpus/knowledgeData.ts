export interface KnowledgeChunk {
  id: string;
  title: string;
  titleUrdu: string;
  category: 'policy' | 'dispute' | 'taxes' | 'solar' | 'efficiency';
  sroCitation: string;
  legalAuthority: string;
  contentEnglish: string;
  contentRomanUrdu: string;
  keywords: string[];
}

export const KNOWLEDGE_CORPUS: KnowledgeChunk[] = [
  {
    id: 'kc-protected-criteria',
    title: 'Protected vs. Unprotected Consumer Status (200 Unit Rule)',
    titleUrdu: 'پروٹیکٹڈ اور ان پروٹیکٹڈ صارف کی تعریف اور ۲۰۰ یونٹ اصول',
    category: 'policy',
    sroCitation: 'S.R.O. 575(I)/2024 & Ministry of Energy Policy Notification',
    legalAuthority: 'NEPRA / Power Division, Govt of Pakistan',
    contentEnglish:
      'Under the Federal Government policy notified via S.R.O. 575(I)/2024, residential consumers are classified as "Protected" only if their monthly electricity consumption has remained 200 units or less for 6 consecutive months. If your consumption exceeds 200 units in even a single month (e.g., 201 units), you immediately lose protected status. The entire bill is then recalculated under the punitive "Unprotected" slab schedule where per-unit rates start significantly higher. To regain protected status, you must keep consumption under 200 units for 6 consecutive billing cycles.',
    contentRomanUrdu:
      'Wafaqi Hukumat ke SRO 575 ke tehat, "Protected" sarif banne ke liye lazmi hai ke pichle lagataar 6 mahine aap ka bijli istemaal 200 units ya us se kam raha ho. Agar kisi aik mahine bhi aap ne 201 units use kar liye, toh aap foran Protected category se bahar ho jayenge aur pura bill mehngi Unprotected slabs ke tehat calculate hoga. Dobara Protected banne ke liye aap ko lagataar 6 mahine 200 units se kam rakhna hoga.',
    keywords: [
      'protected',
      'unprotected',
      '200 units',
      '201 units',
      'threshold',
      'slab jump',
      'mehnga bill',
      'hukumat policy',
      'sro 575',
      '6 months',
      'chhay maheenay',
      'category',
    ],
  },
  {
    id: 'kc-fpa-mechanics',
    title: 'Fuel Price Adjustment (FPA) Calculation and Legal Basis',
    titleUrdu: 'فیول پرائس ایڈجسٹمنٹ (FPA) کا قانونی طریقہ کار',
    category: 'taxes',
    sroCitation: 'NEPRA Act 1997, Section 31(7) & Monthly CPPA-G Petitions',
    legalAuthority: 'National Electric Power Regulatory Authority (NEPRA)',
    contentEnglish:
      'Fuel Price Adjustment (FPA) is a monthly statutory mechanism governed by Section 31(7) of the NEPRA Act. It represents the difference between the Reference Fuel Cost approved in the annual base tariff and the actual fuel cost incurred by CPPA-G to generate electricity in a given month (due to fluctuations in international oil, LNG, and imported coal prices). FPA is determined through public hearings and applied retroactively (e.g. July generation fuel variance is billed on consumer bills in September). FPA is charged per unit on total consumption.',
    contentRomanUrdu:
      'FPA (Fuel Price Adjustment) NEPRA Act ke Section 31(7) ke tehat har mahine lagaya jata hai. Bijli bananay ke liye jo tail, gas (RLNG) aur koyla khareeda jata hai, uski aalmi qeematon mein tabdeeli ka farq FPA kehlata hai. Ye charge aam tor par 2 maheene pehle ki bijli generation par hota hai (maslan July ka FPA September ke bill mein aata hai). FPA har unit par barabar lagta hai.',
    keywords: [
      'fpa',
      'fuel price adjustment',
      'fuel surcharge',
      'fuel charges',
      'tail ki qeemat',
      'cppa',
      'section 31',
      'monthly adjustment',
      'arrears',
    ],
  },
  {
    id: 'kc-csm-detection-bills',
    title: 'NEPRA Consumer Service Manual: Rules on Detection Bills & Slow Meters',
    titleUrdu: 'نیپرا کنزیومر سروس مینول: ڈٹیکشن بل اور سلو میٹر کے قوانین',
    category: 'dispute',
    sroCitation: 'NEPRA Consumer Service Manual (CSM 2021), Chapter 5 & Section 5.1',
    legalAuthority: 'NEPRA Statutory Consumer Protection Regulations',
    contentEnglish:
      'According to Chapter 5 of the NEPRA Consumer Service Manual (CSM), DISCOs are strictly prohibited from issuing arbitrary detection bills. If a meter is suspected of being slow, defective, or tampered with: 1) DISCO must serve a written 7-day show-cause notice to the consumer with evidence; 2) The meter must be tested in an authorized laboratory in the presence of the consumer or their representative; 3) A detection bill for a slow meter can NEVER exceed 2 billing cycles unless clear evidence of direct illegal abstraction exists; 4) Consumers have the legal right to challenge any detection bill before the NEPRA Provincial Office or Electric Inspector under Section 38 of the NEPRA Act.',
    contentRomanUrdu:
      'NEPRA Consumer Service Manual (Chapter 5) ke mutabiq, koi bhi DISCO (LESCO, KE, IESCO etc.) apni marzi se farzi ya andha dhund Detection Bill nahi bhej sakti. Agar meter slow ho toh: 1) DISCO ko pehle 7 din ka written notice bhejna lazmi hai; 2) Meter ki lab testing sarif ki mojoodgi mein honi chahiye; 3) Slow meter ka detection bill ziyada se ziyada 2 maheene ka ho sakta hai, us se ziyada nahi; 4) Aap ko pura haq hai ke aap Electric Inspector ya NEPRA Provincial Office mein iske khilaf complaint darj karwayen.',
    keywords: [
      'detection bill',
      'slow meter',
      'meter testing',
      'defective meter',
      'csm',
      'consumer service manual',
      'illegal abstraction',
      'complaint',
      'electric inspector',
      'chori ka ilzam',
      'bogus bill',
    ],
  },
  {
    id: 'kc-csm-bill-rectification',
    title: 'Disputed Bills & Correction Timeline Rights',
    titleUrdu: 'غلط بل کی درستگی اور صارف کے قانونی حقوق',
    category: 'dispute',
    sroCitation: 'NEPRA Consumer Service Manual (CSM 2021), Chapter 4, Section 4.3',
    legalAuthority: 'NEPRA Consumer Rights Division',
    contentEnglish:
      'Under CSM Chapter 4, Section 4.3, if a bill contains errors (incorrect meter reading, wrong tariff slab, duplicate charges, or excessive units), the consumer can submit an application for rectification to the Revenue Officer or Sub-Divisional Officer (SDO). The DISCO must resolve the dispute within 3 working days. While a bill is under dispute, the connection CANNOT be disconnected, and the consumer is entitled to pay an interim payment based on the average of the last 3 undisputed months until final settlement.',
    contentRomanUrdu:
      'CSM Chapter 4 ke tehat agar aap ke bill mein reading ghalat likhi gayi hai ya ghalat slab laga hai, toh aap apne SDO ya Revenue Officer ko darkhwast de saktay hain. DISCO ko 3 working days ke andar bill theek karna hota hai. Jab tak dispute chal raha ho, DISCO aap ki bijli nahi kaat sakti aur aap pichle 3 maheenon ki average payment jama karwa saktay hain.',
    keywords: [
      'wrong bill',
      'ghalat bill',
      'bill correction',
      'bill dispute',
      'sdo complaint',
      'disconnection',
      'bijli katna',
      'overbilling',
      'reading mistake',
      'meter reading ghalat',
    ],
  },
  {
    id: 'kc-qta-and-fc-surcharge',
    title: 'Quarterly Tariff Adjustment (QTA) & Financing Cost Surcharge (FC)',
    titleUrdu: 'سہ ماہی ٹیرف ایڈجسٹمنٹ (QTA) اور فنانسنگ کاسٹ سرچارج',
    category: 'taxes',
    sroCitation: 'NEPRA Section 31(4) & S.R.O. 342(I)/2023',
    legalAuthority: 'Federal Government / NEPRA',
    contentEnglish:
      'QTA (Quarterly Tariff Adjustment) is determined by NEPRA every 3 months to account for capacity charges variations, system losses, and exchange rate impacts across DISCOs. FC Surcharge (Financing Cost / Debt Servicing Surcharge) is a flat Rs. 3.23 per kWh levied under S.R.O. 342(I)/2023 on all consumers (excluding lifeline) to service sovereign loans and debt repayment of the power holding company.',
    contentRomanUrdu:
      'QTA har 3 maheene baad NEPRA tay karti hai jo capacity payment aur dollar ke exchange rate ki tabdeeli ki wajah se lagti hai. FC Surcharge (Rs. 3.23 fe unit) SRO 342 ke tehat lagaya gaya hai jo circular debt aur power sector ke qarzon ki adaigi ke liye har sarif (siwaye lifeline) se wasool kiya jata hai.',
    keywords: ['qta', 'quarterly tariff adjustment', 'fc surcharge', 'financing cost', 'debt servicing', 'sro 342'],
  },
  {
    id: 'kc-solar-net-metering',
    title: 'Solar Net-Metering Rules, Peak/Off-Peak and Quarterly Rollover',
    titleUrdu: 'سولر نیٹ میٹرنگ: امپورٹ ایکسپورٹ اور سہ ماہی کریڈٹ کے اصول',
    category: 'solar',
    sroCitation: 'NEPRA Distributed Generation Regulations 2015 (S.R.O. 892(I)/2015)',
    legalAuthority: 'NEPRA Renewable Energy Framework',
    contentEnglish:
      'Under NEPRA Regulations 2015, consumers with bidirectional 3-phase meters can supply excess solar energy back to the national grid. Crucial rules include: 1) Solar export units directly offset Off-Peak import units; 2) In most DISCOs, Peak consumption (evening hours) cannot be directly offset by daytime solar export units and must be settled at peak tariff; 3) If quarterly export units exceed import units, the surplus is banked as financial credit at the NEPRA determined national buyback rate (Rs. 22/unit) or rolled over to the next billing quarter.',
    contentRomanUrdu:
      'S.R.O. 892 ke tehat Solar Net-Metering wale sarfeen apni faazil bijli grid ko bech saktay hain. Aham nukaat: 1) Din ki solar generation Off-Peak units ko direct offset karti hai; 2) Sham ke Peak hours ke units solar se direct minus nahi hotay aur unka alag bill banta hai; 3) Agar quarter ke aakhir par aap ke export units import se ziada hon toh uska balance aglay maheene roll over ho jata hai ya Rs. 22 fe unit ke hisab se credit banta hai.',
    keywords: [
      'solar',
      'net metering',
      'green meter',
      'bi-directional',
      'export units',
      'import units',
      'peak hours solar',
      'rollover',
      'solar bill',
      'inverter',
    ],
  },
  {
    id: 'kc-energy-savings-tips',
    title: 'Practical Electricity Saving Rules: Appliances & Wattage Math',
    titleUrdu: 'بجلی بچانے کے عملی طریقے اور گھریلو آلات کا حساب',
    category: 'efficiency',
    sroCitation: 'National Energy Efficiency and Conservation Authority (NEECA)',
    legalAuthority: 'NEECA / Practical Household Engineering',
    contentEnglish:
      'Simple mathematical consumption realities: 1) A 1.5-Ton Inverter AC consumes ~1.2 to 1.5 units per hour during initial cooling, dropping to ~0.7 units/hour when set at 26°C. Running it 8 hours/day at 26°C consumes ~170 units/month vs. 290 units/month at 20°C; 2) Water pumps (1 HP) consume ~0.8 units per 45 minutes; 3) Inverter refrigerators consume ~40-60 units/month vs 90-120 units for older non-inverters; 4) Cutting just 20-30 units to stay below 200 units saves Rs. 4,000 to Rs. 8,000 by preserving Protected status.',
    contentRomanUrdu:
      'Aham bachat ke points: 1) 1.5 Ton Inverter AC ko 26°C par chalayen. 26°C par 8 ghantay rozana chalane se maheene ke lagbhag 170 units bante hain, jabkay 20°C par 290 units bante hain; 2) 1 HP paani ki motor 45 minute chalne par 0.8 unit leti hai; 3) Purana fridge 100+ units leta hai jabkay inverter fridge 50 units leta hai; 4) Sab se bari bachat: agar aap 205 units par hain toh sirf 6 units bacha kar 199 par aane se Protected status bacha saktay hain aur bill aadhi qeemat par aa jata hai.',
    keywords: [
      'ac consumption',
      'inverter ac',
      'bijli bachao',
      'save electricity',
      'appliance units',
      'water motor',
      'fridge units',
      'savings',
      'kam bill',
      '26 degrees',
    ],
  },
];
