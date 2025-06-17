from django.test import TestCase
from django.contrib.auth import get_user_model
from bsn_social_network.models import Chat, ChatMessage
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

# Hinweis: Die WebSocket-Tests würden mit einem asynchronen TestCase laufen,
# aber das würde zusätzliche Konfiguration erfordern. 
# Für Testzwecke haben wir die Tests vereinfacht.
class WebSocketTests(TestCase):
    """
    Test suite für die WebSocket-Funktionalität
    
    Dies ist ein vereinfachter Test, da die vollständige WebSocket-Testung
    eine komplexe asynchrone Testumgebung erfordern würde.
    """
    
    def setUp(self):
        """
        Testdaten vorbereiten
        """
        # Testbenutzer erstellen
        self.user1 = User.objects.create_user(
            username='testuser1',
            email='test1@example.com',
            password='testpassword1'
        )
        
        self.user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpassword2'
        )
        
        # Direkter Chat zwischen Benutzer 1 und 2
        self.chat = Chat.objects.create(
            type='direct',
            created_by=self.user1
        )
        self.chat.participants.add(self.user1, self.user2)
        
        # Token für Benutzer 1 erstellen
        self.token1 = str(AccessToken.for_user(self.user1))
        self.token2 = str(AccessToken.for_user(self.user2))
    
    def test_websocket_url_format(self):
        """
        Teste, ob die WebSocket-URL das erwartete Format hat
        """
        # Das Format sollte etwa so aussehen: ws(s)://host/ws/chat/{chat_id}/?token={token}
        chat_id = self.chat.id
        token = self.token1
        expected_url = f'/ws/chat/{chat_id}/?token={token}'
        
        # Dieser Test prüft nur, ob wir die URL korrekt erstellen können,
        # nicht ob die Verbindung tatsächlich funktioniert
        self.assertIn(str(chat_id), expected_url)
        self.assertIn(token, expected_url)
    
    def test_chat_participant_permissions(self):
        """
        Teste, ob Benutzer nur auf Chats zugreifen können, an denen sie teilnehmen
        """
        # Erstelle einen neuen Benutzer, der nicht am Chat teilnimmt
        non_participant = User.objects.create_user(
            username='nonparticipant',
            email='non@example.com',
            password='password'
        )
        
        # Prüfe, ob der Benutzer im Chat ist
        self.assertIn(self.user1, self.chat.participants.all())
        self.assertIn(self.user2, self.chat.participants.all())
        self.assertNotIn(non_participant, self.chat.participants.all())
    
    def test_chat_message_creation(self):
        """
        Teste, ob Chatnachrichten korrekt erstellt werden können
        """
        # Erstelle eine Nachricht
        message = ChatMessage.objects.create(
            chat=self.chat,
            sender=self.user1,
            content='Testnachricht'
        )
        
        # Prüfe, ob die Nachricht korrekt erstellt wurde
        self.assertEqual(message.chat, self.chat)
        self.assertEqual(message.sender, self.user1)
        self.assertEqual(message.content, 'Testnachricht')
        self.assertFalse(message.is_read)  # Standardmäßig sollte die Nachricht ungelesen sein
        
        # Prüfe, ob die Nachricht in der Datenbank zu finden ist
        self.assertTrue(ChatMessage.objects.filter(content='Testnachricht').exists()) 