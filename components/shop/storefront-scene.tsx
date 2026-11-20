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
  const hole = `polygon(evenodd, ${ox0}px ${oy0}px, ${ox1}px ${oy0}px, ${ox1}px ${oy1}px, ${ox0}px ${oy1}px, ${ox0}px ${oy0}px, ${ax}px ${ay}px, ${ax}px ${ay + ap.h}px, ${ax + ap.w}px ${ay + ap.h}px, ${ax + ap.w}px ${ay}px, ${ax}px ${ay}px)`;
  const bgBox = { left: BG.x, top: BG.y, width: BG.w, height: BG.h };
  const k = fa.h / 970;
  return (
    <>
      {!light && (
        <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-sh="" className="sh-bg" src={FILES.storefrontWide} alt="" width={BG_SRC.w} height={BG_SRC.h} loading="lazy" style={bgBox} />
      <div className="sh-aperture" data-aperture="" style={{ left: ap.x, top: ap.y, width: ap.w, height: ap.h, background: "#1b1a1c" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          data-sh=""
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-sh="" data-front="" className="sh-bg sh-front" src={FILES.storefrontWide} alt="" width={BG_SRC.w} height={BG_SRC.h} loading="lazy" style={{ ...bgBox, clipPath: hole }} />
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
              left: fa.w * BOARD_PANEL.inset,
              top: fa.h * BOARD_PANEL.insetY,
              width: fa.w * (1 - 2 * BOARD_PANEL.inset),
              height: fa.h * (1 - 2 * BOARD_PANEL.insetY),
              transform: `translateX(${fa.w}px)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="sh-board-img" src={FILES.board} alt="" decoding="async" style={{ aspectRatio: String(BOARD.aspect) }} />
          </div>
        </div>
      )}
    </>
  );
}
