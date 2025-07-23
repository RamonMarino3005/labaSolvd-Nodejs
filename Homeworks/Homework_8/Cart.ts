import { Book, ISBN } from "./Book.js";

/**
 * Represents an entry in the cart with a book and its quantity.
 */
export type BookObject = {
  book: Book;
  amount: number;
};

/**
 * A mapping of book ISBNs to book entries in the cart.
 */
type BookCart = Map<ISBN, BookObject>;

/**
 * Represents a shopping cart for a user.
 * Contains logic to add, remove, and manage books and quantities.
 */
export class Cart {
  private _bookMap: BookCart = new Map();

  constructor() {}

  /**
   * Creates a new BookObject with a default quantity of 1.
   * @param book The book to add to the cart.
   * @returns A new BookObject.
   */
  private createBookObject(book: Book): BookObject {
    return {
      book,
      amount: 1,
    };
  }

  /**
   * Adds a single book to the cart.
   * If the book already exists, it increases the quantity.
   * If the book is unavailable, it will not be added.
   * @param book The book to add.
   * @returns True if the book was successfully added, false otherwise.
   */
  addBook(book: Book): boolean {
    if (!book.availabilty) return false;

    const ISBN = book.ISBN;

    if (this._bookMap.has(ISBN)) {
      let book = this._bookMap.get(ISBN);

      if (!book) return false;

      book.amount++;

      return true;
    } else {
      let newBook = this.createBookObject(book);

      this._bookMap.set(ISBN, newBook);

      return true;
    }
  }

  /**
   * Adds multiple books to the cart.
   * @param books An array of books to add.
   */
  addBooks(books: Book[]) {
    books.forEach((book: Book) => {
      this.addBook(book);
    });
  }

  /**
   * Removes one copy of a book from the cart.
   * If `_delete` is true or only one copy is left, removes the book entirely.
   * @param book The book to remove.
   * @param _delete Whether to force full deletion of the book entry.
   * @returns True if the book was found and removed, false otherwise.
   */
  removeBook(book: Book, _delete: boolean = false): boolean {
    let ISBN = book.ISBN;
    let bookEntry = this._bookMap.get(ISBN);

    console.log("Book entry:", bookEntry);
    if (bookEntry) {
      if (bookEntry.amount === 1 || _delete) {
        this._bookMap.delete(ISBN);
      } else bookEntry.amount--;

      return true;
    } else return false;
  }

  /**
   * Removes multiple books from the cart.
   * @param books An array of books to remove.
   */
  removeBooks(books: Book[]) {
    books.forEach((book) => {
      this.removeBook(book);
    });
  }

  /**
   * Clears all books from the cart.
   */
  clear() {
    this._bookMap = new Map();
  }

  /**
   * Calculates the total price of all items in the cart.
   * @returns The total price.
   */
  calculateTotalPrice(): number {
    return [...this._bookMap].reduce((acc, [key, value]) => {
      let { book, amount } = value;
      return acc + book.getFinalPrice() * amount;
    }, 0);
  }

  /**
   * Returns an array of BookObject entries currently in the cart.
   * @returns An array of BookObjects.
   */
  getItems() {
    return [...this._bookMap].map(([key, value]: [ISBN, BookObject]) => value);
  }

  /**
   * Returns just the books from the cart, without quantities.
   * @returns An array of Book instances.
   */
  getBooks() {
    return this.getItems().map((entry) => entry.book);
  }

  /**
   * Checks if the cart is empty.
   * @returns True if the cart has no items, false otherwise.
   */
  isEmpty() {
    console.log("Cart size: ", !!this._bookMap.size);
    return this._bookMap.size == 0;
  }
}
