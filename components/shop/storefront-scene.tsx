import { BOARD, FILES, FRONT, IMG, interiorPlace } from "./shop-config";

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
  const hole = `polygon(evenodd, 0 0, ${IMG.w}px 0, ${IMG.w}px ${IMG.h}px, 0 ${IMG.h}px, 0 0, ${ap.x}px ${ap.y}px, ${ap.x}px ${ap.y + ap.h}px, ${ap.x + ap.w}px ${ap.y + ap.h}px, ${ap.x + ap.w}px ${ap.y}px, ${ap.x}px ${ap.y}px)`;
  const k = fa.h / 970;
  return (
    <>
      {!light && (
        <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-sh="" className="sh-fill" src={FILES.storefront} alt="" width={IMG.w} height={IMG.h} loading="lazy" />
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
      <img data-sh="" data-front="" className="sh-fill sh-front" src={FILES.storefront} alt="" width={IMG.w} height={IMG.h} loading="lazy" style={{ clipPath: hole }} />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="sh-havells"
            data-havells=""
            src={FILES.board}
            alt="Havells Galaxy signboard"
            width={Math.round(fa.h * BOARD.heightFrac * BOARD.aspect)}
            height={Math.round(fa.h * BOARD.heightFrac)}
            decoding="async"
            style={{
              left: (fa.w - fa.h * BOARD.heightFrac * BOARD.aspect) / 2,
              top: (fa.h * (1 - BOARD.heightFrac)) / 2,
              width: fa.h * BOARD.heightFrac * BOARD.aspect,
              height: fa.h * BOARD.heightFrac,
              transform: `translateX(${fa.w}px)`,
            }}
          />
        </div>
      )}
    </>
  );
}
