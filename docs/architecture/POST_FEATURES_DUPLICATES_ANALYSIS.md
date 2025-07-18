# Analyse: Funktions-Duplikate & Überschneidungen im Feed/Post-Bereich

## Übersicht: Betroffene Dateien, Hooks, Repositories & Komponenten

| Datei/Pfad                                               | Typ            | Hauptfunktion(en)                                                                 | Überschneidung/Duplikat mit                | Bemerkung                                  |
|----------------------------------------------------------|----------------|-----------------------------------------------------------------------------------|--------------------------------------------|---------------------------------------------|
| **src/hooks/usePost.ts**                                 | Hook           | Like/Unlike, Bookmark, Kommentar, Share, Edit, Delete, Report, CopyLink           | usePostActions, likeActions, CommentRepo   | Einzelpost-Interaktionen, State lokal       |
| **src/hooks/post/usePostActions.ts**                     | Hook           | Like/Unlike, Delete, Share, Create Post, State-Update für Listen                   | usePost, likeActions, PostRepository       | Für Feed/Post-Listen, komplexere Logik      |
| **src/api/posts/likeActions.ts**                         | API-Helper     | togglePostLike, isPostLikedByUser, incrementLikeCount, Benachrichtigungen          | usePost, usePostActions                    | API-zentrierte Like-Logik                   |
| **src/repositories/CommentRepository.ts**                | Repository     | createComment, getPostComments, deleteComment, toggleCommentLike                   | usePost, usePostActions                    | Zentrale Kommentar-Logik                    |
| **src/repositories/PostRepository.ts**                   | Repository     | createPost, deletePost, updatePost, getPostById, getPosts                          | usePost, usePostActions                    | Zentrale Post-Logik                         |
| **src/hooks/usePosts.ts**                                | Hook           | Fetch/Post-Listen, Pagination, Filter                                              | usePostActions, usePost                    | Für Feed/Listen                             |
| **src/hooks/post/usePostsFetch.ts**                      | Hook           | Fetch/Post-Listen, Pagination, Filter                                              | usePosts                                   | Für Feed/Listen                             |
| **src/components/Feed/Feed.tsx**                         | Komponente     | Feed-Rendering, nutzt Post-Hooks/Repos                                             | usePost, usePostActions                    | Hängt von gewähltem Hook ab                 |
| **src/components/Feed/PostCard.tsx**                     | Komponente     | Einzelpost-Rendering, nutzt Post-Hooks/Repos                                       | usePost, usePostActions                    | Hängt von gewähltem Hook ab                 |
| **src/components/Feed/hooks/usePostList.tsx**            | Hook           | Post-Listen-Logik                                                                  | usePosts, usePostActions                   | Für Feed/Listen                             |
| **src/hooks/feed/useFilteredPosts.tsx**                  | Hook           | Filter für Feed/Posts                                                              | usePosts                                   | Für Feed/Listen                             |
| **src/hooks/useProfileStats.ts**                         | Hook           | Statistiken (Likes, Kommentare, Shares, Posts)                                     | usePost, usePostActions                    | Für Profil-Statistiken                      |
| **src/hooks/useProfileHighlights.ts**                    | Hook           | Highlights (Top-Posts, meistgeliked, meistkommentiert)                             | usePost, usePostActions                    | Für Profil-Highlights                       |
| **src/repositories/LikeRepository.ts**                   | Repository     | Like/Unlike, Like-Status, Like-Zähler                                              | usePost, usePostActions, likeActions       | Zentrale Like-Logik (falls vorhanden)       |
| **src/hooks/useComments.ts**                             | Hook           | Kommentar-Listen, Kommentar-Interaktionen                                          | usePost, CommentRepository                 | Für Kommentar-Listen                        |
| **src/hooks/post/useCommentActions.ts**                  | Hook           | Kommentar-Interaktionen (Like, Delete, Edit)                                       | useComments, CommentRepository             | Für Kommentar-Listen                        |
| **src/components/Feed/CommentSection.tsx**               | Komponente     | Kommentar-Rendering, nutzt Kommentar-Hooks/Repos                                   | useComments, usePost, CommentRepository    | Für Kommentar-UI                            |
| **src/components/Feed/LikeButton.tsx**                   | Komponente     | Like-Button, nutzt Like-Hooks/Repos                                                | usePost, usePostActions, likeActions       | Für Like-UI                                 |
| **src/components/Feed/ShareButton.tsx**                  | Komponente     | Share-Button, nutzt Share-Hooks/Repos                                              | usePost, usePostActions                    | Für Share-UI                                |

---

## Erklärung der wichtigsten Überschneidungen/Duplikate

- **Like/Unlike:**  In usePost.ts, usePostActions.ts, likeActions.ts, evtl. LikeRepository.ts
- **Kommentar:**    In usePost.ts, CommentRepository.ts, useComments.ts, useCommentActions.ts
- **Share:**        In usePost.ts, usePostActions.ts
- **Post-Listen:**  In usePosts.ts, usePostsFetch.ts, usePostList.tsx
- **Komponenten:**  Nutzen je nach Implementierung unterschiedliche Hooks/Repos, was zu UI/UX-Inkonsistenzen führen kann

---

## Empfehlung für die weitere Analyse

1. **Entscheidung für eine zentrale Architektur:**
   - Z.B. alles über Repositories + Actions, oder alles über einen zentralen Hook
2. **Alle Komponenten und Hooks auf diese zentrale Logik umstellen**
3. **Doppelte/alte Dateien entfernen**
4. **UI/UX konsolidieren und testen**

---

## Nächste Schritte: Gesamtanalyse & Migrationsplan

### Ziel

- Alle Funktionsduplikate und Überschneidungen im Feed/Post-Bereich identifizieren
- Eine zentrale, konsistente Architektur für alle Post-Interaktionen (Like, Kommentar, Share, etc.) schaffen
- UI/UX vereinheitlichen und technische Schulden abbauen

### Vorgehen

1. **Systematische Analyse aller relevanten Ordner:**
   - `src/hooks/` (inkl. Unterordner)
   - `src/repositories/`
   - `src/api/`
   - `src/components/Feed/`
   - `src/components/common/`, `src/components/ui/`, ggf. weitere Komponenten
   - `src/pages/` (Feed, PostDetail, etc.)
   - Tests: `tests/hooks/`, `tests/lib/`, `tests/integration/`
2. **Mapping:**
   - Welche Komponenten/Hooks nutzen welche Logik?
   - Wo gibt es Überschneidungen, Redundanzen, Inkonsistenzen?
3. **Bewertung:**
   - Welche Architektur ist am wartbarsten und zukunftssicher?
   - Welche Hooks/Repos/API-Helper sind überflüssig oder sollten zusammengeführt werden?
4. **Migrationsplan:**
   - Schrittweise Umstellung aller Komponenten auf die zentrale Architektur
   - Entfernen alter/duplizierter Dateien
   - UI/UX-Review und Testing

### Checkliste für die Migration

- [ ] Alle relevanten Dateien und Komponenten identifiziert
- [ ] Übersicht: Wer nutzt was? (Mapping)
- [ ] Entscheidung für zentrale Architektur (z.B. Repository + Actions oder zentraler Hook)
- [ ] Migrationsplan erstellt
- [ ] Schrittweise Umstellung und Testing
- [ ] Alte/duplizierte Dateien entfernt
- [ ] UI/UX-Review abgeschlossen

---

**Hinweis:**
Diese Datei wird während der Analyse und Migration fortlaufend aktualisiert und dient als zentrale Dokumentation für die Vereinheitlichung der Feed/Post-Logik.

**Nächster Schritt:**

- Gesamtanalyse aller Ordner und Komponenten, die diese Funktionen nutzen
- Entscheidung und Migrationsplan für die Vereinheitlichung

---

## Übersicht der analysierten Ordner & relevante Dateien

### src/hooks/

- usePost.ts, usePosts.ts, useProfileStats.ts, useProfileHighlights.ts, useComments.ts, useBookmarks.ts, useMining.tsx, useNFTs.tsx, useGroups.tsx, useMessages.ts, useUserSearch.ts, useAirdrops.ts, useTokenVesting.ts, useTokenLocking.ts, useTokenDeployment.ts, useTokenCreationForm.ts, useTokenCreation.ts, useTokenAnalytics.ts, useFollowSystem.ts, useFollowSuggestions.ts, useUserRelationships.ts, useGroupChat.ts, useNotifications.ts, useWallet.ts, useStories.ts, useSidebarData.ts, useReels.ts, useNFTCollections.ts, useTransactionHistory.ts, useThrottledCallback.ts, useThrottle.ts, useSigner.ts, usePushNotifications.ts, useOfflineSupport.ts, useNetworkValidation.ts, useNetworkStatus.ts, useMediaQuery.ts, useLoginForm.ts, useHashtags.ts, useAuthSession.ts, use-toast.ts, use-mobile.tsx, use-mobile.ts
- Unterordner: analytics/, search/, realtime/, media/, notifications/, feed/, post/, mining/, comments/

### src/hooks/post/

- usePostActions.ts, usePostsFetch.ts, usePostNotifications.ts, useSharing.ts, useLikeState.ts, useLikesCount.ts, useLikes.ts, useLikeNotifications.ts, useLikeAction.ts, useComments.ts, useCommentActions.ts, useBookmarks.ts

### src/repositories/

- PostRepository.ts, CommentRepository.ts, LikeRepository.ts (falls vorhanden), InteractionRepository.ts, UserRepository.ts, TokenRepository.ts, NFTRepository.ts, NFTCollectionRepository.ts, MiningRepository.ts, MiningRepositoryBase.ts, BookmarkRepository.ts, BaseRepository.ts
- Unterordner: mining/, interfaces/, interactions/, base/

### src/api/posts/

- likeActions.ts

### src/components/Feed/

- UnifiedPostCard.tsx, LeaderboardPage.tsx, PostCardComments.tsx, PostReport.tsx, PostCardActions.tsx, TrendingPage.tsx, FeedPage.tsx, LeftSidebar.tsx, AirdropsPage.tsx, CreatePostForm.tsx, FeedContent.tsx, EnhancedFeed.tsx, CreatePostModal.tsx, CreatePostBoxLight.tsx, CreatePostBox.tsx, FeedLayout.tsx, YouTubeEmbed.tsx, VirtualizedFeedList.tsx, VirtualizedFeed.tsx, UnifiedPostList.tsx, UnifiedFeedPage.tsx, UnifiedFeedContainer.tsx, UnifiedFeed.tsx, TokensTab.tsx, TokenShareModal.tsx, TokenCard.tsx, StoriesSection.tsx, SimplifiedFeedPage.tsx, SimplifiedFeedContainer.tsx, SimplifiedFeed.tsx, SimpleShareModal.tsx, ShareModal.tsx, ScrollToTopButton.tsx, RightSidebar.tsx, PostReportDialog.tsx, PostListHeader.tsx, PostListContent.tsx, PostList.tsx, PostFilters.tsx, PostCardMenu.tsx, PostCard.tsx, OptimizedPostList.tsx, OptimizedPostCard.tsx, OptimizedFeedPage.tsx, OptimizedFeedContainer.tsx, OptimizedFeed.tsx, NFTCard.tsx, MultiPlatformVideoEmbed.tsx, MiningWidget.tsx, MiningLoadingState.tsx, MiningControlSection.tsx, InfiniteScrollFeed.tsx, HashtagsPage.tsx, FloatingCreateButton.tsx, FeedTabs.tsx, FeedSkeletonLoader.tsx, FeedLoading.tsx, FeedListItem.tsx, FeedList.tsx, FeedHeaderWithActions.tsx, FeedFilters.tsx, FeedFilterOptimized.tsx, FeedError.tsx, FeedEmpty.tsx, FeedContainer.tsx, EnhancedFeedPage.tsx, EnhancedFeedHeader.tsx, EnhancedFeedContainer.tsx, DjangoFeedExample.tsx, Comments.tsx, CategoryPage.tsx, CategoryHeader.tsx
- Unterordner: Post/, components/, unified/, hooks/, common/, TabContent/, PostComponents/, OptimizedFeed/, Mining/

### src/components/Feed/Post/

- PostContent.tsx, PostHeader.tsx, PostCard.tsx, ReportDialog.tsx, PostTextInput.tsx, PostSubmitButton.tsx, PostInteractionButton.tsx, PostInteractionBar.tsx, PostDropdownMenu.tsx, PostCommentSection.tsx, PostActions.tsx, PostActionButtons.tsx, HashtagSearch.tsx, HashtagDisplay.tsx, EmojiPickerButton.tsx

### src/components/Feed/hooks/

- useUnifiedFeed.ts, usePostList.tsx, useFeedState.ts

### src/components/Feed/PostComponents/

- PostMenu.tsx, PostContent.tsx, PostHeader.tsx, PostActions.tsx

### src/components/Feed/common/

- index.tsx, FeedStateRenderer.tsx, FeedFilterSection.tsx

### src/components/Feed/unified/

- UnifiedPostList.tsx, UnifiedFeed.tsx, index.tsx, FeedFilterOptimized.tsx
- Unterordner: components/, common/

### src/components/Feed/unified/components/

- CreatePostBox.tsx, FeedHeader.tsx

### src/components/Feed/unified/common/

- index.ts

### src/components/Feed/OptimizedFeed/

- VirtualizedFeedList.tsx, ScrollToTopButton.tsx, PostRenderer.tsx, ScrollOptimizer.tsx, OptimizedFeedContainer.tsx, NetworkStatusMessage.tsx, LoadMoreTrigger.tsx, FeedLoadingSkeleton.tsx, ErrorMessage.tsx

### src/pages/

- Feed.tsx, SimplifiedFeed.tsx, OptimizedFeedPage.tsx, EnhancedFeedPage.tsx, AlbumDetail.tsx, Dashboard.tsx, SearchPage.tsx, NFTDetailPage.tsx, NFTCollectionsPage.tsx, NFTDetails.tsx, NFTCollection.tsx, Mining.tsx, MessagesPage.tsx, FriendsPage.tsx, GroupsOverviewPage.tsx, CreateToken.tsx, CreateNFTCollection.tsx, CreateNFT.tsx, NotificationSettings.tsx, Notifications.tsx, TestNotificationsPage.tsx, Register.tsx, ResetPassword.tsx, NotFound.tsx, Wallet.tsx, TokenReservationPage.tsx, pages.tsx, Index.tsx

### tests/hooks/

- usePost.test.tsx, useDjangoAnalytics.test.ts
- Unterordner: mining/

### tests/lib/

- database.test.ts

### tests/integration/

- analytics.test.ts

---

## Beispiel-Mapping: UnifiedFeed/UnifiedPostCard

**Komponentenstruktur:**

- UnifiedFeed.tsx (Elternkomponente)
  - nutzt useUnifiedFeedState (Hook)
  - gibt Handler wie handleLikePost, handleCreateComment, handleSharePost etc. an FeedStateRenderer weiter
- FeedStateRenderer (Renderer für Feed-Status und Posts)
  - reicht die Handler an UnifiedPostCard weiter
- UnifiedPostCard.tsx (Post-Komponente)
  - erhält alle Interaktions-Handler als Props (onLike, onComment, onShare, ...)
  - hält lokalen State für Like, Share, Kommentare, ruft aber immer die Handler auf

**Logik-Kette:**

- useUnifiedFeedState.ts
  - nutzt useDjangoFeed (Hook)
    - stellt Methoden bereit: fetchPosts, toggleLike, deletePost, createPost, addComment, sharePost
    - nutzt socialAPI aus lib/django-api.ts für alle Backend-Operationen
- lib/django-api.ts
  - socialAPI.togglePostLike, socialAPI.addComment, socialAPI.sharePost etc. rufen Django-API-Endpunkte auf
  - State-Updates werden im Hook und ggf. lokal in der Komponente synchronisiert

**Zentrale Logik:**

- Die zentrale Backend-Logik für Feed/Post-Interaktionen liegt im Hook useDjangoFeed und in socialAPI (lib/django-api.ts)
- Die UI-Komponenten (UnifiedFeed, UnifiedPostCard) sind "dumm" und bekommen die Logik als Props
- State-Management erfolgt teils lokal (für sofortiges UI-Feedback), teils über erneutes Laden der Daten aus dem Backend

**Redundanz-/Konsistenzrisiko:**

- Wenn andere Komponenten (z.B. OptimizedFeed, FeedPage, PostCard) andere Hooks/Repos/API-Helper nutzen, entstehen Inkonsistenzen
- Die zentrale Logik sollte in useDjangoFeed + socialAPI gebündelt werden, alle Komponenten sollten diese nutzen

---

**Nächster Schritt:**

- Mapping weiterer Feed/Post-Komponenten (z.B. OptimizedFeed, FeedPage, PostCard, PostActions, CommentSection)
- Dokumentation, ob sie dieselbe zentrale Logik nutzen oder eigene/alte Hooks/Repos

**Die nächsten Schritte:**

- Mapping: Welche Komponenten/Hooks nutzen welche Logik?
- Identifikation von Überschneidungen, Redundanzen, Inkonsistenzen
- Dokumentation und Empfehlung für die Vereinheitlichung
