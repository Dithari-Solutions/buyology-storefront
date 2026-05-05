import type { Lang } from "@/config/pathSlugs";

export type StaticPageKey =
  | "home"
  | "shop"
  | "rent"
  | "repair"
  | "sell"
  | "quick-delivery"
  | "b2b"
  | "b2b-apply"
  | "contact"
  | "games"
  | "favourites"
  | "cart"
  | "checkout"
  | "profile"
  | "orders"
  | "auth"
  | "signin"
  | "become-a-supplier"
  | "catalog"
  | "map"
  | "unsubscribe"
  | "payment-callback";

interface PageMeta {
  title: string;
  description: string;
  keywords?: string[];
}

export const STATIC_PAGE_META: Record<StaticPageKey, Record<Lang, PageMeta>> = {
  home: {
    en: {
      title: "Buyology — Buy, Rent, Repair and Sell Online",
      description:
        "Shop electronics, gadgets and lifestyle products. Buy, rent, repair and sell — all in one place with fast delivery and secure checkout.",
      keywords: ["online shopping", "ecommerce", "buy electronics", "marketplace"],
    },
    az: {
      title: "Buyology — Onlayn Al, İcarə, Təmir və Sat",
      description:
        "Elektronika, qadcetlər və məişət məhsullarını al, icarəyə götür, təmir et və sat — hamısı bir yerdə, sürətli çatdırılma ilə.",
      keywords: ["onlayn alış-veriş", "elektronika", "marketpleys"],
    },
    ar: {
      title: "Buyology — اشترِ واستأجر وأصلح وبع عبر الإنترنت",
      description:
        "تسوق الإلكترونيات والأجهزة ومنتجات نمط الحياة. اشترِ واستأجر وأصلح وبع في مكان واحد مع توصيل سريع.",
      keywords: ["تسوق إلكتروني", "متجر إلكتروني", "إلكترونيات"],
    },
  },
  shop: {
    en: {
      title: "Shop All Products — Electronics, Gadgets and Deals",
      description:
        "Browse our full catalog of smartphones, laptops, accessories and lifestyle products. Filter by brand, price and specs. Best deals every day.",
      keywords: ["shop online", "electronics store", "smartphones", "laptops", "deals"],
    },
    az: {
      title: "Mağaza — Elektronika, Qadcetlər və Endirimlər",
      description:
        "Smartfonlar, noutbuklar, aksesuarlar və daha çoxu. Brend, qiymət və xüsusiyyətlərə görə filtrlə. Hər gün ən yaxşı təkliflər.",
      keywords: ["onlayn mağaza", "smartfon", "noutbuk", "endirim"],
    },
    ar: {
      title: "تسوق جميع المنتجات — الإلكترونيات والأجهزة والعروض",
      description:
        "تصفح كتالوجنا الكامل من الهواتف الذكية وأجهزة الكمبيوتر المحمولة والإكسسوارات. صفّ حسب العلامة التجارية والسعر والمواصفات.",
      keywords: ["متجر إلكتروني", "هواتف", "أجهزة كمبيوتر", "عروض"],
    },
  },
  rent: {
    en: {
      title: "Rent Electronics and Gadgets",
      description:
        "Rent the latest electronics, gadgets and tools by the day, week or month. Flexible terms, insured equipment, fast delivery.",
      keywords: ["rent electronics", "gadget rental", "rent laptop", "rent camera"],
    },
    az: {
      title: "Elektronika və Qadcet İcarəsi",
      description:
        "Ən son elektronikanı, qadcetləri və alətləri günlük, həftəlik və aylıq icarəyə götür. Çevik şərtlər, sığortalanmış avadanlıq.",
      keywords: ["icarə", "noutbuk icarəsi", "kamera icarəsi"],
    },
    ar: {
      title: "استئجار الإلكترونيات والأجهزة",
      description:
        "استأجر أحدث الإلكترونيات والأجهزة والأدوات يومياً أو أسبوعياً أو شهرياً. شروط مرنة وتوصيل سريع.",
      keywords: ["إيجار إلكترونيات", "تأجير أجهزة"],
    },
  },
  repair: {
    en: {
      title: "Repair Service — Phones, Laptops and Devices",
      description:
        "Fast and reliable repair service for smartphones, laptops, tablets and home electronics. Certified technicians and warranty.",
      keywords: ["phone repair", "laptop repair", "device repair service"],
    },
    az: {
      title: "Təmir Xidməti — Telefon, Noutbuk və Cihazlar",
      description:
        "Smartfonlar, noutbuklar və ev elektronikası üçün sürətli və etibarlı təmir xidməti. Sertifikatlı ustalar və zəmanət.",
      keywords: ["telefon təmiri", "noutbuk təmiri", "cihaz təmiri"],
    },
    ar: {
      title: "خدمة الإصلاح — الهواتف وأجهزة الكمبيوتر المحمولة والأجهزة",
      description:
        "خدمة إصلاح سريعة وموثوقة للهواتف الذكية وأجهزة الكمبيوتر المحمولة والأجهزة اللوحية. فنيون معتمدون وضمان.",
      keywords: ["إصلاح هاتف", "إصلاح كمبيوتر", "خدمة إصلاح"],
    },
  },
  sell: {
    en: {
      title: "Sell on Buyology — Reach Millions of Buyers",
      description:
        "List your products on Buyology and sell to a global audience. Easy onboarding, secure payouts and powerful seller tools.",
      keywords: ["sell online", "marketplace seller", "online seller"],
    },
    az: {
      title: "Buyology-də Sat — Milyonlarla Alıcıya Çat",
      description:
        "Məhsullarını Buyology-də yerləşdir və qlobal auditoriyaya sat. Asan qeydiyyat, təhlükəsiz ödənişlər və güclü alətlər.",
      keywords: ["onlayn sat", "marketpleys satıcı"],
    },
    ar: {
      title: "بِع على Buyology — اوصل إلى ملايين المشترين",
      description:
        "اعرض منتجاتك على Buyology وبع لجمهور عالمي. تسجيل سهل، مدفوعات آمنة وأدوات قوية للبائعين.",
      keywords: ["بيع إلكتروني", "بائع"],
    },
  },
  "quick-delivery": {
    en: {
      title: "Quick Delivery — Same-Day and Express Shipping",
      description:
        "Get your orders delivered same-day or next-day with Buyology Quick Delivery. Real-time tracking and reliable couriers.",
      keywords: ["same day delivery", "express delivery", "fast shipping"],
    },
    az: {
      title: "Tez Çatdırılma — Eyni Gün və Ekspres",
      description:
        "Sifarişlərini eyni gün və ya növbəti gün Buyology Tez Çatdırılma ilə qəbul et. Real vaxt izləmə və etibarlı kuryerlər.",
      keywords: ["tez çatdırılma", "ekspres çatdırılma"],
    },
    ar: {
      title: "توصيل سريع — في نفس اليوم وشحن سريع",
      description:
        "استلم طلباتك في نفس اليوم أو اليوم التالي مع Buyology Quick Delivery. تتبع لحظي ومراسلون موثوقون.",
      keywords: ["توصيل سريع", "شحن سريع"],
    },
  },
  b2b: {
    en: {
      title: "Buyology B2B — Wholesale Marketplace for Businesses",
      description:
        "Source bulk products at wholesale prices. Verified suppliers, dedicated account managers and flexible payment terms for businesses.",
      keywords: ["B2B marketplace", "wholesale", "bulk buying", "business supplier"],
    },
    az: {
      title: "Buyology B2B — Bizneslər üçün Topdansatış Marketpleys",
      description:
        "Topdansatış qiymətlərlə kütləvi məhsullar əldə et. Yoxlanılmış tədarükçülər və çevik ödəniş şərtləri.",
      keywords: ["B2B", "topdansatış", "biznes"],
    },
    ar: {
      title: "Buyology B2B — سوق الجملة للأعمال",
      description:
        "احصل على منتجات بكميات كبيرة بأسعار الجملة. موردون موثوقون ومديرو حسابات مخصصون وشروط دفع مرنة.",
      keywords: ["سوق الجملة", "B2B", "تجارة"],
    },
  },
  "b2b-apply": {
    en: {
      title: "Apply for B2B Membership",
      description: "Submit your business application to access wholesale prices and B2B benefits on Buyology.",
    },
    az: {
      title: "B2B Üzvlüyü üçün Müraciət",
      description: "Topdansatış qiymətlər və B2B üstünlüklər üçün biznes müraciətini göndər.",
    },
    ar: {
      title: "التقدم لعضوية B2B",
      description: "قدّم طلب عملك للوصول إلى أسعار الجملة ومزايا B2B على Buyology.",
    },
  },
  contact: {
    en: {
      title: "Contact Us — Buyology Customer Support",
      description:
        "Get in touch with Buyology customer support. We're here 24/7 to help with orders, returns, B2B and partnership inquiries.",
      keywords: ["contact buyology", "customer support", "help"],
    },
    az: {
      title: "Bizimlə Əlaqə — Buyology Müştəri Dəstəyi",
      description:
        "Buyology müştəri dəstəyi ilə əlaqə saxla. Sifarişlər, qaytarma və əməkdaşlıq üçün 24/7 buradayıq.",
      keywords: ["əlaqə", "müştəri dəstəyi"],
    },
    ar: {
      title: "اتصل بنا — دعم عملاء Buyology",
      description:
        "تواصل مع دعم عملاء Buyology. نحن هنا على مدار الساعة للمساعدة في الطلبات والاسترجاع والشراكات.",
      keywords: ["اتصل بنا", "دعم العملاء"],
    },
  },
  games: {
    en: {
      title: "Games and Rewards — Win Prizes on Buyology",
      description:
        "Play interactive games on Buyology and win discounts, vouchers and real prizes. New games and rewards added every week.",
      keywords: ["games", "rewards", "win prizes", "discounts"],
    },
    az: {
      title: "Oyunlar və Mükafatlar — Buyology-də Qazan",
      description:
        "Buyology-də interaktiv oyunlar oyna və endirimlər, vauçerlər və real hədiyyələr qazan.",
      keywords: ["oyunlar", "mükafat", "endirim"],
    },
    ar: {
      title: "الألعاب والمكافآت — اربح جوائز على Buyology",
      description:
        "العب الألعاب التفاعلية على Buyology واربح خصومات وقسائم وجوائز حقيقية. ألعاب ومكافآت جديدة كل أسبوع.",
      keywords: ["ألعاب", "مكافآت", "خصومات"],
    },
  },
  favourites: {
    en: { title: "Your Favourites", description: "Items you have saved to your favourites list on Buyology." },
    az: { title: "Sevimliləriniz", description: "Buyology-də sevimlilər siyahınıza əlavə etdiyiniz məhsullar." },
    ar: { title: "المفضلة لديك", description: "العناصر التي حفظتها في قائمة مفضلتك على Buyology." },
  },
  cart: {
    en: { title: "Shopping Cart", description: "Review the items in your shopping cart and proceed to secure checkout." },
    az: { title: "Səbət", description: "Səbətinizdəki məhsulları nəzərdən keçirin və təhlükəsiz ödənişə keçin." },
    ar: { title: "سلة التسوق", description: "راجع العناصر في سلة التسوق وانتقل إلى الدفع الآمن." },
  },
  checkout: {
    en: { title: "Checkout", description: "Securely complete your purchase on Buyology." },
    az: { title: "Ödəniş", description: "Buyology-də alışınızı təhlükəsiz şəkildə tamamlayın." },
    ar: { title: "إتمام الشراء", description: "أكمل عملية الشراء بأمان على Buyology." },
  },
  profile: {
    en: { title: "My Profile", description: "Manage your Buyology profile, addresses and preferences." },
    az: { title: "Profilim", description: "Buyology profilinizi, ünvanlarınızı və tənzimləmələrinizi idarə edin." },
    ar: { title: "ملفي الشخصي", description: "قم بإدارة ملفك الشخصي وعناوينك وتفضيلاتك على Buyology." },
  },
  orders: {
    en: { title: "My Orders", description: "Track and manage your Buyology orders." },
    az: { title: "Sifarişlərim", description: "Buyology sifarişlərinizi izləyin və idarə edin." },
    ar: { title: "طلباتي", description: "تتبع وإدارة طلباتك على Buyology." },
  },
  auth: {
    en: { title: "Sign In or Register", description: "Sign in to your Buyology account or create a new one." },
    az: { title: "Daxil Ol və ya Qeydiyyat", description: "Buyology hesabına daxil ol və ya yeni hesab yarat." },
    ar: { title: "تسجيل الدخول أو التسجيل", description: "سجّل الدخول إلى حسابك على Buyology أو أنشئ حساباً جديداً." },
  },
  signin: {
    en: { title: "Sign In", description: "Sign in to your Buyology account." },
    az: { title: "Daxil Ol", description: "Buyology hesabına daxil ol." },
    ar: { title: "تسجيل الدخول", description: "سجّل الدخول إلى حسابك على Buyology." },
  },
  "become-a-supplier": {
    en: {
      title: "Become a Supplier on Buyology",
      description: "Join Buyology as a verified supplier. Reach more customers and grow your business with our seller tools.",
      keywords: ["become a supplier", "sell wholesale", "supplier registration"],
    },
    az: {
      title: "Buyology-də Tədarükçü Ol",
      description: "Buyology-də yoxlanılmış tədarükçü kimi qoşul. Daha çox müştəriyə çat və biznesini böyüt.",
      keywords: ["tədarükçü ol", "topdansatış"],
    },
    ar: {
      title: "كن موردًا على Buyology",
      description: "انضم إلى Buyology كمورد موثوق. اوصل إلى المزيد من العملاء ونمِّ عملك.",
      keywords: ["كن موردًا", "بيع بالجملة"],
    },
  },
  catalog: {
    en: { title: "Product Catalog", description: "Explore the full Buyology product catalog by category." },
    az: { title: "Məhsul Kataloqu", description: "Buyology məhsul kataloqunu kateqoriyalara görə araşdır." },
    ar: { title: "كتالوج المنتجات", description: "استكشف كتالوج منتجات Buyology حسب الفئة." },
  },
  map: {
    en: { title: "Find Stores Near You", description: "Find Buyology stores and pickup points near you." },
    az: { title: "Yaxındakı Mağazalar", description: "Yaxınlıqdakı Buyology mağazalarını və götürmə nöqtələrini tap." },
    ar: { title: "ابحث عن المتاجر القريبة", description: "ابحث عن متاجر Buyology ونقاط الاستلام القريبة منك." },
  },
  unsubscribe: {
    en: { title: "Unsubscribe", description: "Manage your Buyology email subscription preferences." },
    az: { title: "Abunəlikdən Çıx", description: "Buyology e-poçt abunəlik tənzimləmələrini idarə et." },
    ar: { title: "إلغاء الاشتراك", description: "قم بإدارة تفضيلات الاشتراك في البريد الإلكتروني لـ Buyology." },
  },
  "payment-callback": {
    en: { title: "Processing Payment", description: "We are processing your payment, please wait." },
    az: { title: "Ödəniş Emal Olunur", description: "Ödənişiniz emal olunur, zəhmət olmasa gözləyin." },
    ar: { title: "جارٍ معالجة الدفع", description: "نقوم بمعالجة دفعتك، يرجى الانتظار." },
  },
};
