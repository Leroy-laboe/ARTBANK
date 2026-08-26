import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { AddArtworkStepper } from '../components/artspace/AddArtworkStepper';
import { BasicInformationCard } from '../components/artspace/BasicInformationCard';
import { ProvenanceCard } from '../components/artspace/ProvenanceCard';
import { ImageUploadCard } from '../components/artspace/ImageUploadCard';
import { PricingCard } from '../components/artspace/PricingCard';
import { AvailabilityCard } from '../components/artspace/AvailabilityCard';
import { AdditionalOptionsCard } from '../components/artspace/AdditionalOptionsCard';
import { DocumentUploadCard } from '../components/artspace/DocumentUploadCard';
import { RightsCard } from '../components/artspace/RightsCard';
import { VisibilityCard } from '../components/artspace/VisibilityCard';
import { ReviewSummaryCard } from '../components/artspace/ReviewSummaryCard';
import { ListingPreviewPanel } from '../components/artspace/ListingPreviewPanel';
import { ArtworkImagePreview } from '../components/artspace/ArtworkImagePreview';
import { GuidelinesPanel } from '../components/artspace/GuidelinesPanel';
import { TipsPanel } from '../components/artspace/TipsPanel';
import { NotePanel } from '../components/artspace/NotePanel';
import {
  emptyDraft,
  formatDimensions,
  reviewChecklist,
  validateDetails,
  validatePricing,
  validateReview,
  type ArtworkDraft,
  type DraftErrors,
} from '../components/artspace/artworkDraft';
import { useSession } from '../lib/sessionContext';
import { createArtworkDraft, publishArtwork, updateArtworkPricing } from '../services/artwork';
import {
  deleteArtworkDocument,
  documentRejectionReason,
  documentUrl,
  setDocumentType,
  uploadArtworkDocument,
  type ArtworkDocument,
  type DocumentType,
} from '../services/artworkDocuments';
import {
  deleteArtworkImage,
  rejectionReason,
  saveImageOrder,
  setCoverImage,
  setImageRole,
  uploadArtworkImage,
  type ArtworkImage,
  type ImageRole,
} from '../services/artworkImages';
import {
  documentGuidelines,
  evidenceNote,
  imageGuidelines,
  imageHelpNote,
  ownershipStatement,
  pricingTips,
  publishNote,
  shippingTips,
  supportNote,
  visibilityTips,
} from '../data/artspaceAddArtwork';
import styles from './AddArtworkPage.module.css';

type SaveState = { kind: 'idle' | 'saving' } | { kind: 'error'; message: string };

/** Turns a failed write into something actionable.
 *
 *  A generic "could not save" hides the one fact that matters — usually a
 *  column or table that a migration hasn't created yet. Postgres names it, so
 *  pass that through rather than swallowing it. */
function describeSaveError(err: unknown): string {
  const raw = err as { message?: string; code?: string; details?: string } | null;
  const message = raw?.message ?? '';

  // 42703 undefined_column, 42P01 undefined_table.
  if (raw?.code === '42703' || raw?.code === '42P01' || /does not exist/i.test(message)) {
    return `The database is missing something this form needs — ${message}. Run the outstanding migrations in supabase/migrations.`;
  }
  if (raw?.code === '42501' || /row-level security/i.test(message)) {
    return 'The database refused the write for this account. Check the artist owns this record.';
  }
  if (/violates check constraint/i.test(message)) {
    return `A value was rejected by the database: ${message}`;
  }
  if (message) return message;
  return 'Could not save this artwork. Check your connection and try again.';
}

/** Add Artwork — the guided flow from docs/pivot-checklist/10-add-artwork.md.
 *
 *  All five steps are built, covering the spec's nine requirements. Step 1
 *  saves a real draft and hands its id to everything after it, which writes
 *  against that record: images, pricing, evidence files, then rights and
 *  visibility.
 *
 *  Two rules hold throughout. Nothing is auto-populated — the artist confirms
 *  every fact. And nothing publishes itself: the record stays a private draft
 *  until the Publish button in step 5 is pressed. */
export function AddArtworkPage() {
  const navigate = useNavigate();
  const { profile } = useSession();

  const [step, setStep] = useState('details');
  const [completed, setCompleted] = useState<string[]>([]);
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });

  // Step 1
  const [draft, setDraft] = useState<ArtworkDraft>(emptyDraft);
  const [errors, setErrors] = useState<DraftErrors>({});

  /** Set once step 1 saves. Everything after it writes against this record. */
  const [artworkId, setArtworkId] = useState<string | null>(null);

  // Step 2
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Step 4
  const [documents, setDocuments] = useState<ArtworkDocument[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  const update = (patch: Partial<ArtworkDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key as keyof DraftErrors];
      if ('height' in patch || 'width' in patch || 'depth' in patch) delete next.dimensions;
      return next;
    });
  };

  /** Saves step 1 and moves to Images, keeping the artist in the flow. */
  async function saveDetails() {
    const found = validateDetails(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!profile) {
      setSave({ kind: 'error', message: 'Sign in to save this artwork.' });
      return;
    }

    // Already saved — going forward again shouldn't create a second record.
    if (artworkId) {
      setStep('images');
      return;
    }

    setSave({ kind: 'saving' });
    try {
      const id = await createArtworkDraft(profile, {
        title: draft.title.trim(),
        year: draft.year ? Number(draft.year) : null,
        medium: draft.medium,
        dimensions: formatDimensions(draft),
        height: draft.height ? Number(draft.height) : null,
        width: draft.width ? Number(draft.width) : null,
        depth: draft.depth ? Number(draft.depth) : null,
        dimensionUnit: draft.unit,
        category: draft.category,
        tags: draft.tags,
        materials: draft.materials.split(',').map((m) => m.trim()).filter(Boolean),
        description: draft.description.trim(),
        collection: draft.collection || null,
        artworkType: draft.artworkType,
        editionSize: draft.editionSize ? Number(draft.editionSize) : null,
        coaPromised: draft.coaPromised,
        creationLocation: draft.creationLocation.trim() || null,
        dateCreated: draft.dateCreated || null,
        isSigned: draft.isSigned,
        ownershipStatement: ownershipStatement.body,
      });

      setArtworkId(id);
      setCompleted((prev) => [...new Set([...prev, 'details'])]);
      setSave({ kind: 'idle' });
      setStep('images');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSave({ kind: 'error', message: describeSaveError(err) });
    }
  }

  /** Saves step 3 and moves to Documents. */
  async function savePricing() {
    const found = validatePricing(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!artworkId) {
      setSave({ kind: 'error', message: 'Save the details step first.' });
      return;
    }

    setSave({ kind: 'saving' });
    try {
      await updateArtworkPricing(artworkId, {
        priceType: draft.priceType,
        currency: draft.currency,
        price: draft.price ? Number(draft.price) : null,
        priceMax: draft.priceMax ? Number(draft.priceMax) : null,
        compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
        availability: draft.availabilityStatus,
        readyToShipIn: draft.readyToShipIn || null,
        shipsFrom: draft.shipsFrom.trim() || null,
        shippingRegions: draft.shippingRegions,
        allowInternationalShipping: draft.allowInternationalShipping,
        includesCoa: draft.includesCoa,
        isPhysical: draft.isPhysical,
        allowLayaway: draft.allowLayaway,
      });

      setCompleted((prev) => [...new Set([...prev, 'availability'])]);
      setSave({ kind: 'idle' });
      setStep('documents');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSave({ kind: 'error', message: describeSaveError(err) });
    }
  }

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      if (!artworkId) return;
      setImageError(null);

      const incoming = Array.from(files);
      const accepted: File[] = [];

      for (const file of incoming) {
        const reason = rejectionReason(file, images.length + accepted.length);
        if (reason) {
          setImageError(reason);
          break;
        }
        accepted.push(file);
      }
      if (accepted.length === 0) return;

      setUploading(true);
      try {
        // Sequential, so positions stay stable and one failure doesn't leave
        // a gap in the order.
        let next = images;
        for (const file of accepted) {
          const uploaded = await uploadArtworkImage(artworkId, file, next.length);
          next = [...next, uploaded];
          setImages(next);
        }
      } catch {
        setImageError('Upload failed. Check your connection and try again.');
      } finally {
        setUploading(false);
      }
    },
    [artworkId, images],
  );

  const removeImage = async (image: ArtworkImage) => {
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    try {
      await deleteArtworkImage(image);
    } catch {
      setImageError('Could not remove that image.');
    }
  };

  const chooseCover = async (image: ArtworkImage) => {
    if (!artworkId) return;
    setImages((prev) =>
      prev.map((i) => ({
        ...i,
        isPrimary: i.id === image.id,
        role: i.id === image.id ? 'cover' : i.role === 'cover' ? 'detail' : i.role,
      })),
    );
    try {
      await setCoverImage(artworkId, image.id);
    } catch {
      setImageError('Could not set the cover image.');
    }
  };

  const changeRole = async (image: ArtworkImage, role: ImageRole) => {
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, role } : i)));
    try {
      await setImageRole(image.id, role);
    } catch {
      setImageError('Could not update that label.');
    }
  };

  const moveImage = async (image: ArtworkImage, direction: -1 | 1) => {
    const from = images.findIndex((i) => i.id === image.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= images.length) return;

    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    setImages(next);
    try {
      await saveImageOrder(next);
    } catch {
      setImageError('Could not save the new order.');
    }
  };

  /* ── Step 4: documents ── */

  const addDocuments = useCallback(
    async (files: FileList | File[], type: DocumentType) => {
      if (!artworkId) return;
      setDocumentError(null);

      const accepted: File[] = [];
      for (const file of Array.from(files)) {
        const reason = documentRejectionReason(file, documents.length + accepted.length);
        if (reason) {
          setDocumentError(reason);
          break;
        }
        accepted.push(file);
      }
      if (accepted.length === 0) return;

      setUploadingDoc(true);
      try {
        let next = documents;
        for (const file of accepted) {
          const uploaded = await uploadArtworkDocument(artworkId, file, type);
          next = [...next, uploaded];
          setDocuments(next);
        }
      } catch (err) {
        setDocumentError(describeSaveError(err));
      } finally {
        setUploadingDoc(false);
      }
    },
    [artworkId, documents],
  );

  const removeDocument = async (doc: ArtworkDocument) => {
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    try {
      await deleteArtworkDocument(doc);
    } catch {
      setDocumentError('Could not remove that document.');
    }
  };

  const changeDocumentType = async (doc: ArtworkDocument, type: DocumentType) => {
    setDocuments((prev) => prev.map((d) => (d.id === doc.id ? { ...d, documentType: type } : d)));
    try {
      await setDocumentType(doc.id, type);
    } catch {
      setDocumentError('Could not update that label.');
    }
  };

  /** The bucket is private, so opening a document means minting a signed URL
   *  first. It expires in five minutes — see artworkDocuments.ts. */
  const openDocument = async (doc: ArtworkDocument) => {
    const url = await documentUrl(doc);
    if (!url) {
      setDocumentError('Could not open that document.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  /* ── Step 5: rights, visibility, publish ── */

  /** Saves step 5. `publish` is the button the artist pressed — the record
   *  never publishes itself, per the brief. */
  async function finish(publish: boolean) {
    if (publish) {
      const found = validateReview(draft);
      setErrors(found);
      if (Object.keys(found).length > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (!artworkId) {
      setSave({ kind: 'error', message: 'Save the details step first.' });
      return;
    }

    setSave({ kind: 'saving' });
    try {
      await publishArtwork(artworkId, {
        visibility: draft.visibility,
        permittedUses: draft.permittedUses,
        rightsNote: draft.rightsNote.trim() || null,
        publish,
      });
      setSave({ kind: 'idle' });
      navigate('/artspace/works');
    } catch (err) {
      setSave({ kind: 'error', message: describeSaveError(err) });
    }
  }

  const cover = images.find((i) => i.isPrimary) ?? images[0];
  const checklist = reviewChecklist(draft, {
    images: images.length,
    documents: documents.length,
  });

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />

        <ArtspacePageHeader
          title="Add Artwork"
          subtitle="Add a new artwork to your portfolio and share it with the world."
        />

        <AddArtworkStepper current={step} completed={completed} onSelect={setStep} />

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {step === 'details' && (
              <>
                <BasicInformationCard draft={draft} errors={errors} onChange={update} />
                <ProvenanceCard draft={draft} errors={errors} onChange={update} />

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={() => navigate('/artspace/works')}
                  >
                    Cancel
                  </button>

                  <div className={styles.actionsRight}>
                    {save.kind === 'error' && <p className={styles.error}>{save.message}</p>}
                    {Object.keys(errors).length > 0 && save.kind !== 'error' && (
                      <p className={styles.error}>Check the highlighted fields above.</p>
                    )}
                    <button
                      type="button"
                      className={styles.continue}
                      onClick={saveDetails}
                      disabled={save.kind === 'saving'}
                    >
                      {save.kind === 'saving' ? 'Saving…' : 'Save & Continue'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'images' && (
              <>
                <ImageUploadCard
                  images={images}
                  uploading={uploading}
                  error={imageError}
                  onAdd={addImages}
                  onRemove={removeImage}
                  onSetCover={chooseCover}
                  onSetRole={changeRole}
                  onMove={moveImage}
                />

                <div className={styles.actions}>
                  <button type="button" className={styles.cancel} onClick={() => setStep('details')}>
                    Back
                  </button>

                  <div className={styles.actionsRight}>
                    <button
                      type="button"
                      className={styles.cancel}
                      onClick={() => navigate('/artspace/works')}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className={styles.continue}
                      onClick={() => {
                        setCompleted((prev) => [...new Set([...prev, 'images'])]);
                        setStep('availability');
                      }}
                    >
                      Next: Pricing &amp; Availability
                      <span aria-hidden="true"> →</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'availability' && (
              <>
                <PricingCard draft={draft} errors={errors} onChange={update} />
                <AvailabilityCard draft={draft} errors={errors} onChange={update} />
                <AdditionalOptionsCard draft={draft} onChange={update} />

                <div className={styles.actions}>
                  <button type="button" className={styles.cancel} onClick={() => setStep('images')}>
                    Back
                  </button>

                  <div className={styles.actionsRight}>
                    {save.kind === 'error' && <p className={styles.error}>{save.message}</p>}
                    <button
                      type="button"
                      className={styles.cancel}
                      onClick={() => navigate('/artspace/works')}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className={styles.continue}
                      onClick={savePricing}
                      disabled={save.kind === 'saving'}
                    >
                      {save.kind === 'saving' ? 'Saving…' : 'Next: Documents'}
                      <span aria-hidden="true"> →</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'documents' && (
              <>
                <DocumentUploadCard
                  documents={documents}
                  uploading={uploadingDoc}
                  error={documentError}
                  onAdd={addDocuments}
                  onRemove={removeDocument}
                  onSetType={changeDocumentType}
                  onOpen={openDocument}
                />

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={() => setStep('availability')}
                  >
                    Back
                  </button>

                  <div className={styles.actionsRight}>
                    <button
                      type="button"
                      className={styles.cancel}
                      onClick={() => navigate('/artspace/works')}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className={styles.continue}
                      onClick={() => {
                        // Documents are optional, so this step completes
                        // whether or not anything was attached.
                        setCompleted((prev) => [...new Set([...prev, 'documents'])]);
                        setStep('review');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Next: Review
                      <span aria-hidden="true"> →</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 'review' && (
              <>
                <RightsCard draft={draft} errors={errors} onChange={update} />
                <VisibilityCard draft={draft} onChange={update} />
                <ReviewSummaryCard
                  draft={draft}
                  checklist={checklist}
                  imageCount={images.length}
                  documentCount={documents.length}
                  coverUrl={cover?.url}
                  onGoToStep={(next) => {
                    setStep(next);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.cancel}
                    onClick={() => setStep('documents')}
                  >
                    Back
                  </button>

                  <div className={styles.actionsRight}>
                    {save.kind === 'error' && <p className={styles.error}>{save.message}</p>}
                    <button
                      type="button"
                      className={styles.cancel}
                      onClick={() => finish(false)}
                      disabled={save.kind === 'saving'}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className={styles.continue}
                      onClick={() => finish(true)}
                      disabled={save.kind === 'saving'}
                    >
                      {save.kind === 'saving' ? 'Saving…' : 'Publish Artwork'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <aside className={styles.rightCol}>
            {step === 'availability' || step === 'review' ? (
              <ListingPreviewPanel draft={draft} imageUrl={cover?.url} />
            ) : (
              <ArtworkImagePreview imageUrl={cover?.url} />
            )}

            {step === 'review' ? (
              <>
                <NotePanel
                  title={publishNote.title}
                  body={publishNote.body}
                  linkLabel={publishNote.linkLabel}
                  linkTo="/artspace/help"
                />
                <NotePanel
                  title={supportNote.title}
                  body={supportNote.body}
                  linkLabel={supportNote.linkLabel}
                  linkTo="/artspace/help"
                />
              </>
            ) : step === 'documents' ? (
              <>
                <TipsPanel
                  title="Document Guidelines"
                  tips={documentGuidelines}
                  variant="plain"
                  linkTo="/artspace/help"
                  linkLabel="View evidence guide"
                />
                <NotePanel
                  title={evidenceNote.title}
                  body={evidenceNote.body}
                  linkLabel={evidenceNote.linkLabel}
                  linkTo="/artspace/help"
                />
              </>
            ) : step === 'availability' ? (
              <>
                <TipsPanel
                  title="Pricing Tips"
                  tips={pricingTips}
                  headerIcon="tag"
                  variant="plain"
                  linkTo="/artspace/help"
                  linkLabel="Learn more about pricing"
                />
                <TipsPanel
                  title="Shipping Tips"
                  tips={shippingTips}
                  headerIcon="lightbulb"
                  variant="plain"
                  linkTo="/artspace/help"
                  linkLabel="View shipping guide"
                />
                <NotePanel
                  title={supportNote.title}
                  body={supportNote.body}
                  linkLabel={supportNote.linkLabel}
                  linkTo="/artspace/help"
                />
              </>
            ) : step === 'images' ? (
              <>
                <TipsPanel
                  title="Image Guidelines"
                  tips={imageGuidelines}
                  variant="plain"
                  linkTo="/artspace/help"
                  linkLabel="View image guide"
                />
                <NotePanel
                  title={imageHelpNote.title}
                  body={imageHelpNote.body}
                  linkLabel={imageHelpNote.linkLabel}
                  linkTo="/artspace/help"
                />
              </>
            ) : (
              <>
                <GuidelinesPanel />
                <TipsPanel
                  title="Tips for better visibility"
                  tips={visibilityTips}
                  variant="plain"
                  linkTo="/artspace/help"
                  linkLabel="View full guidelines"
                />
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
