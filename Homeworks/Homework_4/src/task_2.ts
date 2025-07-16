import assert from "node:assert";

type Product = {
  name: string;
  price: number;
  quantity: number;
};

let product: Product = {
  name: "Laptop",
  price: 1000,
  quantity: 5,
};

Object.defineProperties(product, {
  price: {
    writable: false,
    enumerable: false,
  },
  quantity: {
    writable: false,
    enumerable: false,
  },
});

function getTotalPrice(product: Product): number {
  let { price, quantity } = Object.getOwnPropertyDescriptors(product);

  return quantity.value! * price.value!;
}

// Check `getTotalPrice` succesfully computes total price
assert.equal(getTotalPrice(product), 5000);

function deleteNonConfigurable(product: Product, prop: keyof Product) {
  let isConfig = Object.getOwnPropertyDescriptor(product, prop)?.configurable;
  if (isConfig) delete product[prop];
  else {
    throw new TypeError(`property "${prop}" is not configurable`);
  }
}

// Remove "quantity" from product.
deleteNonConfigurable(product, "quantity");

// Check "quantity" has been succesfully removed from product object.
let descriptors = Object.keys(Object.getOwnPropertyDescriptors(product));
assert.deepEqual(descriptors, ["name", "price"]);

// Make "name" property non-configurable.
Object.defineProperty(product, "name", {
  configurable: false,
});

// Check `deleteNonConfigurable` function throws when passed property is non-configurable
assert.throws(() => {
  deleteNonConfigurable(product, "name");
}, TypeError);
