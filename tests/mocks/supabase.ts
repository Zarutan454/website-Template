
// Mock der Supabase-Funktionalität
export const createSupabaseMock = () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockInsert = jest.fn().mockReturnThis();
  const mockUpdate = jest.fn().mockReturnThis();
  const mockDelete = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  const mockIs = jest.fn().mockReturnThis();
  const mockLt = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockLimit = jest.fn().mockReturnThis();
  const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });
  const mockMaybeSingle = jest.fn().mockResolvedValue({ data: null, error: null });

  return {
    from: jest.fn().mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      is: mockIs,
      lt: mockLt,
      order: mockOrder,
      limit: mockLimit,
      single: mockSingle,
      maybeSingle: mockMaybeSingle
    }),
    auth: {
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null
      }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } }, 
        error: null
      })
    },
    rpc: jest.fn().mockReturnThis(),
    // Mockfunktionen für die Tests konfigurieren
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockIs,
    mockLt,
    mockOrder,
    mockLimit,
    mockSingle,
    mockMaybeSingle,
    // Hilfsfunktionen für Tests
    reset: () => {
      mockSelect.mockClear();
      mockInsert.mockClear();
      mockUpdate.mockClear();
      mockDelete.mockClear();
      mockEq.mockClear();
      mockIs.mockClear();
      mockLt.mockClear();
      mockOrder.mockClear();
      mockLimit.mockClear();
      mockSingle.mockClear();
      mockMaybeSingle.mockClear();
    }
  };
};
