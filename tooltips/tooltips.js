// ==ClosureCompiler==
// @output_file_name default.js
// @compilation_level ADVANCED_OPTIMIZATIONS
// @js_externs var iconWrapperClass
// @js_externs var tooltipWrapperClass
// @js_externs var arrowClass
// @language_out ECMASCRIPT_2015
// ==/ClosureCompiler==
//
//
// Use https://closure-compiler.appspot.com/home
// Move the *Class variables inside the IIFE.  They're outside so the names are not
// mangled by ClosureCompiler:
iconWrapperClass = "tooltip1_element-wrapper";
tooltipWrapperClass = "tooltip1_tooltip-wrapper";
arrowClass = "tooltip1_arrow";

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
    ["bottom"]: "top",
    ["left"]: "right",
    ["right"]: "left",
    ["top"]: "bottom",
  };
  const arrowRotation = {
    ["bottom"]: 180,
    ["left"]: -90,
    ["right"]: 90,
    ["top"]: 0,
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
    ["bottom"]: horizontalAxis,
    ["left"]: verticalAxis,
    ["right"]: verticalAxis,
    ["top"]: horizontalAxis,
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

  function setupTooltip(icon) {
    // Ensure setupTooltip is idempotent:
    const isSetupKey = "relumeTooltipSetup";
    if (icon.dataset[isSetupKey]) return;
    icon.dataset[isSetupKey] = 1;

    const tooltip = icon.parentElement.querySelector("." + tooltipWrapperClass);
    const arrow = icon.parentElement.querySelector("." + arrowClass);
    const naturalDirection = arrow.className.includes("is-left")
      ? "left"
      : arrow.className.includes("is-right")
      ? "right"
      : arrow.className.includes("is-bottom")
      ? "bottom"
      : "top";
    const oppositeDirection = oppositeOf[naturalDirection];
    const tooltipPadding = getTooltipPadding(tooltip);

    /** Updates the tooltip's style to position it in direction `d` */
    function updateTooltipStyle(d, slideAxis, slidePx) {
      const o = oppositeOf[d];
      tooltip.style[o] = "100%";
      tooltip.style[d] = "auto";
      tooltip.style[paddingPropertyName(o)] = tooltipPadding + "px";
      tooltip.style[paddingPropertyName(d)] = "0";
      tooltip.style.transform = slideAxis.translate + "(" + slidePx + "px)";

      arrow.style.transform =
        slideAxis.translate +
        "(" +
        -slidePx +
        "px) " +
        "rotate(" +
        arrowRotation[d] +
        "deg) ";
      arrow.style[d] = "auto";
      arrow.style[o] = d === "top" || d === "bottom" ? "0.25rem" : "0";
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
        ["bottom"]: iconBox.bottom + tooltipBox.height < docEl.clientHeight,
        ["left"]: iconBox.left - tooltipBox.width > 0,
        ["right"]: iconBox.right + tooltipBox.width < docEl.clientWidth,
        ["top"]: iconBox.top - tooltipBox.height > 0,
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
