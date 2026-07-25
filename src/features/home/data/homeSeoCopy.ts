import type { Lang } from "@/config/pathSlugs";

/**
 * Static, server-rendered home-page copy.
 *
 * Deliberately NOT routed through i18next: every other home section is a client
 * component whose strings only materialise after hydration, which left the raw
 * HTML thin (~399 words) and pushed the audited "rendering percentage" up. This
 * block ships in the server HTML for all three locales, so crawlers and LLMs
 * read the same prose a visitor does.
 *
 * The wording intentionally carries the page's target keywords — brand new,
 * refurbished devices, free shipping, fast delivery, new arrivals, flash sale —
 * in the H2/H3 tags as well as the body, which is what the audit's keyword
 * consistency check measures.
 */

export interface SeoBlock {
  heading: string;
  body: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface HomeSeoCopy {
  /** Section H2. */
  title: string;
  /** Lead paragraph under the H2. */
  intro: string;
  /** Three H3 + paragraph blocks. */
  blocks: SeoBlock[];
  faqTitle: string;
  faq: FaqItem[];
}

export const HOME_SEO_COPY: Record<Lang, HomeSeoCopy> = {
  en: {
    title: "Shop Brand New and Refurbished Devices in One Place",
    intro:
      "Buyology is an all-in-one tech store where you can shop brand new and certified refurbished devices, rent the gear you only need for a while, book a repair, or sell the phone sitting in your drawer. Every product is tested before it ships, listed with the real condition grade, and covered by a warranty — so the price you see is the whole story.",
    blocks: [
      {
        heading: "Brand New Products and Certified Refurbished Devices",
        body:
          "Browse smartphones, laptops, tablets, gaming gear and accessories from the brands people actually ask for. Brand new stock arrives sealed with full manufacturer warranty. Refurbished devices are professionally inspected, cleaned, battery-checked and graded, then sold with a one-year warranty of their own — typically at a discount of up to 30% against new. New arrivals land every week, and flash sale pricing runs on a rotating set of products, so the catalogue is worth a second look.",
      },
      {
        heading: "Free Shipping and Fast Delivery Across the Region",
        body:
          "Orders over 100 AED ship free, and in the cities we cover directly, quick delivery brings your order to the door in about 30 minutes. Everything else moves on standard fast delivery with tracking from checkout to doorstep. Checkout is secure, prices convert to your local currency automatically, and you can pay by card or split the cost with Tabby or Tamara where those options are available.",
      },
      {
        heading: "Rent, Repair, Trade In or Sell Your Device",
        body:
          "Not every device needs to be bought outright. Rent a laptop or console on a flexible plan when the need is temporary. Book a repair and have a technician diagnose, quote and fix the device — most jobs turn around in under 24 hours, with a warranty on the work. Ready to move on from an old device? List it to sell, or trade it in and put the value straight toward your next purchase.",
      },
    ],
    faqTitle: "Frequently Asked Questions",
    faq: [
      {
        question: "What does 'certified refurbished' mean at Buyology?",
        answer:
          "A certified refurbished device has been fully tested by our technicians, cleaned, checked for battery health, and graded for cosmetic condition before it goes on sale. Each refurbished device ships with a one-year warranty and the same return rights as a brand new product.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes. Orders over 100 AED ship free. Smaller orders show the exact delivery fee at checkout before you pay, and every order is tracked from dispatch to delivery.",
      },
      {
        question: "How fast is delivery?",
        answer:
          "In cities covered by our quick delivery service, orders arrive in about 30 minutes. Elsewhere, standard delivery typically takes one to three business days depending on your address.",
      },
      {
        question: "Can I rent a device instead of buying it?",
        answer:
          "Yes. Laptops, tablets, gaming consoles and other devices can be rented on flexible plans with no long-term commitment, which is useful for short projects, travel or trying a device before you commit to buying.",
      },
      {
        question: "How do I sell or trade in my old device?",
        answer:
          "List the device on Buyology to sell it directly, or choose trade-in to have us value it and apply that amount to your next order. Either way you get a condition-based quote before anything is finalised.",
      },
      {
        question: "What warranty comes with a repair?",
        answer:
          "Every repair is carried out by a trained technician and covered by a warranty on both the parts used and the labour. Most repairs are completed within 24 hours, and you approve the quote before any work starts.",
      },
    ],
  },

  az: {
    title: "Yeni və Refurbished Cihazlar — Hamısı Bir Yerdə",
    intro:
      "Buyology yeni və sertifikatlı refurbished cihazları almaq, qısa müddətə lazım olan texnikanı icarəyə götürmək, təmir sifariş etmək və ya köhnə cihazını satmaq üçün hər şeyi bir araya gətirən mağazadır. Hər məhsul göndərilməzdən əvvəl yoxlanılır, real vəziyyət dərəcəsi ilə yerləşdirilir və zəmanətlə təchiz olunur.",
    blocks: [
      {
        heading: "Yeni Məhsullar və Sertifikatlı Refurbished Cihazlar",
        body:
          "Smartfonlar, noutbuklar, planşetlər, oyun avadanlığı və aksesuarlar — insanların həqiqətən soruşduğu brendlərdən. Yeni məhsullar tam istehsalçı zəmanəti ilə bağlı qutuda gəlir. Refurbished cihazlar peşəkar şəkildə yoxlanılır, təmizlənir, batareyası nəzərdən keçirilir və dərəcələndirilir, sonra isə öz bir illik zəmanəti ilə — adətən yeni qiymətdən 30%-ə qədər aşağı — satışa çıxarılır. Hər həftə yeni məhsullar əlavə olunur.",
      },
      {
        heading: "Pulsuz Çatdırılma və Sürətli Delivery",
        body:
          "100 AED-dən yuxarı sifarişlər pulsuz göndərilir, birbaşa xidmət göstərdiyimiz şəhərlərdə isə tez çatdırılma sifarişi təxminən 30 dəqiqəyə qapınıza gətirir. Qalan sifarişlər izlənilə bilən standart sürətli çatdırılma ilə yola salınır. Ödəniş təhlükəsizdir, qiymətlər avtomatik olaraq yerli valyutanıza çevrilir.",
      },
      {
        heading: "İcarə, Təmir, Trade-In və Satış",
        body:
          "Hər cihazı tam qiymətə almaq lazım deyil. Ehtiyac müvəqqətidirsə, noutbuku və ya konsolu çevik planla icarəyə götürün. Təmir sifariş edin — mütəxəssis diaqnostika aparır, qiymət təklif edir və cihazı düzəldir; işlərin əksəriyyəti 24 saatdan az müddətdə, işə zəmanətlə tamamlanır. Köhnə cihazı satın və ya trade-in edərək dəyərini növbəti alışınıza yönəldin.",
      },
    ],
    faqTitle: "Tez-tez Verilən Suallar",
    faq: [
      {
        question: "Buyology-də 'sertifikatlı refurbished' nə deməkdir?",
        answer:
          "Sertifikatlı refurbished cihaz satışa çıxmazdan əvvəl texniklərimiz tərəfindən tam yoxlanılır, təmizlənir, batareya vəziyyəti nəzərdən keçirilir və xarici görünüşünə görə dərəcələndirilir. Hər refurbished cihaz bir illik zəmanətlə və yeni məhsulla eyni qaytarma hüquqları ilə göndərilir.",
      },
      {
        question: "Pulsuz çatdırılma varmı?",
        answer:
          "Bəli. 100 AED-dən yuxarı sifarişlər pulsuz göndərilir. Daha kiçik sifarişlərdə dəqiq çatdırılma haqqı ödənişdən əvvəl göstərilir və hər sifariş göndərilmədən çatdırılmaya qədər izlənilir.",
      },
      {
        question: "Çatdırılma nə qədər sürətlidir?",
        answer:
          "Tez çatdırılma xidmətimizin əhatə etdiyi şəhərlərdə sifarişlər təxminən 30 dəqiqəyə çatır. Digər ünvanlarda standart çatdırılma adətən bir-üç iş günü çəkir.",
      },
      {
        question: "Cihazı almaq əvəzinə icarəyə götürə bilərəmmi?",
        answer:
          "Bəli. Noutbuklar, planşetlər, oyun konsolları və digər cihazlar uzunmüddətli öhdəlik olmadan çevik planlarla icarəyə götürülə bilər — qısa layihələr, səyahət və ya almazdan əvvəl sınamaq üçün əlverişlidir.",
      },
      {
        question: "Köhnə cihazımı necə sata və ya trade-in edə bilərəm?",
        answer:
          "Cihazı birbaşa satmaq üçün Buyology-də yerləşdirin və ya trade-in seçin: biz onu qiymətləndirək və məbləği növbəti sifarişinizə tətbiq edək. Hər iki halda razılaşmadan əvvəl vəziyyətə əsaslanan qiymət təklifi alırsınız.",
      },
      {
        question: "Təmirə hansı zəmanət verilir?",
        answer:
          "Hər təmir hazırlıqlı mütəxəssis tərəfindən aparılır və həm istifadə olunan hissələrə, həm də işə zəmanət verilir. Təmirlərin əksəriyyəti 24 saat ərzində tamamlanır və iş başlamazdan əvvəl qiyməti siz təsdiqləyirsiniz.",
      },
    ],
  },

  ar: {
    title: "تسوق أجهزة جديدة ومجددة في مكان واحد",
    intro:
      "‏Buyology متجر تقني شامل يمكنك فيه شراء أجهزة جديدة ومجددة معتمدة، أو استئجار ما تحتاجه لفترة قصيرة، أو حجز إصلاح، أو بيع هاتفك القديم. كل منتج يُفحص قبل الشحن ويُعرض بدرجة حالته الحقيقية مع ضمان، فالسعر الذي تراه هو القصة كاملة.",
    blocks: [
      {
        heading: "منتجات جديدة وأجهزة مجددة معتمدة",
        body:
          "تصفح الهواتف الذكية وأجهزة اللابتوب والأجهزة اللوحية ومعدات الألعاب والإكسسوارات من العلامات التجارية التي يطلبها الناس فعلاً. المنتجات الجديدة تصل مغلقة بضمان المصنّع الكامل، والأجهزة المجددة تُفحص وتُنظّف وتُختبر بطارياتها وتُصنّف مهنياً ثم تُباع بضمان سنة كاملة، وبخصم يصل إلى 30% مقارنة بالجديد. تصل منتجات جديدة كل أسبوع مع تخفيضات دورية على مجموعة متغيرة من المنتجات.",
      },
      {
        heading: "شحن مجاني وتوصيل سريع في المنطقة",
        body:
          "الطلبات التي تتجاوز 100 درهم تُشحن مجاناً، وفي المدن التي نغطيها مباشرة يصل التوصيل السريع إلى بابك خلال 30 دقيقة تقريباً. أما بقية الطلبات فتُشحن بالتوصيل السريع القياسي مع تتبع من الدفع حتى التسليم. الدفع آمن، والأسعار تُحوَّل تلقائياً إلى عملتك المحلية، ويمكنك الدفع بالبطاقة أو تقسيم المبلغ عبر تابي أو تمارا حيثما توفرت.",
      },
      {
        heading: "استأجر أو أصلح أو استبدل أو بِع جهازك",
        body:
          "ليس كل جهاز يستحق الشراء الكامل. استأجر لابتوب أو جهاز ألعاب بخطة مرنة عندما تكون الحاجة مؤقتة. احجز إصلاحاً ليقوم فني بالتشخيص وتقديم عرض السعر والإصلاح — وتُنجز معظم الأعمال في أقل من 24 ساعة مع ضمان على العمل. وإذا أردت التخلص من جهاز قديم، اعرضه للبيع أو استبدله واحتسب قيمته مباشرة في عملية شرائك التالية.",
      },
    ],
    faqTitle: "الأسئلة الشائعة",
    faq: [
      {
        question: "ماذا يعني «مجدد معتمد» في Buyology؟",
        answer:
          "الجهاز المجدد المعتمد خضع لفحص كامل من فنيينا وتنظيف واختبار لصحة البطارية وتصنيف لحالته الظاهرية قبل عرضه للبيع. كل جهاز مجدد يُشحن بضمان سنة كاملة وبنفس حقوق الإرجاع الخاصة بالمنتج الجديد.",
      },
      {
        question: "هل تقدمون شحناً مجانياً؟",
        answer:
          "نعم. الطلبات التي تتجاوز 100 درهم تُشحن مجاناً. أما الطلبات الأصغر فتظهر رسوم التوصيل الدقيقة عند الدفع قبل إتمام العملية، وكل طلب يمكن تتبعه من الإرسال حتى التسليم.",
      },
      {
        question: "ما مدى سرعة التوصيل؟",
        answer:
          "في المدن التي تشملها خدمة التوصيل السريع تصل الطلبات خلال 30 دقيقة تقريباً. وفي غيرها يستغرق التوصيل القياسي عادة من يوم إلى ثلاثة أيام عمل حسب عنوانك.",
      },
      {
        question: "هل يمكنني استئجار جهاز بدلاً من شرائه؟",
        answer:
          "نعم. يمكن استئجار أجهزة اللابتوب والأجهزة اللوحية وأجهزة الألعاب وغيرها بخطط مرنة دون التزام طويل الأمد، وهو خيار مفيد للمشاريع القصيرة أو السفر أو تجربة الجهاز قبل شرائه.",
      },
      {
        question: "كيف أبيع جهازي القديم أو أستبدله؟",
        answer:
          "اعرض الجهاز على Buyology لبيعه مباشرة، أو اختر الاستبدال لنقيّمه ونطبّق قيمته على طلبك التالي. في الحالتين تحصل على عرض سعر مبني على حالة الجهاز قبل إتمام أي شيء.",
      },
      {
        question: "ما الضمان الذي يشمل الإصلاح؟",
        answer:
          "كل إصلاح ينفذه فني مدرب ويشمله ضمان على القطع المستخدمة وعلى العمل معاً. تُنجز معظم الإصلاحات خلال 24 ساعة، وتوافق أنت على عرض السعر قبل بدء أي عمل.",
      },
    ],
  },
};
