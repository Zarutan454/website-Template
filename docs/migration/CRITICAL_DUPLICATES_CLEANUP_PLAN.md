# 🧹 Kritische Code-Duplikate Bereinigungsplan

**Datum:** 21. Dezember 2024  
**Priorität:** KRITISCH - Vor Django API Migration  
**Ziel:** Konsolidierung der kritischsten Duplikate für saubere Django API Migration

## 🎯 **Phase 1: Like/Unlike System Konsolidierung** ✅ **ABGESCHLOSSEN**

### **Aktuelle Situation:**
- `src/hooks/usePost.ts` - Like/Unlike Logik (Hauptimplementierung)
- `src/hooks/post/usePostActions.ts` - Like/Unlike Logik (Alternative)
- `src/api/posts/likeActions.ts` - Like/Unlike API Helper
- `src/hooks/post/useLikeAction.ts` - Like Action Hook
- `src/hooks/post/useLikes.ts` - Kombinierter Like Hook
- `src/hooks/post/useLikeState.ts` - Like State Management
- `src/hooks/post/useLikesCount.ts` - Like Count Management

### **Bereinigungsplan:**
1. **Zentrale Like-Logik in `src/hooks/post/useLikeActions.ts` konsolidieren**
2. **Alle anderen Like-Hooks als Wrapper verwenden oder entfernen**
3. **API-Helper in Repository-Pattern integrieren**

### **Konkrete Schritte:**
```typescript
// 1. Zentrale Like-Logik erstellen
// src/hooks/post/useLikeActions.ts
export const useLikeActions = (postId: string, userId?: string) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleLike = async () => {
    // Zentrale Like-Logik hier
  };

  const fetchLikeStatus = async () => {
    // Like-Status abrufen
  };

  return {
    liked,
    likesCount,
    isProcessing,
    toggleLike,
    fetchLikeStatus
  };
};

// 2. Andere Hooks als Wrapper verwenden
// src/hooks/post/useLikes.ts (Wrapper)
export const useLikes = (postId: string, userId?: string) => {
  return useLikeActions(postId, userId);
};

// 3. Alte Hooks entfernen
// - useLikeState.ts ❌
// - useLikesCount.ts ❌
// - useLikeAction.ts ❌
```

### **✅ Ergebnisse:**
- ✅ `useLikeActions` als zentrale Hook erstellt
- ✅ `useLikes` Wrapper-Hook aktualisiert
- ✅ Alte Hooks entfernt: `useLikePost`, `useUnlikePost`, `useLikeActions` (dupliziert)
- ✅ Build-Test erfolgreich

## 🎯 **Phase 2: Kommentar-System Konsolidierung** ✅ **ABGESCHLOSSEN**

### **Aktuelle Situation:**
- `src/hooks/usePost.ts` - Kommentar Logik (Hauptimplementierung)
- `src/repositories/CommentRepository.ts` - Kommentar Repository
- `src/hooks/useComments.ts` - Kommentar Hook
- `src/hooks/post/useCommentActions.ts` - Kommentar Actions
- `src/hooks/post/useComments.ts` - Kommentar Hook (duplicate)
- `src/hooks/comments/useCommentSection.ts` - Kommentar Section Hook

### **Bereinigungsplan:**
1. **Zentrale Kommentar-Logik in `src/repositories/CommentRepository.ts`**
2. **Alle Kommentar-Hooks über Repository verwenden**
3. **Duplizierte Hooks entfernen**

### **✅ Ergebnisse:**
- ✅ `CommentRepository` als zentrale Logik erstellt
- ✅ `useCommentActions` Hook zentralisiert
- ✅ Duplizierte Hooks entfernt: `useComments`, `useCommentSection`
- ✅ Komponenten auf zentrale Logik aktualisiert
- ✅ Build-Test erfolgreich

## 🎯 **Phase 3: Feed-Komponenten Konsolidierung** ✅ **ABGESCHLOSSEN**

### **Aktuelle Situation:**
- `src/components/Feed/PostCard.tsx` - Haupt PostCard Komponente
- `src/components/Feed/Post/PostCard.tsx` - Alternative PostCard
- `src/components/Feed/UnifiedPostCard.tsx` - Unified PostCard
- `src/components/Feed/OptimizedPostCard.tsx` - Optimized PostCard
- `src/components/Feed/PostComponents/` vs `src/components/Feed/Post/` - Duplizierte Unterkomponenten

### **Bereinigungsplan:**
1. **`UnifiedPostCard.tsx` als zentrale PostCard-Komponente verwenden**
2. **Duplizierte PostCard-Komponenten entfernen**
3. **PostComponents vs Post-Komponenten konsolidieren**

### **✅ Ergebnisse:**
- ✅ `UnifiedPostCard` als zentrale Komponente identifiziert
- ✅ Duplizierte Komponenten entfernt: `PostCard.tsx`, `Post/PostCard.tsx`
- ✅ PostComponents vs Post-Komponenten konsolidiert
- ✅ Alle Imports auf UnifiedPostCard aktualisiert
- ✅ Build-Test erfolgreich

## 🎯 **Phase 4: Feed Container & List Konsolidierung** ✅ **ABGESCHLOSSEN**

### **Aktuelle Situation:**
- `src/components/Feed/PostList.tsx` - Haupt PostList
- `src/components/Feed/UnifiedPostList.tsx` - Unified PostList
- `src/components/Feed/OptimizedPostList.tsx` - Optimized PostList
- `src/components/Feed/FeedContainer.tsx` - Feed Container
- `src/components/Feed/EnhancedFeedContainer.tsx` - Enhanced Container
- `src/components/Feed/UnifiedFeedContainer.tsx` - Unified Container
- `src/components/Feed/FeedList.tsx` - Feed List
- `src/components/Feed/VirtualizedFeed.tsx` - Virtualized Feed
- `src/components/Feed/FeedListItem.tsx` - Feed List Item

### **Bereinigungsplan:**
1. **Beste Container-Komponente identifizieren**
2. **Duplizierte Container entfernen**
3. **Listen-Komponenten konsolidieren**
4. **Imports aktualisieren**

### **✅ Ergebnisse:**
- ✅ `UnifiedFeedContainer` als zentrale Container-Komponente identifiziert
- ✅ `UnifiedPostList` als zentrale Listen-Komponente identifiziert
- ✅ Duplizierte Komponenten entfernt: `PostList.tsx`, `PostListContent.tsx`, `FeedContainer.tsx`, `EnhancedFeedContainer.tsx`, `FeedList.tsx`, `FeedListItem.tsx`, `OptimizedPostList.tsx`
- ✅ Alle Imports auf zentrale Komponenten aktualisiert
- ✅ Build-Test erfolgreich

## 🎯 **Phase 5: Mining System Konsolidierung**

### **Aktuelle Situation:**
- `src/hooks/mining/miningService.ts` - Haupt Mining Service
- `src/hooks/mining/repository.ts` - Mining Repository
- `src/repositories/mining/index.ts` - Mining Repository (duplicate)
- `src/repositories/MiningRepository.ts` - Mining Repository (duplicate)
- `src/repositories/MiningRepositoryBase.ts` - Mining Repository Base
- Mehrere Session-Management Services

### **Bereinigungsplan:**
1. **Zentrale Mining-Logik in `src/hooks/mining/useMiningService.ts`**
2. **Alle Mining-Services zusammenführen**
3. **Session-Management vereinheitlichen**

### **Konkrete Schritte:**
```typescript
// 1. Zentrale Mining-Logik
// src/hooks/mining/useMiningService.ts
export const useMiningService = () => {
  // Alle Mining-Funktionen hier zusammenführen
  const startMining = async () => { /* ... */ };
  const stopMining = async () => { /* ... */ };
  const sendHeartbeat = async () => { /* ... */ };
  const manageSessions = async () => { /* ... */ };

  return {
    startMining,
    stopMining,
    sendHeartbeat,
    manageSessions
  };
};

// 2. Alte Services entfernen
// - miningService.ts ❌
// - repository.ts ❌
// - sessions/ ❌ (alle Session-Services)
```

## 📋 **Bereinigungs-Checkliste**

### **Phase 1: Like/Unlike System** ✅ **ABGESCHLOSSEN**
- [x] `src/hooks/post/useLikeActions.ts` als zentrale Logik erstellen
- [x] `src/hooks/post/useLikes.ts` als Wrapper aktualisieren
- [x] Alte Like-Hooks entfernen
- [x] Build-Test durchführen

### **Phase 2: Kommentar-System** ✅ **ABGESCHLOSSEN**
- [x] `src/repositories/CommentRepository.ts` erweitern
- [x] `src/hooks/post/useCommentActions.ts` zentralisieren
- [x] Duplizierte Kommentar-Hooks entfernen
- [x] Build-Test durchführen

### **Phase 3: Feed-Komponenten** ✅ **ABGESCHLOSSEN**
- [x] `UnifiedPostCard.tsx` als zentrale Komponente verwenden
- [x] Duplizierte PostCard-Komponenten entfernen
- [x] PostComponents vs Post-Komponenten konsolidieren
- [x] Build-Test durchführen

### **Phase 4: Feed Container & List** 🔄 **IN ARBEIT**
- [x] Beste Container-Komponente identifizieren
- [x] Duplizierte Container entfernen
- [x] Listen-Komponenten konsolidieren
- [x] Imports aktualisieren
- [x] Build-Test durchführen

### **Phase 5: Mining System**
- [ ] Zentrale Mining-Logik erstellen
- [ ] Mining-Services zusammenführen
- [ ] Session-Management vereinheitlichen
- [ ] Build-Test durchführen

## 🚀 **Build-Status nach jeder Phase**
- ✅ Phase 1: Build erfolgreich
- ✅ Phase 2: Build erfolgreich  
- ✅ Phase 3: Build erfolgreich
- ✅ Phase 4: Build erfolgreich

## ⚠️ **Wichtige Hinweise**

1. **Schrittweise Vorgehen:** Jede Phase vollständig abschließen, bevor die nächste beginnt
2. **Testing:** Nach jeder Phase umfassend testen
3. **Build-Tests:** Nach jeder Änderung Build-Test durchführen
4. **Dokumentation:** Alle Änderungen dokumentieren
5. **Rollback-Plan:** Backup der ursprünglichen Dateien erstellen

## 🎯 **Nächste Schritte**

1. **Phase 1 starten:** Like/Unlike System konsolidieren
2. **Testing:** Umfassende Tests nach Phase 1
3. **Phase 2:** Kommentar-System konsolidieren
4. **Phase 3:** Feed-Komponenten konsolidieren
5. **Phase 4:** Mining System konsolidieren
6. **Django API Migration:** Nach erfolgreicher Bereinigung

**Diese Bereinigung wird die Django API Migration erheblich vereinfachen und die Code-Qualität verbessern.** 