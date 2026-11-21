import { BOARD_PAD } from "./board-art";
import { BG, BG_SRC, BOARD, BOARD_PANEL, FILES, FRONT, interiorPlace } from "./shop-config";

/**
 * The storefront as one registered world (1672x941): photograph, doorway (interior behind two
 * door leaves and fixed side glass), fixed frame foreground with a clean rectangular doorway hole,
 * and the official sign on the fascia. `light` renders only the fascia surface and sign: all that
 * is visible through the billboard's mask, and cheap enough to stay crisp while the camera zooms. Used on the Outdoor billboard face AND as the shop story's
 * world, so the board's pixels simply become the storefront as the camera arrives.
 */
export function StorefrontScene({ light = false }: { light?: boolean }) {
  const fa = FRONT.fascia;
  const ap = FRONT.aperture;
  const side = (ap.w - FRONT.doorW * 2) / 2;
  // The exterior photo is larger than the world (BG), so its clip polygon is expressed in the image's own box: world coords minus BG's offset.
  const ax = ap.x - BG.x;
  const ay = ap.y - BG.y;
  // Only a thin ring around the doorway needs the second copy of the photograph (it covers the antialiased edge of the
  // clipped doorway). Painting a full-size second copy every frame was what made slower machines show unpainted gray tiles.
  const m = 10;
  const ox0 = ax - m;
  const oy0 = ay - m;
  const ox1 = ax + ap.w + m;
  const oy1 = ay + ap.h + m;
  const R = BG.w;
  const B = BG.h;
  const ring = [
    `inset(${oy0}px ${R - ox1}px ${B - ay}px ${ox0}px)`, // top
    `inset(${ay + ap.h}px ${R - ox1}px ${B - oy1}px ${ox0}px)`, // bottom
    `inset(${ay}px ${R - ax}px ${B - (ay + ap.h)}px ${ox0}px)`, // left
    `inset(${ay}px ${R - ox1}px ${B - (ay + ap.h)}px ${ax + ap.w}px)`, // right
  ];
  const bgBox = { left: BG.x, top: BG.y, width: BG.w, height: BG.h };
  const k = fa.h / 970;
  return (
    <>
      {!light && (
        <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-sh="" className="sh-bg" src={FILES.storefrontWide} alt="" width={BG_SRC.w} height={BG_SRC.h} loading="lazy" style={bgBox} />
      <div className="sh-aperture" data-aperture="" style={{ left: ap.x, top: ap.y, width: ap.w, height: ap.h, background: "#1b1a1c" }}>
        {/* The doorway photograph is two stacked copies with identical framing: a light one that is always there (decoded before the
            stage is shown, never hidden or swapped out) and the HD one on top. If the HD copy is ever late or fails, the light one
            is what shows, at the same position and size, so the doorway is never empty. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-sh="" data-interior-base="" className="sh-interior" src={FILES.interiorLite} alt="" loading="lazy" style={{ left: interiorPlace.x - ap.x, top: interiorPlace.y - ap.y, width: interiorPlace.w, height: interiorPlace.h }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-hd=""
          data-interior=""
          className="sh-interior"
          src={FILES.interior}
          alt=""
          loading="lazy"
          style={{ left: interiorPlace.x - ap.x, top: interiorPlace.y - ap.y, width: interiorPlace.w, height: interiorPlace.h }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-sh="" data-door-l="" className="sh-door" src={FILES.doorL} alt="" loading="lazy" style={{ left: side, width: FRONT.doorW, height: ap.h }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-sh="" data-door-r="" className="sh-door" src={FILES.doorR} alt="" loading="lazy" style={{ left: side + FRONT.doorW, width: FRONT.doorW, height: ap.h }} />
        <span className="sh-side" data-side-l="" style={{ left: 0, width: side }} />
        <span className="sh-side" data-side-r="" style={{ right: 0, width: side }} />
      </div>
      {/* The ring of photograph around the doorway, as four plain rectangular clips (top, bottom, left, right) instead of one
          full-size image cut by an even-odd polygon: a polygon mask on a photo magnified ~4x was far more than slower GPUs can
          raster, so the photograph and interior stayed unpainted (grey stage) during the zoom-out. Rect clips are cheap. */}
      <div data-front="" className="sh-front" style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}>
        {ring.map((inset, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} data-sh="" className="sh-bg" src={FILES.storefrontWide} alt="" width={BG_SRC.w} height={BG_SRC.h} loading="lazy" style={{ ...bgBox, clipPath: inset }} />
        ))}
      </div>
        </>
      )}
      <div className="sh-tone" data-tone="" style={{ left: fa.x, top: fa.y, width: fa.w, height: fa.h }} />
      {light ? (
        <div
          className="oo-art sh-sign"
          data-sign=""
          style={{ width: 2000, height: 970, transform: `translate(${fa.x + fa.w / 2 - (2000 * k) / 2}px, ${fa.y}px) scale(${k})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="oo-art-logo" src={FILES.logo} alt="" width={516} height={201} style={{ position: "relative", zIndex: 1, filter: "none" }} />
          <span className="oo-art-rule" style={{ position: "relative", zIndex: 1 }} />
          <span className="oo-art-text" style={{ position: "relative", zIndex: 1 }}>
            <span>Think Big.</span>
            <span>Think Different.</span>
          </span>
        </div>
      ) : (
        /* The shop's fascia window: it starts as the Outdoor board (the Adinn art, so the zoom continues), then the
           Adinn art slides out to the left and the supplied Havells signboard slides in from the right. Both stay inside the fascia. */
        <div className="sh-fclip" style={{ left: fa.x, top: fa.y, width: fa.w, height: fa.h }}>
          <div className="sh-fslide" data-sign="">
            <div
              className="oo-art sh-sign"
              style={{ width: 2000, height: 970, transform: `translate(${fa.w / 2 - (2000 * k) / 2}px, 0px) scale(${k})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="oo-art-logo" src={FILES.logo} alt="" width={516} height={201} style={{ position: "relative", zIndex: 1, filter: "none" }} />
              <span className="oo-art-rule" style={{ position: "relative", zIndex: 1 }} />
              <span className="oo-art-text" style={{ position: "relative", zIndex: 1 }}>
                <span>Think Big.</span>
                <span>Think Different.</span>
              </span>
            </div>
          </div>
          {/* The shop's own sign board: a full-width lit red fascia panel (frame, rim lights, depth) that carries the supplied
              Havells Galaxy sign at its natural proportions; the panel's red continues seamlessly each side of the sign. */}
          <div
            className="sh-havells sh-board"
            data-havells=""
            role="img"
            aria-label="Havells Galaxy signboard"
            style={{
              // PAD larger than the panel on every side (room for the drop shadow and frame, all painted inside this box; see .sh-board in globals.css)
              left: fa.w * BOARD_PANEL.inset - BOARD_PAD,
              top: fa.h * BOARD_PANEL.insetY - BOARD_PAD,
              width: fa.w * (1 - 2 * BOARD_PANEL.inset) + BOARD_PAD * 2,
              height: fa.h * (1 - 2 * BOARD_PANEL.insetY) + BOARD_PAD * 2,
              transform: `translateX(${fa.w}px)`,
            }}
          >
            {/* Painted once by paintBoard() (board-art.ts) as a finished bitmap; the CSS layers below are the identical-looking fallback,
                shown only until the canvas has painted (or if it cannot). */}
            <canvas className="sh-board-cv" data-board-cv="" />
            <span className="sh-board-drop" />
            <span className="sh-board-frame" />
            <div className="sh-board-in">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-sh="" data-board-img="" className="sh-board-img" src={FILES.board} alt="" decoding="async" style={{ aspectRatio: String(BOARD.aspect) }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
