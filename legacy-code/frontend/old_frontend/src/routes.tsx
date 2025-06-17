import Index from './pages/Index';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login3D from './components/landing/Login3D';
import Register3D from './components/landing/Register3D';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationSettings from './pages/NotificationSettings';
import Notifications from './pages/Notifications';
import ResetPassword from './pages/ResetPassword';
import CreateToken from './pages/CreateToken';
import Wallet from './pages/Wallet';
import Mining from './pages/Mining';
import MessagesPage from './pages/MessagesPage';
import GroupsOverviewPage from './pages/GroupsOverviewPage';
import CreateNFT from './pages/CreateNFT';
import NFTDetailPage from './pages/NFTDetailPage';
import TokenCreationPage from './components/TokenCreation/TokenCreationPage';
import NFTMarketplace from './pages/NFTMarketplace';
import SearchPage from './pages/SearchPage';
import FriendsPage from './pages/FriendsPage';
import AlbumDetail from './pages/AlbumDetail';
import CreateNFTCollection from './pages/CreateNFTCollection';
import NFTCollection from './pages/NFTCollection';
import ReelsPage from './pages/ReelsPage';

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
        <NFTDetailPage />
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
    path: '/reels',
    element: (
      <ProtectedRoute>
        <ReelsPage />
      </ProtectedRoute>
    ),
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
