
import { vi } from 'vitest';

// Erstellt einen konfigurierbaren Supabase-Mock für Tests
export const createSupabaseMock = () => {
  // Basisoperationen für Datenbankabfragen
  const mockSelect = vi.fn().mockReturnThis();
  const mockInsert = vi.fn().mockReturnThis();
  const mockUpdate = vi.fn().mockReturnThis();
  const mockDelete = vi.fn().mockReturnThis();
  const mockEq = vi.fn().mockReturnThis();
  const mockIs = vi.fn().mockReturnThis();
  const mockLt = vi.fn().mockReturnThis();
  const mockGt = vi.fn().mockReturnThis();
  const mockOrder = vi.fn().mockReturnThis();
  const mockLimit = vi.fn().mockReturnThis();
  const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
  const mockMatch = vi.fn().mockReturnThis();
  const mockIn = vi.fn().mockReturnThis();
  const mockNot = vi.fn().mockReturnThis();
  const mockRange = vi.fn().mockReturnThis();
  const mockAsc = vi.fn().mockReturnThis();
  const mockDesc = vi.fn().mockReturnThis();
  
  return {
    from: vi.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      is: mockIs,
      lt: mockLt,
      gt: mockGt,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      maybeSingle: mockMaybeSingle,
      match: mockMatch,
      in: mockIn,
      not: mockNot,
      range: mockRange,
      asc: mockAsc,
      desc: mockDesc
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id', email: 'test@example.com' } }, 
        error: null
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }, 
        error: null
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signIn: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test-url.com/image.jpg' } }),
        remove: vi.fn().mockResolvedValue({ data: null, error: null })
      })
    },
    
    // Hilfsfunktionen für Tests
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockIs,
    mockLt,
    mockGt,
    mockOrder,
    mockLimit,
    mockSingle,
    mockMaybeSingle,
    mockMatch,
    mockIn,
    mockNot,
    mockRange,
    mockAsc,
    mockDesc,
    
    // Hilfsfunktion zum Zurücksetzen aller Mocks
    reset: () => {
      mockSelect.mockClear();
      mockInsert.mockClear();
      mockUpdate.mockClear();
      mockDelete.mockClear();
      mockEq.mockClear();
      mockIs.mockClear();
      mockLt.mockClear();
      mockGt.mockClear();
      mockOrder.mockClear();
      mockLimit.mockClear();
      mockSingle.mockClear();
      mockMaybeSingle.mockClear();
      mockMatch.mockClear();
      mockIn.mockClear();
      mockNot.mockClear();
      mockRange.mockClear();
      mockAsc.mockClear();
      mockDesc.mockClear();
    },
    
    // Methode zum Einstellen von benutzerdefinierten Antworten
    setMockResponse: (method: string, response: any) => {
      switch (method) {
        case 'select':
          mockSelect.mockImplementation(() => ({ data: response, error: null }));
          break;
        case 'insert':
          mockInsert.mockImplementation(() => ({ data: response, error: null }));
          break;
        case 'update':
          mockUpdate.mockImplementation(() => ({ data: response, error: null }));
          break;
        case 'delete':
          mockDelete.mockImplementation(() => ({ data: response, error: null }));
          break;
        case 'single':
          mockSingle.mockResolvedValue({ data: response, error: null });
          break;
        case 'maybeSingle':
          mockMaybeSingle.mockResolvedValue({ data: response, error: null });
          break;
        default:
          break;
      }
    }
  };
};
