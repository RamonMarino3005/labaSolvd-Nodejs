/**
 * This Symbol allows to restrict operations to specific modules
 * without breaking encapsulation.
 */
const _protectionKey = Symbol("protectionKey");

/**
 * A branded type representing a valid ISBN (either ISBN-10 or ISBN-13).
 */
export type ISBN = string & { readonly __brand: unique symbol };

/**
 * Abstract base class representing a generic book.
 * Includes properties like title, author, price, and availability,
 * and provides common behavior such as discounting, stock handling,
 * and description formatting.
 */
export abstract class Book {
  private _discount: number = 0;

  /**
   * @param title - The title of the book.
   * @param author - The author of the book.
   * @param _ISBN - The book's unique ISBN.
   * @param _price - The base price of the book.
   * @param _availabilty - The current stock of the book, or `null` if unavailable.
   */
  constructor(
    private _title: string,
    private _author: string,
    private _ISBN: ISBN,
    private _price: number,
    private _availabilty: number | null
  ) {}

  /**
   * The type of the book (e.g., "EBook", "Hardcover"). Must be implemented by subclasses.
   */
  abstract get type(): string;

  /** Return book title */
  get title() {
    return this._title;
  }

  /** Return book author */
  get author() {
    return this._author;
  }

  /** Return book price */
  get price() {
    return this._price;
  }

  get ISBN() {
    return this._ISBN;
  }

  /** Returns the number of books available in stock. */
  get availabilty() {
    return this._availabilty;
  }

  /** Returns the current discount being applied to the book (from 0 to <1). */
  get discount() {
    return this._discount;
  }

  getFinalPrice() {
    return this.price * (1 - this.discount);
  }

  /**
   * Decreases the stock by the given amount (default is 1).
   * If the book is available, the method updates availability and returns true.
   * If unavailable, it returns false.
   * @param amount - Number of units to decrease from availability.
   * @returns Whether the operation was successful.
   */
  decreaseStock(amount: number = 1, key: symbol) {
    if (key !== _protectionKey) {
      throw new Error("Unauthorized access to set stock");
    }
    if (this._availabilty) {
      console.log(" Inside Decreasing!");

      this._availabilty -= amount;
      return true;
    }
    return false;
  }

  /**
   * Applies a discount to the book's price.
   * @param discount - A number between 0 (no discount) and <1 (e.g. 0.2 = 20% off).
   * @throws Error if discount is not between 0 and 1 (exclusive).
   */
  applyDiscount(discount: number, key: symbol) {
    if (key !== _protectionKey) {
      throw new Error("Unauthorized access to set discount");
    }
    if (discount >= 1 || discount < 0) {
      throw new Error(
        "Invalid discount: discount must be a number between 0 and 1 exclusive"
      );
    }
    this._discount = discount;
  }

  /**
   * Returns a short description of the book including title and author.
   * @returns A string in the format: "Title by Author".
   */
  getDescription() {
    return `${this.title} by ${this.author}`;
  }

  /**
   * Overloads toString to returns the string representation of the book (same as description).
   * @returns A string representing the book.
   */
  toString() {
    return this.getDescription();
  }

  toPublicObject() {
    return {
      title: this.title,
      author: this.author,
      ISBN: this._ISBN,
      price: this.price,
      discount: this.discount,
    };
  }

  // ----- Static utility methods for ISBN validation -----

  // All the following validations where taken from online sources.
  // I am not familiar with ISBN validation

  /**
   * Validates an ISBN-10 string.
   * @param isbn - A 10-digit string possibly ending in "X".
   * @returns Whether the ISBN-10 is valid.
   */
  private static isValidISBN10(isbn: string): boolean {
    if (!/^\d{9}[\dX]$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += (i + 1) * Number(isbn[i]);
    }

    const check = isbn[9] === "X" ? 10 : Number(isbn[9]);
    sum += 10 * check;

    return sum % 11 === 0;
  }

  /**
   * Validates an ISBN-13 string.
   * @param isbn - A 13-digit string.
   * @returns Whether the ISBN-13 is valid.
   */
  private static isValidISBN13(isbn: string): boolean {
    if (!/^\d{13}$/.test(isbn)) return false;

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += Number(isbn[i]) * (i % 2 === 0 ? 1 : 3);
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === Number(isbn[12]);
  }

  /**
   * Validates whether the provided string is a valid ISBN (10 or 13).
   * Removes dashes/spaces before validating.
   * @param isbn - The ISBN string to validate.
   * @returns True if valid, false otherwise.
   */
  private static isValidISBN(isbn: string) {
    let digits = isbn.replace(/[-\s]/g, "");
    return digits.length === 10
      ? this.isValidISBN10(digits)
      : digits.length === 13
      ? this.isValidISBN13(digits)
      : false;
  }

  /**
   * Factory method to validate and cast a string into an `ISBN` branded type.
   * @param isbn - A string representing an ISBN-10 or ISBN-13.
   * @returns The validated ISBN as a branded `ISBN` type.
   * @throws Error if the ISBN is not valid.
   */
  static createISBN(isbn: string): ISBN {
    if (!this.isValidISBN(isbn)) throw new Error("Invalid ISBN");
    return isbn as ISBN;
  }
}

/**
 * Represents the physical dimensions of a book.
 * Used for `dimesions` property in HardCover
 */
type BookDimensions = {
  width: number;
  height: number;
  depth: number;
};

/**
 * Represents a physical hardcover book.
 * Extends the abstract Book class with physical dimensions.
 */
export class HardCover extends Book {
  /**
   * Creates a new HardCover book.
   * @param title - The title of the book.
   * @param author - The author of the book.
   * @param ISBN - The ISBN of the book.
   * @param price - The price of the book.
   * @param availabilty - How many units are in stock.
   * @param _dimensions - The physical dimensions of the hardcover book.
   */
  constructor(
    title: string,
    author: string,
    ISBN: ISBN,
    price: number,
    availabilty: number | null,
    private _dimensions: BookDimensions
  ) {
    super(title, author, ISBN, price, availabilty);
  }

  /**
   * Returns the type of book.
   */
  get type() {
    return "HardCover";
  }

  get dimensions() {
    return this._dimensions;
  }

  /**
   * Returns a formatted string describing the book with dimensions.
   */
  getDescription(): string {
    return `${super.getDescription()} [Hardcover, ${
      this._dimensions.width
    }cm x ${this._dimensions.height}cm x ${this._dimensions.depth}cm]`;
  }

  /**
   * Overloads toString to return a string representation of the book(same as getDescription).
   */
  toString(): string {
    return this.getDescription();
  }
}

/**
 * Represents a digital eBook.
 * Extends the Book class with a file size property.
 */
export class EBook extends Book {
  /**
   * Creates a new EBook.
   * @param title - The title of the eBook.
   * @param author - The author of the eBook.
   * @param ISBN - The ISBN of the eBook.
   * @param price - The price of the eBook.
   * @param _availabilty - How many licenses are available, or null if unlimited.
   * @param fileSize - The size of the eBook file in megabytes.
   */
  constructor(
    title: string,
    author: string,
    ISBN: ISBN,
    price: number,
    availabilty: number | null,
    private _fileSize: number
  ) {
    super(title, author, ISBN, price, availabilty);
  }

  /**
   * Returns the type of book.
   */
  get type() {
    return "EBook";
  }

  get fileSize() {
    return this._fileSize;
  }

  /**
   * Returns a formatted string describing the eBook and its size.
   */
  getDescription(): string {
    return `${super.getDescription()} [EBook, ${this.fileSize}mb]`;
  }

  /**
   * Overloads toString to return a string representation of the EBook(same as getDescription).
   */
  toString(): string {
    return this.getDescription();
  }
}

export const ProtectionKey = _protectionKey;

export type EBookParameters = [string, string, ISBN, number, number, number];
export type HardParameters = [
  string,
  string,
  ISBN,
  number,
  number,
  BookDimensions
];

export const mockBooks: (EBookParameters | HardParameters)[] = [
  [
    "Harry Potter",
    "J.K. Rowling",
    Book.createISBN("9796957875839"),
    21,
    200,
    { width: 15, height: 0, depth: 5 },
  ],

  [
    "Fantastic Beasts and where to find them",
    "J.K. Rowling",
    Book.createISBN("9788165274696"),
    25,
    200,
    { width: 15, height: 0, depth: 5 },
  ],

  ["Dune", "Frank Herbert", Book.createISBN("9795398637327"), 20, 200, 400],
  [
    "Crime And Punishment",
    "Fyodor Dostoevsky",
    Book.createISBN("9782110054432"),
    16,
    200,
    368,
  ],

  [
    "Lord of The Rings: The fellowship of the Ring",
    "Tolkien",
    Book.createISBN("9783837811100"),
    33,
    200,
    { width: 10, height: 30, depth: 5 },
  ],
];
