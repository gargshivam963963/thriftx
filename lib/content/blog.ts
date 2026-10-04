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
    }[];
}

export const blogPosts: BlogPost[] = [
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
