var screenPosition;

screenPosition = function (options) {
  var baseScale, baseVerticalOffset, position, positioningMethods;
  if (options == null) {
    options = {};
  }
  options.positioning || (options.positioning = 'absolute');
  options.scale || (options.scale = 1);
  options.scaleX || (options.scaleX = 1);
  options.scaleY || (options.scaleY = 1);
  options.scaleZ || (options.scaleZ = 1);
  options.verticalOffset || (options.verticalOffset = 0);
  baseScale = 6;
  baseVerticalOffset = -100;
  positioningMethods = {
    absolute: function (positionVec3) {
      return [(window.innerWidth / 2) + (positionVec3[0] * baseScale * options.scale * options.scaleX), window.innerHeight + baseVerticalOffset + options.verticalOffset - (positionVec3[1] * baseScale * options.scale * options.scaleY), positionVec3[2] * baseScale * options.scale * options.scaleZ];
    }
  };
  position = function (vec3, memoize) {
    var screenPositionVec3;
    if (memoize == null) {
      memoize = false;
    }
    screenPositionVec3 = typeof options.positioning === 'function' ? options.positioning.call(this, vec3) : positioningMethods[options.positioning].call(this, vec3);
    if (memoize) {
      this.screenPositionVec3 = screenPositionVec3;
    }
    return screenPositionVec3;
  };
  return {
    hand: {
      screenPosition: function (vec3) {
        return position.call(this, vec3 || this.palmPosition, !vec3);
      }
    },
    pointable: {
      screenPosition: function (vec3) {
        return position.call(this, vec3 || this.tipPosition, !vec3);
      }
    }
  };
};

export default screenPosition;