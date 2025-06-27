import { Index, Feed, Dashboard, Profile, NotFound, NotificationSettings, Notifications, ResetPassword, CreateToken, Wallet, Mining, MessagesPage, GroupsOverviewPage, CreateNFT, NFTDetails, NFTMarketplace, SearchPage, FriendsPage, AlbumDetail, CreateNFTCollection, NFTCollection, ReelsPage } from './pages/pages';
import Login3D from './components/landing/Login3D';
import Register3D from './components/landing/Register3D';
import ProtectedRoute from './components/ProtectedRoute';
import TokenCreationPage from './components/TokenCreation/TokenCreationPage';
import { TestNotificationsPage } from './pages/TestNotificationsPage';

const routes = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/login',
    element: <Login3D />,
  },
  {
    path: '/register',
    element: <Register3D />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/test-notifications',
    element: (
      <ProtectedRoute>
        <TestNotificationsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/feed',
    element: <Feed />,
  },
  {
    path: '/feed/popular',
    element: <Feed />,
  },
  {
    path: '/feed/recent',
    element: <Feed />,
  },
  {
    path: '/feed/following',
    element: <Feed />,
  },
  {
    path: '/feed/tokens',
    element: <Feed />,
  },
  {
    path: '/feed/nfts',
    element: <Feed />,
  },
  {
    path: '/reels',
    element: (
      <ProtectedRoute>
        <ReelsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile/:username',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notification-settings',
    element: (
      <ProtectedRoute>
        <NotificationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-token',
    element: (
      <ProtectedRoute>
        <CreateToken />
      </ProtectedRoute>
    ),
  },
  {
    path: '/wallet',
    element: (
      <ProtectedRoute>
        <Wallet />
      </ProtectedRoute>
    ),
  },
  {
    path: '/mining',
    element: (
      <ProtectedRoute>
        <Mining />
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages/new',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/messages/:conversationId',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/groups',
    element: (
      <ProtectedRoute>
        <GroupsOverviewPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/nfts/:id',
    element: (
      <ProtectedRoute>
        <NFTDetails />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-nft',
    element: (
      <ProtectedRoute>
        <CreateNFT />
      </ProtectedRoute>
    ),
  },
  {
    path: '/token-wizard',
    element: (
      <ProtectedRoute>
        <TokenCreationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/marketplace',
    element: (
      <ProtectedRoute>
        <NFTMarketplace />
      </ProtectedRoute>
    ),
  },
  {
    path: '/search',
    element: (
      <ProtectedRoute>
        <SearchPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/friends',
    element: (
      <ProtectedRoute>
        <FriendsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/album/:id',
    element: (
      <ProtectedRoute>
        <AlbumDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-nft-collection',
    element: (
      <ProtectedRoute>
        <CreateNFTCollection />
      </ProtectedRoute>
    ),
  },
  {
    path: '/nft/collections/:id',
    element: (
      <ProtectedRoute>
        <NFTCollection />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <NotFound />,
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '/messages/groups/:groupId',
    element: (
      <ProtectedRoute>
        <MessagesPage />
      </ProtectedRoute>
    ),
  },
];

export default routes;
