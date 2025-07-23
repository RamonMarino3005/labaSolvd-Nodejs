import { Cart } from "./Cart.js";

/**
 * Abstract base class representing a generic user.
 * Intended to extended to user types like `Customer` or `Admin`.
 */
export abstract class User {
  /**
   * Any extension must specify a unique ID and whether the user has administrative privileges.
   * I leave user_id abstract just in case different subclasses use different ID validations or formats
   */
  abstract user_id: any;
  abstract admin: boolean;

  /**
   * Creates a new user.
   * @param name - The name of the user.
   * @param email - The email address of the user.
   */
  constructor(public name: string, public email: string) {}
}

export class Customer extends User {
  /**
   * Represents a customer in the bookstore.
   * Customers have a unique ID and their own shopping cart.
   */
  private user_ID: string;

  /**
   * Customers are not admins.
   */
  public admin: boolean = false;

  /**
   * The customer's shopping cart.
   */
  private _cart: Cart = new Cart();

  /**
   * Creates a new customer with a unique ID and an empty cart.
   * @param name - The name of the customer.
   * @param email - The email address of the customer.
   */
  constructor(name: string, email: string) {
    super(name, email);
    this.user_ID = crypto.randomUUID();
  }

  /**
   * Gets the customer's unique ID.
   */
  get user_id() {
    return this.user_ID;
  }

  /**
   * Gets the customer's cart.
   */
  get cart() {
    return this._cart;
  }

  toObject() {
    return {
      userId: this.user_id,
      name: this.name,
    };
  }
}

// UTIL
export const mockUsers = {
  thomas: new Customer("Thomas", "thomas@gmail.com"),
  john: new Customer("John", "john@gmail.com"),
  howard: new Customer("Howard", "howard@gmail.com"),
  rajesh: new Customer("Rajesh", "rajesh@gmail.com"),
  leonard: new Customer("Leonard", "thomas@gmail.com"),
  penny: new Customer("Penny", "penny@gmail.com"),
};
