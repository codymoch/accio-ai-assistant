// chat-widget.js
(function() {
    'use strict';
    
    console.log('Chat widget script loaded from external file');
    
    function initializeChat() {
        var container = document.getElementById('claudeChatWidget');
        if (!container) {
            console.log('Chat widget not found, retrying...');
            setTimeout(initializeChat, 100);
            return;
        }
        
        var messagesContainer = document.getElementById('chatMessages');
        var messageInput = document.getElementById('messageInput');
        var sendButton = document.getElementById('sendButton');
        
        if (!messagesContainer || !messageInput || !sendButton) {
            console.log('Chat elements not ready, retrying...');
            setTimeout(initializeChat, 100);
            return;
        }
        
        console.log('Chat widget initialized!');
        
        var conversationHistory = [];
        var isProcessing = false;
        
        function addMessage(content, role) {
            var messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + role;
            messageDiv.textContent = content;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTypingIndicator() {
            var existingTyping = document.getElementById('typingIndicator');
            if (existingTyping) return;
            
            var typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typingIndicator';
            typingDiv.textContent = 'Claude is typing...';
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function removeTypingIndicator() {
            var typingDiv = document.getElementById('typingIndicator');
            if (typingDiv) {
                typingDiv.remove();
            }
        }
        
        function sendMessage() {
            if (isProcessing) return;
            
            var message = messageInput.value.trim();
            if (!message) return;
            
            console.log('Sending message:', message);
            
            isProcessing = true;
            messageInput.disabled = true;
            sendButton.disabled = true;
            
            addMessage(message, 'user');
            messageInput.value = '';
            
            conversationHistory.push({
                role: 'user',
                content: message
            });
            
            showTypingIndicator();
            
            fetch('https://accio-ai-assistant-git-main-codyreeves-9715s-projects.vercel.app/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 1024,
                    messages: conversationHistory
                })
            })
            .then(function(response) {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(function(data) {
                console.log('Response data:', data);
                removeTypingIndicator();
                
                if (data.error) {
                    throw new Error(data.error.message || 'Failed to get response');
                }
                
                var assistantMessage = data.content[0].text;
                
                conversationHistory.push({
                    role: 'assistant',
                    content: assistantMessage
                });
                
                addMessage(assistantMessage, 'assistant');
            })
            .catch(function(error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addMessage('Error: ' + error.message, 'error');
            })
            .finally(function() {
                isProcessing = false;
                messageInput.disabled = false;
                sendButton.disabled = false;
                messageInput.focus();
            });
        }
        
        sendButton.addEventListener('click', sendMessage);
        
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        messageInput.focus();
        console.log('Chat widget ready!');
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeChat);
    } else {
        initializeChat();
    }
})();
