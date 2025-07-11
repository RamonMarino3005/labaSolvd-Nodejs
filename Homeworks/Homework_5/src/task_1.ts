import { Locale, Translations } from "./types.js";

type Greet = {
  greet: string;
  intro: string;
};
const TRANSLATIONS: Translations<Greet> = {
  en: {
    greet: "Hello",
    intro: "Welcome to our website",
  },
  es: {
    greet: "Hola",
    intro: "Bienvenido a nuestro sitio web",
  },
  fr: {
    greet: "Bonjour",
    intro: "Bienvenue sur notre site web",
  },
  de: {
    greet: "Hallo",
    intro: "Willkommen auf unserer Webseite",
  },
  it: {
    greet: "Ciao",
    intro: "Benvenuto sul nostro sito web",
  },
  pt: {
    greet: "Olá",
    intro: "Bem-vindo ao nosso site",
  },
  ru: {
    greet: "Здравствуйте",
    intro: "Добро пожаловать на наш сайт",
  },
  ja: {
    greet: "こんにちは",
    intro: "私たちのウェブサイトへようこそ",
  },
  zh: {
    greet: "你好",
    intro: "欢迎访问我们的网站",
  },
  ar: {
    greet: "مرحبا",
    intro: "مرحبًا بكم في موقعنا",
  },
};

function generalLocalize<T extends Record<string, string>>(
  translations: Translations<T>
) {
  return function (language: Locale) {
    return function (_: TemplateStringsArray, value: keyof T) {
      return (translations[language] as T)[value];
    };
  };
}

const localize = generalLocalize(TRANSLATIONS);
const localizeEN = localize("en");

const greeting = "greet";
const introduction = "intro";

const greetingEN = localizeEN`${greeting}`;
const introEN = localizeEN`${introduction}`;

console.log("Greet:", greetingEN);
console.log("Introduction:", introEN);
