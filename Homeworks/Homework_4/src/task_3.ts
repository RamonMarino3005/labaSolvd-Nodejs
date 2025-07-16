import assert from "node:assert";

type BankAccount = {
  _balance: number;
  balance: number;
  readonly formattedBalance: string;
  transfer: (target: BankAccount, amount: number) => void;
};

// I am assuming classes are not allowed in this exercise.
function createBankAccount(
  this: Partial<BankAccount>,
  initialBalance: number = 1000
) {
  this._balance = initialBalance;

  Object.defineProperties(this, {
    _balance: {
      value: initialBalance,
      writable: true,
      enumerable: false,
      configurable: false,
    },

    formattedBalance: {
      get() {
        return `$${this._balance}`;
      },
    },

    balance: {
      get() {
        return this._balance;
      },
      set(val: number) {
        if (typeof val !== "number" || val < 0) {
          throw new Error("Balance must be a non-negative number");
        }
        this._balance = val;
      },
    },

    transfer: {
      value: function (target: BankAccount, amount: number) {
        if (amount > this._balance) throw new Error("Not enough funds");
        this._balance -= amount;
        target.balance += amount;
      },
    },
  });
}

let defaultBank: Partial<BankAccount> = {};
createBankAccount.call(defaultBank);

// Check expected properties have been created.
const getDescriptors = (obj: Record<any, any>) =>
  Object.keys(Object.getOwnPropertyDescriptors(obj));
let expectedBankDescriptors = [
  "_balance",
  "formattedBalance",
  "balance",
  "transfer",
];
assert.deepEqual(expectedBankDescriptors, getDescriptors(defaultBank));
// Check default value
assert.equal(defaultBank.balance, 1000, "Default initialization");

// Check balance setter works as expected
defaultBank.balance = 1500;
assert.equal(defaultBank.balance, 1500, "Balace setter");

// Check formattedBalance works as expected.
assert.equal(defaultBank.formattedBalance, "$1500", "formattedBalance getter");

// Check transfer method works as expected.
let bankAccount: Partial<BankAccount> = {};
createBankAccount.call(bankAccount, 1500);

let secondBankAccount: Partial<BankAccount> = {};
createBankAccount.call(secondBankAccount, 2000);

bankAccount.transfer!(secondBankAccount as BankAccount, 1000);
assert(
  bankAccount.balance === 500 && secondBankAccount.balance === 3000,
  "Transfer method"
);
