import type { User, Document, Role } from './types';

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

export const MOCK_USERS: Omit<User, 'token'>[] = [
  { id: '1', username: 'admin', email: 'admin@example.com', role: 'Admin' },
  { id: '2', username: 'editor', email: 'editor@example.com', role: 'Editor' },
  { id: '3', username: 'reader', email: 'reader@example.com', role: 'Reader' },
];

export const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    name: 'API_Specification_v3.pdf',
    author: 'Alice',
    type: 'PDF',
    currentVersion: 2,
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: yesterday.toISOString(),
    versions: [
      { version: 2, date: yesterday.toISOString(), size: 2.5 * 1024 * 1024, author: 'Alice', url: '/mock-document.pdf' },
      { version: 1, date: twoDaysAgo.toISOString(), size: 2.2 * 1024 * 1024, author: 'Alice', url: '/mock-document.pdf' },
    ],
  },
  {
    id: 'doc-002',
    name: 'System_Architecture_Diagram.png',
    author: 'Bob',
    type: 'Image',
    currentVersion: 1,
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    versions: [{ version: 1, date: yesterday.toISOString(), size: 1.1 * 1024 * 1024, author: 'Bob', url: 'https://picsum.photos/seed/1/1200/800' }],
  },
  {
    id: 'doc-003',
    name: 'Release_Notes_Q2.md',
    author: 'Charlie',
    type: 'MD',
    currentVersion: 3,
    createdAt: twoDaysAgo.toISOString(),
    updatedAt: today.toISOString(),
    versions: [
        { version: 3, date: today.toISOString(), size: 15 * 1024, author: 'Charlie', url: 'mock-content' },
        { version: 2, date: yesterday.toISOString(), size: 12 * 1024, author: 'Charlie', url: 'mock-content' },
        { version: 1, date: twoDaysAgo.toISOString(), size: 10 * 1024, author: 'Charlie', url: 'mock-content' },
    ],
  },
  {
    id: 'doc-004',
    name: 'Onboarding_Guide.docx',
    author: 'Alice',
    type: 'DOCX',
    currentVersion: 1,
    createdAt: yesterday.toISOString(),
    updatedAt: yesterday.toISOString(),
    versions: [{ version: 1, date: yesterday.toISOString(), size: 550 * 1024, author: 'Alice', url: '#' }],
  },
  {
    id: 'doc-005',
    name: 'meeting_notes.txt',
    author: 'David',
    type: 'TXT',
    currentVersion: 1,
    createdAt: today.toISOString(),
    updatedAt: today.toISOString(),
    versions: [{ version: 1, date: today.toISOString(), size: 5 * 1024, author: 'David', url: 'mock-content' }],
  },
];
