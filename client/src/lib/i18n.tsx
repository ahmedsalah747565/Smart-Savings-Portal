import { createContext, useContext, ReactNode, useState, useEffect } from "react";

type Language = "en" | "ar";

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        "nav.home": "Home",
        "nav.shop": "Shop",
        "nav.factories": "Factories",
        "nav.about": "About",
        "nav.cart": "Cart",
        "nav.login": "Login",
        "nav.logout": "Logout",
        "nav.apply_vendor": "Apply as Vendor",
        "nav.vendor_dashboard": "Vendor Dashboard",
        "product.add_to_cart": "Add to Cart",
        "product.out_of_stock": "Out of Stock",
        "product.stock": "Stock",
        "cart.empty": "Your cart is empty",
        "cart.checkout": "Proceed to Checkout",
        "cart.moq_error": "A minimum of 30 items is required to place an order",
        "home.savings_title": "Community Savings:",
        "home.hero_title_1": "Direct from the Source.",
        "home.hero_title_2": "Honest to your Wallet.",
        "home.hero_desc": "We've eliminated the middlemen to bring you premium quality goods directly from the world's best factories at unbeatable prices.",
        "home.cta_shop": "Start Saving Now",
        "home.cta_how": "How it Works",
        "home.feature_1_title": "Unbeatable Savings",
        "home.feature_1_desc": "By removing retailers and distributors, we pass 100% of the savings directly to you.",
        "home.feature_2_title": "Verified Quality",
        "home.feature_2_desc": "Every product comes from the same factories producing for top luxury brands.",
        "home.feature_3_title": "Transparent Origin",
        "home.feature_3_desc": "Know exactly where your product was made, who made it, and what it cost to produce.",
        "home.trending": "Trending Now",
        "home.trending_desc": "Top factory-direct picks this week.",
        "home.view_all": "View All",
        "vendor.add_product": "Add Product",
        "vendor.edit_product": "Edit Product",
        "vendor.save": "Save",
        "vendor.save_success": "Product saved successfully",
        "vendor.title_en": "Product Title (English)",
        "vendor.title_ar": "Product Title (Arabic)",
        "vendor.desc_en": "Description (English)",
        "vendor.desc_ar": "Description (Arabic)",
        "vendor.price": "Price",
        "vendor.stock": "Stock",
        "vendor.category": "Category",
        "vendor.image_url": "Image URL",
        "common.currency": "LE",
    },
    ar: {
        "nav.home": "الرئيسية",
        "nav.shop": "المتجر",
        "nav.factories": "المصانع",
        "nav.about": "عن المنصة",
        "nav.cart": "العربة",
        "nav.login": "تسجيل الدخول",
        "nav.logout": "تسجيل الخروج",
        "nav.apply_vendor": "كن بائعاً",
        "nav.vendor_dashboard": "لوحة البائع",
        "product.add_to_cart": "أضف إلى العربة",
        "product.out_of_stock": "نفدت الكمية",
        "product.stock": "المخزون",
        "cart.empty": "عربة التسوق فارغة",
        "cart.checkout": "إتمام الشراء",
        "cart.moq_error": "يجب اختيار 30 قطعة على الأقل لإتمام الطلب",
        "home.savings_title": "مدخرات المجتمع:",
        "home.hero_title_1": "مباشرة من المصدر.",
        "home.hero_title_2": "بأسعار صادقة.",
        "home.hero_desc": "لقد ألغينا الوسطاء لنوفر لك سلعاً ذات جودة عالية مباشرة من أفضل المصانع في العالم بأسعار لا تقبل المنافسة.",
        "home.cta_shop": "ابدأ التوفير الآن",
        "home.cta_how": "كيف يعمل؟",
        "home.feature_1_title": "توفير لا يهزم",
        "home.feature_1_desc": "من خلال إزالة تجار التجزئة والموزعين، ننقل 100٪ من المدخرات إليك مباشرة.",
        "home.feature_2_title": "جودة مضمونة",
        "home.feature_2_desc": "كل منتج يأتي من نفس المصانع التي تنتج لأفضل الماركات العالمية.",
        "home.feature_3_title": "مصدر شفاف",
        "home.feature_3_desc": "تعرف بالضبط أين صنع منتجك، ومن صنعه، وتكلفة إنتاجه.",
        "home.trending": "المنتجات الرائجة",
        "home.trending_desc": "أفضل اختياراتنا من المصنع مباشرة لهذا الأسبوع.",
        "home.view_all": "عرض الكل",
        "vendor.add_product": "إضافة منتج",
        "vendor.edit_product": "تعديل منتج",
        "vendor.save": "حفظ",
        "vendor.save_success": "تم حفظ المنتج بنجاح",
        "vendor.title_en": "اسم المنتج (انجليزي)",
        "vendor.title_ar": "اسم المنتج (عربي)",
        "vendor.desc_en": "الوصف (انجليزي)",
        "vendor.desc_ar": "الوصف (عربي)",
        "vendor.price": "السعر",
        "vendor.stock": "المخزون",
        "vendor.category": "الفئة",
        "vendor.image_url": "رابط الصورة",
        "common.currency": "ج.م",
    }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        return (localStorage.getItem("lang") as Language) || "en";
    });

    useEffect(() => {
        localStorage.setItem("lang", language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    }, [language]);

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <I18nContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useTranslation must be used within an I18nProvider");
    }
    return context;
}
