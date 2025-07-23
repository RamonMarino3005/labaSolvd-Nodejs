import { Book, ISBN } from "./Book.js";
import { Cart } from "./Cart.js";
import { ProtectionKey } from "./Book.js";

/**
 * Represents optional filters for searching books.
 */
type SearchFilters = {
  title?: string;
  author?: string;
  price?: { max: number; min?: number };
};

/**
 * The `Bookstore` class manages collections of books by type,
 * supports operations such as searching, inventory control,
 * and discount management.
 */
export class Bookstore {
  private books = new Map<string, Book[]>();

  /**
   * Returns all books from all categories in the store.
   */
  getAllBooks() {
    return [...this.books.values()].flatMap((book) => book);
  }

  /**
   * Adds a book to the store under its type category.
   * @param book - The book to be added.
   * @returns Whether the book was successfully added.
   */
  addBook(book: Book): boolean {
    if (!this.books.has(book.type)) {
      this.books.set(book.type, []);
    }
    this.books.get(book.type)!.push(book);
    return true;
  }

  /**
   * Adds multiple books to the store.
   * @param books - An array of books to be added.
   */
  addBooks(books: Book[]) {
    books.forEach((book) => {
      this.addBook(book);
    });
  }

  /**
   * Removes a book from the store.
   * @param book - The book to be removed.
   * @returns Whether the book was successfully removed.
   */
  removeBook(book: Book): boolean {
    let shelf = this.books.get(book.type);
    if (!shelf) return false;

    let bookInShelf = shelf.find((_book) => _book.ISBN === book.ISBN);
    if (!bookInShelf) return false;

    this.books.set(
      book.type,
      shelf.filter((_book) => _book.ISBN !== book.ISBN)
    );
    return true;
  }

  /**
   * Removes multiple books from the store.
   * @param books - An array of books to be removed.
   */
  removeBooks(books: Book[]) {
    books.forEach((book) => {
      this.removeBook(book);
    });
  }

  /**
   * Applies a discount to a given book.
   * @param discount - A number between 0 and 1.
   * @param book - The book to apply the discount to.
   */
  applyDiscount(discount: number, book: Book) {
    book.applyDiscount(discount, ProtectionKey);
  }

  /**
   * Verifies that all items in a cart instance are available in stock.
   * @param cart - The shopping cart to check against inventory.
   * @returns True if all items are in stock.
   */
  verifyStock(cart: Cart): boolean {
    let cartItems = cart.getItems();

    cartItems.forEach((book) => {
      let target = this.searchByISBN(book.book.ISBN);
      if (!target || !target.availabilty || target.availabilty < book.amount)
        return false;
    });

    return true;
  }

  /**
   * Decreases the stock of items in the cart after a successful order.
   * @param cart - The cart with items to decrement from inventory.
   * @throws Error if any item is unavailable or insufficient in stock.
   */
  updateStock(cart: Cart) {
    let cartItems = cart.getItems();

    cartItems.forEach((bookObject) => {
      let target = this.searchByISBN(bookObject.book.ISBN);
      if (
        !target ||
        !target.availabilty ||
        target.availabilty < bookObject.amount
      )
        throw new Error("Invalid Cart Items: validate before changing stock");

      bookObject.book.decreaseStock(bookObject.amount, ProtectionKey);
    });
  }

  /**
   * Retrieves all books of a given type/category.
   * @param category - The type of books to retrieve.
   * @returns An array of books in that category.
   * @throws TypeError if the category is not found.
   */
  getBooksByType(category: string): Book[] {
    let shelf = this.books.get(category);
    if (!shelf) throw new TypeError(`No category '${category}' in our shelves`);

    return shelf;
  }

  /**
   * Searches for books by a title substring.
   * @param query - The title query string.
   * @returns A list of matching books.
   */
  searchByTitle(query: string) {
    const escapedInput = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedInput, "i");

    let results: Book[] = [];
    [...this.books].forEach(([key, shelf]) => {
      shelf.forEach((book) => {
        let title = book.title;
        const match = regex.test(title);
        if (match) {
          results.push(book);
        }
      });
    });
    return results;
  }

  /**
   * Searches for books by author name.
   * @param query - The author query string.
   * @returns A list of matching books.
   */
  searchByAuthor(query: string) {
    const escapedInput = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedInput, "i");

    let results: Book[] = [];
    [...this.books].forEach(([_, shelf]) => {
      shelf.forEach((book) => {
        let author = book.author;
        const match = regex.test(author);
        if (match) {
          results.push(book);
        }
      });
    });
    return results;
  }

  /**
   * Finds a book by its ISBN.
   * @param ISBN - The ISBN identifier.
   * @returns The matching book or null.
   */
  searchByISBN(ISBN: ISBN): Book | null {
    for (let shelf of this.books.values()) {
      let match = shelf.find((book) => {
        let _ISBN = book.ISBN;
        return ISBN === _ISBN;
      });
      if (match) return match;
    }
    return null;
  }

  /**
   * Finds books within a given price range.
   * @param max - The maximum price.
   * @param min - The minimum price (default is 0).
   * @returns A list of books in the specified range.
   */
  searchByPriceRange(max: number, min: number = 0) {
    let results: Book[] = [];
    [...this.books].forEach(([_, value]) => {
      value.forEach((book) => {
        let price = book.price;
        if (price >= min && price <= max) {
          results.push(book);
        }
      });
    });
    return results;
  }

  /**
   * Searches for books based on multiple filters (title, author, price).
   * All filters must be satisfied (intersection).
   * @param searchOptions - The filters to apply.
   * @returns A list of matching books or null.
   */
  searchByFilters(searchOptions: SearchFilters): Book[] | null {
    const map: Record<keyof SearchFilters, (...args: any) => Book[]> = {
      title: (title: string) => this.searchByTitle(title),
      author: (author: string) => this.searchByAuthor(author),
      price: (range: { max: number; min?: number }) =>
        this.searchByPriceRange(range.max, range.min),
    };

    let results: Book[] | undefined;

    Object.entries(searchOptions).forEach(([key, value]) => {
      let searchResults = map[key as keyof SearchFilters](value);
      // If one filter has no results, then search will never be satified.
      if (!searchResults) return [];

      if (results) {
        let intersection = results.filter((book) =>
          searchResults.includes(book)
        );
        if (!intersection) return [];
        results = intersection;
      } else {
        results = searchResults;
      }
    });
    return results || null;
  }

  /**
   * String representation of the bookstore.
   */
  toString() {
    // Convert books Map<string, Book[]> into an object with arrays of book descriptions
    const obj: Record<string, string[]> = {};

    for (const [category, books] of this.books.entries()) {
      obj[category] = books.map((book) => book.toString());
    }

    return JSON.stringify(obj, null, 2);
  }
}
