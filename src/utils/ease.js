// from https://github.com/kaelzhang/easing-functions/
export const basic = {
  Linear: {
    None: function (e) {
      return e;
    },
  },
  Quad: {
    In: function (e) {
      return e * e;
    },
    Out: function (e) {
      return e * (2 - e);
    },
    InOut: function (e) {
      if ((e *= 2) < 1) return 0.5 * e * e;
      return -0.5 * (--e * (e - 2) - 1);
    },
  },
  Cubic: {
    In: function (e) {
      return e * e * e;
    },
    Out: function (e) {
      return --e * e * e + 1;
    },
    InOut: function (e) {
      if ((e *= 2) < 1) return 0.5 * e * e * e;
      return 0.5 * ((e -= 2) * e * e + 2);
    },
  },
  Quart: {
    In: function (e) {
      return e * e * e * e;
    },
    Out: function (e) {
      return 1 - --e * e * e * e;
    },
    InOut: function (e) {
      if ((e *= 2) < 1) return 0.5 * e * e * e * e;
      return -0.5 * ((e -= 2) * e * e * e - 2);
    },
  },
  Quint: {
    In: function (e) {
      return e * e * e * e * e;
    },
    Out: function (e) {
      return --e * e * e * e * e + 1;
    },
    InOut: function (e) {
      if ((e *= 2) < 1) return 0.5 * e * e * e * e * e;
      return 0.5 * ((e -= 2) * e * e * e * e + 2);
    },
  },
  Sine: {
    In: function (e) {
      return 1 - Math.cos((e * Math.PI) / 2);
    },
    Out: function (e) {
      return Math.sin((e * Math.PI) / 2);
    },
    InOut: function (e) {
      return 0.5 * (1 - Math.cos(Math.PI * e));
    },
  },
  Expo: {
    In: function (e) {
      return e === 0 ? 0 : Math.pow(1024, e - 1);
    },
    Out: function (e) {
      return e === 1 ? 1 : 1 - Math.pow(2, -10 * e);
    },
    InOut: function (e) {
      if (e === 0) return 0;
      if (e === 1) return 1;
      if ((e *= 2) < 1) return 0.5 * Math.pow(1024, e - 1);
      return 0.5 * (-Math.pow(2, -10 * (e - 1)) + 2);
    },
  },
  Circ: {
    In: function (e) {
      return 1 - Math.sqrt(1 - e * e);
    },
    Out: function (e) {
      return Math.sqrt(1 - --e * e);
    },
    InOut: function (e) {
      if ((e *= 2) < 1) return -0.5 * (Math.sqrt(1 - e * e) - 1);
      return 0.5 * (Math.sqrt(1 - (e -= 2) * e) + 1);
    },
  },
  Elastic: {
    In: function (e) {
      var t,
        n = 0.1,
        r = 0.4;
      if (e === 0) return 0;
      if (e === 1) return 1;
      if (!n || n < 1) {
        n = 1;
        t = r / 4;
      } else t = (r * Math.asin(1 / n)) / (2 * Math.PI);
      return -(
        n *
        Math.pow(2, 10 * (e -= 1)) *
        Math.sin(((e - t) * 2 * Math.PI) / r)
      );
    },
    Out: function (e) {
      var t,
        n = 0.1,
        r = 0.4;
      if (e === 0) return 0;
      if (e === 1) return 1;
      if (!n || n < 1) {
        n = 1;
        t = r / 4;
      } else t = (r * Math.asin(1 / n)) / (2 * Math.PI);
      return (
        n * Math.pow(2, -10 * e) * Math.sin(((e - t) * 2 * Math.PI) / r) + 1
      );
    },
    InOut: function (e) {
      var t,
        n = 0.1,
        r = 0.4;
      if (e === 0) return 0;
      if (e === 1) return 1;
      if (!n || n < 1) {
        n = 1;
        t = r / 4;
      } else {
        t = (r * Math.asin(1 / n)) / (2 * Math.PI);
      }
      if ((e *= 2) < 1)
        return (
          -0.5 *
          n *
          Math.pow(2, 10 * (e -= 1)) *
          Math.sin(((e - t) * 2 * Math.PI) / r)
        );
      return (
        n *
          Math.pow(2, -10 * (e -= 1)) *
          Math.sin(((e - t) * 2 * Math.PI) / r) *
          0.5 +
        1
      );
    },
  },
  Back: {
    In: function (e) {
      var t = 1.70158;
      return e * e * ((t + 1) * e - t);
    },
    Out: function (e) {
      var t = 1.70158;
      return --e * e * ((t + 1) * e + t) + 1;
    },
    InOut: function (e) {
      var t = 1.70158 * 1.525;
      if ((e *= 2) < 1) return 0.5 * e * e * ((t + 1) * e - t);
      return 0.5 * ((e -= 2) * e * ((t + 1) * e + t) + 2);
    },
  },
  Bounce: {
    In: function (e) {
      return 1 - basic.Bounce.Out(1 - e);
    },
    Out: function (e) {
      if (e < 1 / 2.75) {
        return 7.5625 * e * e;
      } else if (e < 2 / 2.75) {
        return 7.5625 * (e -= 1.5 / 2.75) * e + 0.75;
      } else if (e < 2.5 / 2.75) {
        return 7.5625 * (e -= 2.25 / 2.75) * e + 0.9375;
      } else {
        return 7.5625 * (e -= 2.625 / 2.75) * e + 0.984375;
      }
    },
    InOut: function (e) {
      if (e < 0.5) return basic.Bounce.In(e * 2) * 0.5;
      return basic.Bounce.Out(e * 2 - 1) * 0.5 + 0.5;
    },
  },
};

export const linear = basic.Linear;

export const easeInQuad = basic.Quad.In;
export const easeOutQuad = basic.Quad.Out;
export const easeInOutQuad = basic.Quad.InOut;

export const easeInCubic = basic.Cubic.In;
export const easeOutCubic = basic.Cubic.Out;
export const easeInOutCubic = basic.Cubic.InOut;

export const easeInQuart = basic.Quart.In;
export const easeOutQuart = basic.Quart.Out;
export const easeInOutQuart = basic.Quart.InOut;

export const easeInQuint = basic.Quint.In;
export const easeOutQuint = basic.Quint.Out;
export const easeInOutQuint = basic.Quint.InOut;

export const easeInSine = basic.Sine.In;
export const easeOutSine = basic.Sine.Out;
export const easeInOutSine = basic.Sine.InOut;

export const easeInExpo = basic.Expo.In;
export const easeOutExpo = basic.Expo.Out;
export const easeInOutExpo = basic.Expo.InOut;

export const easeInCirc = basic.Circ.In;
export const easeOutCirc = basic.Circ.Out;
export const easeInOutCirc = basic.Circ.InOut;

export const easeInElastic = basic.Elastic.In;
export const easeOutElastic = basic.Elastic.Out;
export const easeInOutElastic = basic.Elastic.InOut;

export const easeInBack = basic.Back.In;
export const easeOutBack = basic.Back.Out;
export const easeInOutBack = basic.Back.InOut;

export const easeInBounce = basic.Bounce.In;
export const easeOutBounce = basic.Bounce.Out;
export const easeInOutBounce = basic.Bounce.InOut;
