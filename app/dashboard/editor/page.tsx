"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type Template = "minimal" | "modern" | "creative" | "sidebar";
type PreviewMode = "desktop" | "phone";
type SectionType = "text" | "tags" | "cards" | "timeline" | "links" | "contact";
type HeadingStyle = "plain" | "underline" | "bar";
type HeadingCase = "none" | "uppercase" | "capitalize";
type CardStyle = "filled" | "outline" | "plain";
type TagStyle = "pill" | "outline" | "text";
type Spacing = "compact" | "comfortable" | "spacious";
type ImageShape = "circle" | "rounded" | "square";
type Align = "left" | "center";
type Backdrop = "solid" | "gradient" | "dots";
type LinkStyle = "text" | "filled" | "outline";
type ImageRatio = "16/9" | "4/3" | "1/1";
type ImagePosition = "top" | "side";
type ImageFit = "cover" | "contain";

type Item = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  url: string;
  image: string; // uploaded image (data URL) or an image link
  imageAlt: string;
  showImage: boolean;
  showLink: boolean;
  linkLabel: string;
  featured: boolean;
};

type Section = {
  id: string;
  type: SectionType;
  title: string;
  icon: string; // optional emoji or symbol before the title
  visible: boolean;
  text: string; // used by "text" and "contact" sections
  tags: string; // used by "tags" sections (comma separated)
  items: Item[]; // used by "cards", "timeline", "links", "contact"
};

type Profile = {
  name: string;
  headline: string;
  eyebrow: string;
  location: string;
  badge: string;
  email: string;
  ctaLabel: string;
  ctaUrl: string;
  cta2Label: string;
  cta2Url: string;
  monogram: boolean;
  footer: string;
  tabTitle: string;
  favicon: string;
};

type ProfileTextKey = Exclude<keyof Profile, "monogram">;

type Design = {
  template: Template;
  themeKey: ThemeName;
  customAccent: string; // "" = use the theme's color
  customBackground: string;
  customText: string;
  backdrop: Backdrop;
  headingFont: string;
  bodyFont: string;
  baseSize: number;
  nameScale: number;
  headingWeight: number;
  headingCase: HeadingCase;
  letterSpacing: number;
  radius: number;
  spacing: Spacing;
  headingStyle: HeadingStyle;
  cardStyle: CardStyle;
  cardColumns: 1 | 2;
  cardImageRatio: ImageRatio;
  cardImagePosition: ImagePosition;
  cardImageFit: ImageFit;
  linkStyle: LinkStyle;
  tagStyle: TagStyle;
  align: Align;
};

type ImageSettings = {
  show: boolean;
  src: string;
  shape: ImageShape;
  size: number;
};

type Config = {
  profile: Profile;
  design: Design;
  image: ImageSettings;
  sections: Section[];
};

/* ------------------------------------------------------------------ */
/* Static data                                                         */
/* ------------------------------------------------------------------ */

const themes = {
  blue: {
    label: "Ocean Blue",
    accent: "#2563eb",
    background: "#ffffff",
    surface: "#eff6ff",
    text: "#172033",
    muted: "#64748b",
  },
  green: {
    label: "Forest Green",
    accent: "#15803d",
    background: "#ffffff",
    surface: "#f0fdf4",
    text: "#17251d",
    muted: "#64756a",
  },
  purple: {
    label: "Royal Purple",
    accent: "#7c3aed",
    background: "#ffffff",
    surface: "#f5f3ff",
    text: "#24183b",
    muted: "#746784",
  },
  rose: {
    label: "Rose",
    accent: "#e11d48",
    background: "#ffffff",
    surface: "#fff1f2",
    text: "#2a1218",
    muted: "#7a6168",
  },
  sunset: {
    label: "Sunset",
    accent: "#ea580c",
    background: "#ffffff",
    surface: "#fff7ed",
    text: "#2b1a0e",
    muted: "#7c6a5a",
  },
  mono: {
    label: "Monochrome",
    accent: "#111827",
    background: "#ffffff",
    surface: "#f3f4f6",
    text: "#111827",
    muted: "#6b7280",
  },
  dark: {
    label: "Midnight",
    accent: "#38bdf8",
    background: "#111827",
    surface: "#1f2937",
    text: "#f9fafb",
    muted: "#cbd5e1",
  },
  ember: {
    label: "Ember",
    accent: "#fb923c",
    background: "#1c1917",
    surface: "#292524",
    text: "#fafaf9",
    muted: "#d6d3d1",
  },
};

type ThemeName = keyof typeof themes;

const templateNames: Record<Template, string> = {
  minimal: "Minimal",
  modern: "Modern",
  creative: "Creative",
  sidebar: "Sidebar",
};

const templateHints: Record<Template, string> = {
  minimal: "Simple and clean",
  modern: "Cards and accents",
  creative: "Bold and expressive",
  sidebar: "Profile on the side",
};

type FontOption = {
  key: string;
  label: string;
  stack: string;
  google?: string; // Google Fonts "family" parameter
  singleWeight?: boolean; // font only ships one weight
};

const fonts: FontOption[] = [
  { key: "arial", label: "Arial — Modern", stack: "Arial, sans-serif" },
  { key: "georgia", label: "Georgia — Classic", stack: "Georgia, serif" },
  {
    key: "trebuchet",
    label: "Trebuchet — Friendly",
    stack: "'Trebuchet MS', sans-serif",
  },
  {
    key: "courier",
    label: "Courier New — Technical",
    stack: "'Courier New', monospace",
  },
  {
    key: "inter",
    label: "Inter — Clean",
    stack: "'Inter', sans-serif",
    google: "Inter:wght@400;700",
  },
  {
    key: "poppins",
    label: "Poppins — Geometric",
    stack: "'Poppins', sans-serif",
    google: "Poppins:wght@400;700",
  },
  {
    key: "montserrat",
    label: "Montserrat — Confident",
    stack: "'Montserrat', sans-serif",
    google: "Montserrat:wght@400;700",
  },
  {
    key: "nunito",
    label: "Nunito — Rounded",
    stack: "'Nunito', sans-serif",
    google: "Nunito:wght@400;700",
  },
  {
    key: "space",
    label: "Space Grotesk — Tech",
    stack: "'Space Grotesk', sans-serif",
    google: "Space+Grotesk:wght@400;700",
  },
  {
    key: "playfair",
    label: "Playfair Display — Elegant",
    stack: "'Playfair Display', serif",
    google: "Playfair+Display:wght@400;700",
  },
  {
    key: "lora",
    label: "Lora — Editorial",
    stack: "'Lora', serif",
    google: "Lora:wght@400;700",
  },
  {
    key: "merriweather",
    label: "Merriweather — Readable serif",
    stack: "'Merriweather', serif",
    google: "Merriweather:wght@400;700",
  },
  {
    key: "dmserif",
    label: "DM Serif Display — Headlines",
    stack: "'DM Serif Display', serif",
    google: "DM+Serif+Display",
    singleWeight: true,
  },
  {
    key: "bebas",
    label: "Bebas Neue — Poster",
    stack: "'Bebas Neue', sans-serif",
    google: "Bebas+Neue",
    singleWeight: true,
  },
  {
    key: "fira",
    label: "Fira Code — Developer",
    stack: "'Fira Code', monospace",
    google: "Fira+Code:wght@400;700",
  },
  {
    key: "caveat",
    label: "Caveat — Handwritten",
    stack: "'Caveat', cursive",
    google: "Caveat:wght@400;700",
  },
];

function getFont(key: string): FontOption {
  return fonts.find((f) => f.key === key) ?? fonts[0];
}

function googleFontsHref(keys: string[]): string {
  const specs = Array.from(
    new Set(
      keys
        .map((k) => getFont(k).google)
        .filter((g): g is string => Boolean(g))
    )
  );
  if (specs.length === 0) return "";
  return `https://fonts.googleapis.com/css2?${specs
    .map((s) => `family=${s}`)
    .join("&")}&display=swap`;
}

const sectionTypeLabels: Record<SectionType, string> = {
  text: "Text paragraph",
  tags: "Tags / skills",
  cards: "Cards (projects, work)",
  timeline: "Timeline (experience, education)",
  links: "Links (social, publications)",
  contact: "Contact",
};

const defaultSectionTitles: Record<SectionType, string> = {
  text: "New Section",
  tags: "Skills",
  cards: "Highlights",
  timeline: "Experience",
  links: "Links",
  contact: "Contact",
};

type ItemFieldConfig = {
  title?: string;
  subtitle?: string;
  description?: string;
  url?: string; // plain URL field (links and contact)
  image?: boolean; // image block with show/hide
  link?: boolean; // link-button block with show/hide
  linkDefault?: string; // default button text
  featured?: boolean;
  addLabel: string;
};

const itemFields: Record<SectionType, ItemFieldConfig> = {
  text: { addLabel: "" },
  tags: { addLabel: "" },
  cards: {
    title: "Title",
    subtitle: "Tech or tags, separated by commas (optional)",
    description: "Description",
    image: true,
    link: true,
    linkDefault: "View project",
    featured: true,
    addLabel: "Add card",
  },
  timeline: {
    title: "Role or title",
    subtitle: "Where and when",
    description: "Details",
    link: true,
    linkDefault: "Learn more",
    addLabel: "Add entry",
  },
  links: {
    title: "Label (for example, GitHub)",
    url: "URL",
    addLabel: "Add link",
  },
  contact: {
    title: "Label (for example, LinkedIn)",
    url: "URL",
    addLabel: "Add link",
  },
};

const STORAGE_KEY = "portfolio-builder-v2";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Random ids are only created inside click handlers, never while rendering.
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function blankItem(id: string): Item {
  return {
    id,
    title: "",
    subtitle: "",
    description: "",
    url: "",
    image: "",
    imageAlt: "",
    showImage: true,
    showLink: true,
    linkLabel: "",
    featured: false,
  };
}

function newItem(): Item {
  return blankItem(uid());
}

function hasItems(type: SectionType) {
  return (
    type === "cards" ||
    type === "timeline" ||
    type === "links" ||
    type === "contact"
  );
}

function defaultConfig(): Config {
  return {
    profile: {
      name: "",
      headline: "",
      eyebrow: "Portfolio",
      location: "",
      badge: "",
      email: "",
      ctaLabel: "",
      ctaUrl: "",
      cta2Label: "",
      cta2Url: "",
      monogram: false,
      footer: "",
      tabTitle: "",
      favicon: "",
    },
    design: {
      template: "minimal",
      themeKey: "blue",
      customAccent: "",
      customBackground: "",
      customText: "",
      backdrop: "solid",
      headingFont: "arial",
      bodyFont: "arial",
      baseSize: 16,
      nameScale: 2.1,
      headingWeight: 700,
      headingCase: "none",
      letterSpacing: 0,
      radius: 12,
      spacing: "comfortable",
      headingStyle: "plain",
      cardStyle: "filled",
      cardColumns: 1,
      cardImageRatio: "16/9",
      cardImagePosition: "top",
      cardImageFit: "cover",
      linkStyle: "text",
      tagStyle: "pill",
      align: "left",
    },
    image: { show: false, src: "", shape: "circle", size: 120 },
    sections: [
      {
        id: "about",
        type: "text",
        title: "About Me",
        icon: "",
        visible: true,
        text: "",
        tags: "",
        items: [],
      },
      {
        id: "skills",
        type: "tags",
        title: "Skills",
        icon: "",
        visible: true,
        text: "",
        tags: "",
        items: [],
      },
      {
        id: "projects",
        type: "cards",
        title: "Projects",
        icon: "",
        visible: true,
        text: "",
        tags: "",
        // Fixed id on purpose: defaultConfig() runs while rendering, and
        // random values are not allowed there.
        items: [blankItem("project-1")],
      },
      {
        id: "contact",
        type: "contact",
        title: "Contact",
        icon: "",
        visible: true,
        text: "",
        tags: "",
        items: [],
      },
    ],
  };
}

// Fills in any fields that older saved data does not have yet.
function normalizeSection(s: Section): Section {
  return {
    ...s,
    icon: s.icon ?? "",
    items: Array.isArray(s.items)
      ? s.items.map((it, index) => ({
          ...blankItem(it.id || `item-${index}`),
          ...it,
        }))
      : [],
  };
}

function splitTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// Only allow safe link types; add https:// when the user leaves it off.
function safeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return "";
  return `https://${value}`;
}

// Only allow uploaded images or normal web images.
function safeImageSrc(raw: string): string {
  const value = raw.trim();
  if (/^data:image\//i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return "";
}

function parseHex(hex: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Blend two hex colors (t = 0 gives a, t = 1 gives b).
function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const channels = pa.map((value, i) => Math.round(value * (1 - t) + pb[i] * t));
  return `#${channels.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

// Pick black or white text so it stays readable on any accent color.
function readableOn(hex: string): string {
  const rgb = parseHex(hex);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
    ? "#111111"
    : "#ffffff";
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Shrinks big photos so they stay light in the browser and in the download.
function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      const src = reader.result;
      if (typeof src !== "string") {
        reject(new Error("Could not read the file."));
        return;
      }
      const image = new Image();
      image.onerror = () => reject(new Error("Could not load the image."));
      image.onload = () => {
        if (!image.width || !image.height) {
          resolve(src);
          return;
        }
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.round(image.width * scale);
        const height = Math.round(image.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(src);
          return;
        }
        context.drawImage(image, 0, 0, width, height);
        // Keep transparency for PNG, GIF, WebP, and SVG files.
        const keepsAlpha = /^image\/(png|gif|webp|svg)/.test(file.type);
        resolve(canvas.toDataURL(keepsAlpha ? "image/webp" : "image/jpeg", 0.85));
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/* Small UI pieces (kept outside the page so inputs keep focus)        */
/* ------------------------------------------------------------------ */

const cardCls = "rounded-xl border border-gray-200 bg-white p-5";
const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
const smallBtnCls =
  "rounded-lg border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 hover:border-gray-500 disabled:cursor-not-allowed disabled:opacity-40";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <span className="block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  );
}

function Segmented<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
            value === option.value
              ? "border-blue-600 bg-blue-50 text-blue-700"
              : "border-gray-200 text-gray-700 hover:border-gray-400"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || fallback}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-10 w-14 cursor-pointer rounded border border-gray-300 bg-white"
      />
      <div className="text-sm">
        <span className="block text-gray-700">{label}</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-600 underline"
          >
            Use theme color
          </button>
        ) : (
          <span className="text-xs text-gray-500">Theme color</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function PortfolioEditorPage() {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saved" | "noimage" | "failed"
  >("idle");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [newSectionType, setNewSectionType] = useState<SectionType>("text");

  // Hidden desktop render used to build the downloadable HTML file.
  const exportRef = useRef<HTMLDivElement>(null);

  const { profile, design: d, image: img, sections } = config;

  /* ---------- Load and autosave (browser localStorage) ---------- */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Config>;
        const defaults = defaultConfig();
        setConfig({
          profile: { ...defaults.profile, ...saved.profile },
          design: { ...defaults.design, ...saved.design },
          image: { ...defaults.image, ...saved.image },
          sections: Array.isArray(saved.sections)
            ? saved.sections.map(normalizeSection)
            : defaults.sections,
        });
      }
    } catch {
      // Ignore unreadable saved data and start fresh.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        setSaveStatus("saved");
      } catch {
        try {
          // Most likely the uploaded images are too big for browser storage.
          const withoutImages: Config = {
            ...config,
            image: { ...config.image, src: "" },
            sections: config.sections.map((s) => ({
              ...s,
              items: s.items.map((it) => ({
                ...it,
                image: it.image.startsWith("data:") ? "" : it.image,
              })),
            })),
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(withoutImages));
          setSaveStatus("noimage");
        } catch {
          setSaveStatus("failed");
        }
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [config, loaded]);

  /* ---------- State helpers ---------- */

  function setProfile(patch: Partial<Profile>) {
    setConfig((c) => ({ ...c, profile: { ...c.profile, ...patch } }));
  }

  function setDesign(patch: Partial<Design>) {
    setConfig((c) => ({ ...c, design: { ...c.design, ...patch } }));
  }

  function setImage(patch: Partial<ImageSettings>) {
    setConfig((c) => ({ ...c, image: { ...c.image, ...patch } }));
  }

  function updateSection(id: string, patch: Partial<Section>) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function moveSection(id: string, direction: -1 | 1) {
    setConfig((c) => {
      const from = c.sections.findIndex((s) => s.id === id);
      const to = from + direction;
      if (from < 0 || to < 0 || to >= c.sections.length) return c;
      const next = [...c.sections];
      [next[from], next[to]] = [next[to], next[from]];
      return { ...c, sections: next };
    });
  }

  function removeSection(id: string) {
    if (!window.confirm("Delete this section and everything in it?")) return;
    setConfig((c) => ({
      ...c,
      sections: c.sections.filter((s) => s.id !== id),
    }));
  }

  function addSection(type: SectionType) {
    const section: Section = {
      id: uid(),
      type,
      title: defaultSectionTitles[type],
      icon: "",
      visible: true,
      text: "",
      tags: "",
      items: hasItems(type) && type !== "contact" ? [newItem()] : [],
    };
    setConfig((c) => ({ ...c, sections: [...c.sections, section] }));
  }

  function addItem(sectionId: string) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem()] } : s
      ),
    }));
  }

  function updateItem(sectionId: string, itemId: string, patch: Partial<Item>) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((it) =>
                it.id === itemId ? { ...it, ...patch } : it
              ),
            }
          : s
      ),
    }));
  }

  function removeItem(sectionId: string, itemId: string) {
    setConfig((c) => ({
      ...c,
      sections: c.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((it) => it.id !== itemId) }
          : s
      ),
    }));
  }

  function resetAll() {
    if (!window.confirm("Reset everything back to the starting design?")) return;
    setConfig(defaultConfig());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to clear.
    }
    setSaveStatus("idle");
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image smaller than 5 MB.");
      input.value = "";
      return;
    }

    try {
      const src = await resizeImage(file, 800);
      setImage({ src, show: true });
    } catch {
      alert("Could not read that image. Please try a different file.");
    }
    input.value = "";
  }

  async function handleItemImage(
    sectionId: string,
    itemId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      input.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("Please choose an image smaller than 8 MB.");
      input.value = "";
      return;
    }

    try {
      const src = await resizeImage(file, 1100);
      updateItem(sectionId, itemId, { image: src, showImage: true });
    } catch {
      alert("Could not read that image. Please try a different file.");
    }
    input.value = "";
  }

  /* ---------- Theme and typography ---------- */

  const baseTheme = themes[d.themeKey];
  const accent = d.customAccent || baseTheme.accent;
  const background = d.customBackground || baseTheme.background;
  const textColor = d.customText || baseTheme.text;
  const hasCustomBase = Boolean(d.customBackground || d.customText);

  const theme = {
    accent,
    onAccent: readableOn(accent),
    background,
    text: textColor,
    // Surface and muted colors follow your own background and text colors.
    surface: hasCustomBase ? mix(background, textColor, 0.07) : baseTheme.surface,
    muted: hasCustomBase ? mix(textColor, background, 0.35) : baseTheme.muted,
  };

  const headingFont = getFont(d.headingFont);
  const bodyFont = getFont(d.bodyFont);
  const headingWeight = headingFont.singleWeight ? 400 : d.headingWeight;
  const fontsHref = googleFontsHref([d.headingFont, d.bodyFont]);

  const sectionGap = { compact: 22, comfortable: 34, spacious: 50 }[d.spacing];

  const headingBase: CSSProperties = {
    fontFamily: headingFont.stack,
    fontWeight: headingWeight,
    textTransform: d.headingCase,
    letterSpacing: `${d.letterSpacing}px`,
  };

  const sectionTitleStyle: CSSProperties = {
    ...headingBase,
    fontSize: d.baseSize * 1.35,
    lineHeight: 1.25,
    marginBottom: 14,
    color: theme.text,
    ...(d.headingStyle === "underline"
      ? { borderBottom: `2px solid ${theme.accent}`, paddingBottom: 8 }
      : {}),
    ...(d.headingStyle === "bar"
      ? { borderLeft: `4px solid ${theme.accent}`, paddingLeft: 10 }
      : {}),
  };

  const paragraphStyle: CSSProperties = {
    color: theme.muted,
    lineHeight: 1.8,
    fontSize: d.baseSize,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };

  const cardBoxStyle: CSSProperties =
    d.cardStyle === "filled"
      ? {
          border: `1px solid ${theme.muted}33`,
          borderRadius: d.radius,
          padding: 18,
          background: theme.surface,
        }
      : d.cardStyle === "outline"
      ? {
          border: `1px solid ${theme.muted}77`,
          borderRadius: d.radius,
          padding: 18,
        }
      : { borderBottom: `1px solid ${theme.muted}33`, paddingBottom: 16 };

  const tagStyle: CSSProperties = {
    borderRadius: 999,
    padding: "7px 12px",
    fontSize: d.baseSize * 0.85,
    color: theme.accent,
    ...(d.tagStyle === "pill" ? { background: theme.surface } : {}),
    ...(d.tagStyle === "outline"
      ? { border: `1px solid ${theme.accent}` }
      : {}),
  };

  const anchorStyle: CSSProperties = {
    color: theme.accent,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: d.baseSize * 0.92,
  };

  // Look of the "View project" style link buttons on cards and timeline entries.
  const linkButtonStyle: CSSProperties = {
    ...anchorStyle,
    display: "inline-block",
    marginTop: 14,
    ...(d.linkStyle === "filled"
      ? {
          background: theme.accent,
          color: theme.onAccent,
          padding: "9px 16px",
          borderRadius: d.radius,
        }
      : {}),
    ...(d.linkStyle === "outline"
      ? {
          border: `1.5px solid ${theme.accent}`,
          padding: "8px 15px",
          borderRadius: d.radius,
        }
      : {}),
  };

  /* ---------- Preview rendering ---------- */

  function renderItemLink(it: Item, fallbackLabel: string) {
    if (!it.showLink) return null;
    const href = safeUrl(it.url);
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={linkButtonStyle}
      >
        {it.linkLabel.trim() || fallbackLabel}
      </a>
    );
  }

  function renderCard(it: Item) {
    const src = it.showImage ? safeImageSrc(it.image) : "";
    const side = d.cardImagePosition === "side";
    const chips = splitTags(it.subtitle);

    const box: CSSProperties = { ...cardBoxStyle };
    if (it.featured) {
      if (d.cardStyle === "plain") {
        box.borderLeft = `3px solid ${theme.accent}`;
        box.paddingLeft = 14;
      } else {
        box.border = `2px solid ${theme.accent}`;
      }
    }

    const image = src ? (
      <img
        src={src}
        alt={it.imageAlt || it.title || "Project image"}
        style={{
          width: "100%",
          aspectRatio: d.cardImageRatio,
          objectFit: d.cardImageFit,
          display: "block",
          borderRadius: Math.max(d.radius - 4, 0),
          background: theme.surface,
        }}
      />
    ) : null;

    const text = (
      <div style={{ minWidth: 0 }}>
        {it.featured && (
          <p
            style={{
              color: theme.accent,
              fontSize: d.baseSize * 0.78,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Featured
          </p>
        )}
        <h4
          style={{
            ...headingBase,
            fontSize: d.baseSize * 1.1,
            color: theme.text,
          }}
        >
          {it.title || "Your project title"}
        </h4>
        {chips.length > 0 && (
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}
          >
            {chips.map((chip, index) => (
              <span
                key={`${chip}-${index}`}
                style={{
                  border: `1px solid ${theme.accent}66`,
                  color: theme.accent,
                  borderRadius: 999,
                  padding: "2px 10px",
                  fontSize: d.baseSize * 0.78,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        )}
        <p style={{ ...paragraphStyle, marginTop: 8 }}>
          {it.description || "Describe a project you have worked on."}
        </p>
        {renderItemLink(it, "View project")}
      </div>
    );

    return (
      <div key={it.id} style={box}>
        {image && !side && <div style={{ marginBottom: 14 }}>{image}</div>}
        {image && side ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: "1 1 160px", maxWidth: 260 }}>{image}</div>
            <div style={{ flex: "2 1 220px", minWidth: 0 }}>{text}</div>
          </div>
        ) : (
          text
        )}
      </div>
    );
  }

  function renderSectionBody(s: Section): ReactNode {
    switch (s.type) {
      case "text":
        return (
          <p style={paragraphStyle}>
            {s.text || "Your text will appear here."}
          </p>
        );

      case "tags": {
        const list = splitTags(s.tags);
        if (list.length === 0) {
          return <p style={paragraphStyle}>Your skills will appear here.</p>;
        }
        if (d.tagStyle === "text") {
          return <p style={paragraphStyle}>{list.join("  ·  ")}</p>;
        }
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {list.map((tag, index) => (
              <span key={`${tag}-${index}`} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>
        );
      }

      case "cards":
        if (s.items.length === 0) {
          return <p style={paragraphStyle}>Add a card to get started.</p>;
        }
        return (
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns:
                d.cardColumns === 2
                  ? "repeat(auto-fit, minmax(240px, 1fr))"
                  : "1fr",
            }}
          >
            {s.items.map(renderCard)}
          </div>
        );

      case "timeline":
        if (s.items.length === 0) {
          return <p style={paragraphStyle}>Add an entry to get started.</p>;
        }
        return (
          <div
            style={{
              borderLeft: `2px solid ${theme.accent}66`,
              paddingLeft: 20,
              display: "grid",
              gap: 22,
            }}
          >
            {s.items.map((it) => (
              <div key={it.id} style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: -27,
                    top: 6,
                    width: 12,
                    height: 12,
                    borderRadius: 999,
                    background: theme.accent,
                  }}
                />
                <h4
                  style={{
                    ...headingBase,
                    fontSize: d.baseSize * 1.05,
                    color: theme.text,
                  }}
                >
                  {it.title || "Role or title"}
                </h4>
                {it.subtitle && (
                  <p
                    style={{
                      color: theme.accent,
                      fontSize: d.baseSize * 0.85,
                      fontWeight: 600,
                      marginTop: 4,
                    }}
                  >
                    {it.subtitle}
                  </p>
                )}
                {it.description && (
                  <p style={{ ...paragraphStyle, marginTop: 6 }}>
                    {it.description}
                  </p>
                )}
                {renderItemLink(it, "Learn more")}
              </div>
            ))}
          </div>
        );

      case "links": {
        const links = s.items.filter((it) => it.title.trim() || it.url.trim());
        if (links.length === 0) {
          return <p style={paragraphStyle}>Your links will appear here.</p>;
        }
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {links.map((it) => {
              const href = safeUrl(it.url);
              const label = it.title.trim() || it.url.trim();
              const pill: CSSProperties = {
                ...anchorStyle,
                border: `1px solid ${theme.accent}`,
                borderRadius: 999,
                padding: "7px 14px",
              };
              return href ? (
                <a
                  key={it.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={pill}
                >
                  {label}
                </a>
              ) : (
                <span key={it.id} style={pill}>
                  {label}
                </span>
              );
            })}
          </div>
        );
      }

      case "contact": {
        const links = s.items.filter((it) => it.url.trim());
        return (
          <div>
            {s.text && <p style={paragraphStyle}>{s.text}</p>}
            <p style={{ ...paragraphStyle, marginTop: s.text ? 10 : 0 }}>
              {profile.email ? (
                <a href={`mailto:${profile.email.trim()}`} style={anchorStyle}>
                  {profile.email}
                </a>
              ) : (
                "your.email@example.com"
              )}
            </p>
            {links.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {links.map((it) => (
                  <a
                    key={it.id}
                    href={safeUrl(it.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...anchorStyle,
                      border: `1px solid ${theme.accent}`,
                      borderRadius: 999,
                      padding: "7px 14px",
                    }}
                  >
                    {it.title.trim() || it.url}
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      }
    }
  }

  function renderSection(s: Section) {
    const hasTitle = s.title.trim() || s.icon.trim();
    return (
      <section key={s.id} style={{ marginTop: sectionGap }}>
        {hasTitle && (
          <h3 style={sectionTitleStyle}>
            {s.icon.trim() && <span style={{ marginRight: 8 }}>{s.icon}</span>}
            {s.title}
          </h3>
        )}
        {renderSectionBody(s)}
      </section>
    );
  }

  function renderHeaderButtons(onAccent: boolean, align: Align) {
    const buttons = [
      { label: profile.ctaLabel, url: profile.ctaUrl, primary: true },
      { label: profile.cta2Label, url: profile.cta2Url, primary: false },
    ].filter((b) => b.label.trim() && safeUrl(b.url));

    if (buttons.length === 0) return null;

    const strong = onAccent ? theme.onAccent : theme.accent;
    const onStrong = onAccent ? theme.accent : theme.onAccent;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 18,
          justifyContent: align === "center" ? "center" : "flex-start",
        }}
      >
        {buttons.map((b, index) => (
          <a
            key={index}
            href={safeUrl(b.url)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: d.baseSize * 0.92,
              padding: "10px 18px",
              borderRadius: d.radius,
              ...(b.primary
                ? { background: strong, color: onStrong, border: `1.5px solid ${strong}` }
                : { color: strong, border: `1.5px solid ${strong}` }),
            }}
          >
            {b.label}
          </a>
        ))}
      </div>
    );
  }

  function renderIntro(onAccent: boolean, align: Align) {
    const nameColor = onAccent ? theme.onAccent : theme.text;
    const softColor = onAccent ? theme.onAccent : theme.muted;
    const eyebrowColor = onAccent ? theme.onAccent : theme.accent;

    const markRadius =
      img.shape === "circle"
        ? "50%"
        : img.shape === "rounded"
        ? Math.max(d.radius, 12) + 6
        : 0;
    const markMargin = align === "center" ? "0 auto 20px" : "0 0 20px";

    const photoSrc = img.show ? safeImageSrc(img.src) : "";
    const initials =
      profile.name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("") || "YN";

    const mark = photoSrc ? (
      <img
        src={photoSrc}
        alt="Portfolio profile"
        style={{
          width: img.size,
          height: img.size,
          maxWidth: "100%",
          objectFit: "cover",
          display: "block",
          borderRadius: markRadius,
          margin: markMargin,
        }}
      />
    ) : profile.monogram ? (
      <div
        aria-hidden="true"
        style={{
          width: img.size,
          height: img.size,
          maxWidth: "100%",
          borderRadius: markRadius,
          margin: markMargin,
          background: onAccent ? theme.onAccent : theme.accent,
          color: onAccent ? theme.accent : theme.onAccent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: headingFont.stack,
          fontWeight: headingWeight,
          fontSize: img.size * 0.38,
        }}
      >
        {initials}
      </div>
    ) : null;

    return (
      <div style={{ textAlign: align }}>
        {mark}
        {profile.eyebrow.trim() && (
          <p
            style={{
              color: eyebrowColor,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "2px",
              textTransform: "uppercase",
            }}
          >
            {profile.eyebrow}
          </p>
        )}
        <h2
          style={{
            ...headingBase,
            fontSize: d.baseSize * (d.nameScale + (d.template === "creative" ? 0.5 : 0)),
            lineHeight: 1.15,
            marginTop: 12,
            color: nameColor,
            overflowWrap: "anywhere",
          }}
        >
          {profile.name || "Your Name"}
        </h2>
        <p
          style={{
            fontSize: d.baseSize * 1.15,
            color: softColor,
            marginTop: 12,
            overflowWrap: "anywhere",
          }}
        >
          {profile.headline || "Your professional headline"}
        </p>
        {profile.location.trim() && (
          <p
            style={{
              fontSize: d.baseSize * 0.9,
              color: softColor,
              marginTop: 6,
            }}
          >
            {profile.location}
          </p>
        )}
        {profile.badge.trim() && (
          <span
            style={{
              display: "inline-block",
              marginTop: 14,
              border: `1px solid ${onAccent ? theme.onAccent : theme.accent}`,
              color: onAccent ? theme.onAccent : theme.accent,
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: d.baseSize * 0.8,
              fontWeight: 600,
            }}
          >
            {profile.badge}
          </span>
        )}
        {renderHeaderButtons(onAccent, align)}
      </div>
    );
  }

  function renderPortfolio(mode: PreviewMode) {
    const phone = mode === "phone";

    const baseStyle: CSSProperties = {
      backgroundColor: theme.background,
      ...(d.backdrop === "gradient"
        ? {
            backgroundImage: `linear-gradient(160deg, ${theme.background} 0%, ${theme.surface} 100%)`,
          }
        : {}),
      ...(d.backdrop === "dots"
        ? {
            backgroundImage: `radial-gradient(${theme.muted}44 1px, transparent 1px)`,
            backgroundSize: "18px 18px",
          }
        : {}),
      color: theme.text,
      fontFamily: bodyFont.stack,
      fontSize: d.baseSize,
      minHeight: 600,
      padding: phone ? 22 : 42,
      boxSizing: "border-box",
      overflowWrap: "anywhere",
    };

    const content: ReactNode[] = sections.filter((s) => s.visible).map(renderSection);

    if (profile.footer.trim()) {
      content.push(
        <footer
          key="footer"
          style={{
            marginTop: sectionGap + 10,
            paddingTop: 18,
            borderTop: `1px solid ${theme.muted}33`,
            color: theme.muted,
            fontSize: d.baseSize * 0.85,
            textAlign: d.template === "sidebar" ? "left" : d.align,
            whiteSpace: "pre-wrap",
          }}
        >
          {profile.footer}
        </footer>
      );
    }

    if (d.template === "minimal") {
      return (
        <div style={baseStyle}>
          <div
            style={{
              borderBottom: `2px solid ${theme.accent}`,
              paddingBottom: 28,
            }}
          >
            {renderIntro(false, d.align)}
          </div>
          {content}
        </div>
      );
    }

    if (d.template === "modern") {
      return (
        <div style={baseStyle}>
          <div
            style={{
              background: theme.surface,
              borderRadius: d.radius + 6,
              padding: 24,
              borderLeft: `5px solid ${theme.accent}`,
            }}
          >
            {renderIntro(false, d.align)}
          </div>
          {content}
        </div>
      );
    }

    if (d.template === "creative") {
      return (
        <div style={baseStyle}>
          <div
            style={{
              background: theme.accent,
              color: theme.onAccent,
              borderRadius: d.radius + 6,
              padding: 26,
            }}
          >
            {renderIntro(true, d.align)}
          </div>
          {content}
        </div>
      );
    }

    // Sidebar template
    return (
      <div
        className="pf-sidebar"
        style={{
          ...baseStyle,
          padding: 0,
          display: "grid",
          gridTemplateColumns: phone ? "1fr" : "minmax(150px, 0.65fr) 1.5fr",
        }}
      >
        <aside
          style={{
            background: theme.surface,
            padding: 24,
            borderBottom: phone ? `3px solid ${theme.accent}` : "none",
            borderRight: phone ? "none" : `3px solid ${theme.accent}`,
          }}
        >
          {renderIntro(false, "left")}
        </aside>
        <div style={{ padding: phone ? 22 : 30 }}>{content}</div>
      </div>
    );
  }

  /* ---------- Download as a standalone HTML file ---------- */

  function downloadHtml() {
    const html = exportRef.current?.innerHTML;
    if (!html) return;

    const title = escapeHtml(
      profile.tabTitle.trim() || profile.name.trim() || "Portfolio"
    );
    const description = profile.headline.trim()
      ? `<meta name="description" content="${escapeHtml(profile.headline.trim())}" />`
      : "";
    const fontLink = fontsHref
      ? `<link rel="stylesheet" href="${fontsHref.replace(/&/g, "&amp;")}" />`
      : "";
    const favicon = profile.favicon.trim()
      ? `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${escapeHtml(
            profile.favicon.trim().slice(0, 4)
          )}</text></svg>`
        )}" />`
      : "";

    const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
${description}
${favicon}
${fontLink}
<style>
  body { margin: 0; background: ${theme.background}; }
  h1, h2, h3, h4, p { margin: 0; }
  @media (max-width: 640px) {
    .pf-sidebar { grid-template-columns: 1fr !important; }
    .pf-sidebar > aside { border-right: none !important; border-bottom: 3px solid ${theme.accent} !important; }
  }
</style>
</head>
<body>
<div style="max-width: 960px; margin: 0 auto;">
${html}
</div>
</body>
</html>`;

    const blob = new Blob([doc], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const slug = profile.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.href = url;
    link.download = `${slug || "portfolio"}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /* ---------- Editor pieces ---------- */

  function renderProfileFields(
    list: { key: ProfileTextKey; label: string; placeholder?: string }[]
  ) {
    return list.map((field) => (
      <Field key={field.key} label={field.label}>
        <input
          value={profile[field.key]}
          placeholder={field.placeholder}
          onChange={(event) =>
            setProfile({ [field.key]: event.target.value } as Partial<Profile>)
          }
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3"
        />
      </Field>
    ));
  }

  function renderSectionEditor(s: Section, index: number) {
    const fields = itemFields[s.type];

    return (
      <div key={s.id} className="mt-4 rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            value={s.icon}
            onChange={(event) =>
              updateSection(s.id, { icon: event.target.value.slice(0, 4) })
            }
            aria-label="Emoji or symbol before the title (optional)"
            placeholder="🙂"
            className="w-12 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm"
          />
          <input
            value={s.title}
            onChange={(event) => updateSection(s.id, { title: event.target.value })}
            aria-label="Section name"
            placeholder="Section name"
            className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold"
          />
          <button
            type="button"
            onClick={() => moveSection(s.id, -1)}
            disabled={index === 0}
            aria-label="Move section up"
            className={smallBtnCls}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => moveSection(s.id, 1)}
            disabled={index === sections.length - 1}
            aria-label="Move section down"
            className={smallBtnCls}
          >
            ↓
          </button>
          <button
            type="button"
            onClick={() => removeSection(s.id)}
            aria-label="Delete section"
            className={`${smallBtnCls} text-red-600`}
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={s.visible}
              onChange={(event) =>
                updateSection(s.id, { visible: event.target.checked })
              }
              className="h-4 w-4"
            />
            Show on portfolio
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Layout
            <select
              value={s.type}
              onChange={(event) =>
                updateSection(s.id, { type: event.target.value as SectionType })
              }
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
            >
              {(Object.keys(sectionTypeLabels) as SectionType[]).map((type) => (
                <option key={type} value={type}>
                  {sectionTypeLabels[type]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {s.type === "text" && (
          <textarea
            value={s.text}
            onChange={(event) => updateSection(s.id, { text: event.target.value })}
            rows={4}
            placeholder="Write your text here..."
            className={`${inputCls} py-3`}
          />
        )}

        {s.type === "tags" && (
          <input
            value={s.tags}
            onChange={(event) => updateSection(s.id, { tags: event.target.value })}
            placeholder="Separate with commas: Python, React, Public speaking"
            className={inputCls}
          />
        )}

        {s.type === "contact" && (
          <textarea
            value={s.text}
            onChange={(event) => updateSection(s.id, { text: event.target.value })}
            rows={2}
            placeholder="Short message (optional): Let's work together!"
            className={`${inputCls} py-3`}
          />
        )}

        {hasItems(s.type) && (
          <div className="mt-3 space-y-3">
            {s.items.map((it, itemIndex) => (
              <div key={it.id} className="rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {s.type === "contact" ? "Link" : "Item"} {itemIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(s.id, it.id)}
                    className="text-xs text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>

                {fields.title && (
                  <input
                    value={it.title}
                    onChange={(event) =>
                      updateItem(s.id, it.id, { title: event.target.value })
                    }
                    aria-label={fields.title}
                    placeholder={fields.title}
                    className={inputCls}
                  />
                )}
                {fields.subtitle && (
                  <input
                    value={it.subtitle}
                    onChange={(event) =>
                      updateItem(s.id, it.id, { subtitle: event.target.value })
                    }
                    aria-label={fields.subtitle}
                    placeholder={fields.subtitle}
                    className={inputCls}
                  />
                )}
                {fields.description && (
                  <textarea
                    value={it.description}
                    onChange={(event) =>
                      updateItem(s.id, it.id, { description: event.target.value })
                    }
                    rows={3}
                    aria-label={fields.description}
                    placeholder={fields.description}
                    className={inputCls}
                  />
                )}
                {fields.url && (
                  <input
                    value={it.url}
                    onChange={(event) =>
                      updateItem(s.id, it.id, { url: event.target.value })
                    }
                    aria-label={fields.url}
                    placeholder={fields.url}
                    className={inputCls}
                  />
                )}

                {fields.image && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={it.showImage}
                        onChange={(event) =>
                          updateItem(s.id, it.id, {
                            showImage: event.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      Show an image
                    </label>

                    {it.showImage && (
                      <div className="mt-2">
                        {it.image.startsWith("data:") ? (
                          <div className="flex items-center gap-3">
                            <img
                              src={it.image}
                              alt=""
                              className="h-16 w-24 rounded object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateItem(s.id, it.id, { image: "" })
                              }
                              className="text-sm text-red-600 underline"
                            >
                              Remove image
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                handleItemImage(s.id, it.id, event)
                              }
                              className="block w-full text-sm"
                            />
                            <input
                              value={it.image}
                              onChange={(event) =>
                                updateItem(s.id, it.id, {
                                  image: event.target.value,
                                })
                              }
                              placeholder="Or paste an image link (https://...)"
                              className={inputCls}
                            />
                          </>
                        )}
                        <input
                          value={it.imageAlt}
                          onChange={(event) =>
                            updateItem(s.id, it.id, { imageAlt: event.target.value })
                          }
                          placeholder="Describe the image (for screen readers)"
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                )}

                {fields.link && (
                  <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={it.showLink}
                        onChange={(event) =>
                          updateItem(s.id, it.id, {
                            showLink: event.target.checked,
                          })
                        }
                        className="h-4 w-4"
                      />
                      Show a link button
                    </label>

                    {it.showLink && (
                      <div className="mt-2">
                        <input
                          value={it.url}
                          onChange={(event) =>
                            updateItem(s.id, it.id, { url: event.target.value })
                          }
                          placeholder="Link to the project page, demo, or repo"
                          className={inputCls}
                        />
                        <input
                          value={it.linkLabel}
                          onChange={(event) =>
                            updateItem(s.id, it.id, {
                              linkLabel: event.target.value,
                            })
                          }
                          placeholder={`Button text (default: ${fields.linkDefault})`}
                          className={inputCls}
                        />
                      </div>
                    )}
                  </div>
                )}

                {fields.featured && (
                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={it.featured}
                      onChange={(event) =>
                        updateItem(s.id, it.id, { featured: event.target.checked })
                      }
                      className="h-4 w-4"
                    />
                    Highlight as featured
                  </label>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addItem(s.id)}
              className={smallBtnCls}
            >
              + {fields.addLabel}
            </button>
          </div>
        )}
      </div>
    );
  }

  /* ---------- Page layout ---------- */

  const saveText = {
    idle: "Changes save automatically in this browser.",
    saved: "Saved in this browser.",
    noimage:
      "Saved, but your uploaded images are too large to keep here. Re-add them next visit, or download your portfolio.",
    failed:
      "Could not save in this browser. Download your portfolio to keep it.",
  }[saveStatus];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 [color-scheme:light] sm:px-6">
      {fontsHref && <link rel="stylesheet" href={fontsHref} />}

      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            AI Portfolio Builder
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Customize your portfolio
          </h1>
          <p className="mt-2 text-gray-600">
            Choose a design, edit your content, and preview your changes.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-2">
          {/* EDITOR CONTROLS */}
          <section className="space-y-6">
            {/* 1. Template and layout */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">
                1. Choose a template
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {(Object.keys(templateNames) as Template[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setDesign({ template: item })}
                    className={`rounded-lg border p-4 text-left transition ${
                      d.template === item
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="block font-semibold">
                      {templateNames[item]}
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      {templateHints[item]}
                    </span>
                  </button>
                ))}
              </div>

              <Field label="Header alignment (not used by Sidebar)">
                <Segmented<Align>
                  value={d.align}
                  onChange={(align) => setDesign({ align })}
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Centered" },
                  ]}
                />
              </Field>

              <Field label="Space between sections">
                <Segmented<Spacing>
                  value={d.spacing}
                  onChange={(spacing) => setDesign({ spacing })}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "comfortable", label: "Comfortable" },
                    { value: "spacious", label: "Spacious" },
                  ]}
                />
              </Field>

              <Field label="Section heading style">
                <Segmented<HeadingStyle>
                  value={d.headingStyle}
                  onChange={(headingStyle) => setDesign({ headingStyle })}
                  options={[
                    { value: "plain", label: "Plain" },
                    { value: "underline", label: "Underline" },
                    { value: "bar", label: "Side bar" },
                  ]}
                />
              </Field>

              <Field label="Page background">
                <Segmented<Backdrop>
                  value={d.backdrop}
                  onChange={(backdrop) => setDesign({ backdrop })}
                  options={[
                    { value: "solid", label: "Solid" },
                    { value: "gradient", label: "Soft gradient" },
                    { value: "dots", label: "Dotted" },
                  ]}
                />
              </Field>
            </div>

            {/* 2. Fonts */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">2. Fonts</h2>

              <Field label="Heading font (name and section titles)">
                <select
                  value={d.headingFont}
                  onChange={(event) =>
                    setDesign({ headingFont: event.target.value })
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3"
                >
                  {fonts.map((font) => (
                    <option key={font.key} value={font.key}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Body font">
                <select
                  value={d.bodyFont}
                  onChange={(event) => setDesign({ bodyFont: event.target.value })}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3"
                >
                  {fonts.map((font) => (
                    <option key={font.key} value={font.key}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={`Text size: ${d.baseSize}px`}>
                <input
                  type="range"
                  min={14}
                  max={20}
                  step={1}
                  value={d.baseSize}
                  onChange={(event) =>
                    setDesign({ baseSize: Number(event.target.value) })
                  }
                  className="mt-2 w-full"
                />
              </Field>

              <Field label={`Name size: ${d.nameScale.toFixed(1)}×`}>
                <input
                  type="range"
                  min={1.6}
                  max={3.4}
                  step={0.1}
                  value={d.nameScale}
                  onChange={(event) =>
                    setDesign({ nameScale: Number(event.target.value) })
                  }
                  className="mt-2 w-full"
                />
              </Field>

              <Field label="Heading weight">
                <Segmented<number>
                  value={d.headingWeight}
                  onChange={(headingWeight) => setDesign({ headingWeight })}
                  options={[
                    { value: 400, label: "Regular" },
                    { value: 700, label: "Bold" },
                  ]}
                />
              </Field>

              <Field label="Heading letter case">
                <Segmented<HeadingCase>
                  value={d.headingCase}
                  onChange={(headingCase) => setDesign({ headingCase })}
                  options={[
                    { value: "none", label: "As typed" },
                    { value: "capitalize", label: "Capitalize Each Word" },
                    { value: "uppercase", label: "UPPERCASE" },
                  ]}
                />
              </Field>

              <Field label={`Heading letter spacing: ${d.letterSpacing}px`}>
                <input
                  type="range"
                  min={-1}
                  max={6}
                  step={0.5}
                  value={d.letterSpacing}
                  onChange={(event) =>
                    setDesign({ letterSpacing: Number(event.target.value) })
                  }
                  className="mt-2 w-full"
                />
              </Field>
            </div>

            {/* 3. Colors and shapes */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">
                3. Colors and shapes
              </h2>

              <Field label="Color theme">
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(Object.keys(themes) as ThemeName[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDesign({ themeKey: key })}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition ${
                        d.themeKey === key
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span
                        className="h-4 w-4 shrink-0 rounded-full border border-gray-300"
                        style={{ background: themes[key].accent }}
                      />
                      {themes[key].label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Your brand colors (optional)">
                <div className="mt-3 flex flex-wrap gap-x-8 gap-y-4">
                  <ColorField
                    label="Accent"
                    value={d.customAccent}
                    fallback={baseTheme.accent}
                    onChange={(customAccent) => setDesign({ customAccent })}
                  />
                  <ColorField
                    label="Background"
                    value={d.customBackground}
                    fallback={baseTheme.background}
                    onChange={(customBackground) =>
                      setDesign({ customBackground })
                    }
                  />
                  <ColorField
                    label="Text"
                    value={d.customText}
                    fallback={baseTheme.text}
                    onChange={(customText) => setDesign({ customText })}
                  />
                </div>
              </Field>

              <Field label={`Corner roundness: ${d.radius}px`}>
                <input
                  type="range"
                  min={0}
                  max={28}
                  step={2}
                  value={d.radius}
                  onChange={(event) =>
                    setDesign({ radius: Number(event.target.value) })
                  }
                  className="mt-2 w-full"
                />
              </Field>
            </div>

            {/* 4. Cards and links */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">
                4. Cards, images, and links
              </h2>

              <Field label="Card style">
                <Segmented<CardStyle>
                  value={d.cardStyle}
                  onChange={(cardStyle) => setDesign({ cardStyle })}
                  options={[
                    { value: "filled", label: "Filled" },
                    { value: "outline", label: "Outline" },
                    { value: "plain", label: "Plain" },
                  ]}
                />
              </Field>

              <Field label="Cards per row">
                <Segmented<1 | 2>
                  value={d.cardColumns}
                  onChange={(cardColumns) => setDesign({ cardColumns })}
                  options={[
                    { value: 1, label: "One" },
                    { value: 2, label: "Two (when there is room)" },
                  ]}
                />
              </Field>

              <Field label="Image position on cards">
                <Segmented<ImagePosition>
                  value={d.cardImagePosition}
                  onChange={(cardImagePosition) =>
                    setDesign({ cardImagePosition })
                  }
                  options={[
                    { value: "top", label: "On top" },
                    { value: "side", label: "Beside the text" },
                  ]}
                />
              </Field>

              <Field label="Image shape on cards">
                <Segmented<ImageRatio>
                  value={d.cardImageRatio}
                  onChange={(cardImageRatio) => setDesign({ cardImageRatio })}
                  options={[
                    { value: "16/9", label: "Wide" },
                    { value: "4/3", label: "Standard" },
                    { value: "1/1", label: "Square" },
                  ]}
                />
              </Field>

              <Field label="Image fit">
                <Segmented<ImageFit>
                  value={d.cardImageFit}
                  onChange={(cardImageFit) => setDesign({ cardImageFit })}
                  options={[
                    { value: "cover", label: "Fill the frame (crops)" },
                    { value: "contain", label: "Show the whole image" },
                  ]}
                />
              </Field>

              <Field label="Link button style">
                <Segmented<LinkStyle>
                  value={d.linkStyle}
                  onChange={(linkStyle) => setDesign({ linkStyle })}
                  options={[
                    { value: "text", label: "Text link" },
                    { value: "filled", label: "Filled button" },
                    { value: "outline", label: "Outline button" },
                  ]}
                />
              </Field>

              <Field label="Skill tag style">
                <Segmented<TagStyle>
                  value={d.tagStyle}
                  onChange={(tagStyle) => setDesign({ tagStyle })}
                  options={[
                    { value: "pill", label: "Pills" },
                    { value: "outline", label: "Outlined" },
                    { value: "text", label: "Plain text" },
                  ]}
                />
              </Field>
            </div>

            {/* 5. Your information */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">
                5. Your information
              </h2>

              {renderProfileFields([
                { key: "name", label: "Full name" },
                { key: "headline", label: "Professional headline" },
                {
                  key: "eyebrow",
                  label: "Small label above your name (leave empty to hide)",
                },
                { key: "location", label: "Location (optional)" },
                {
                  key: "badge",
                  label: "Status badge",
                  placeholder: "Open to internships",
                },
                { key: "email", label: "Contact email" },
              ])}

              <h3 className="mt-6 font-semibold text-gray-900">
                Header buttons
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add up to two buttons under your name, like a résumé download or
                a booking link. A button appears when it has text and a link.
              </p>

              {renderProfileFields([
                {
                  key: "ctaLabel",
                  label: "Main button text",
                  placeholder: "Download résumé",
                },
                {
                  key: "ctaUrl",
                  label: "Main button link",
                  placeholder: "https://...",
                },
                {
                  key: "cta2Label",
                  label: "Second button text",
                  placeholder: "Book a call",
                },
                {
                  key: "cta2Url",
                  label: "Second button link",
                  placeholder: "https://...",
                },
              ])}

              <h3 className="mt-6 font-semibold text-gray-900">
                Brand extras
              </h3>

              {renderProfileFields([
                {
                  key: "footer",
                  label: "Footer text (optional)",
                  placeholder: "© 2026 Your Name",
                },
                {
                  key: "tabTitle",
                  label: "Browser tab title (defaults to your name)",
                },
                {
                  key: "favicon",
                  label: "Tab icon (one emoji, used in the downloaded file)",
                  placeholder: "✨",
                },
              ])}

              <div className="mt-5 border-t border-gray-200 pt-5">
                <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={img.show}
                    onChange={(event) => setImage({ show: event.target.checked })}
                    className="h-4 w-4"
                  />
                  Show a profile image
                </label>

                {img.show && (
                  <div className="mt-3">
                    <label className="block text-sm text-gray-600">
                      Upload an image (maximum 5 MB)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-2 block w-full text-sm"
                    />
                    {img.src && (
                      <button
                        type="button"
                        onClick={() => setImage({ src: "", show: false })}
                        className="mt-2 text-sm text-red-600 underline"
                      >
                        Remove image
                      </button>
                    )}
                  </div>
                )}

                <label className="mt-4 flex items-center gap-3 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={profile.monogram}
                    onChange={(event) =>
                      setProfile({ monogram: event.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  Show your initials when there is no photo
                </label>

                {(img.show || profile.monogram) && (
                  <>
                    <Field label="Photo and initials shape">
                      <Segmented<ImageShape>
                        value={img.shape}
                        onChange={(shape) => setImage({ shape })}
                        options={[
                          { value: "circle", label: "Circle" },
                          { value: "rounded", label: "Rounded" },
                          { value: "square", label: "Square" },
                        ]}
                      />
                    </Field>

                    <Field label={`Photo and initials size: ${img.size}px`}>
                      <input
                        type="range"
                        min={80}
                        max={220}
                        step={10}
                        value={img.size}
                        onChange={(event) =>
                          setImage({ size: Number(event.target.value) })
                        }
                        className="mt-2 w-full"
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>

            {/* 6. Sections */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-gray-900">6. Sections</h2>
              <p className="mt-1 text-sm text-gray-500">
                Rename, reorder, hide, or delete any section, and add your own.
                The small box before each name takes an emoji.
              </p>

              {sections.map((s, index) => renderSectionEditor(s, index))}

              {sections.length === 0 && (
                <p className="mt-4 text-sm text-gray-500">
                  No sections yet. Add one below.
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-5">
                <select
                  value={newSectionType}
                  onChange={(event) =>
                    setNewSectionType(event.target.value as SectionType)
                  }
                  aria-label="New section layout"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {(Object.keys(sectionTypeLabels) as SectionType[]).map(
                    (type) => (
                      <option key={type} value={type}>
                        {sectionTypeLabels[type]}
                      </option>
                    )
                  )}
                </select>
                <button
                  type="button"
                  onClick={() => addSection(newSectionType)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  + Add section
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
              <p className="text-xs text-gray-500">{saveText}</p>
              <button
                type="button"
                onClick={resetAll}
                className="text-sm text-red-600 underline"
              >
                Reset everything
              </button>
            </div>
          </section>

          {/* LIVE PREVIEW */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 lg:sticky lg:top-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-900">Live preview</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {templateNames[d.template]} template
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewMode("desktop")}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    previewMode === "desktop"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Website
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode("phone")}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    previewMode === "phone"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Phone
                </button>
                <button
                  type="button"
                  onClick={downloadHtml}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:border-gray-500"
                >
                  Download HTML
                </button>
              </div>
            </div>

            <div className="mt-5 max-h-[75vh] overflow-auto rounded-xl bg-gray-100 p-3 sm:p-4">
              <div
                className="mx-auto overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all"
                style={{
                  width: previewMode === "phone" ? "375px" : "100%",
                  maxWidth: "100%",
                  background: theme.background,
                }}
              >
                {renderPortfolio(previewMode)}
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Download HTML gives you a single file you can open in any browser
              or upload to a free host.
            </p>

            {/* Hidden desktop render used for the HTML download */}
            <div ref={exportRef} aria-hidden="true" style={{ display: "none" }}>
              {renderPortfolio("desktop")}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}