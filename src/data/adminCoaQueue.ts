// Data for Admin → COA Review — docs/pivot-checklist/
// 29-feature-admin-functions.md's function #3: moving artworks.coa_status
// from pending_review to issued or back to not_requested.

import type { AdminCoaCase } from '../types/admin';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export const adminCoaQueue: AdminCoaCase[] = [
  {
    id: 'coa1',
    title: 'Coastal Memory',
    artistName: 'Taylor Kim',
    artistEmail: 'taylor.kim@gmail.com',
    year: '2023',
    medium: 'Oil on canvas',
    dimensions: '60 × 80 cm',
    description:
      'A study of light and atmosphere along the coast, painted from a series of sketches made over one summer.',
    images: [
      photo('photo-1580136579312-94651dfd596d', 640, 480),
      photo('photo-1541701494587-cb58502866ab', 200, 200),
      photo('photo-1513519245088-0e12902e5a38', 200, 200),
    ],
    evidenceFiles: [
      {
        id: 'e1',
        name: 'provenance_document.pdf',
        sizeLabel: '2.4 MB',
        uploadedDate: '12 Oct 2024',
        kind: 'document',
        url: '#',
      },
      {
        id: 'e2',
        name: 'purchase_receipt.jpg',
        sizeLabel: '1.1 MB',
        uploadedDate: '12 Oct 2024',
        kind: 'image',
        url: photo('photo-1549887534-1541e9326642', 200, 200),
      },
      {
        id: 'e3',
        name: 'signature_detail.jpg',
        sizeLabel: '0.8 MB',
        uploadedDate: '12 Oct 2024',
        kind: 'image',
        url: photo('photo-1577720580479-7d839d829c73', 200, 200),
      },
    ],
  },
  {
    id: 'coa2',
    title: 'Morning Light',
    artistName: 'Jordan Ellis',
    artistEmail: 'jordan.ellis@gmail.com',
    year: '2024',
    medium: 'Acrylic on Canvas',
    dimensions: '80 × 60 cm',
    description: 'Part of a series exploring the first hour after sunrise over the strait.',
    images: [photo('photo-1541961017774-22349e4a1262', 640, 480)],
    evidenceFiles: [
      {
        id: 'e4',
        name: 'artist_statement.pdf',
        sizeLabel: '410 KB',
        uploadedDate: '10 Oct 2024',
        kind: 'document',
        url: '#',
      },
    ],
  },
  {
    id: 'coa3',
    title: 'Fragments of Home',
    artistName: 'Mia Carter',
    artistEmail: 'mia.carter@gmail.com',
    year: '2022',
    medium: 'Mixed Media',
    dimensions: '100 × 70 cm',
    description: 'A mixed-media piece built from found materials collected over two years.',
    images: [photo('photo-1502920917128-1aa500764cbd', 640, 480)],
    evidenceFiles: [
      {
        id: 'e5',
        name: 'exhibition_catalogue.pdf',
        sizeLabel: '3.8 MB',
        uploadedDate: '8 Oct 2024',
        kind: 'document',
        url: '#',
      },
      {
        id: 'e6',
        name: 'workshop_photo.jpg',
        sizeLabel: '1.4 MB',
        uploadedDate: '8 Oct 2024',
        kind: 'image',
        url: photo('photo-1577720580479-7d839d829c73', 200, 200),
      },
    ],
  },
];
