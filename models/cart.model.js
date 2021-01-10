module.exports = {
  add(cart, item) {
    const isInCart = this.ifInCart(cart, item);
    if (!isInCart) cart.push(item);
  },

  del(cart, id) {
    for (let i = cart.length - 1; i >= 0; i--) {
      if (id === cart[i].id) {
        cart.splice(i, 1);
        return;
      }
    }
  },

  ifInCart(cart, item) {
    for (let e in cart) {
      if (item.id == cart[e].id) {
        return true;
      }
    }
    return false;
  },

  getNumberOfItems(cart) {
    return cart.length;
  },
};
