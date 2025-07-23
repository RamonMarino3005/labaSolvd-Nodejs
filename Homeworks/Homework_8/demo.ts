import assert from "node:assert";
import {
  Book,
  EBook,
  EBookParameters,
  HardCover,
  HardParameters,
  mockBooks,
} from "./Book.js";
import { mockUsers } from "./User.js";
import { Bookstore } from "./bookstore.js";
import { FakePaymentProcessor, Order, OrderService } from "./Order.js";

/*
    CREATING A BOOKSTORE
*/

// Create new Bookstore.
const lib = new Bookstore();

// Extract book data from mockBooks(util form Book.ts)
const [
  _harryPotter,
  _fantasticBeasts,
  _dune,
  _crimeAndPunishment,
  _lordOfTheRings,
] = mockBooks;

// Helper functions for creating books
const createEBook = (...args: EBookParameters) => new EBook(...args);
const createHardCover = (...args: HardParameters) => new HardCover(...args);

// Add books to the bookstore

lib.addBooks([
  createHardCover(...(_harryPotter as HardParameters)),
  createHardCover(...(_fantasticBeasts as HardParameters)),
  createEBook(...(_dune as EBookParameters)),
  createEBook(...(_crimeAndPunishment as EBookParameters)),
  createHardCover(...(_lordOfTheRings as HardParameters)),
]);

/*
    Configure Payment and order proccessing
*/

const paymentProcessor = new FakePaymentProcessor();
const orderService = new OrderService(lib, paymentProcessor);

/*
    USER INTERACTIONS
*/

// Get mock Users.
const { thomas, john, howard, rajesh } = mockUsers;

// Access each user's cart
let thomasCart = thomas.cart;
let johnCart = john.cart;
let howardCart = howard.cart;
let rajeshCart = rajesh.cart;

// Find books from bookstore using different search methods
const harryPotter = lib.searchByTitle("Harry Potter")[0];
const dune = lib.searchByAuthor("Herbert")[0];

let isbnCrime = Book.createISBN("9782110054432");
const crimeAndPunishment = lib.searchByISBN(isbnCrime)!;
const lordOfTheRings = lib.searchByFilters({ title: "Lord" })![0];

// Cart operations: add, remove, clear

// Thomas adds books (2 harryPotter, 1 lordOfTheRings)
/* 
    Note: addBooks is really just a helper function for this demo,
    it's easier to pass array, but I do not see a real world 
    implementation for it.
*/
thomasCart.addBooks([harryPotter, lordOfTheRings, harryPotter]);
let booksInCart = thomasCart.getBooks();
assert(booksInCart.length == 2 && booksInCart.includes(harryPotter));

// Thomas removes one copy of harryPotter
// Thomas now has 1 harryPotter and 1 lordOfTheRings
thomasCart.removeBook(harryPotter);

// John adds books to his cart
johnCart.addBooks([crimeAndPunishment, dune]);
johnCart.addBook(dune);
assert(johnCart.getBooks().includes(dune));

// John removes all copies of dune from his cart
johnCart.removeBook(dune, true);
assert(!johnCart.getBooks().includes(dune));

// Howard adds books and then removes them
howardCart.addBooks([dune, harryPotter]);
howardCart.removeBooks([dune, harryPotter]);
assert(howardCart.isEmpty());

// Rajesh adds books
rajeshCart.addBooks([lordOfTheRings, crimeAndPunishment]);
// Rajesh clears Cart.
rajeshCart.clear();
assert(rajeshCart.isEmpty());

/*
  CHECKOUT: Process orders and handle errors
*/
const order = await orderService.checkout(thomas);
const order_2 = await orderService.checkout(john);
try {
  const order_3 = await orderService.checkout(howard);
} catch (err) {
  console.log(err); // Cant checkout empty cart
}
// Order was successful and assigned to Thomas.
assert(order && order.toObject().id === thomas.user_id);

// Book stock was updated.
assert(harryPotter.availabilty === 199 && lordOfTheRings.availabilty === 199);

// Apply discount to harry potter from library
lib.applyDiscount(0.1, harryPotter);
assert(
  harryPotter.discount === 0.1 && Math.floor(harryPotter.getFinalPrice()) === 18
);
