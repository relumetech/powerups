iconWrapperClass = "tooltip1_element-wrapper";
tooltipWrapperClass = "tooltip1_tooltip-wrapper";
pointerClass = "tooltip1_pointer";

(() => {
  //////////////////////
  // Helper functions //
  //////////////////////
  function titleCase(d) {
    return d[0].toUpperCase() + d.slice(1);
  }
  function paddingPropertyName(d) {
    return "padding" + titleCase(d);
  }

  /** The opposite direction of each direction */
  const oppositeOf = {
    bottom: "top",
    left: "right",
    right: "left",
    top: "bottom",
  };
  const pointerCss = {
    bottom: {
      // order: top, right, bottom, left (clockwise)
      margin: [1, "auto", 0, "auto"],
      inset: [0, 0, "auto", 0],
    },
    left: {
      margin: [0, 1, 0, 0],
      inset: ["auto", 0, "auto", "auto"],
    },
    right: {
      margin: [0, 0, 0, 1],
      inset: ["auto", "auto", "auto", 0],
    },
    top: {
      margin: [0, "auto", 1, "auto"],
      inset: ["auto", 0, 0, 0],
    },
  };
  /* The css property names for the horizontal axis */
  const horizontalAxis = {
    start: "left",
    end: "right",
    len: "width",
    translate: "translateX",
  };
  /* The css property names for the vertical axis */
  const verticalAxis = {
    start: "top",
    end: "bottom",
    len: "height",
    translate: "translateY",
  };
  /** The axis perpendicular to each direction */
  const perpendicularAxisTo = {
    top: horizontalAxis,
    bottom: horizontalAxis,
    left: verticalAxis,
    right: verticalAxis,
  };

  /** Returns the style properties of the tooltip.  Users might customize padding values in Webflow */
  function getTooltipPadding(tooltip) {
    const tooltipStyle = window.getComputedStyle(tooltip);
    return (
      parseInt(tooltipStyle.paddingTop, 10) ||
      parseInt(tooltipStyle.paddingBottom, 10) ||
      parseInt(tooltipStyle.paddingLeft, 10) ||
      parseInt(tooltipStyle.paddingRight, 10) ||
      0
    );
  }

  /** Returns the style properties of the pointer.  Users might customize margin values in Webflow */
  function getPointerMargin(pointer, naturalDirection) {
    const style = window.getComputedStyle(pointer);
    const idx = pointerCss[naturalDirection].margin.indexOf(1);
    return [
      style.marginTop,
      style.marginRight,
      style.marginBottom,
      style.marginLeft,
    ][idx];
  }

  function setupTooltip(icon) {
    // Ensure setupTooltip is idempotent:
    const isSetupKey = "relumeTooltipSetup";
    if (icon.dataset[isSetupKey]) return;
    icon.dataset[isSetupKey] = 1;

    const tooltip = icon.parentElement.querySelector("." + tooltipWrapperClass);
    const pointer = icon.parentElement.querySelector("." + pointerClass);
    const naturalDirection = pointer.className.includes("is-left")
      ? "left"
      : pointer.className.includes("is-right")
      ? "right"
      : pointer.className.includes("is-bottom")
      ? "bottom"
      : "top";
    const oppositeDirection = oppositeOf[naturalDirection];
    const tooltipPadding = getTooltipPadding(tooltip);
    const pointerMargin = getPointerMargin(pointer, naturalDirection);

    /** Updates the tooltip's style to position it in direction `d` */
    function updateTooltipStyle(d, slideAxis, slidePx) {
      const o = oppositeOf[d];
      tooltip.style[o] = "100%";
      tooltip.style[d] = "auto";
      tooltip.style[paddingPropertyName(o)] = tooltipPadding + "px";
      tooltip.style[paddingPropertyName(d)] = "0";
      tooltip.style.transform = slideAxis.translate + "(" + slidePx + "px)";

      pointer.style.transform =
        slideAxis.translate + "(" + -slidePx + "px) rotate(45deg)";
      pointer.style.margin = pointerCss[d].margin
        .map((x) => (x === 1 ? pointerMargin : x))
        .join(" ");
      pointer.style.inset = pointerCss[d].inset.join(" ");
    }

    let open = false;
    /** Runs every frame that the tooltip is open */
    function keepInViewport() {
      if (!open) return;
      window.requestAnimationFrame(keepInViewport);
      const iconBox = icon.getBoundingClientRect();
      const tooltipBox = tooltip.getBoundingClientRect();
      const docEl = document.documentElement;

      // Step 1 - on the perpendicular axis to naturalDirection, slide the
      //   tooltip to keep it in the viewport.
      const slideAxis = perpendicularAxisTo[naturalDirection];
      const desiredStart =
        (iconBox[slideAxis.start] +
          iconBox[slideAxis.end] -
          tooltipBox[slideAxis.len]) /
        2;
      const desiredEnd =
        (iconBox[slideAxis.start] +
          iconBox[slideAxis.end] +
          tooltipBox[slideAxis.len]) /
        2;
      let slidePx = 0;
      const windowEnd = docEl["client" + titleCase(slideAxis.len)];
      if (desiredStart < 0) {
        slidePx = -desiredStart;
      } else if (desiredEnd > windowEnd) {
        slidePx = windowEnd - desiredEnd;
      }

      // Step 2 - set the direction of the tooltip to either naturalDirection or
      //   oppositeDirection direction, whichever fits best.
      const fits = {
        bottom: iconBox.bottom + tooltipBox.height < docEl.clientHeight,
        left: iconBox.left - tooltipBox.width > 0,
        right: iconBox.right + tooltipBox.width < docEl.clientWidth,
        top: iconBox.top - tooltipBox.height > 0,
      };
      const newDirection =
        fits[naturalDirection] || !fits[oppositeDirection]
          ? naturalDirection
          : oppositeDirection;

      updateTooltipStyle(newDirection, slideAxis, slidePx);
    }

    icon.parentElement.addEventListener("mouseenter", () => {
      open = true;
      keepInViewport();
    });
    icon.parentElement.addEventListener("mouseleave", () => {
      open = false;
    });
  }

  function setupAllTooltips() {
    document.querySelectorAll("." + iconWrapperClass).forEach(setupTooltip);
  }

  // Setup tooltips when the DOM loads:
  window.addEventListener("DOMContentLoaded", setupAllTooltips);
  // Also setup the tooltips now, in case the dom has already loaded.  Setting
  // up a tooltip is idempotent so this is safe:
  setupAllTooltips();
})();
