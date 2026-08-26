import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type SyntheticEvent,
} from 'react';
import { Icon } from '../ui/Icon';
import styles from './ImageCropModal.module.css';

type Offset = { x: number; y: number };

/** Lets the artist choose exactly how their photo is framed before it's
 *  uploaded, rather than saving whatever crop `object-fit: cover` happens to
 *  land on.
 *
 *  No cropping library — this project avoids adding a dependency where a
 *  reasonably-scoped hand-rolled version covers it (same reasoning as
 *  MyWorksPage's print-to-PDF and the document/image upload flows elsewhere).
 *  Pointer Events unify mouse and single-finger touch for the drag, and a
 *  native range input handles zoom — both work without extra libraries.
 *
 *  The crop is only computed at confirm time: dragging and zooming just move
 *  an <img> with a CSS transform inside a fixed, overflow-hidden viewport,
 *  and clicking "Use Photo" reads that same geometry back to cut the actual
 *  pixels on a canvas. */
export function ImageCropModal({
  file,
  aspect,
  shape,
  outputSize,
  title,
  onCancel,
  onConfirm,
}: {
  file: File;
  /** width / height of the crop frame, e.g. 1 for a square avatar, 3 for a
   *  wide cover band. */
  aspect: number;
  shape: 'circle' | 'rect';
  outputSize: { width: number; height: number };
  title: string;
  onCancel: () => void;
  onConfirm: (file: File) => void;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; startOffset: Offset } | null>(null);

  // Created *and* revoked inside the same effect, not created in a useState
  // initializer with the revoke in a separate effect. StrictMode's dev-only
  // double-invoke of effects would otherwise revoke the URL the <img> is
  // already pointing at right after mount — the image then never loads,
  // onLoad never fires, and the crop viewport stays permanently empty. Each
  // run of this effect creates its own URL and only ever revokes that one.
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const viewportWidth = 320;
  const viewportHeight = Math.round(viewportWidth / aspect);

  const baseScale = natural
    ? Math.max(viewportWidth / natural.width, viewportHeight / natural.height)
    : 1;
  const scale = baseScale * zoom;

  function clamp(next: Offset, currentScale: number): Offset {
    if (!natural) return next;
    const displayedWidth = natural.width * currentScale;
    const displayedHeight = natural.height * currentScale;
    return {
      x: Math.min(0, Math.max(viewportWidth - displayedWidth, next.x)),
      y: Math.min(0, Math.max(viewportHeight - displayedHeight, next.y)),
    };
  }

  function handleImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) {
      setError('That file doesn’t look like a usable image.');
      return;
    }
    const size = { width: naturalWidth, height: naturalHeight };
    setNatural(size);
    const initialScale = Math.max(viewportWidth / naturalWidth, viewportHeight / naturalHeight);
    setOffset({
      x: (viewportWidth - naturalWidth * initialScale) / 2,
      y: (viewportHeight - naturalHeight * initialScale) / 2,
    });
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!natural) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: offset };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const next = {
      x: drag.startOffset.x + (e.clientX - drag.startX),
      y: drag.startOffset.y + (e.clientY - drag.startY),
    };
    setOffset(clamp(next, scale));
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handleZoomChange(nextZoom: number) {
    if (!natural) {
      setZoom(nextZoom);
      return;
    }
    // Zoom from the centre of the viewport, not the image's top-left corner —
    // otherwise every zoom step also drags the framing sideways.
    const nextScale = baseScale * nextZoom;
    const centreImageX = (viewportWidth / 2 - offset.x) / scale;
    const centreImageY = (viewportHeight / 2 - offset.y) / scale;
    const next = {
      x: viewportWidth / 2 - centreImageX * nextScale,
      y: viewportHeight / 2 - centreImageY * nextScale,
    };
    setZoom(nextZoom);
    setOffset(clamp(next, nextScale));
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !natural) return;

    const canvas = document.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Could not process that image. Try a different file.');
      return;
    }

    // The visible viewport rectangle, translated back into the source
    // image's own pixel space.
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sWidth = viewportWidth / scale;
    const sHeight = viewportHeight / scale;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

    setConfirming(true);
    canvas.toBlob(
      (blob) => {
        setConfirming(false);
        if (!blob) {
          setError('Could not process that image. Try a different file.');
          return;
        }
        const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
        onConfirm(new File([blob], name, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92,
    );
  }

  return (
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.hint}>Drag to reposition. Use the slider to zoom.</p>

        <div
          ref={viewportRef}
          className={[styles.viewport, shape === 'circle' && styles.viewportCircle]
            .filter(Boolean)
            .join(' ')}
          style={{ width: viewportWidth, height: viewportHeight }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {objectUrl && (
            <img
              ref={imgRef}
              src={objectUrl}
              alt=""
              draggable={false}
              className={styles.image}
              onLoad={handleImageLoad}
              style={
                natural
                  ? {
                      width: natural.width * scale,
                      height: natural.height * scale,
                      left: offset.x,
                      top: offset.y,
                    }
                  : { opacity: 0 }
              }
            />
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.zoomRow}>
          <span className={styles.zoomLabel}>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={!natural}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
          />
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={handleConfirm}
            disabled={!natural || confirming}
          >
            <Icon name="check" size={14} />
            {confirming ? 'Processing…' : 'Use Photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
