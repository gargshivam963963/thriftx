export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    category: string;
    publishedAt: string;
    readTime: string;
    introduction: string;
    sections: {
        heading: string;
        paragraphs: string[];
        points?: string[];
        /** Optional highlighted box rendered at the end of this section. */
        callout?: { title: string; text: string };
    }[];
    /** SEO + UI keyword chips. */
    tags?: string[];
    /** Highlighted takeaway box rendered mid-article. */
    callout?: { title: string; text: string };
    /** Visual accent key mapped in the blog UI (falls back to a default). */
    accent?: "authenticity" | "style" | "fit" | "care" | "thrift";
}

export const blogPosts: BlogPost[] = [
    {
        slug: "how-to-spot-authentic-branded-thrift",
        title: "How to spot authentic vs fake branded thrift (Nike, Adidas, Zara & more)",
        description:
            "A practical 6-point checklist to verify original branded clothing before you buy thrift online — stitching, tags, fabric, logos, sizing and price red flags.",
        category: "Authenticity",
        publishedAt: "2026-11-10",
        readTime: "6 min read",
        accent: "authenticity",
        tags: [
            "authentic thrift",
            "original vs fake",
            "Nike",
            "Adidas",
            "Zara",
            "thrift India",
        ],
        introduction:
            "The whole appeal of branded thrift is owning the real thing for a fraction of retail. But the rise of high-quality counterfeits means a \"too good to be true\" listing deserves a second look. The good news: you don't need to be an expert. A few deliberate checks on stitching, tags and fabric will tell you almost everything you need to know before you checkout.",
        callout: {
            title: "The 10-second gut check",
            text: "If an \"original\" Nike or Zara piece is priced close to a mass-market local brand, slow down. Genuine branded thrift is cheaper than retail — but it is never suspiciously cheap. Price is your first filter.",
        },
        sections: [
            {
                heading: "1. Study the stitching and build quality",
                paragraphs: [
                    "Authentic branded garments are built to be worn and washed hundreds of times, so the stitching is neat, evenly spaced and straight — even on the inside seams and hidden areas like the collar and underarms.",
                    "Counterfeits cut costs here first. Look for loose threads, uneven stitch lines, fraying edges, or glue where there should be stitching. Turn the garment inside out: real construction shows itself in the parts a fake usually ignores.",
                ],
                points: [
                    "Straight, consistent stitching on inside seams.",
                    "No excess glue, rough edges or stray threads.",
                    "Reinforced stress points (shoulders, pockets).",
                ],
            },
            {
                heading: "2. Read the tags and labels closely",
                paragraphs: [
                    "Original tags are printed crisply with correct spelling, consistent fonts and clean spacing. Check the brand name character by character — misspellings and slightly-off logos are the most common giveaway.",
                    "Genuine items usually include a fabric-content label, care symbols, a size tag and often a style/SKU or RN number. A single flimsy tag with no fabric or care information is a warning sign.",
                ],
                points: [
                    "Crisp print, correct spelling, aligned text.",
                    "Multiple labels: brand, fabric content, care, size.",
                    "Care symbols legible and matching the fabric.",
                ],
            },
            {
                heading: "3. Feel the fabric and weigh the piece",
                paragraphs: [
                    "Branded clothing uses fabric chosen for a reason — it has a certain weight, density and hand-feel. Once you've held a few genuine pieces you develop a feel for it.",
                    "Fakes often use thinner, cheaper, plasticky or overly shiny fabric that feels wrong for the style. If a \"performance\" Nike or Adidas piece feels like stiff, non-breathable plastic, treat it with suspicion.",
                ],
            },
            {
                heading: "4. Inspect the logo, print and hardware",
                paragraphs: [
                    "Logos should be sharply defined with clean edges and correct proportions — whether embroidered, printed or a rubber badge. Blurry edges, cracked print, wrong colours or a swoosh that looks slightly \"off\" are red flags.",
                    "Check zippers, buttons and drawstring tips too. Authentic sportswear typically uses branded or quality hardware (YKK, branded pullers) that operates smoothly.",
                ],
                points: [
                    "Sharp, symmetrical logos with correct colour.",
                    "Smooth, branded zippers and sturdy buttons.",
                    "Print that won't crack or peel with light stretch.",
                ],
            },
            {
                heading: "5. Compare the size and fit labels",
                paragraphs: [
                    "Real brands are internally consistent. The size on the tag, the size printed on the care label and the actual garment measurements should all agree.",
                    "Vintage and imported pieces may use different sizing systems (US, EU, UK), so cross-check the garment measurements in centimetres rather than trusting the letter alone.",
                ],
            },
            {
                heading: "6. Trust the seller, photos and price together",
                paragraphs: [
                    "No single check is perfect — authentic thrift is pre-owned after all, so minor wear is normal and expected. The goal is to judge the balance of evidence: construction, tags, fabric, logo and price should all tell the same story.",
                    "Buy from sellers who show clear, close-up photos of tags and stitching and stand behind authenticity. That transparency is worth more than any single feature.",
                ],
                callout: {
                    title: "Buy with confidence",
                    text: "Every piece on THRIFTX is hand-checked for authenticity and photographed in detail, so you can zoom into the tags, stitching and labels before you add to cart.",
                },
            },
        ],
    },
    {
        slug: "how-to-shop-one-of-a-kind-thrift",
        title: "How to shop one-of-a-kind thrift clothing online",
        description:
            "A practical checklist for choosing unique pre-loved clothing online, from measurements and photos to checkout.",
        category: "Thrift shopping",
        publishedAt: "2026-10-04",
        readTime: "4 min read",
        introduction:
            "Shopping a one-off piece is different from ordering a size that will always be restocked. A little time with the listing helps you choose confidently and avoid missing the details that matter.",
        sections: [
            {
                heading: "Read the listing before the label",
                paragraphs: [
                    "Brand and tagged size are useful clues, but they don’t tell the whole story. Check the measurements, fit notes, fabric details, and condition information shown on the individual product page.",
                    "If a measurement or detail you need is missing, ask the store before you place the order rather than guessing.",
                ],
            },
            {
                heading: "Inspect every product photo",
                paragraphs: [
                    "Look at the front, back, close-ups, and any areas called out in the description. Screens can show colors differently, so use written color and condition details alongside the photos.",
                ],
                points: [
                    "Compare garment measurements with a similar item you already own.",
                    "Check seams, cuffs, collars, prints, and closures in the available photos.",
                    "Review the listing’s condition notes and ask about anything unclear.",
                ],
            },
            {
                heading: "Check availability and checkout details",
                paragraphs: [
                    "Many THRIFTX finds are unique or limited. Availability can change while you browse, so the checkout confirmation is the reliable sign that your order was placed.",
                    "Before paying, confirm the delivery address, selected shipping option, payment method, and final total shown at checkout.",
                ],
            },
        ],
    },
    {
        slug: "finding-the-right-fit-in-pre-loved-clothing",
        title: "Finding the right fit in pre-loved clothing",
        description:
            "Use garment measurements, a familiar reference piece, and fit notes to choose pre-loved clothing with less guesswork.",
        category: "Fit guide",
        publishedAt: "2026-10-04",
        readTime: "4 min read",
        introduction:
            "A size tag is only a starting point. Fit can vary across brands, styles, and eras, so comparing measurements is often more useful than relying on the letter or number alone.",
        sections: [
            {
                heading: "Measure a garment that fits you",
                paragraphs: [
                    "Choose a similar piece from your wardrobe, lay it flat, and measure the same points used in the product listing. Keep the garment relaxed and measure consistently; don’t compare body measurements directly with garment measurements.",
                ],
                points: [
                    "Tops: compare chest width, shoulder, and length.",
                    "Trousers: compare waist, rise, inseam, and leg opening.",
                    "For stretch fabrics, consider how the fabric behaves when worn.",
                ],
            },
            {
                heading: "Think about the fit you want",
                paragraphs: [
                    "Your preferred fit matters. A relaxed shirt and a close-fitting shirt can share the same measurement but feel very different in use. Read any fit description and account for the layers you plan to wear underneath.",
                ],
            },
            {
                heading: "Ask when a detail is missing",
                paragraphs: [
                    "If a key measurement is not listed or a photo is unclear, contact support with the product link before ordering. Because many pieces are one-offs, getting clarity first is better than assuming another size will be available later.",
                ],
            },
        ],
    },
    {
        slug: "caring-for-pre-loved-clothing",
        title: "A simple care routine for pre-loved clothing",
        description:
            "Make a thoughtful first impression with your thrift find: check the care label, sort by fabric, and choose gentle washing habits.",
        category: "Care guide",
        publishedAt: "2026-10-04",
        readTime: "3 min read",
        introduction:
            "Good clothing care starts with the garment itself. Before washing a pre-loved find, take a moment to inspect the fabric and follow its care label.",
        sections: [
            {
                heading: "Start with the care label",
                paragraphs: [
                    "Care instructions vary by fabric, construction, and finish. Follow the label where available. If there is no label or you are unsure, choose a conservative approach and seek professional cleaning advice for delicate pieces.",
                ],
            },
            {
                heading: "Wash thoughtfully",
                paragraphs: [
                    "Sort by color and fabric weight, close zippers, and turn printed or delicate garments inside out when appropriate. Avoid using more detergent or heat than the garment needs.",
                ],
                points: [
                    "Use cold water when suitable for the care instructions.",
                    "Air-dry when practical to reduce heat and help protect fabric.",
                    "Treat a small, inconspicuous area first if you’re unsure about a stain treatment.",
                ],
            },
            {
                heading: "Store it ready to wear",
                paragraphs: [
                    "Make sure clothing is fully dry before storing. Fold knits to help them keep their shape, hang structured pieces on suitable hangers, and give garments enough room to breathe.",
                ],
            },
        ],
    },
];

export function getBlogPost(slug: string) {
    return blogPosts.find((post) => post.slug === slug);
}
