import { Bookstore } from "./bookstore.js";
import { BookObject, Cart } from "./Cart.js";
import { Customer, User } from "./User.js";

/**
 * Represents a completed order.
 */
export class Order {
  private order_id: string;

  /**
   * Creates a new order for a given customer and cart items.
   * @param user - The customer placing the order.
   * @param bookOrder - The list of books being ordered.
   * @param totalPrice - The total price of the order.
   */
  constructor(
    public user: Customer,
    public bookOrder: BookObject[],
    public totalPrice: number
  ) {
    this.order_id = crypto.randomUUID();
  }

  /**
   * Gets the order ID.
   */
  get id(): string {
    return this.order_id;
  }

  /**
   * Returns a plain object representing the order.
   */
  toObject() {
    const orderedBooks = this.bookOrder.map((entry) => {
      return { book: entry.book.toPublicObject(), amount: entry.amount };
    });
    const _user = this.user.toObject();
    return {
      id: _user.userId,
      user: _user,
      books: orderedBooks,
      total: this.totalPrice,
    };
  }

  /**
   * Custom toJSON.
   */
  toJSON() {
    return this.toObject();
  }
}

/**
 * Service class responsible for handling operations with orders,
 * including checkout and payment processing.
 */
export class OrderService {
  /**
   * Constructs the order service with dependencies.
   * @param bookstore - The bookstore instance for stock management.
   * @param paymentProcessor - The payment processor to use during checkout.
   */
  constructor(
    private bookstore: Bookstore,
    private paymentProcessor: PaymentProcessor
  ) {}

  /**
   * Processes the checkout for a user.
   * Validates the cart, processes payment, and creates the order.
   * @param user - The customer attempting to checkout.
   * @returns The created order if successful, otherwise null.
   * @throws Error if the cart is empty or payment fails.
   */
  async checkout(user: Customer): Promise<Order | null> {
    let userCart = user.cart;
    let cartItems = userCart.getItems();
    let totalAmount = userCart.calculateTotalPrice();

    if (userCart.isEmpty()) {
      throw new Error("Cannot create an order with an empty cart");
    }

    // Validate stock in Bookstore
    this.bookstore.verifyStock(userCart);

    // Process payment
    const paymentResult = await this.paymentProcessor.processPayment(
      user,
      totalAmount
    );

    if (!paymentResult.success) {
      throw new Error("Payment failed");
    }

    // Create order
    const order = new Order(user, cartItems, totalAmount);

    // Update stock
    this.bookstore.updateStock(userCart);

    return order;
  }
}

/**
 * Interface for a payment processor.
 * This allows OrderService to stay abstract,
 * Low level details are handle outside the OrderService class.
 */
interface PaymentProcessor {
  /**
   * Processes a payment for a user.
   * @param user - The user making the payment.
   * @param amount - The amount to charge.
   * @returns A promise that resolves to an object indicating success.
   */
  processPayment(user: Customer, amount: number): Promise<{ success: boolean }>;
}

/**
 * A mock payment processor that simulates payment handling
 * Has a random success rate of 90% just for testing purposes.
 */
export class FakePaymentProcessor implements PaymentProcessor {
  /**
   * Simulates processing a payment.
   * @param user - The user making the payment.
   * @param amount - The amount to simulate charging.
   * @returns A promise resolving to a simulated result.
   */
  async processPayment(
    user: Customer,
    amount: number
  ): Promise<{ success: boolean }> {
    console.log(`Simulating payment of $${amount} for user ${user.user_id}...`);

    await new Promise((r) => setTimeout(r, 1000)); // simulate delay

    const success = true; // `Math.random() > 0.1` paste this for 90% success rate
    if (success) {
      console.log("Payment successful!");
    } else {
      console.log("Payment failed.");
    }

    return { success };
  }
}
